import { User, Role, Owner } from '../models/index.js';
import { signToken } from '../services/jwtService.js';
import { ROLES } from '../config/auth.js';

const mapPermissions = (role) =>
  role?.permissions?.map((permission) => permission.codigo) || [];

export const register = async (req, res, next) => {
  try {
    const { name, username, email, password, ownerId } = req.body;
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El username ya está registrado.' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado.' });
    }

    const role = await Role.findOne({ where: { name: ROLES.USER }, include: ['permissions'] });

    if (!role) {
      return res.status(500).json({ success: false, message: 'Rol por defecto no encontrado.' });
    }

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'ownerId es requerido para usuarios de oficina.' });
    }

    const owner = await Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(400).json({ success: false, message: 'Owner inválido.' });
    }

    const user = await User.create({ name, username, email, password, roleId: role.id, ownerId });
    const permissions = mapPermissions(role);
    const token = signToken({ id: user.id, role: role.name, ownerId: user.ownerId });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: role.name,
          ownerId: user.ownerId,
          permissions,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.unscoped().findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: 'role',
          include: ['permissions'],
        },
        'owner',
      ],
    });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const permissions = mapPermissions(user.role);
    const token = signToken({ id: user.id, role: user.role?.name, ownerId: user.ownerId });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role?.name,
          ownerId: user.ownerId,
          permissions,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role?.name,
      owner: user.owner
        ? {
            id: user.owner.id,
            fullName: user.owner.fullName,
          }
        : null,
      permissions: user.permissions,
    },
  });
};
