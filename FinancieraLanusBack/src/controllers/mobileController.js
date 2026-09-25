import { Op } from 'sequelize'

import {
  Collector,
  Supervisor,
  Credito,
  CreditoDetalle,
  Client,
  Ayuda,
  Zone
} from '../models/index.js'

import {
  registrarPagoCuota
} from './creditoController.js'

const obtenerCollector =
  async (userId) => {

    return await Collector.findOne({

      where: {
        userId
      }

    })

  }

const obtenerFechaLocal =
  (fecha = new Date()) => {

    const anio = fecha.getFullYear()

    const mes =
      String(fecha.getMonth() + 1)
        .padStart(2, '0')

    const dia =
      String(fecha.getDate())
        .padStart(2, '0')

    return `${anio}-${mes}-${dia}`

  }

const obtenerSupervisor =
  async (userId) => {

    return await Supervisor.findOne({

      where: {
        userId
      }

    })

  }

const formatDate =
  (value) => {

    if (!value) return null

    if (typeof value === 'string') {
      return value
    }

    return value
      .toISOString()
      .split('T')[0]

  }

const obtenerStatusCollector =
  (collector) => {

    if (
      collector.vencidas > 2 ||
      (collector.cobradoHoy === 0 && collector.clientesPendientes > 0)
    ) {
      return 'ATENCION'
    }

    if (collector.vencidas > 0) {
      return 'NORMAL'
    }

    return 'EXCELENTE'

  }

const esSupervisor = (user) => user?.permissions?.includes('MOBILE_SUPERVISOR');

/*
Resuelve quién es el usuario logueado (cobrador o supervisor)
para las ayudas, que ahora pueden enviarse y recibirse desde
cualquiera de los dos roles.
*/
const obtenerOrigen =
  async (user) => {

    if (esSupervisor(user)) {

      const supervisor =
        await obtenerSupervisor(user.id)

      return supervisor
        ? { tipo: 'SUPERVISOR', registro: supervisor }
        : null

    }

    const collector =
      await obtenerCollector(user.id)

    return collector
      ? { tipo: 'COBRADOR', registro: collector }
      : null

  }

/*
Resuelve los cobradorId sobre los que hay que buscar cuotas
en /cuotas-hoy y /cuotas-atrasadas. Para un cobrador es
siempre él mismo. Para un supervisor son todos los cobradores
de las zonas que tiene asignadas (no solo los de su propio
equipo), ya que a veces cubre zonas de otros supervisores.
Si el supervisor tiene más de una zona, puede filtrar por una
sola mandando ?zoneId=... (debe ser una de las suyas).
*/
const resolverCobradorIdsMobile =
  async (req) => {

    if (esSupervisor(req.user)) {

      const supervisor =
        await obtenerSupervisor(
          req.user.id
        )

      if (!supervisor) {

        return {
          ok: false,
          status: 404,
          message: 'Supervisor no encontrado'
        }

      }

      const zonas =
        await supervisor.getZonas()

      let zoneIds =
        zonas.map((z) => z.id)

      if (req.query.zoneId) {

        if (
          !zoneIds.includes(
            req.query.zoneId
          )
        ) {

          return {
            ok: false,
            status: 403,
            message: 'La zona solicitada no está asignada a este supervisor.'
          }

        }

        zoneIds = [req.query.zoneId]

      }

      if (zoneIds.length === 0) {

        return { ok: true, collectorIds: [] }

      }

      const collectors =
        await Collector.findAll({
          where: {
            zoneId: zoneIds,
            activo: true
          }
        })

      return {
        ok: true,
        collectorIds: collectors.map((c) => c.id)
      }

    }

    const collector =
      await obtenerCollector(req.user.id)

    if (!collector) {

      return {
        ok: false,
        status: 404,
        message: 'Cobrador no encontrado'
      }

    }

    return {
      ok: true,
      collectorIds: [collector.id]
    }

  }

