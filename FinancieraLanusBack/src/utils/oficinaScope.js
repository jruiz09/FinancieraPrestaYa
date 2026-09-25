import { Zone, Oficina } from '../models/index.js'

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

/*
=====================================================
SCOPING DIRECTO POR OFICINA (Collector/Supervisor/Client)

A diferencia de Zone (que puede estar compartida entre
varias oficinas), un Collector/Supervisor/Client pertenece a
UNA sola Oficina de forma directa. obtenerOficinaIdsPermitidos
devuelve los ids de oficina del usuario (null = sin
restricción, ve todo, mismo contrato que
obtenerZoneIdsPermitidos).
=====================================================
*/

export const obtenerOficinaIdsPermitidos = async (user) => {

  if (typeof user?.getOficinas !== 'function') {
    return null
  }

  const oficinas = await user.getOficinas({
    attributes: ['id']
  })

  if (!oficinas || oficinas.length === 0) {
    return null
  }

  return oficinas.map(oficina => oficina.id)

}

/*
Valida que un oficinaId recibido en un alta/edición
(Collector, Supervisor, Client) sea una Oficina real del
owner correspondiente, y que el usuario que hace el pedido
tenga acceso a ella (si el usuario tiene oficinas asignadas,
no puede dar de alta nada en una oficina ajena).
*/

export const validarOficinaParaAlta = async (
  user,
  ownerId,
  oficinaId
) => {

  if (!oficinaId) {
    return {
      ok: false,
      status: 400,
      message: 'Oficina es requerida'
    }
  }

  const oficina = await Oficina.findByPk(oficinaId)

  if (
    !oficina ||
    oficina.ownerId !== ownerId ||
    !oficina.activa
  ) {
    return {
      ok: false,
      status: 400,
      message: 'Oficina inválida'
    }
  }

  const oficinaIdsPermitidos =
    await obtenerOficinaIdsPermitidos(user)

  if (
    oficinaIdsPermitidos !== null &&
    !oficinaIdsPermitidos.includes(oficinaId)
  ) {
    return {
      ok: false,
      status: 403,
      message: 'No tenés acceso a esa oficina'
    }
  }

  return {
    ok: true,
    oficina
  }

}

/*
=====================================================
OFICINA ACTIVA (switch del Header) + BORDE DE SEGURIDAD

Gemelo de resolverZoneIdsEfectivos pero para oficinas.
Combina lo que el usuario PIDIÓ mirar (oficinaIdsSolicitados,
el switch del Header; vacío = todas) con lo que PUEDE ver
(obtenerOficinaIdsPermitidos). Siempre intersecta contra lo
permitido para que el switch nunca pueda pedir una oficina
ajena.

Devuelve:
  - oficinaIds: lista efectiva para el where (o null = sin
    restricción, cuando el usuario no tiene oficinas asignadas
    y no pidió ninguna).
  - restringido: true si hay que aplicar el filtro sí o sí.

Casos:
  - Sin oficinas asignadas y sin selección: null / false
    (ve todo, como hasta ahora).
  - Sin oficinas asignadas pero con selección: filtra por lo
    pedido (no hay borde que intersectar).
  - Con oficinas asignadas: siempre restringido. Si seleccionó
    puntuales, se intersectan contra lo permitido; si no
    seleccionó, ve todas SUS oficinas.
=====================================================
*/

/*
Parsea el query param ?oficinaIds=a,b,c (el switch del Header)
a un array de ids limpio. Vacío/ausente => [].
*/
export const parseOficinaIdsQuery = (raw) => {

  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)

}

export const resolverOficinaIdsEfectivos = async (
  user,
  oficinaIdsSolicitados = []
) => {

  const oficinaIdsPermitidos =
    await obtenerOficinaIdsPermitidos(user)

  if (oficinaIdsPermitidos === null) {

    return {
      oficinaIds: oficinaIdsSolicitados.length
        ? oficinaIdsSolicitados
        : null,
      restringido: oficinaIdsSolicitados.length > 0
    }

  }

  const permitidos = new Set(oficinaIdsPermitidos)

  const oficinaIds = oficinaIdsSolicitados.length
    ? oficinaIdsSolicitados.filter(id => permitidos.has(id))
    : oficinaIdsPermitidos

  return {
    oficinaIds,
    restringido: true
  }

}

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
