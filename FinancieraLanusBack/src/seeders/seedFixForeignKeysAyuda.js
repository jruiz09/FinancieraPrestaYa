import { sequelize } from '../config/database.js'

/*
=====================================================
BUG PREEXISTENTE: origen_id y destino_id de "ayudas" son
columnas polimórficas (pueden apuntar a un Collector O a un
Supervisor, según origenTipo/destinoTipo), pero en la base
real tenían una FK física que las obligaba a apuntar SIEMPRE
a "collectors" (ayudas_ibfk_1 / ayudas_ibfk_2). Eso rompía a
nivel de base de datos cualquier ayuda donde el origen o el
destino fuera un Supervisor, aunque el modelo y el código de
la aplicación ya estaban preparados para soportarlo.

Una sola columna no puede tener dos FK a dos tablas distintas
al mismo tiempo (no se puede saber de antemano si va a
apuntar a collectors o a supervisors), así que la solución es
sacar la FK física y validar la integridad desde la
aplicación (ya se valida en crearAyudaMobile que el
destinatario exista y pertenezca al mismo owner antes de
crear la ayuda).

Idempotente: solo borra las constraints si todavía existen.
=====================================================
*/

export const seedFixForeignKeysAyuda = async () => {

  const [constraints] =
    await sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'ayudas'
        AND REFERENCED_TABLE_NAME = 'collectors'
        AND COLUMN_NAME IN ('origen_id', 'destino_id')
    `)

  for (const { CONSTRAINT_NAME } of constraints) {

    await sequelize.query(`
      ALTER TABLE ayudas
      DROP FOREIGN KEY \`${CONSTRAINT_NAME}\`
    `)

  }

}
