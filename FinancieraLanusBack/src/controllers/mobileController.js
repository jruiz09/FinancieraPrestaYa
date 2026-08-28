import { Op } from 'sequelize'

import {
  Collector,
  Supervisor,
  Credito,
  CreditoDetalle,
  Client,
  Ayuda,
  Vale,
  Zone,
  sequelize
} from '../models/index.js'

import {
  registrarPagoCuota
} from './creditoController.js'

import {
  generarNumeroVale
} from './valeController.js'

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
        await CreditoDetalle.findAll({
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
                  collectorIds
              }
            }
          ],
          where: {
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
      let cuotasPendientes = 0
      let cuotasVencidas = 0
      const clientesVisitadosHoy =
        new Set()

      cuotas.forEach(
        (cuota) => {
          const credito =
            cuota.credito

          if (!credito) {
            return
          }

          const collector =
            collectorMap.get(
              credito.cobradorId
            )

          if (!collector) {
            return
          }

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
            clientesVisitadosHoy.add(
              credito.clienteId
            )
          }

          if (
            cuota.estado !==
            'PAGADA'
          ) {
            cuotasPendientes++
            collector.clientesPendientes.add(
              credito.clienteId
            )
          }

          if (
            cuota.estado ===
            'VENCIDA'
          ) {
            cuotasVencidas++
            collector.vencidas++
          }

          if (
            fechaPago === hoyString
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

      return res.json({
        success: true,
        data: {
          cobradoHoy,
          cuotasPendientes,
          cuotasVencidas,
          cobradoresActivos:
            collectors.length,
          clientesVisitadosHoy:
            clientesVisitadosHoy.size,
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

      const cuotas =
        await CreditoDetalle.findAll({

          include: [

            {

              model: Credito,

              as: 'credito',

              where: {

                cobradorId:
                  collector.id

              },

              include: [

                {

                  model: Client,

                  as: 'cliente'

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

      const cuotas =
        await CreditoDetalle.findAll({

          include: [

            {

              model: Credito,

              as: 'credito',

              where: {

                cobradorId:
                  collector.id

              },

              include: [

                {

                  model: Client,

                  as: 'cliente'

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

            if (cuota.estado !== 'PAGADA') {
              pendienteCobro += saldo
            }

            if (cuota.estado === 'VENCIDA') {
              cuotasVencidas++
            }

            if (cuota.fechaPagoEsperada === hoy) {
              cuotasVencenHoy++

              if (cuota.estado !== 'PAGADA') {
                cuotasPendientes++
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

          if (cuota.estado !== 'PAGADA') {
            pendienteCobro += saldo
          }

          if (cuota.estado === 'VENCIDA') {
            cuotasVencidas++
          }

          if (cuota.fechaPagoEsperada === hoy) {
            cuotasVencenHoy++

            if (cuota.estado !== 'PAGADA') {
              cuotasPendientes++
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

    const collector =
      await obtenerCollector(
        req.user.id
      )

    if (!collector) {

      return res.status(404).json({

        success:false,

        message:
          'Cobrador no encontrado'

      })

    }

    const recibidas =
      await Ayuda.findAll({

        where:{

          destinoTipo:'COBRADOR',

          destinoId:collector.id,

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

          origenTipo:'COBRADOR',

          origenId:collector.id,

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

    const collector =
      await obtenerCollector(
        req.user.id
      )

    if (!collector) {

      return res.status(404).json({

        success:false,

        message:'Cobrador no encontrado'

      })

    }

    const {

      destinoTipo,

      destinoId,

      monto,

      observaciones

    } = req.body

    if (

      destinoTipo === 'COBRADOR' &&

      destinoId === collector.id

    ) {

      return res.status(400).json({

        success:false,

        message:
          'No puede enviarse una ayuda a usted mismo.'

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
          'COBRADOR',

        origenId:
          collector.id,

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


export const valesMobile =
async (
  req,
  res,
  next
) => {

  try {

    const where = {
      activo: true
    }

    if (esSupervisor(req.user)) {

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

      where.supervisorId =
        supervisor.id

    } else {

      const collector =
        await obtenerCollector(
          req.user.id
        )

      if (!collector) {

        return res.status(404).json({

          success: false,

          message: 'Cobrador no encontrado'

        })

      }

      where.collectorId =
        collector.id

    }

    const vales =
      await Vale.findAll({

        where,

        order: [
          ['fecha', 'DESC']
        ]

      })

    return res.json({

      success: true,

      data: vales

    })

  } catch (error) {

    next(error)

  }

}


const TIPOS_VALE_PERMITIDOS = [
  'ADELANTO',
  'COMBUSTIBLE',
  'GASTOS',
  'OTROS'
]

export const crearValeMobile =
async (
  req,
  res,
  next
) => {

  const transaction =
    await sequelize.transaction()

  try {

    const {
      tipo,
      monto,
      observaciones
    } = req.body

    if (!TIPOS_VALE_PERMITIDOS.includes(tipo)) {

      await transaction.rollback()

      return res.status(400).json({
        success: false,
        message: 'Tipo de vale inválido.'
      })

    }

    const montoVale =
      Number(monto)

    if (
      !Number.isFinite(montoVale) ||
      montoVale <= 0
    ) {

      await transaction.rollback()

      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a cero.'
      })

    }

    /*
    El origen del autovale se resuelve siempre desde
    req.user.id, nunca desde el body, para que un cobrador
    o supervisor no pueda cargar un vale a nombre de otro.
    */

    let collectorId = null
    let supervisorId = null
    let usuarioRecepcionId = null

    if (esSupervisor(req.user)) {

      const supervisor =
        await obtenerSupervisor(
          req.user.id
        )

      if (!supervisor) {

        await transaction.rollback()

        return res.status(404).json({
          success: false,
          message: 'Supervisor no encontrado'
        })

      }

      supervisorId = supervisor.id
      usuarioRecepcionId = req.user.id

    } else {

      const collector =
        await obtenerCollector(
          req.user.id
        )

      if (!collector) {

        await transaction.rollback()

        return res.status(404).json({
          success: false,
          message: 'Cobrador no encontrado'
        })

      }

      collectorId = collector.id
      usuarioRecepcionId = req.user.id

    }

    const numero =
      await generarNumeroVale(transaction)

    const vale =
      await Vale.create(
        {
          numero,

          fecha:
            new Date(),

          ownerId:
            req.user.ownerId,

          collectorId,

          supervisorId,

          tipo,

          monto: montoVale,

          observaciones:
            observaciones || null,

          usuarioEntregaId:
            req.user.id,

          usuarioRecepcionId
        },
        { transaction }
      )

    await transaction.commit()

    return res.status(201).json({
      success: true,
      data: vale
    })

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback()
    }

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

    const collector =
      await obtenerCollector(
        req.user.id
      )

    const ayuda =
      await Ayuda.findByPk(
        req.params.id
      )

    if (

      !ayuda ||

      ayuda.destinoTipo !== 'COBRADOR' ||

      ayuda.destinoId !== collector.id

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

    const collector =
      await obtenerCollector(
        req.user.id
      )

    const ayuda =
      await Ayuda.findByPk(
        req.params.id
      )

    if (

      !ayuda ||

      ayuda.destinoTipo !== 'COBRADOR' ||

      ayuda.destinoId !== collector.id

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