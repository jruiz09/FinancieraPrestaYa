import { Zone } from '../models/index.js'

/*
=====================================================
SCOPING POR OFICINA

Devuelve el conjunto de zoneId a los que un usuario tiene
acceso según las Oficinas que tenga asignadas (User <-> Oficina,
muchos a muchos). Una Oficina agrupa Zonas (también muchos a
muchos: una misma Zona puede estar en más de una Oficina), así
que el acceso de un usuario es la UNIÓN de las zonas de todas
sus oficinas.

- Si el usuario NO tiene ninguna oficina asignada, devuelve
  `null`: significa "sin restricción", el usuario ve todas las
  zonas del owner, igual que antes de esta feature. Este es el
  comportamiento por defecto para no romper a nadie que no use
  oficinas todavía.

- Si el usuario tiene oficinas asignadas pero esas oficinas no
  tienen ninguna zona asociada, devuelve un array vacío `[]`:
  el usuario no puede ver ninguna zona.

Uso esperado en un controller que ya filtra por zona/collector:

  const zoneIdsPermitidos = await obtenerZoneIdsPermitidos(req.user)

  if (zoneIdsPermitidos !== null) {
    // intersectar zoneIds pedidos/disponibles contra zoneIdsPermitidos
  }
=====================================================
*/

export const obtenerZoneIdsPermitidos = async (user) => {

  if (typeof user?.getOficinas !== 'function') {
    return null
  }

  const oficinas = await user.getOficinas({
    include: [
      {
        model: Zone,
        as: 'zonas',
        attributes: ['id']
      }
    ]
  })

  if (!oficinas || oficinas.length === 0) {
    return null
  }

  const zoneIds = new Set()

  for (const oficina of oficinas) {
    for (const zona of oficina.zonas || []) {
      zoneIds.add(zona.id)
    }
  }

  return Array.from(zoneIds)
}

/*
Intersecta una lista de zoneId "candidatos" (por ejemplo, las
zonas del owner, o las que pidió el usuario por query param)
contra las zoneIdsPermitidos de obtenerZoneIdsPermitidos. Si
zoneIdsPermitidos es null (sin restricción), devuelve los
candidatos tal cual.
*/

export const filtrarZoneIdsPermitidos = (
  zoneIdsCandidatos,
  zoneIdsPermitidos
) => {

  if (zoneIdsPermitidos === null) {
    return zoneIdsCandidatos
  }

  const permitidos = new Set(zoneIdsPermitidos)

  return zoneIdsCandidatos.filter(id => permitidos.has(id))
}
