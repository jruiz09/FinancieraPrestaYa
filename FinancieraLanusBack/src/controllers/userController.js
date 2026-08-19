import { User, Role } from '../models/index.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      include: ['role', 'owner'],
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: { total: count, page, limit, users: rows } });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { include: ['role', 'owner'] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, username, email, password, roleId, ownerId } = req.body;

    if (!name || !username || !email || !password || !roleId) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: name, username, email, password, roleId.' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ success: false, message: 'Rol inválido.' });
    }

    const user = await User.create({ name, username, email, password, roleId, ownerId });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const { name, email, password, roleId } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ success: false, message: 'Rol inválido.' });
      }
      user.roleId = roleId;
    }

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    await user.destroy();
    res.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

