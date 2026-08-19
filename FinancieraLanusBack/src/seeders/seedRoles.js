import { Role } from '../models/index.js';
import { ROLES } from '../config/auth.js';

export const seedRoles = async () => {
  const roles = [
    { name: ROLES.ADMIN, description: 'Administrador del sistema' },
    { name: ROLES.ADMINISTRATIVO, description: 'Administrativo de oficina' },
    { name: ROLES.SUPERVISOR, description: 'Supervisor de cobranzas' },
    { name: ROLES.COBRADOR, description: 'Cobrador asignado' },
    { name: ROLES.USER, description: 'Usuario estándar' },
  ];

  for (const roleData of roles) {
    await Role.findOrCreate({ where: { name: roleData.name }, defaults: roleData });
  }
};
