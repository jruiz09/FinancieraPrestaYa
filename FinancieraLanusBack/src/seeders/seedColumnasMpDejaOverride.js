import { sequelize } from '../config/database.js'

/*
=====================================================
Agrega mp_override / deja_override a registro_diario_zonas.

El proyecto no usa migraciones formales: sequelize.sync()
en el arranque solo crea tablas nuevas, no agrega columnas
a tablas que ya existen. Este seeder hace el ALTER TABLE de
forma idempotente (chequea information_schema antes de
alterar) para que corra sin error en cada arranque, tanto
en desarrollo como en el servidor de produccion.

Ademas hace un backfill una sola vez: copia el mp/deja ya
cargado manualmente a mp_override/deja_override para las
filas existentes, asi ningun valor historico se pisa en
silencio por el calculo automatico nuevo (que solo aplica
por defecto cuando el override es null).
=====================================================
*/

export const seedColumnasMpDejaOverride = async () => {

  const [columnas] =
    await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'registro_diario_zonas'
        AND COLUMN_NAME IN ('mp_override', 'deja_override')
    `)

  const existentes =
    columnas.map(
      c => c.COLUMN_NAME
    )

  if (!existentes.includes('mp_override')) {

    await sequelize.query(`
      ALTER TABLE registro_diario_zonas
      ADD COLUMN mp_override DECIMAL(12,2) NULL
    `)

  }

  if (!existentes.includes('deja_override')) {

    await sequelize.query(`
      ALTER TABLE registro_diario_zonas
      ADD COLUMN deja_override DECIMAL(12,2) NULL
    `)

  }

  await sequelize.query(`
    UPDATE registro_diario_zonas
    SET mp_override = mp
    WHERE mp_override IS NULL
  `)

  await sequelize.query(`
    UPDATE registro_diario_zonas
    SET deja_override = deja
    WHERE deja_override IS NULL
  `)

}