const dashboardSupervisor =
  async (
    req,
    res,
    next
  ) => {

    try {

      const supervisor =
        await obtenerSupervisor(
          req.user.id
        )

      if (!supervisor) {

        return res.status(404)
          .json({
            success: false,
            message:
              'Supervisor no encontrado'
          })

      }

      const collectors =
        await Collector.findAll({
          where: {
            supervisorId:
              supervisor.id,
            activo: true
          },
          include: [
            {
              model: Zone,
              as: 'zone',
              attributes: [
                'id',
                'nombre'
              ]
            }
          ],
          order: [
            ['apellido', 'ASC'],
            ['nombre', 'ASC']
          ]
        })

      const collectorIds =
        collectors.map(
          (c) => c.id
        )

      /*
      Las estadísticas del dashboard tienen que reflejar TODO
      lo que el supervisor tiene a cargo: su propio equipo
      (supervisorId) más los cobradores de las zonas que tenga
      asignadas directamente (setZonas), ya que a veces cubre
      zonas de otros supervisores sin tener a esos cobradores
      como reportes directos. "team"/"ranking" (Equipo) siguen
      siendo solo el equipo propio, sin cambios.
      */

      const zonasAsignadas =
        await supervisor.getZonas()

      const zoneIdsAsignados =
        zonasAsignadas.map((z) => z.id)

      const collectorsDeZonas =
        zoneIdsAsignados.length > 0
          ? await Collector.findAll({
              where: {
                zoneId: zoneIdsAsignados,
                activo: true
              }
            })
          : []

      const statsCollectorIds =
        Array.from(
          new Set([
            ...collectorIds,
            ...collectorsDeZonas.map((c) => c.id)
          ])
        )

      const hoy =
        new Date()

      hoy.setHours(
        0,
        0,
        0,
        0
      )

      const hoyString =
        hoy.toISOString()
          .split('T')[0]

      const mesInicio =
        new Date(hoy)

      mesInicio.setDate(1)

      const proximoMes =
        new Date(
          mesInicio
        )

      proximoMes.setMonth(
        proximoMes.getMonth() + 1
      )

      const cuotas =
        statsCollectorIds.length > 0
          ? await CreditoDetalle.findAll({
              include: [
                {
                  model: Credito,
                  as: 'credito',
                  attributes: [
                    'id',
                    'cobradorId',
                    'clienteId'
                  ],
                  where: {
                    cobradorId:
                      statsCollectorIds
                  }
                }
              ],
              where: {
                activo: true
              }
            })
          : []

      const ayudasPendientes =
        await Ayuda.count({
          where: {
            destinoId:
              supervisor.id,
            estado:
              'PENDIENTE',
            activo: true
          }
        })

      const collectorMap = new Map()

      collectors.forEach(
        (collector) => {
          collectorMap.set(
            collector.id,
            {
              id: collector.id,
              nombre: collector.nombre,
              apellido: collector.apellido,
              zone: collector.zone,
              cobradoHoy: 0,
              clientesPendientes: new Set(),
              vencidas: 0
            }
          )
        }
      )

      let cobradoHoy = 0
      let cuotasCobradas = 0
      let cuotasPendientes = 0
      let cuotasVencidas = 0
      let cuotasVencenHoy = 0
      let pendienteCobro = 0
      const clientesVisitadosHoy =
        new Set()

      cuotas.forEach(
        (cuota) => {
          const credito =
            cuota.credito

          if (!credito) {
            return
          }

          const saldo =
            Number(cuota.monto) -
            Number(cuota.montoPago)

          /*
          El detalle por cobrador (collector.*) solo existe
          para el equipo propio (collectorMap). Los totales
          generales (cobradoHoy, cuotasPendientes, etc.) suman
          SIEMPRE, sea equipo propio o cobrador de una zona
          cubierta, para que el dashboard no quede vacío
          cuando el supervisor no tiene reportes directos.
          */

          const collector =
            collectorMap.get(
              credito.cobradorId
            )

          const fechaPago =
            formatDate(
              cuota.fechaPago
            )

          if (
            fechaPago === hoyString
          ) {
            cobradoHoy +=
              Number(
                cuota.montoPago
              )
            cuotasCobradas++
            clientesVisitadosHoy.add(
              credito.clienteId
            )
          }

          if (
            cuota.estado !==
            'PAGADA'
          ) {
            collector?.clientesPendientes.add(
              credito.clienteId
            )
          }

          // Pendiente/vencen del día: cuotas que vencen hoy y
          // no están pagas (pendiente de cobrar del día).
          if (
            formatDate(cuota.fechaPagoEsperada) === hoyString
          ) {
            cuotasVencenHoy++

            if (cuota.estado !== 'PAGADA') {
              cuotasPendientes++
              pendienteCobro += saldo
            }
          }

          if (
            cuota.estado ===
            'VENCIDA'
          ) {
            cuotasVencidas++

            if (collector) {
              collector.vencidas++
            }
          }

          if (
            fechaPago === hoyString &&
            collector
          ) {
            collector.cobradoHoy +=
              Number(
                cuota.montoPago
              )
          }
        }
      )

      const team =
        Array.from(
          collectorMap.values()
        ).map(
          (collector) => ({
            id: collector.id,
            nombre:
              `${collector.nombre} ${collector.apellido}`,
            zona:
              collector.zone?.nombre ||
              null,
            cobradoHoy:
              collector.cobradoHoy,
            clientesPendientes:
              collector.clientesPendientes.size,
            vencidas:
              collector.vencidas,
            estado:
              obtenerStatusCollector(
                collector
              )
          })
        )

      const ranking =
        [...team]
          .sort(
            (
              a,
              b
            ) =>
              b.cobradoHoy -
              a.cobradoHoy
          )
          .slice(0, 3)

      const efectividad =
        cuotasVencenHoy === 0
          ? 0
          : Math.round(
              (cuotasCobradas * 100) / cuotasVencenHoy
            )

      return res.json({
        success: true,
        data: {
          cobradoHoy,
          cuotasCobradas,
          cuotasPendientes,
          cuotasVencidas,
          cuotasVencenHoy,
          pendienteCobro,
          efectividad,
          cobradoresActivos:
            statsCollectorIds.length,
          clientesVisitadosHoy:
            clientesVisitadosHoy.size,
          ayudasPendientes,
          team,
          ranking
        }
      })
    } catch (error) {
      next(error)
    }

  }

