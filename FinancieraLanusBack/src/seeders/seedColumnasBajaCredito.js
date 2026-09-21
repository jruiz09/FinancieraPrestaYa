import { sequelize } from '../config/database.js'

/*
=====================================================
Agrega las columnas de baja de crédito (motivo_baja,
fecha_baja, observaciones_baja, usuario_baja_id) a creditos.

El proyecto no usa migraciones formales: sequelize.sync() en
el arranque solo crea tablas nuevas, no agrega columnas a
tablas que ya existen. Este seeder hace el ALTER TABLE de
forma idempotente (chequea information_schema antes de
alterar) para que corra sin error en cada arranque.

No hace falta backfill: son columnas nuevas, todos los
créditos existentes quedan con estos valores en NULL (nunca
fueron dados de baja).
=====================================================
*/

export const seedColumnasBajaCredito = async () => {

  const [columnas] =
    await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'creditos'
        AND COLUMN_NAME IN (
          'motivo_baja',
          'fecha_baja',
          'observaciones_baja',
          'usuario_baja_id'
        )
    `)

  const existentes =
    columnas.map(c => c.COLUMN_NAME)

  if (!existentes.includes('motivo_baja')) {

    await sequelize.query(`
      ALTER TABLE creditos
      ADD COLUMN motivo_baja
      ENUM('ERROR', 'PAGO_COMPLETO', 'MAL_PAGO') NULL
    `)

  }

  if (!existentes.includes('fecha_baja')) {

    await sequelize.query(`
      ALTER TABLE creditos
      ADD COLUMN fecha_baja DATE NULL
    `)

  }

  if (!existentes.includes('observaciones_baja')) {

    await sequelize.query(`
      ALTER TABLE creditos
      ADD COLUMN observaciones_baja TEXT NULL
    `)

  }

  if (!existentes.includes('usuario_baja_id')) {

    await sequelize.query(`
      ALTER TABLE creditos
      ADD COLUMN usuario_baja_id CHAR(36) NULL
    `)

  }

}
