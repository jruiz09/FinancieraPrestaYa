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

/*
=====================================================
Helper de conveniencia para el caso más común: un endpoint
que ya recibe un filtro opcional `zoneIds` por query string
(?zoneIds=a,b,c) y arma su where/include en base a eso.

Combina lo que el usuario PIDIÓ (zoneIdsSolicitados, puede
venir vacío = "todas") con lo que el usuario PUEDE ver
(obtenerZoneIdsPermitidos). Devuelve:

  - zoneIds: la lista efectiva a usar en el where/include.
  - restringido: true si hay que aplicar el filtro de zona
    sí o sí (antes el código typeaba esto como
    `zoneIds.length > 0`; con oficinas, incluso sin pedir
    ninguna zona explícita puede haber restricción).

Casos:
  - Sin oficinas asignadas y sin zoneIds pedidos: sin
    restricción, ve todo (como hasta ahora).
  - Sin oficinas asignadas y con zoneIds pedidos: filtra por
    lo pedido, igual que hasta ahora.
  - Con oficinas asignadas: siempre restringido. Si pidió
    zonas puntuales, se intersectan contra lo permitido (para
    que no pueda "pedir" una zona ajena); si no pidió nada,
    ve todas SUS zonas permitidas.
=====================================================
*/

export const resolverZoneIdsEfectivos = async (
  user,
  zoneIdsSolicitados = []
) => {

  const zoneIdsPermitidos =
    await obtenerZoneIdsPermitidos(user)

  if (zoneIdsPermitidos === null) {

    return {
      zoneIds: zoneIdsSolicitados,
      restringido: zoneIdsSolicitados.length > 0
    }

  }

  const zoneIds = zoneIdsSolicitados.length
    ? filtrarZoneIdsPermitidos(
        zoneIdsSolicitados,
        zoneIdsPermitidos
      )
    : zoneIdsPermitidos

  return {
    zoneIds,
    restringido: true
  }

}
