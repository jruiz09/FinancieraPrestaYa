import { sequelize } from '../config/database.js'

/*
=====================================================
Elimina la columna email de users y supervisors (Owner.email
no se toca: no estaba en el alcance pedido).

El proyecto no usa migraciones formales: sequelize.sync() en
el arranque solo crea tablas nuevas, no elimina columnas de
tablas que ya existen. Este seeder hace el DROP COLUMN de
forma idempotente (chequea information_schema antes de
alterar) para que corra sin error en cada arranque.

El login siempre usó username, nunca email, así que no hace
falta ningún reemplazo ni backfill.
=====================================================
*/

export const seedEliminarEmailUsuariosYSupervisores = async () => {

  const [columnas] =
    await sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('users', 'supervisores')
        AND COLUMN_NAME = 'email'
    `)

  const tienenEmail =
    columnas.map(c => c.TABLE_NAME)

  if (tienenEmail.includes('users')) {

    await sequelize.query(`
      ALTER TABLE users
      DROP COLUMN email
    `)

  }

  if (tienenEmail.includes('supervisores')) {

    await sequelize.query(`
      ALTER TABLE supervisores
      DROP COLUMN email
    `)

  }

}
