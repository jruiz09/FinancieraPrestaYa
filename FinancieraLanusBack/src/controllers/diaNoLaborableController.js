import { DiaNoLaborable } from '../models/index.js';

export const listDiasNoLaborables = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const where = { activo: true };

    const { count, rows } = await DiaNoLaborable.findAndCountAll({
      where,
      limit,
      offset,
      order: [['fecha', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        total: count,
        page,
        limit,
        diasNoLaborables: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDiaNoLaborable = async (req, res, next) => {
  try {
    const diaNoLaborable = await DiaNoLaborable.findByPk(req.params.id);

    if (!diaNoLaborable || !diaNoLaborable.activo) {
      return res.status(404).json({
        success: false,
        message: 'Día no laborable no encontrado.'
      });
    }

    res.json({
      success: true,
      data: diaNoLaborable
    });
  } catch (error) {
    next(error);
  }
};

export const createDiaNoLaborable = async (req, res, next) => {
  try {
    const { fecha, descripcion } = req.body;

    const existe = await DiaNoLaborable.findOne({
      where: { fecha }
    });

    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un día no laborable para esa fecha.'
      });
    }

    const diaNoLaborable = await DiaNoLaborable.create({
      fecha,
      descripcion
    });

    res.status(201).json({
      success: true,
      data: diaNoLaborable
    });
  } catch (error) {
    next(error);
  }
};

export const updateDiaNoLaborable = async (req, res, next) => {
  try {
    const diaNoLaborable = await DiaNoLaborable.findByPk(req.params.id);

    if (!diaNoLaborable || !diaNoLaborable.activo) {
      return res.status(404).json({
        success: false,
        message: 'Día no laborable no encontrado.'
      });
    }

    const { fecha, descripcion } = req.body;

    if (fecha !== undefined) {
      const existe = await DiaNoLaborable.findOne({
        where: { fecha }
      });

      if (existe && existe.id !== diaNoLaborable.id) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un día no laborable para esa fecha.'
        });
      }

      diaNoLaborable.fecha = fecha;
    }

    if (descripcion !== undefined) {
      diaNoLaborable.descripcion = descripcion;
    }

    await diaNoLaborable.save();

    res.json({
      success: true,
      data: diaNoLaborable
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiaNoLaborable = async (req, res, next) => {
  try {
    const diaNoLaborable = await DiaNoLaborable.findByPk(req.params.id);

    if (!diaNoLaborable || !diaNoLaborable.activo) {
      return res.status(404).json({
        success: false,
        message: 'Día no laborable no encontrado.'
      });
    }

    diaNoLaborable.activo = false;

    await diaNoLaborable.save();

    res.json({
      success: true,
      message: 'Día no laborable desactivado.'
    });
  } catch (error) {
    next(error);
  }
};