export const dashboardMobile =
  async (
    req,
    res,
    next
  ) => {

    try {

      if (esSupervisor(req.user)) {
        return dashboardSupervisor(
          req,
          res,
          next
        )
      }

      const collector =
        await obtenerCollector(
          req.user.id
        )

      if (!collector) {

        return res.status(404)
          .json({
            success: false,
            message:
              'Cobrador no encontrado'
          })

      }

      const hoy =
        new Date()

      hoy.setHours(
        0,
        0,
        0,
        0
      )

      const manana =
        new Date(hoy)

      manana.setDate(
        manana.getDate() + 1
      )

      const cobrosHoy =
        await CreditoDetalle.count({

          include: [
            {
              model: Credito,
              as: 'credito',
              where: {
                cobradorId:
                  collector.id
              }
            }
          ],

          where: {

            estado: {

              [Op.in]: [
                'PENDIENTE',
                'PARCIAL',
                'VENCIDA'
              ]

            },

            fechaPagoEsperada: {

              [Op.gte]: hoy,
              [Op.lt]: manana

            }

          }

        })

      const vencidas =
        await CreditoDetalle.count({

          include: [
            {
              model: Credito,
              as: 'credito',
              where: {
                cobradorId:
                  collector.id
              }
            }
          ],

          where: {
            estado: 'VENCIDA'
          }

        })

      const ayudasPendientes =
        await Ayuda.count({

          where: {

            destinoId:
              collector.id,

            estado:
              'PENDIENTE',

            activo: true

          }

        })

      return res.json({

        success: true,

        data: {

          cobrosHoy,

          vencidas,

          ayudasPendientes

        }

      })

    } catch (error) {

      next(error)

    }

  }

