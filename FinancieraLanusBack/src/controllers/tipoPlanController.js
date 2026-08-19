import { TipoPlan } from '../models/index.js';

export const listTiposPlan = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const where = { activo: true };

    const { count, rows } = await TipoPlan.findAndCountAll({
      where,
      limit,
      offset,
      order: [['descripcion', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        total: count,
        page,
        limit,
        tiposPlan: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTipoPlan = async (req, res, next) => {
  try {
    const tipoPlan = await TipoPlan.findByPk(req.params.id);

    if (!tipoPlan || !tipoPlan.activo) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de plan no encontrado.'
      });
    }

    res.json({
      success: true,
      data: tipoPlan
    });
  } catch (error) {
    next(error);
  }
};

export const createTipoPlan = async (req, res, next) => {
  try {
    const { descripcion, dias } = req.body;

    const existe = await TipoPlan.findOne({
      where: {
        descripcion
      }
    });

    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un tipo de plan con esa descripción.'
      });
    }

    const tipoPlan = await TipoPlan.create({
      descripcion,
      dias
    });

    res.status(201).json({
      success: true,
      data: tipoPlan
    });
  } catch (error) {
    next(error);
  }
};

export const updateTipoPlan = async (req, res, next) => {
  try {
    const tipoPlan = await TipoPlan.findByPk(req.params.id);

    if (!tipoPlan || !tipoPlan.activo) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de plan no encontrado.'
      });
    }

    const { descripcion, dias } = req.body;

    if (descripcion !== undefined) tipoPlan.descripcion = descripcion;
    if (dias !== undefined) tipoPlan.dias = dias;

    await tipoPlan.save();

    res.json({
      success: true,
      data: tipoPlan
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTipoPlan = async (req, res, next) => {
  try {
    const tipoPlan = await TipoPlan.findByPk(req.params.id);

    if (!tipoPlan || !tipoPlan.activo) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de plan no encontrado.'
      });
    }

    tipoPlan.activo = false;

    await tipoPlan.save();

    res.json({
      success: true,
      message: 'Tipo de plan desactivado.'
    });
  } catch (error) {
    next(error);
  }
};