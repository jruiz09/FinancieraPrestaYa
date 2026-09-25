import {
  sequelize,
  Collector,
  Owner,
  User,
  Role
} from '../models/index.js'
import { ROLES } from '../config/auth.js'
import {
  validarOficinaParaAlta,
  resolverOficinaIdsEfectivos,
  parseOficinaIdsQuery
} from '../utils/oficinaScope.js'
import { Op } from 'sequelize'

const canSetOwner = (user) => user.permissions?.includes('OWNERS_EDIT');

export const listCollectors = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const where = { activo: true };
    if (!canSetOwner(req.user)) {
      where.ownerId = req.user.ownerId;
    } else if (req.query.ownerId) {
      where.ownerId = req.query.ownerId;
    }

    /*
    Scope por Oficina: borde de seguridad (oficinas asignadas al
    usuario) intersectado con la oficina activa del switch
    (?oficinaIds=). Un cobrador pertenece a UNA oficina directa.
    */
    const { oficinaIds, restringido } =
      await resolverOficinaIdsEfectivos(
        req.user,
        parseOficinaIdsQuery(req.query.oficinaIds)
      );

    if (restringido) {
      where.oficinaId = { [Op.in]: oficinaIds };
    }

    const { count, rows } = await Collector.findAndCountAll({
      where,
      include: ["owner", "supervisor", "zone", "user", "oficina"],
      limit,
      offset,
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: { total: count, page, limit, collectors: rows },
    });
  } catch (error) {
    next(error);
  }
};

export const getCollector = async (req, res, next) => {
  try {
    const collector = await Collector.findByPk(req.params.id, {
      include: ["owner", "supervisor", "zone", "user", "oficina"],
    });
    if (!collector || !collector.activo)
      return res
        .status(404)
        .json({ success: false, message: "Cobrador no encontrado." });

    if (!canSetOwner(req.user) && collector.ownerId !== req.user.ownerId) {
      return res
        .status(403)
        .json({ success: false, message: "Acceso denegado." });
    }

    res.json({ success: true, data: collector });
  } catch (error) {
    next(error);
  }
};

export const createCollector = async (req, res, next) => {

  const transaction =
    await sequelize.transaction()

  try {

    const {

      nombre,
      apellido,
      dni,
      celular,
      zoneId,
      supervisorId,
      ownerId,
      oficinaId,

      crearUsuario,
      usuario

    } = req.body

    let finalOwnerId = ownerId

    if (!canSetOwner(req.user)) {
      finalOwnerId = req.user.ownerId
    }

    const owner =
      await Owner.findByPk(
        finalOwnerId,
        { transaction }
      )

    if (!owner) {

      await transaction.rollback()

      return res.status(400).json({

        success:false,

        message:'Owner inválido'

      })

    }

    if (!zoneId) {

      await transaction.rollback()

      return res.status(400).json({

        success:false,

        message:'Zona es requerida'

      })

    }

    const validacionOficina =
      await validarOficinaParaAlta(
        req.user,
        finalOwnerId,
        oficinaId
      )

    if (!validacionOficina.ok) {

      await transaction.rollback()

      return res.status(validacionOficina.status).json({

        success:false,

        message:validacionOficina.message

      })

    }

    const collector =
      await Collector.create({

        nombre,
        apellido,
        dni,
        celular,

        ownerId:
          finalOwnerId,

        supervisorId:
          supervisorId || null,

        zoneId,

        oficinaId

      },{
        transaction
      })

    if (crearUsuario) {

      const role =
        await Role.findOne({

          where:{
            name:ROLES.COBRADOR
          },

          transaction

        })

      if (!role) {

        await transaction.rollback()

        return res.status(400).json({

          success:false,

          message:'No existe el rol COBRADOR'

        })

      }

      const existeUsuario =
        await User.findOne({

          where:{
            username:
              usuario.username
          },

          transaction

        })

      if (existeUsuario) {

        await transaction.rollback()

        return res.status(400).json({

          success:false,

          message:'El nombre de usuario ya existe'

        })

      }

      const nuevoUsuario =
        await User.create({

          name:
            `${nombre} ${apellido}`,

          username:
            usuario.username,

          password:
            usuario.password,

          roleId:
            role.id,

          ownerId:
            finalOwnerId

        },{
          transaction
        })

      collector.userId =
        nuevoUsuario.id

      await collector.save({
        transaction
      })

    }

    await transaction.commit()

    const resultado =
      await Collector.findByPk(
        collector.id,
        {

          include:[
            'owner',
            'supervisor',
            'zone',
            'user',
            'oficina'
          ]

        }
      )

    res.status(201).json({

      success:true,

      data:resultado

    })

  }

  catch(error){

    await transaction.rollback()

    next(error)

  }

}