export const cuotasHoyMobile =
  async (
    req,
    res,
    next
  ) => {

    try {

      const resolucion =
        await resolverCobradorIdsMobile(
          req
        )

      if (!resolucion.ok) {

        return res.status(
          resolucion.status
        ).json({
          success: false,
          message:
            resolucion.message
        })

      }

      const { collectorIds } =
        resolucion

      if (
        collectorIds.length === 0
      ) {

        return res.json({
          success: true,
          data: []
        })

      }

      const hoy =
        new Date()

      hoy.setHours(
        0,
        0,
        0,
        0
      )

      const manana =
        new Date(hoy)

      manana.setDate(
        manana.getDate() + 1
      )

      const cuotas =
        await CreditoDetalle.findAll({

          include: [

            {

              model: Credito,

              as: 'credito',

              where: {

                cobradorId:
                  collectorIds

              },

              include: [

                {

                  model: Client,

                  as: 'cliente'

                },

                {

                  model: Collector,

                  as: 'cobrador',

                  include: [

                    {
                      model: Zone,
                      as: 'zone'
                    }

                  ]

                }

              ]

            }

          ],

          where: {

            estado: {

              [Op.in]: [

                'PENDIENTE',
                'PARCIAL',
                'VENCIDA'

              ]

            },

            fechaPagoEsperada: {

              [Op.gte]: hoy,
              [Op.lt]: manana

            }

          },

          order: [

            [
              'fechaPagoEsperada',
              'ASC'
            ]

          ]

        })

      return res.json({

        success: true,

        data: cuotas

      })

    } catch (error) {

      next(error)

    }

  }

export const cuotasAtrasadasMobile =
  async (
    req,
    res,
    next
  ) => {

    try {

      const resolucion =
        await resolverCobradorIdsMobile(
          req
        )

      if (!resolucion.ok) {

        return res.status(
          resolucion.status
        ).json({
          success: false,
          message:
            resolucion.message
        })

      }

      const { collectorIds } =
        resolucion

      if (
        collectorIds.length === 0
      ) {

        return res.json({
          success: true,
          data: []
        })

      }

      const cuotas =
        await CreditoDetalle.findAll({

          include: [

            {

              model: Credito,

              as: 'credito',

              where: {

                cobradorId:
                  collectorIds

              },

              include: [

                {

                  model: Client,

                  as: 'cliente'

                },

                {

                  model: Collector,

                  as: 'cobrador',

                  include: [

                    {
                      model: Zone,
                      as: 'zone'
                    }

                  ]

                }

              ]

            }

          ],

          where: {

            estado:
              'VENCIDA'

          },

          order: [

            [
              'fechaVencimiento',
              'ASC'
            ]

          ]

        })

      return res.json({

        success: true,

        data: cuotas

      })

    } catch (error) {

      next(error)

    }

  }

export const busquedaMobile =
  async (
    req,
    res,
    next
  ) => {

    try {

      const collector =
        await obtenerCollector(
          req.user.id
        )

      if (!collector) {

        return res.status(404)
          .json({
            success: false,
            message:
              'Cobrador no encontrado'
          })

      }

      const q =
        (
          req.query.q || ''
        )
        .trim()
        .toLowerCase()

      const creditos =
        await Credito.findAll({

          where: {
            cobradorId:
              collector.id
          },

          include: [

            {
              model: Client,
              as: 'cliente'
            },

            {
              model: CreditoDetalle,
              as: 'cuotas'
            }

          ],

          order: [
            ['numeroCredito', 'DESC']
          ]

        })

      const resultado =
        creditos
          .filter(
            credito => {

              const cliente =
                credito.cliente

              return (

                String(
                  credito.numeroCredito
                ).includes(q)

                ||

                cliente?.nombre
                  ?.toLowerCase()
                  .includes(q)

                ||

                cliente?.apellido
                  ?.toLowerCase()
                  .includes(q)

                ||

                cliente?.dni
                  ?.includes(q)

              )

            }
          )
          .map(
            credito => {

              const saldo =
                credito.cuotas.reduce(

                  (
                    total,
                    cuota
                  ) =>

                    total +

                    (
                      Number(
                        cuota.monto
                      ) -

                      Number(
                        cuota.montoPago
                      )
                    ),

                  0

                )

              const pendientes =
                credito.cuotas.filter(

                  c =>
                    c.estado !==
                    'PAGADA'

                ).length

              return {

                id:
                  credito.id,

                numeroCredito:
                  credito.numeroCredito,

                estado:
                  credito.estado,

                cliente: {

                  id:
                    credito.cliente.id,

                  nombre:
                    credito.cliente.nombre,

                  apellido:
                    credito.cliente.apellido,

                  dni:
                    credito.cliente.dni,

                  celular:
                    credito.cliente.celular

                },

                saldo,

                cuotasPendientes:
                  pendientes

              }

            }
          )

      return res.json({

        success: true,

        data: resultado

      })

    } catch (error) {

      next(error)

    }

  }
