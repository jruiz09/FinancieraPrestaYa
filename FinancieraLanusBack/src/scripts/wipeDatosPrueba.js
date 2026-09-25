import { sequelize } from '../config/database.js'

/*
=====================================================
Borra los datos de prueba operativos en localhost, para
empezar a cargar datos reales ya separados por Oficina.

Mantiene intactas: Owner, User, Role, Permission,
RolePermission, Oficina y UsuarioOficinas (la asignación de
oficinas a usuarios sigue valiendo).

Se ejecuta a mano, UNA SOLA VEZ, y no está registrado en
server.js (a diferencia de los demás seeders, que son
idempotentes y se corren en cada arranque):

  node src/scripts/wipeDatosPrueba.js

Orden de borrado: hijos antes que padres, para no romper
ninguna FK real de la base.
=====================================================
*/

const TABLAS_EN_ORDEN = [
  'notificaciones',
  'pago_cuota',
  'creditos_detalles',
  'creditos',
  'vales',
  'ayudas',
  'registro_diario_zonas',
  'movimientos_cajas',
  'clients',
  'collectors',
  'supervisores',
  'oficinazonas',
  'supervisorzonas',
  'zones'
]

const wipeDatosPrueba = async () => {

  const transaction = await sequelize.transaction()

  try {

    console.log('Borrando datos de prueba...\n')

    for (const tabla of TABLAS_EN_ORDEN) {

      const [[{ total }]] =
        await sequelize.query(
          `SELECT COUNT(*) AS total FROM ${tabla}`,
          { transaction }
        )

      await sequelize.query(
        `DELETE FROM ${tabla}`,
        { transaction }
      )

      console.log(`${tabla}: ${total} filas borradas`)

    }

    await transaction.commit()

    console.log('\nListo. Owner, Users, Roles, Permissions y Oficinas quedaron intactos.')

    process.exit(0)

  } catch (error) {

    await transaction.rollback()

    console.error('Error al borrar datos de prueba:', error)

    process.exit(1)

  }

}

wipeDatosPrueba()
