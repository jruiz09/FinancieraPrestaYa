export const ROLES = {
  ADMIN: 'ADMIN',
  ADMINISTRATIVO: 'ADMINISTRATIVO',
  SUPERVISOR: 'SUPERVISOR',
  COBRADOR: 'COBRADOR',
  USER: 'USER',
};

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'default_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