export const pagarCuotaMobile =
  async (
    req,
    res,
    next
  ) => {

    if (esSupervisor(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          'Supervisores no pueden registrar pagos desde mobile.'
      })
    }

    return registrarPagoCuota(
      req,
      res,
      next
    )

  }

export const getCreditoMobile =
  async (
    req,
    res,
    next
  ) => {

    try {
      const creditoWhere = {
        id: req.params.id
      }

      if (esSupervisor(req.user)) {
        const supervisor =
          await obtenerSupervisor(
            req.user.id
          )

        if (!supervisor) {
          return res.status(404).json({
            success: false,
            message:
              'Supervisor no encontrado'
          })
        }

        const collectors =
          await Collector.findAll({
            where: {
              supervisorId:
                supervisor.id,
              activo: true
            }
          })

        creditoWhere.cobradorId =
          collectors.map(
            (c) => c.id
          )
      } else {
        const collector =
          await obtenerCollector(
            req.user.id
          )

        if (!collector) {
          return res.status(404).json({
            success: false,
            message:
              'Cobrador no encontrado'
          })
        }

        creditoWhere.cobradorId =
          collector.id
      }

      const credito =
        await Credito.findOne({
          where: creditoWhere,
          include: [
            {
              model: Client,
              as: 'cliente'
            },
            {
              model: CreditoDetalle,
              as: 'cuotas',
              order: [
                ['numeroCuota', 'ASC']
              ]
            }
          ]
        })

      if (!credito) {
        return res.status(404).json({
          success: false,
          message:
            'Crédito no encontrado'
        })
      }

      const saldo =
        credito.cuotas.reduce(
          (t, c) =>
            t +
            (
              Number(c.monto) -
              Number(c.montoPago)
            ),
          0
        )

      return res.json({
        success: true,
        data: {
          id: credito.id,
          numeroCredito:
            credito.numeroCredito,
          cantidadCuotas:
            credito.cantidadCuotas,
          estado: credito.estado,
          saldo,
          cliente: credito.cliente,
          cuotas: credito.cuotas.map(
            (c) => ({
              id: c.id,
              numeroCuota: c.numeroCuota,
              estado: c.estado,
              monto: c.monto,
              montoPago: c.montoPago,
              saldo:
                Number(c.monto) -
                Number(c.montoPago),
              fechaPagoEsperada:
                c.fechaPagoEsperada,
              fechaVencimiento:
                c.fechaVencimiento
            })
          )
        }
      })
    } catch (error) {
      next(error)
    }
  }

