import { Permission } from '../models/index.js';

export const getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({ order: [['codigo', 'ASC']] });
    res.json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
};
