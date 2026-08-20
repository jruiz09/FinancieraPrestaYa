import { User, Role, Owner } from '../models/index.js';
import { ROLES } from '../config/auth.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      include: ['role', 'owner', 'ownersList'],
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
    const user = await User.findByPk(req.params.id, { include: ['role', 'owner', 'ownersList'] });
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
    const { name, username, email, password, roleId, ownerId, ownerIds } = req.body;

    if (!name || !username || !email || !password || !roleId) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: name, username, email, password, roleId.' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ success: false, message: 'Rol inválido.' });
    }

    // Multiempresa: un ADMIN se asocia a una o varias Owners vía UserOwner (ownerIds),
    // en lugar del ownerId único que usan el resto de los roles.
    if (role.name === ROLES.ADMIN && Array.isArray(ownerIds) && ownerIds.length) {
      const owners = await Owner.findAll({ where: { id: ownerIds } });
      if (owners.length !== ownerIds.length) {
        return res.status(400).json({ success: false, message: 'Alguna de las empresas indicadas no existe.' });
      }
    }

    const user = await User.create({ name, username, email, password, roleId, ownerId });

    if (role.name === ROLES.ADMIN && Array.isArray(ownerIds) && ownerIds.length) {
      await user.setOwnersList(ownerIds);
    }

    const created = await User.findByPk(user.id, { include: ['role', 'owner', 'ownersList'] });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { include: ['role'] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const { name, email, password, roleId, ownerIds } = req.body;

    let role = user.role;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (roleId) {
      role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ success: false, message: 'Rol inválido.' });
      }
      user.roleId = roleId;
    }

    if (role?.name === ROLES.ADMIN && Array.isArray(ownerIds)) {
      if (ownerIds.length) {
        const owners = await Owner.findAll({ where: { id: ownerIds } });
        if (owners.length !== ownerIds.length) {
          return res.status(400).json({ success: false, message: 'Alguna de las empresas indicadas no existe.' });
        }
      }
      await user.setOwnersList(ownerIds);
    }

    await user.save();

    const updated = await User.findByPk(user.id, { include: ['role', 'owner', 'ownersList'] });
    res.json({ success: true, data: updated });
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