export const perfilMobile =
  async (
    req,
    res,
    next
  ) => {

    try {
      if (esSupervisor(req.user)) {
        const supervisor =
          await obtenerSupervisor(
            req.user.id
          )

        if (!supervisor) {
          return res.status(404).json({
            success: false,
            message:
              'Supervisor no encontrado'
          })
        }

        const collectors =
          await Collector.findAll({
            where: {
              supervisorId:
                supervisor.id,
              activo: true
            }
          })

        const collectorIds =
          collectors.map((c) => c.id)

        const hoy =
          obtenerFechaLocal()

        const creditos =
          await Credito.findAll({
            where: {
              cobradorId: collectorIds,
              activo: true
            },
            include: [
              {
                model: CreditoDetalle,
                as: 'cuotas'
              }
            ]
          })

        let cobradoHoy = 0
        let cuotasCobradas = 0
        let pendienteCobro = 0
        let cuotasPendientes = 0
        let cuotasVencidas = 0
        let cuotasVencenHoy = 0
        const clientesVisitadosHoy = new Set()

        creditos.forEach((credito) => {
          credito.cuotas.forEach((cuota) => {
            const saldo =
              Number(cuota.monto) -
              Number(cuota.montoPago)

            if (cuota.fechaPago === hoy) {
              cobradoHoy += Number(cuota.montoPago)
              cuotasCobradas++
              clientesVisitadosHoy.add(credito.clienteId)
            }

            if (cuota.estado === 'VENCIDA') {
              cuotasVencidas++
            }

            // Pendiente de cobrar del día: saldo de las cuotas
            // que vencen hoy y todavía no están pagas.
            if (cuota.fechaPagoEsperada === hoy) {
              cuotasVencenHoy++

              if (cuota.estado !== 'PAGADA') {
                cuotasPendientes++
                pendienteCobro += saldo
              }
            }
          })
        })

        const efectividad =
          cuotasVencenHoy === 0
            ? 0
            : Math.round(
                (cuotasCobradas * 100) / cuotasVencenHoy
              )

        return res.json({
          success: true,
          data: {
            nombre: req.user.name,
            rol: req.user.role?.name,
            cobradoHoy,
            cuotasCobradas,
            pendienteCobro,
            cuotasPendientes,
            cuotasVencidas,
            efectividad,
            cobradoresActivos: collectors.length,
            clientesVisitadosHoy: clientesVisitadosHoy.size
          }
        })
      }

      const collector =
        await obtenerCollector(req.user.id)

      if (!collector) {
        return res.status(404).json({
          success: false,
          message: 'Cobrador no encontrado'
        })
      }

      const hoy =
        obtenerFechaLocal()

      const creditos =
        await Credito.findAll({
          where: {
            cobradorId: collector.id,
            activo: true
          },
          include: [
            {
              model: CreditoDetalle,
              as: 'cuotas'
            }
          ]
        })

      let cobradoHoy = 0
      let cuotasCobradas = 0
      let pendienteCobro = 0
      let cuotasPendientes = 0
      let cuotasVencidas = 0
      let cuotasVencenHoy = 0

      creditos.forEach((credito) => {
        credito.cuotas.forEach((cuota) => {
          const saldo = Number(cuota.monto) - Number(cuota.montoPago)

          if (cuota.fechaPago === hoy) {
            cobradoHoy += Number(cuota.montoPago)
            cuotasCobradas++
          }

          if (cuota.estado === 'VENCIDA') {
            cuotasVencidas++
          }

          // Pendiente de cobrar del día: saldo de las cuotas que
          // vencen hoy y todavía no están pagas.
          if (cuota.fechaPagoEsperada === hoy) {
            cuotasVencenHoy++

            if (cuota.estado !== 'PAGADA') {
              cuotasPendientes++
              pendienteCobro += saldo
            }
          }
        })
      })

      const efectividad =
        cuotasVencenHoy === 0
          ? 0
          : Math.round(
              (cuotasCobradas * 100) / cuotasVencenHoy
            )

      return res.json({
        success: true,
        data: {
          nombre: req.user.name,
          rol: req.user.role?.name,
          cobradoHoy,
          cuotasCobradas,
          pendienteCobro,
          cuotasPendientes,
          cuotasVencidas,
          efectividad
        }
      })
    } catch (error) {
      next(error)
    }
  }

export const zonasMobile =
  async (
    req,
    res,
    next
  ) => {

    try {

      if (!esSupervisor(req.user)) {

        return res.json({
          success: true,
          data: []
        })

      }

      const supervisor =
        await obtenerSupervisor(
          req.user.id
        )

      if (!supervisor) {

        return res.status(404).json({
          success: false,
          message: 'Supervisor no encontrado'
        })

      }

      const zonas =
        await supervisor.getZonas({
          order: [['nombre', 'ASC']]
        })

      return res.json({
        success: true,
        data: zonas
      })

    } catch (error) {
      next(error)
    }
  }

