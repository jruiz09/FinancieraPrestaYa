import {
  sequelize,
  Supervisor,
  Owner,
  User,
  Role,
} from "../models/index.js";

import {
  ROLES,
} from "../config/auth.js";

const canViewAllOwners = (user) =>
  user.permissions?.includes(
    "OWNERS_VIEW",
  );

const canSetOwner = (user) =>
  user.permissions?.includes(
    "OWNERS_EDIT",
  );

//////////////////////////////////////////////////////
// LISTAR
//////////////////////////////////////////////////////

export const listSupervisores =
  async (req, res, next) => {
    try {
      const page = Math.max(
        parseInt(req.query.page) || 1,
        1,
      );

      const limit = Math.min(
        parseInt(req.query.limit) || 10,
        100,
      );

      const offset =
        (page - 1) * limit;

      const where = {
        activo: true,
      };

      if (
        !canViewAllOwners(req.user)
      ) {
        where.ownerId =
          req.user.ownerId;
      } else if (
        req.query.ownerId
      ) {
        where.ownerId =
          req.query.ownerId;
      }

      const {
        count,
        rows,
      } =
        await Supervisor.findAndCountAll({
          where,

          include: [
            "owner",
            "user",
          ],

          limit,
          offset,

          order: [
            ["apellido", "ASC"],
            ["nombre", "ASC"],
          ],
        });

      res.json({
        success: true,

        data: {
          total: count,
          page,
          limit,
          supervisores: rows,
        },
      });
    } catch (error) {
      next(error);
    }
  };

//////////////////////////////////////////////////////
// OBTENER
//////////////////////////////////////////////////////

export const getSupervisor =
  async (req, res, next) => {
    try {
      const supervisor =
        await Supervisor.findByPk(
          req.params.id,
          {
            include: [
              "owner",
              "user",
            ],
          },
        );

      if (
        !supervisor ||
        !supervisor.activo
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Supervisor no encontrado.",
          });
      }

      if (
        !canViewAllOwners(req.user) &&
        supervisor.ownerId !==
          req.user.ownerId
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Acceso denegado.",
          });
      }

      res.json({
        success: true,
        data: supervisor,
      });
    } catch (error) {
      next(error);
    }
  };

//////////////////////////////////////////////////////
// CREAR
//////////////////////////////////////////////////////

export const createSupervisor =
  async (req, res, next) => {
    const transaction =
      await sequelize.transaction();

    try {
      const {
        nombre,
        apellido,
        celular,
        email,
        ownerId,

        crearUsuario,
        usuario,
      } = req.body;

      //////////////////////////////////////////////////////
      // OWNER
      //////////////////////////////////////////////////////

      let finalOwnerId =
        ownerId ||
        req.user.ownerId;

      if (
        !canSetOwner(req.user)
      ) {
        finalOwnerId =
          req.user.ownerId;
      }

      if (!finalOwnerId) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Debe especificarse un owner.",
          });
      }

      const owner =
        await Owner.findByPk(
          finalOwnerId,
          {
            transaction,
          },
        );

      if (!owner) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Owner inválido.",
          });
      }

      //////////////////////////////////////////////////////
      // CREAR SUPERVISOR
      //////////////////////////////////////////////////////

      const supervisor =
        await Supervisor.create(
          {
            nombre,
            apellido,
            celular,
            email,

            ownerId:
              finalOwnerId,
          },
          {
            transaction,
          },
        );

      //////////////////////////////////////////////////////
      // CREAR USUARIO
      //////////////////////////////////////////////////////

      if (crearUsuario) {
        if (!usuario) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "Debe informar los datos del usuario.",
            });
        }

        if (
          !usuario.username?.trim()
        ) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El nombre de usuario es obligatorio.",
            });
        }

        if (
          !usuario.email?.trim()
        ) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El email del usuario es obligatorio.",
            });
        }

        if (!usuario.password) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "La contraseña es obligatoria.",
            });
        }

        //////////////////////////////////////////////////////
        // BUSCAR ROL SUPERVISOR
        //////////////////////////////////////////////////////

        const role =
          await Role.findOne({
            where: {
              name:
                ROLES.SUPERVISOR,
            },

            transaction,
          });

        if (!role) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "No existe el rol SUPERVISOR.",
            });
        }

        //////////////////////////////////////////////////////
        // VALIDAR USERNAME
        //////////////////////////////////////////////////////

        const existeUsuario =
          await User.findOne({
            where: {
              username:
                usuario.username.trim(),
            },

            transaction,
          });

        if (existeUsuario) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El nombre de usuario ya existe.",
            });
        }

        //////////////////////////////////////////////////////
        // VALIDAR EMAIL
        //////////////////////////////////////////////////////

        const existeMail =
          await User.findOne({
            where: {
              email:
                usuario.email.trim(),
            },

            transaction,
          });

        if (existeMail) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El email ya existe.",
            });
        }

        //////////////////////////////////////////////////////
        // CREAR USER
        //////////////////////////////////////////////////////

        const nuevoUsuario =
          await User.create(
            {
              name:
                `${nombre} ${apellido}`.trim(),

              username:
                usuario.username.trim(),

              email:
                usuario.email.trim(),

              password:
                usuario.password,

              roleId:
                role.id,

              ownerId:
                finalOwnerId,
            },
            {
              transaction,
            },
          );

        //////////////////////////////////////////////////////
        // ASOCIAR USER AL SUPERVISOR
        //////////////////////////////////////////////////////

        supervisor.userId =
          nuevoUsuario.id;

        await supervisor.save({
          transaction,
        });
      }

      //////////////////////////////////////////////////////
      // COMMIT
      //////////////////////////////////////////////////////

      await transaction.commit();

      //////////////////////////////////////////////////////
      // DEVOLVER COMPLETO
      //////////////////////////////////////////////////////

      const resultado =
        await Supervisor.findByPk(
          supervisor.id,
          {
            include: [
              "owner",
              "user",
            ],
          },
        );

      res
        .status(201)
        .json({
          success: true,
          data: resultado,
        });
    } catch (error) {
      await transaction.rollback();

      next(error);
    }
  };

