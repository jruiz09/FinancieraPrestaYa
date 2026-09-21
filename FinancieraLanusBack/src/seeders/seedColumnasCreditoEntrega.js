import { sequelize } from '../config/database.js'

/*
=====================================================
Agrega monto_efectivo / monto_transferencia a creditos, y
extiende el ENUM de tipo_transaccion para admitir 'MIXTO'
(entrega dividida entre efectivo y transferencia).

El proyecto no usa migraciones formales: sequelize.sync()
en el arranque solo crea tablas nuevas, no agrega columnas
ni altera ENUMs de tablas que ya existen. Este seeder hace
el ALTER TABLE de forma idempotente (chequea information_schema
antes de alterar) para que corra sin error en cada arranque.

Backfill: para los créditos ya cargados (un solo medio de
pago), copia montoCredito entero al campo que corresponda
según el tipoTransaccion histórico, así ningún crédito
existente queda con $0 en ambos campos.
=====================================================
*/

export const seedColumnasCreditoEntrega = async () => {

  const [columnas] =
    await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'creditos'
        AND COLUMN_NAME IN ('monto_efectivo', 'monto_transferencia')
    `)

  const existentes =
    columnas.map(
      c => c.COLUMN_NAME
    )

  if (!existentes.includes('monto_efectivo')) {

    await sequelize.query(`
      ALTER TABLE creditos
      ADD COLUMN monto_efectivo DECIMAL(12,2) NOT NULL DEFAULT 0
    `)

  }

  if (!existentes.includes('monto_transferencia')) {

    await sequelize.query(`
      ALTER TABLE creditos
      ADD COLUMN monto_transferencia DECIMAL(12,2) NOT NULL DEFAULT 0
    `)

  }

  await sequelize.query(`
    UPDATE creditos
    SET monto_efectivo = monto_credito
    WHERE tipo_transaccion = 'EFECTIVO'
      AND monto_efectivo = 0
      AND monto_transferencia = 0
  `)

  await sequelize.query(`
    UPDATE creditos
    SET monto_transferencia = monto_credito
    WHERE tipo_transaccion = 'TRANSFERENCIA'
      AND monto_efectivo = 0
      AND monto_transferencia = 0
  `)

  const [[columnaTipo]] =
    await sequelize.query(`
      SELECT COLUMN_TYPE AS tipo
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'creditos'
        AND COLUMN_NAME = 'tipo_transaccion'
    `)

  if (
    columnaTipo &&
    !columnaTipo.tipo.includes('MIXTO')
  ) {

    await sequelize.query(`
      ALTER TABLE creditos
      MODIFY COLUMN tipo_transaccion
      ENUM('EFECTIVO', 'TRANSFERENCIA', 'MIXTO') NOT NULL
    `)

  }

}
