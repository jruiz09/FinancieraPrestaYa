import { Role, Permission } from '../models/index.js'
import { seedPermissions } from './seedPermissions.js'

/*
=====================================================
Informe diario y Recaudación tenían que tildarse con
permisos prestados (DASHBOARD_VIEW y CREDITS_VIEW). Ahora
tienen los suyos: INFORME_DIARIO_VIEW, INFORME_DIARIO_EDIT
y RECAUDACION_VIEW.

Para no dejar sin acceso a nadie, en una base ya
inicializada se los otorga a los roles que hoy entran a
esas pantallas:
- DASHBOARD_VIEW       -> INFORME_DIARIO_VIEW + EDIT
- INFORME_SEMANAL_VIEW -> INFORME_DIARIO_EDIT (el informe
  semanal guarda a través del informe diario)
- CREDITS_VIEW         -> RECAUDACION_VIEW

Corre una sola vez: solo si INFORME_DIARIO_VIEW todavía
no existe. Así, si después se los sacan a un rol desde
la UI, no vuelven en el próximo arranque. Debe correr
antes de seedPermissions (que es el que crea los
permisos nuevos).
=====================================================
*/

const EQUIVALENCIAS = {
  DASHBOARD_VIEW: ['INFORME_DIARIO_VIEW', 'INFORME_DIARIO_EDIT'],
  INFORME_SEMANAL_VIEW: ['INFORME_DIARIO_EDIT'],
  CREDITS_VIEW: ['RECAUDACION_VIEW']
}

export const seedPermisosInformeDiarioRecaudacion = async () => {

  const yaMigrado =
    await Permission.findOne({
      where: {
        codigo: 'INFORME_DIARIO_VIEW'
      }
    })

  if (yaMigrado) return

  await seedPermissions()

  const permisosNuevos =
    await Permission.findAll({
      where: {
        codigo: [
          'INFORME_DIARIO_VIEW',
          'INFORME_DIARIO_EDIT',
          'RECAUDACION_VIEW'
        ]
      }
    })

  const roles =
    await Role.findAll({
      include: [
        'permissions'
      ]
    })

  for (const role of roles) {

    const codigosActuales =
      role.permissions.map(p => p.codigo)

    const codigosAOtorgar = new Set()

    for (const [codigoPrevio, nuevos] of Object.entries(EQUIVALENCIAS)) {
      if (codigosActuales.includes(codigoPrevio)) {
        nuevos.forEach(codigo => codigosAOtorgar.add(codigo))
      }
    }

    const aAgregar =
      permisosNuevos.filter(p => codigosAOtorgar.has(p.codigo))

    if (aAgregar.length) {
      await role.addPermissions(aAgregar)
    }

  }

}
