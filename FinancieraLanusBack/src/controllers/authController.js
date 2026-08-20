import { User, Role, Owner, UserOwner } from '../models/index.js';
import { signToken } from '../services/jwtService.js';
import { ROLES } from '../config/auth.js';

const mapPermissions = (role) =>
  role?.permissions?.map((permission) => permission.codigo) || [];

const mapOwner = (owner) => ({ id: owner.id, fullName: owner.fullName });

// Multiempresa: para un ADMIN, la empresa activa se resuelve entre las Owners
// asociadas vía UserOwner. Si se pide una puntual y es válida se usa esa,
// si no se usa la primera disponible. Sin Owners asociadas, no hay empresa activa.
const resolveActiveOwner = (user, requestedOwnerId) => {
  const owners = user.ownersList || [];
  if (!owners.length) {
    return { activeOwnerId: null, owners: [] };
  }

  const matched = requestedOwnerId && owners.find((owner) => owner.id === requestedOwnerId);
  return { activeOwnerId: (matched || owners[0]).id, owners };
};

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
    const { username, password, ownerId } = req.body;
    const user = await User.unscoped().findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: 'role',
          include: ['permissions'],
        },
        'owner',
        { model: Owner, as: 'ownersList', through: { attributes: [] } },
      ],
    });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const permissions = mapPermissions(user.role);
    const isAdmin = user.role?.name === ROLES.ADMIN;
    const { activeOwnerId, owners } = isAdmin
      ? resolveActiveOwner(user, ownerId)
      : { activeOwnerId: user.ownerId, owners: [] };

    if (isAdmin && !activeOwnerId) {
      return res.status(403).json({
        success: false,
        message: 'El usuario no tiene empresas asignadas.',
      });
    }

    const token = signToken({ id: user.id, role: user.role?.name, ownerId: activeOwnerId });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role?.name,
          ownerId: activeOwnerId,
          owners: isAdmin ? owners.map(mapOwner) : undefined,
          permissions,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const switchOwner = async (req, res, next) => {
  try {
    const { ownerId } = req.body;
    const user = req.user;

    if (user.role?.name !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: 'Solo un ADMIN puede cambiar de empresa activa.' });
    }

    const membership = await UserOwner.findOne({ where: { userId: user.id, ownerId } });
    if (!membership) {
      return res.status(400).json({ success: false, message: 'El usuario no tiene acceso a esa empresa.' });
    }

    const token = signToken({ id: user.id, role: user.role.name, ownerId });
    res.json({ success: true, data: { token, ownerId } });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = req.user;
    const isAdmin = user.role?.name === ROLES.ADMIN;

    let owners;
    if (isAdmin) {
      const ownersList = await Owner.findAll({
        include: [{ model: User, as: 'usersList', where: { id: user.id }, attributes: [], through: { attributes: [] } }],
      });
      owners = ownersList.map(mapOwner);
    }

    const activeOwner = user.ownerId
      ? (isAdmin ? owners.find((owner) => owner.id === user.ownerId) : await Owner.findByPk(user.ownerId))
      : null;

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        ownerId: user.ownerId,
        owner: activeOwner ? mapOwner(activeOwner) : null,
        owners,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};
