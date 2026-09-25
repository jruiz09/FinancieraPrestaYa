import { sequelize } from '../config/database.js'

/*
=====================================================
Agrega oficina_id a collectors, supervisores y clients.

El proyecto no usa migraciones formales: sequelize.sync()
en el arranque solo crea tablas nuevas, no agrega columnas
a tablas que ya existen. Este seeder hace el ALTER TABLE de
forma idempotente (chequea information_schema antes de
alterar).

A diferencia de zoneId, un Collector/Supervisor/Client
pertenece a UNA sola Oficina de forma directa (no a través
de su Zona, que puede estar compartida entre varias
oficinas). La columna se agrega NULL a nivel de base (igual
que otras columnas retrofitteadas en este repo) y se exige
NOT NULL desde el modelo Sequelize (allowNull: false) y los
controllers de alta.
=====================================================
*/

const agregarOficinaId = async (tabla) => {

  const [columnas] =
    await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = '${tabla}'
        AND COLUMN_NAME = 'oficina_id'
    `)

  if (columnas.length > 0) {
    return
  }

  await sequelize.query(`
    ALTER TABLE ${tabla}
    ADD COLUMN oficina_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
    ADD CONSTRAINT fk_${tabla}_oficina
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
  `)

}

export const seedOficinaIdEntidadesOperativas = async () => {

  await agregarOficinaId('collectors')
  await agregarOficinaId('supervisores')
  await agregarOficinaId('clients')

}
