import dotenv from 'dotenv';
import app from './app.js';
import { sequelize } from './config/database.js';
import { seedRoles } from './seeders/seedRoles.js';
import { seedPermissions } from './seeders/seedPermissions.js';
import { seedRolePermissions } from './seeders/seedRolePermissions.js';
import { seedOwners } from './seeders/seedOwners.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {

    await sequelize.authenticate();

    await sequelize.sync();

    await seedRoles();

    await seedPermissions();

    await seedRolePermissions();

    await seedOwners();

    app.listen(PORT, () => {
      console.log(
        `Servidor iniciado en http://localhost:${PORT}`
      );
    });

  } catch (error) {

    console.error(
      'Error al conectar con la base de datos:',
      error
    );

    process.exit(1);

  }
};

startServer();