export const recorridoMobile =
async (
  req,
  res,
  next
) => {

  try {

    const collector =
      await obtenerCollector(
        req.user.id
      )

    if (!collector) {

      return res.status(404).json({

        success: false,

        message:
          'Cobrador no encontrado'

      })

    }

    const creditos =
      await Credito.findAll({

        where: {

          cobradorId:
            collector.id,

          estado: [
            'NUEVO',
            'EN_CURSO'
          ]

        },

        include: [

          {

            model: Client,

            as: 'cliente'

          },

          {

            model: CreditoDetalle,

            as: 'cuotas'

          }

        ]

      })

    const resultado =
      creditos.map(
        credito => {

          const cuotasPendientes =
            credito.cuotas.filter(

              c =>

                c.estado !==
                'PAGADA'

            )

        const proxima =
  cuotasPendientes
    .sort(
      (a, b) =>
        a.numeroCuota -
        b.numeroCuota
    )[0]

const proximaCuota =
  proxima
    ? {
        id: proxima.id,
        numeroCuota: proxima.numeroCuota,
        saldo:
          Number(proxima.monto) -
          Number(proxima.montoPago),
        estado: proxima.estado,
        fechaVencimiento:
          proxima.fechaVencimiento
      }
    : null

              const saldoCredito =
  cuotasPendientes.reduce(

    (total, cuota) =>

      total +

      (

        Number(cuota.monto) -

        Number(cuota.montoPago)

      ),

    0

  )
          return {

            id:
              credito.id,

            numeroCredito:
              credito.numeroCredito,

          saldoCredito,

            cuotasPendientes:
              cuotasPendientes.length,

            proximaCuota,

            cliente: {

              id:
                credito.cliente.id,

              nombre:
                credito.cliente.nombre,

              apellido:
                credito.cliente.apellido,

              dni:
                credito.cliente.dni,

              celular:
                credito.cliente.celular,

              direccion:
                credito.cliente.direccion,

              latitud:
                credito.cliente.latitud,

              longitud:
                credito.cliente.longitud,

              mapsUrl:
                credito.cliente.mapsUrl

            }

          }

        }
      )

    return res.json({

      success: true,

      data: resultado

    })

  } catch (error) {

    next(error)

  }

}


export const ayudasMobile =
async (
  req,
  res,
  next
) => {

  try {

    const origen =
      await obtenerOrigen(req.user)

    if (!origen) {

      return res.status(404).json({

        success:false,

        message:
          'Usuario no encontrado'

      })

    }

    const recibidas =
      await Ayuda.findAll({

        where:{

          destinoTipo:origen.tipo,

          destinoId:origen.registro.id,

          activo:true

        },

        include:[

          {

            model:Collector,

            as:'origenCobrador',

            attributes:[
              'id',
              'nombre',
              'apellido'
            ]

          },

          {

            model:Supervisor,

            as:'origenSupervisor',

            attributes:[
              'id',
              'nombre',
              'apellido'
            ]

          }

        ],

        order:[
          ['fecha','DESC']
        ]

      })

    const enviadas =
      await Ayuda.findAll({

        where:{

          origenTipo:origen.tipo,

          origenId:origen.registro.id,

          activo:true

        },

        include:[

          {

            model:Collector,

            as:'destinoCobrador',

            attributes:[
              'id',
              'nombre',
              'apellido'
            ]

          },

          {

            model:Supervisor,

            as:'destinoSupervisor',

            attributes:[
              'id',
              'nombre',
              'apellido'
            ]

          }

        ],

        order:[
          ['fecha','DESC']
        ]

      })

    return res.json({

      success:true,

      data:{

        recibidas,

        enviadas

      }

    })

  }

  catch(error){

    next(error)

  }

}

