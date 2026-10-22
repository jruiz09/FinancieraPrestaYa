import { sequelize } from '../config/database.js'

/*
=====================================================
Agrega fecha_visita_sin_pago y visitas_sin_pago a
creditos_detalles.

Marca que se visitó al cliente y no le pagaron la cuota
(distinto de un cliente que no fue visitado). La fecha es la
de la última visita sin pago y visitas_sin_pago cuenta en
cuántos días distintos pasó. Se setean desde mobile o desde
el panel admin y se limpian al registrar un pago de la cuota.

El proyecto no usa migraciones formales: sequelize.sync() en
el arranque solo crea tablas nuevas, no agrega columnas a
tablas que ya existen. Este seeder hace el ALTER TABLE de
forma idempotente (chequea information_schema antes de
alterar) para que corra sin error en cada arranque.

Backfill: las cuotas que ya tenían una visita sin pago
registrada antes de existir el contador arrancan en 1.
=====================================================
*/

const existeColumna = async (columna) => {

  const [columnas] =
    await sequelize.query(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'creditos_detalles'
          AND COLUMN_NAME = :columna
      `,
      {
        replacements: { columna }
      }
    )

  return columnas.length > 0

}

export const seedColumnaVisitaSinPago = async () => {

  if (!(await existeColumna('fecha_visita_sin_pago'))) {

    await sequelize.query(`
      ALTER TABLE creditos_detalles
      ADD COLUMN fecha_visita_sin_pago DATE NULL
    `)

  }

  if (!(await existeColumna('visitas_sin_pago'))) {

    await sequelize.query(`
      ALTER TABLE creditos_detalles
      ADD COLUMN visitas_sin_pago INT NOT NULL DEFAULT 0
    `)

    await sequelize.query(`
      UPDATE creditos_detalles
      SET visitas_sin_pago = 1
      WHERE fecha_visita_sin_pago IS NOT NULL
    `)

  }

}
