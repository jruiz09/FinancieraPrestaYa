import { Owner } from '../models/index.js';

export const getOwners = async (req, res, next) => {
  try {
    const owners = await Owner.findAll();
    res.json({ success: true, data: owners });
  } catch (error) {
    next(error);
  }
};

export const getOwnerById = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Propietario no encontrado.' });
    }
    res.json({ success: true, data: owner });
  } catch (error) {
    next(error);
  }
};

export const createOwner = async (req, res, next) => {
  try {
    const owner = await Owner.create(req.body);
    res.status(201).json({ success: true, data: owner });
  } catch (error) {
    next(error);
  }
};

export const updateOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Propietario no encontrado.' });
    }
    await owner.update(req.body);
    res.json({ success: true, data: owner });
  } catch (error) {
    next(error);
  }
};

export const deleteOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Propietario no encontrado.' });
    }
    await owner.destroy();
    res.json({ success: true, message: 'Propietario eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};