export const crearAyudaMobile =
async (
  req,
  res,
  next
) => {

  try {

    const origen =
      await obtenerOrigen(req.user)

    if (!origen) {

      return res.status(404).json({

        success:false,

        message:'Usuario no encontrado'

      })

    }

    const {

      destinoTipo,

      destinoId,

      monto,

      observaciones

    } = req.body

    if (

      destinoTipo === origen.tipo &&

      destinoId === origen.registro.id

    ) {

      return res.status(400).json({

        success:false,

        message:
          'No puede enviarse una ayuda a usted mismo.'

      })

    }

    /*
    El destinatario tiene que pertenecer al mismo owner
    que quien envía, sin importar el rol de cada uno.
    */

    const ownerId =
      origen.registro.ownerId

    const destinoValido =
      destinoTipo === 'COBRADOR'
        ? await Collector.findOne({
            where: { id: destinoId, ownerId, activo: true }
          })
        : destinoTipo === 'SUPERVISOR'
          ? await Supervisor.findOne({
              where: { id: destinoId, ownerId }
            })
          : null

    if (!destinoValido) {

      return res.status(400).json({

        success:false,

        message: 'Destinatario inválido.'

      })

    }

    const numero =
      String(

        (await Ayuda.count()) + 1

      ).padStart(

        6,

        '0'

      )

    const ayuda =
      await Ayuda.create({

        numeroAyuda:
          numero,

        fecha:
          new Date(),

        origenTipo:
          origen.tipo,

        origenId:
          origen.registro.id,

        destinoTipo,

        destinoId,

        monto,

        observaciones,

        estado:
          'PENDIENTE'

      })

    return res.status(201).json({

      success:true,

      data:ayuda

    })

  }

  catch(error){

    next(error)

  }

}


export const destinatariosAyudaMobile =
async (
  req,
  res,
  next
) => {

  try {

    const origen =
      await obtenerOrigen(req.user)

    if (!origen) {

      return res.status(404).json({

        success:false,

        message:'Usuario no encontrado'

      })

    }

    const ownerId =
      origen.registro.ownerId

    const cobradores =
      await Collector.findAll({
        where: { ownerId, activo: true },
        attributes: ['id', 'nombre', 'apellido']
      })

    const supervisores =
      await Supervisor.findAll({
        where: { ownerId },
        attributes: ['id', 'nombre', 'apellido']
      })

    const destinatarios = [

      ...cobradores.map(c => ({
        tipo: 'COBRADOR',
        id: c.id,
        nombre: `${c.apellido}, ${c.nombre}`
      })),

      ...supervisores.map(s => ({
        tipo: 'SUPERVISOR',
        id: s.id,
        nombre: `${s.apellido}, ${s.nombre}`
      }))

    ].filter(
      d => !(d.tipo === origen.tipo && d.id === origen.registro.id)
    )

    return res.json({

      success:true,

      data: destinatarios

    })

  }

  catch(error){

    next(error)

  }

}


export const aceptarAyudaMobile =
async (
  req,
  res,
  next
) => {

  try {

    const origen =
      await obtenerOrigen(req.user)

    if (!origen) {

      return res.status(404).json({ success:false })

    }

    const ayuda =
      await Ayuda.findByPk(
        req.params.id
      )

    if (

      !ayuda ||

      ayuda.destinoTipo !== origen.tipo ||

      ayuda.destinoId !== origen.registro.id

    ){

      return res.status(404).json({

        success:false

      })

    }

    ayuda.estado =
      'ACEPTADA'

    ayuda.fechaAceptacion =
      new Date()

    await ayuda.save()

    res.json({

      success:true,

      data:ayuda

    })

  }

  catch(error){

    next(error)

  }

}


export const rechazarAyudaMobile =
async (
  req,
  res,
  next
) => {

  try {

    const origen =
      await obtenerOrigen(req.user)

    if (!origen) {

      return res.status(404).json({ success:false })

    }

    const ayuda =
      await Ayuda.findByPk(
        req.params.id
      )

    if (

      !ayuda ||

      ayuda.destinoTipo !== origen.tipo ||

      ayuda.destinoId !== origen.registro.id

    ){

      return res.status(404).json({

        success:false

      })

    }

    ayuda.estado =
      'RECHAZADA'

    ayuda.fechaRechazo =
      new Date()

    ayuda.motivoRechazo =
      req.body.motivoRechazo

    await ayuda.save()

    res.json({

      success:true,

      data:ayuda

    })

  }

  catch(error){

    next(error)

  }

}