//////////////////////////////////////////////////////
// ACTUALIZAR
//////////////////////////////////////////////////////

export const updateSupervisor =
  async (req, res, next) => {
    const transaction =
      await sequelize.transaction();

    try {
      const supervisor =
        await Supervisor.findByPk(
          req.params.id,
          {
            transaction,
          },
        );

      if (
        !supervisor ||
        !supervisor.activo
      ) {
        await transaction.rollback();

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Supervisor no encontrado.",
          });
      }

      if (
        !canSetOwner(req.user) &&
        supervisor.ownerId !==
          req.user.ownerId
      ) {
        await transaction.rollback();

        return res
          .status(403)
          .json({
            success: false,
            message:
              "Acceso denegado.",
          });
      }

      const {
        nombre,
        apellido,
        celular,
        email,

        crearUsuario,
        usuario,
      } = req.body;

      //////////////////////////////////////////////////////
      // ACTUALIZAR SUPERVISOR
      //////////////////////////////////////////////////////

      if (nombre !== undefined) {
        supervisor.nombre =
          nombre;
      }

      if (apellido !== undefined) {
        supervisor.apellido =
          apellido;
      }

      if (celular !== undefined) {
        supervisor.celular =
          celular;
      }

      if (email !== undefined) {
        supervisor.email =
          email;
      }

      //////////////////////////////////////////////////////
      // CREAR USUARIO SI TODAVÍA NO TIENE
      //////////////////////////////////////////////////////

      if (
        crearUsuario &&
        !supervisor.userId
      ) {
        if (!usuario) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "Debe informar los datos del usuario.",
            });
        }

        if (
          !usuario.username?.trim()
        ) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El nombre de usuario es obligatorio.",
            });
        }

        if (
          !usuario.email?.trim()
        ) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El email del usuario es obligatorio.",
            });
        }

        if (!usuario.password) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "La contraseña es obligatoria.",
            });
        }

        //////////////////////////////////////////////////////
        // ROL SUPERVISOR
        //////////////////////////////////////////////////////

        const role =
          await Role.findOne({
            where: {
              name:
                ROLES.SUPERVISOR,
            },

            transaction,
          });

        if (!role) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "No existe el rol SUPERVISOR.",
            });
        }

        //////////////////////////////////////////////////////
        // VALIDAR USERNAME
        //////////////////////////////////////////////////////

        const existeUsername =
          await User.findOne({
            where: {
              username:
                usuario.username.trim(),
            },

            transaction,
          });

        if (existeUsername) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El usuario ya existe.",
            });
        }

        //////////////////////////////////////////////////////
        // VALIDAR EMAIL
        //////////////////////////////////////////////////////

        const existeMail =
          await User.findOne({
            where: {
              email:
                usuario.email.trim(),
            },

            transaction,
          });

        if (existeMail) {
          await transaction.rollback();

          return res
            .status(400)
            .json({
              success: false,
              message:
                "El email ya existe.",
            });
        }

        //////////////////////////////////////////////////////
        // CREAR USER
        //////////////////////////////////////////////////////

        const nuevoUsuario =
          await User.create(
            {
              name:
                `${
                  nombre ??
                  supervisor.nombre
                } ${
                  apellido ??
                  supervisor.apellido
                }`.trim(),

              username:
                usuario.username.trim(),

              email:
                usuario.email.trim(),

              password:
                usuario.password,

              roleId:
                role.id,

              ownerId:
                supervisor.ownerId,
            },
            {
              transaction,
            },
          );

        supervisor.userId =
          nuevoUsuario.id;
      }

      //////////////////////////////////////////////////////
      // GUARDAR
      //////////////////////////////////////////////////////

      await supervisor.save({
        transaction,
      });

      await transaction.commit();

      //////////////////////////////////////////////////////
      // DEVOLVER ACTUALIZADO
      //////////////////////////////////////////////////////

      const resultado =
        await Supervisor.findByPk(
          supervisor.id,
          {
            include: [
              "owner",
              "user",
            ],
          },
        );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      await transaction.rollback();

      next(error);
    }
  };

//////////////////////////////////////////////////////
// ELIMINAR / DESACTIVAR
//////////////////////////////////////////////////////

export const deleteSupervisor =
  async (req, res, next) => {
    try {
      const supervisor =
        await Supervisor.findByPk(
          req.params.id,
        );

      if (
        !supervisor ||
        !supervisor.activo
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Supervisor no encontrado.",
          });
      }

      if (
        !canSetOwner(req.user) &&
        supervisor.ownerId !==
          req.user.ownerId
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Acceso denegado.",
          });
      }

      supervisor.activo =
        false;

      await supervisor.save();

      res.json({
        success: true,
        message:
          "Supervisor desactivado.",
      });
    } catch (error) {
      next(error);
    }
  };