import jwt from 'jsonwebtoken';
import { JWT_CONFIG, ROLES } from '../config/auth.js';
import { User, Role, UserOwner } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado.' });
  }

  try {
    const payload = jwt.verify(token, JWT_CONFIG.secret);
    const user = await User.findByPk(payload.id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: ['permissions'],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no autorizado.' });
    }

    // Multiempresa: un ADMIN puede tener varios Owners asociados y elegir cuál está
    // activo en cada sesión (payload.ownerId). Se valida en cada request contra la
    // tabla pivote UserOwner por si fue desasociado de esa empresa mientras el token
    // seguía vigente (segmentación estricta).
    if (user.role?.name === ROLES.ADMIN && payload.ownerId) {
      const activeOwner = await UserOwner.findOne({
        where: { userId: user.id, ownerId: payload.ownerId },
      });

      if (!activeOwner) {
        return res.status(401).json({
          success: false,
          message: 'La empresa activa ya no está disponible para este usuario.',
          code: 'INVALID_ACTIVE_OWNER',
        });
      }
    }

    const permissions = user.role?.permissions?.map((permission) => permission.codigo) || [];
    req.user = user;
    req.user.ownerId = payload.ownerId;
    req.user.permissions = permissions;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

export const authorize = (...allowedPermissions) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: 'Acceso denegado.' });
  }

  const hasPermission = req.user.permissions?.some((permission) =>
    allowedPermissions.includes(permission),
  );

  if (!hasPermission) {
    return res.status(403).json({ success: false, message: 'No tienes permisos suficientes.' });
  }

  next();
};

export const hasPermission = (user, permission) =>
  user?.permissions?.includes(permission);
