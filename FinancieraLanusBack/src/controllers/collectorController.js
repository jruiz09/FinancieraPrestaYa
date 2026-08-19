import {
  sequelize,
  Collector,
  Owner,
  User,
  Role
} from '../models/index.js'
import { ROLES } from '../config/auth.js'

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

    const { count, rows } = await Collector.findAndCountAll({
      where,
      include: ["owner", "supervisor", "zone", "user"],
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
      include: ["owner", "supervisor", "zone", "user"],
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

        zoneId:
          zoneId || null

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

      const existeMail =
        await User.findOne({

          where:{
            email:
              usuario.email
          },

          transaction

        })

      if (existeMail) {

        await transaction.rollback()

        return res.status(400).json({

          success:false,

          message:'El email ya existe'

        })

      }

      const nuevoUsuario =
        await User.create({

          name:
            `${nombre} ${apellido}`,

          username:
            usuario.username,

          email:
            usuario.email,

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
            'user'
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

      crearUsuario,
      usuario

    } = req.body

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
      zoneId || null

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

      const existeMail =
        await User.findOne({

          where:{
            email:
              usuario.email
          },

          transaction

        })

      if (existeMail) {

        await transaction.rollback()

        return res.status(400).json({

          success:false,

          message:'El email ya existe'

        })

      }

      const nuevoUsuario =
        await User.create({

          name:
            `${nombre} ${apellido}`,

          username:
            usuario.username,

          email:
            usuario.email,

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
            'user'
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