export const updateCollector = async (req, res, next) => {

  const transaction =
    await sequelize.transaction()

  try {

    const collector =
      await Collector.findByPk(
        req.params.id,
        { transaction }
      )

    if (!collector || !collector.activo) {

      await transaction.rollback()

      return res.status(404).json({

        success:false,

        message:'Cobrador no encontrado.'

      })

    }

    if (
      !canSetOwner(req.user) &&
      collector.ownerId !== req.user.ownerId
    ) {

      await transaction.rollback()

      return res.status(403).json({

        success:false,

        message:'Acceso denegado.'

      })

    }

    const {

      nombre,
      apellido,
      dni,
      celular,
      supervisorId,
      zoneId,
      oficinaId,

      crearUsuario,
      usuario

    } = req.body

    if (!zoneId) {

      await transaction.rollback()

      return res.status(400).json({

        success:false,

        message:'Zona es requerida'

      })

    }

    const validacionOficina =
      await validarOficinaParaAlta(
        req.user,
        collector.ownerId,
        oficinaId
      )

    if (!validacionOficina.ok) {

      await transaction.rollback()

      return res.status(validacionOficina.status).json({

        success:false,

        message:validacionOficina.message

      })

    }

    collector.nombre =
      nombre

    collector.apellido =
      apellido

    collector.dni =
      dni

    collector.celular =
      celular

    collector.supervisorId =
      supervisorId || null

    collector.zoneId =
      zoneId

    collector.oficinaId =
      oficinaId

    if (

      crearUsuario &&

      !collector.userId

    ) {

      const role =
        await Role.findOne({

          where:{
            name:ROLES.COBRADOR
          },

          transaction

        })

      if (!role) {

        await transaction.rollback()

        return res.status(400).json({

          success:false,

          message:'No existe el rol COBRADOR'

        })

      }

      const existeUsername =
        await User.findOne({

          where:{
            username:
              usuario.username
          },

          transaction

        })

      if (existeUsername) {

        await transaction.rollback()

        return res.status(400).json({

          success:false,

          message:'El usuario ya existe'

        })

      }

      const nuevoUsuario =
        await User.create({

          name:
            `${nombre} ${apellido}`,

          username:
            usuario.username,

          password:
            usuario.password,

          roleId:
            role.id,

          ownerId:
            collector.ownerId

        },{
          transaction
        })

      collector.userId =
        nuevoUsuario.id

    }

    await collector.save({

      transaction

    })

    await transaction.commit()

    const resultado =
      await Collector.findByPk(

        collector.id,

        {

          include:[
            'owner',
            'supervisor',
            'zone',
            'user',
            'oficina'
          ]

        }

      )

    res.json({

      success:true,

      data:resultado

    })

  }

  catch(error){

    await transaction.rollback()

    next(error)

  }

}

export const deleteCollector = async (req, res, next) => {
  try {
    const collector = await Collector.findByPk(req.params.id);
    if (!collector || !collector.activo)
      return res
        .status(404)
        .json({ success: false, message: "Cobrador no encontrado." });

    if (!canSetOwner(req.user) && collector.ownerId !== req.user.ownerId) {
      return res
        .status(403)
        .json({ success: false, message: "Acceso denegado." });
    }

    collector.activo = false;
    await collector.save();
    res.json({ success: true, message: "Cobrador desactivado." });
  } catch (error) {
    next(error);
  }
};
