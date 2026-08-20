import { Client, Owner, Collector } from '../models/index.js';
import {
  resolverUbicacion
} from '../services/geocoder.service.js';

const canViewAllOwners = (user) => user.permissions?.includes('OWNERS_VIEW');
const canSetOwner = (user) => user.permissions?.includes('OWNERS_EDIT');

/*
=====================================================
Si el frontend ya nos manda coordenadas (via el boton
"Buscar ubicacion", que pega contra /clients/geolocalizar)
confiamos en ellas en vez de volver a geocodificar la
misma direccion desde el backend. Evita depender dos veces
del servicio externo para la misma operacion.
=====================================================
*/

const resolverCoordenadas = async ({
  latitud,
  longitud,
  mapsUrl,
  direccion
}) => {

  if (latitud != null && longitud != null) {

    return {
      latitud: Number(latitud),
      longitud: Number(longitud),
      direccion
    };

  }

  const ubicacion =
    await resolverUbicacion(
      mapsUrl?.trim()
        ? mapsUrl
        : direccion
    );

  return {
    latitud:
      ubicacion?.latitud || null,

    longitud:
      ubicacion?.longitud || null,

    direccion:
      ubicacion?.direccion || direccion
  };

};

export const listClients = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const where = { activo: true };

    if (!canViewAllOwners(req.user)) {
      where.ownerId = req.user.ownerId;
    } else if (req.query.ownerId) {
      where.ownerId = req.query.ownerId;
    }

    if (req.query.cobradorId) {
      where.cobradorId = req.query.cobradorId;
    }

    const { count, rows } = await Client.findAndCountAll({
      where,
      include: ['owner', 'collector'],
      limit,
      offset,
      order: [
        ['apellido', 'ASC'],
        ['nombre', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: {
        total: count,
        page,
        limit,
        clients: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(
      req.params.id,
      {
        include: ['owner', 'collector']
      }
    );

    if (!client || !client.activo) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.'
      });
    }

    if (
      !canViewAllOwners(req.user) &&
      client.ownerId !== req.user.ownerId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado.'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req, res, next) => {
  try {

    const {
      nombre,
      apellido,
      dni,
      celular,
      direccion,
      mapsUrl,
      foto,
      ownerId,
      cobradorId,
      latitud,
      longitud
    } = req.body;

    let finalOwnerId = ownerId;

    if (!canSetOwner(req.user)) {
      finalOwnerId = req.user.ownerId;
    }

    if (!finalOwnerId) {
      return res.status(400).json({
        success: false,
        message: 'ownerId es requerido.'
      });
    }

    if (!cobradorId) {
      return res.status(400).json({
        success: false,
        message: 'cobradorId es requerido.'
      });
    }

    const owner = await Owner.findByPk(finalOwnerId);

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: 'Owner inválido.'
      });
    }

    const collector = await Collector.findByPk(
      cobradorId
    );

    if (
      !collector ||
      collector.ownerId !== finalOwnerId
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Cobrador inválido o no pertenece al mismo owner.'
      });
    }

    const ubicacion =
      await resolverCoordenadas({
        latitud,
        longitud,
        mapsUrl,
        direccion
      });

    const client = await Client.create({

      nombre,
      apellido,
      dni,
      celular,

      direccion:
        ubicacion.direccion,

      mapsUrl,

      foto,

      latitud:
        ubicacion.latitud,

      longitud:
        ubicacion.longitud,

      ownerId: finalOwnerId,

      cobradorId

    });

    res.status(201).json({
      success: true,
      data: client
    });

  } catch (error) {

    next(error);

  }
};

export const updateClient = async (req, res, next) => {
  try {

    const client =
      await Client.findByPk(
        req.params.id
      );

    if (!client || !client.activo) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.'
      });
    }

    if (
      !canSetOwner(req.user) &&
      client.ownerId !== req.user.ownerId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado.'
      });
    }

    const {
      nombre,
      apellido,
      dni,
      celular,
      direccion,
      mapsUrl,
      foto,
      cobradorId,
      latitud,
      longitud
    } = req.body;

    if (cobradorId) {

      const collector =
        await Collector.findByPk(
          cobradorId
        );

      if (
        !collector ||
        collector.ownerId !== client.ownerId
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Cobrador inválido o no pertenece al mismo owner.'
        });
      }

      client.cobradorId =
        cobradorId;

    }

    if (nombre !== undefined)
      client.nombre = nombre;

    if (apellido !== undefined)
      client.apellido = apellido;

    if (dni !== undefined)
      client.dni = dni;

    if (celular !== undefined)
      client.celular = celular;

    if (foto !== undefined)
      client.foto = foto;

    if (
      direccion !== undefined ||
      mapsUrl !== undefined ||
      latitud !== undefined ||
      longitud !== undefined
    ) {

      const ubicacion =
        await resolverCoordenadas({
          latitud,
          longitud,
          mapsUrl,
          direccion
        });

      client.direccion =
        ubicacion.direccion;

      client.mapsUrl =
        mapsUrl;

      client.latitud =
        ubicacion.latitud;

      client.longitud =
        ubicacion.longitud;

    }

    await client.save();

    res.json({
      success: true,
      data: client
    });

  } catch (error) {

    next(error);

  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(
      req.params.id
    );

    if (!client || !client.activo) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.'
      });
    }

    if (
      !canSetOwner(req.user) &&
      client.ownerId !== req.user.ownerId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado.'
      });
    }

    client.activo = false;

    await client.save();

    res.json({
      success: true,
      message: 'Cliente desactivado.'
    });
  } catch (error) {
    next(error);
  }
};
export const geolocalizarDireccion =
  async (req, res, next) => {

    try {

      const {
        direccion,
        mapsUrl
      } = req.body;

      const ubicacion =
        await resolverUbicacion(
          mapsUrl?.trim()
            ? mapsUrl
            : direccion
        );

      return res.json({

        success: true,

        data: ubicacion

      });

    } catch (error) {

      next(error);

    }

  };