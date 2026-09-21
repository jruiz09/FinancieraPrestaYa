import { sequelize } from '../config/database.js'

/*
=====================================================
Los vales dejan de tener "estado": ahora se gestionan
únicamente desde el panel admin, y el único estado real que
importa es si el vale sigue vigente o fue anulado — para eso
ya existe la columna `activo` (boolean).

Antes de borrar la columna `estado`, se hace backfill: los
vales que ya estaban en estado ANULADO pasan a activo=false,
para no perder ese efecto (PENDIENTE/RENDIDO no cambian nada,
ya estaban activos).

El proyecto no usa migraciones formales: sequelize.sync() en
el arranque solo crea tablas nuevas, no borra columnas de
tablas que ya existen. Este seeder hace el DROP COLUMN de
forma idempotente (chequea information_schema antes de
alterar) para que corra sin error en cada arranque.
=====================================================
*/

export const seedEliminarEstadoVale = async () => {

  const [columnas] =
    await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'vales'
        AND COLUMN_NAME = 'estado'
    `)

  if (columnas.length === 0) {
    return
  }

  await sequelize.query(`
    UPDATE vales
    SET activo = false
    WHERE estado = 'ANULADO'
  `)

  await sequelize.query(`
    ALTER TABLE vales
    DROP COLUMN estado
  `)

}
