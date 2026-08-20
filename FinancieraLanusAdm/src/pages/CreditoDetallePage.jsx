import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useParams,
  useNavigate
} from 'react-router-dom'

import toast from 'react-hot-toast'

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  HandCoins,
  Loader2,
  MessageCircle,
  ReceiptText,
  UserRound,
  Wallet,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  BadgeDollarSign
} from 'lucide-react'

import {
  creditoService
} from '../services/creditoService'

import PagoCuotaModal
  from '../components/PagoCuotaModal'

import ConfirmCascadaModal
  from '../components/ConfirmCascadaModal'


export default function CreditoDetallePage() {

  const navigate =
    useNavigate()

  const { id } =
    useParams()

  const [
    credito,
    setCredito
  ] = useState(null)

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState(false)

  const [
    cuotaSeleccionada,
    setCuotaSeleccionada
  ] = useState(null)

  const [
    modalPagoOpen,
    setModalPagoOpen
  ] = useState(false)

  const [
    loadingPago,
    setLoadingPago
  ] = useState(false)

  const [
    confirmacionPendiente,
    setConfirmacionPendiente
  ] = useState(null)


  /* ===================================================== */
  /* CARGA */
  /* ===================================================== */

  useEffect(() => {

    cargarCredito()

  }, [id])


  const cargarCredito =
    async () => {

      try {

        setLoading(true)
        setError(false)

        const data =
          await creditoService
            .getById(id)

        setCredito(data)

      } catch (error) {

        console.error(error)

        setError(true)

      } finally {

        setLoading(false)

      }

    }


  /* ===================================================== */
  /* HELPERS */
  /* ===================================================== */

  const formatDate =
    fecha => {

      if (!fecha)
        return '-'

      const fechaLimpia =
        String(fecha)
          .split('T')[0]

      const [
        anio,
        mes,
        dia
      ] = fechaLimpia.split('-')

      if (
        !anio ||
        !mes ||
        !dia
      ) {
        return fecha
      }

      return `${dia}/${mes}/${anio}`

    }


  const money =
    value =>
      Number(
        value || 0
      ).toLocaleString(
        'es-AR'
      )


const obtenerLinkConsulta = () => {

  if (!credito?.tokenConsulta) {
    return null
  }

  return `${window.location.origin}/consulta/${credito.tokenConsulta}`

}

const copiarLinkEstado = async () => {

  try {

    const url =
      obtenerLinkConsulta()

    if (!url) {

      toast.error(
        'Este crédito no tiene token de consulta'
      )

      return
    }

    await navigator
      .clipboard
      .writeText(url)

    toast.success(
      'Link del cliente copiado'
    )

    console.log(
      'Link copiado:',
      url
    )

  } catch (error) {

    console.error(error)

    toast.error(
      'No se pudo copiar el link'
    )

  }

}

  /* ===================================================== */
  /* CUOTAS */
  /* ===================================================== */

  const cuotasOrdenadas =
    useMemo(
      () => {

        if (!credito?.cuotas)
          return []

        return [
          ...credito.cuotas
        ].sort(
          (a, b) =>
            a.numeroCuota -
            b.numeroCuota
        )

      },
      [credito]
    )


  const cuotasPagadas =
    cuotasOrdenadas.filter(
      cuota =>
        cuota.estado ===
        'PAGADA'
    ).length


  const cuotasPendientes =
    cuotasOrdenadas.filter(
      cuota =>
        cuota.estado !==
        'PAGADA'
    ).length


  const cuotasVencidas =
    cuotasOrdenadas.filter(
      cuota =>
        cuota.estado ===
        'VENCIDA'
    ).length


  const notasSaldoAFavor =
    (credito?.observaciones || '')
      .split('\n')
      .filter(linea =>
        linea
          .toLowerCase()
          .includes('saldo a favor')
      )


  const porcentaje =
    cuotasOrdenadas.length
      ? Math.round(
          (
            cuotasPagadas *
            100
          ) /
          cuotasOrdenadas.length
        )
      : 0


  const montoCobrado =
    cuotasOrdenadas.reduce(
      (total, cuota) =>
        total +
        Number(
          cuota.montoPago || 0
        ),
      0
    )


  const saldoPendiente =
    Math.max(
      0,
      Number(
        credito?.montoFinal || 0
      ) -
      montoCobrado
    )


  const proximaCuota =
    cuotasOrdenadas.find(
      cuota =>
        cuota.estado !==
        'PAGADA'
    )


  /* ===================================================== */
  /* COMPARTIR */
  /* ===================================================== */



  const normalizarTelefono =
    telefono => {

      let numero =
        String(
          telefono || ''
        ).replace(
          /\D/g,
          ''
        )

      if (
        numero.startsWith('549')
      ) {
        return numero
      }

      if (
        numero.startsWith('54')
      ) {
        return `549${numero.slice(2)}`
      }

      if (
        numero.startsWith('11')
      ) {
        return `549${numero}`
      }

      return `549${numero}`

    }

const compartirWhatsapp = () => {

  const telefono =
    normalizarTelefono(
      credito.cliente?.celular
    )

  if (!credito?.tokenConsulta) {

    toast.error(
      'Este crédito no tiene token de consulta'
    )

    return
  }

  if (!telefono) {

    toast.error(
      'El cliente no tiene celular'
    )

    return
  }

  const url =
    obtenerLinkConsulta()

  const mensaje =
`Hola ${credito.cliente?.nombre || ''},

Podés consultar el estado de tu crédito aquí:

${url}`

  window.open(
    `https://wa.me/${telefono}?text=${encodeURIComponent(
      mensaje
    )}`,
    '_blank'
  )

}

  /* ===================================================== */
  /* PAGO */
  /* ===================================================== */

  const registrarPago =
    async data => {

      try {

        setLoadingPago(true)

        const respuesta =
          await creditoService
            .registrarPago(
              cuotaSeleccionada.id,
              data
            )

        if (respuesta.requiereConfirmacion) {

          setConfirmacionPendiente({
            formData: data,
            ...respuesta.data
          })

          return
        }

        setModalPagoOpen(false)
        setCuotaSeleccionada(null)

        toast.success(
          'Pago registrado correctamente'
        )

        await cargarCredito()

      } catch (error) {

        console.error(error)

        toast.error(
          error?.response
            ?.data
            ?.message ||
          'No se pudo registrar el pago'
        )

      } finally {

        setLoadingPago(false)

      }

    }


  const confirmarCascada =
    async () => {

      try {

        setLoadingPago(true)

        await creditoService
          .registrarPago(
            cuotaSeleccionada.id,
            {
              ...confirmacionPendiente.formData,
              confirmado: true
            }
          )

        setConfirmacionPendiente(null)
        setModalPagoOpen(false)
        setCuotaSeleccionada(null)

        toast.success(
          'Pago registrado correctamente'
        )

        await cargarCredito()

      } catch (error) {

        console.error(error)

        toast.error(
          error?.response
            ?.data
            ?.message ||
          'No se pudo registrar el pago'
        )

      } finally {

        setLoadingPago(false)

      }

    }


  /* ===================================================== */
  /* LOADING */
  /* ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-[400px]
        flex
        flex-col
        items-center
        justify-center
        text-stone-500
      ">

        <Loader2
          className="
            w-8
            h-8
            animate-spin
            text-amber-600
            mb-3
          "
        />

        <p className="
          font-medium
        ">
          Cargando crédito...
        </p>

      </div>

    )

  }


  /* ===================================================== */
  /* ERROR */
  /* ===================================================== */

  if (
    error ||
    !credito
  ) {

    return (

      <div className="
        min-h-[400px]
        flex
        items-center
        justify-center
      ">

        <div className="
          text-center
          max-w-sm
        ">

          <div className="
            w-14
            h-14
            mx-auto
            rounded-full
            bg-red-100
            text-red-600
            flex
            items-center
            justify-center
            mb-4
          ">

            <AlertTriangle
              className="w-6 h-6"
            />

          </div>

          <h2 className="
            text-xl
            font-bold
            text-stone-900
          ">
            Crédito no encontrado
          </h2>

          <p className="
            text-sm
            text-stone-500
            mt-2
          ">
            No pudimos obtener la
            información del crédito.
          </p>

          <button
            onClick={() =>
              navigate('/creditos')
            }
            className="
              mt-5
              px-4
              py-2
              bg-stone-900
              text-white
              rounded-xl
              text-sm
              font-semibold
            "
          >
            Volver a créditos
          </button>

        </div>

      </div>

    )

  }


  /* ===================================================== */
  /* DATOS */
  /* ===================================================== */

  const numeroCredito =
    `CR-${String(
      credito.numeroCredito || 0
    ).padStart(
      6,
      '0'
    )}`


  const clienteNombre =
    `${credito.cliente?.apellido || ''} ${credito.cliente?.nombre || ''}`.trim()


  const cobradorNombre =
    credito.cobrador
      ? `${credito.cobrador.apellido || ''} ${credito.cobrador.nombre || ''}`.trim()
      : '-'


  return (

    <div className="
      space-y-6
      pb-8
    ">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        <div className="
          h-1.5
          bg-gradient-to-r
          from-amber-500
          to-orange-600
        " />

        <div className="
          p-5
          md:p-6
        ">

          <div className="
            flex
            flex-col
            xl:flex-row
            xl:items-start
            xl:justify-between
            gap-5
          ">

            {/* INFO */}

            <div className="
              flex
              items-start
              gap-4
              min-w-0
            ">

              <div className="
                hidden
                sm:flex
                w-12
                h-12
                rounded-2xl
                bg-amber-100
                text-amber-700
                items-center
                justify-center
                shrink-0
              ">

                <CreditCard
                  className="w-6 h-6"
                />

              </div>

              <div className="
                min-w-0
              ">

                <div className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                ">

                  <h1 className="
                    text-2xl
                    md:text-3xl
                    font-bold
                    tracking-tight
                    text-stone-900
                  ">
                    {numeroCredito}
                  </h1>

                  <EstadoCreditoBadge
                    estado={
                      credito.estado
                    }
                  />

                </div>

                <p className="
                  text-lg
                  font-semibold
                  text-stone-700
                  mt-2
                ">
                  {clienteNombre}
                </p>

                <div className="
                  flex
                  flex-wrap
                  gap-x-5
                  gap-y-2
                  mt-3
                  text-sm
                  text-stone-500
                ">

                  <span className="
                    flex
                    items-center
                    gap-1.5
                  ">

                    <ReceiptText
                      className="w-4 h-4"
                    />

                    {
                      credito.tipoPlan
                        ?.descripcion ||
                      'Sin plan'
                    }

                  </span>

                  <span className="
                    flex
                    items-center
                    gap-1.5
                  ">

                    <CalendarDays
                      className="w-4 h-4"
                    />

                    Otorgado:
                    {' '}
                    {formatDate(
                      credito.fechaOtorgamiento
                    )}

                  </span>

                </div>

              </div>

            </div>


            {/* ACCIONES */}

            <div className="
              flex
              flex-wrap
              gap-2
            ">

              <button
                onClick={
                  copiarLinkEstado
                }
                className="
                  h-10
                  px-3
                  flex
                  items-center
                  gap-2
                  border
                  border-stone-200
                  rounded-xl
                  text-sm
                  font-semibold
                  text-stone-600
                  hover:bg-stone-50
                  hover:text-stone-900
                  transition
                "
              >

                <Copy
                  className="w-4 h-4"
                />

                <span className="
                  hidden
                  sm:inline
                ">
                  Copiar link
                </span>

              </button>


              <button
                onClick={
                  compartirWhatsapp
                }
                className="
                  h-10
                  px-3
                  flex
                  items-center
                  gap-2
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  rounded-xl
                  text-sm
                  font-semibold
                  transition
                "
              >

                <MessageCircle
                  className="w-4 h-4"
                />

                WhatsApp

              </button>


              <button
                onClick={() =>
                  navigate('/creditos')
                }
                className="
                  h-10
                  px-3
                  flex
                  items-center
                  gap-2
                  bg-stone-100
                  hover:bg-stone-200
                  text-stone-700
                  rounded-xl
                  text-sm
                  font-semibold
                  transition
                "
              >

                <ArrowLeft
                  className="w-4 h-4"
                />

                Volver

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* ALERTA MORA */}
      {/* ================================================= */}

      {cuotasVencidas > 0 && (

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-3
          bg-red-50
          border
          border-red-200
          rounded-xl
          px-4
          py-3
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-9
              h-9
              rounded-lg
              bg-red-100
              text-red-600
              flex
              items-center
              justify-center
              shrink-0
            ">

              <AlertTriangle
                className="w-5 h-5"
              />

            </div>

            <div>

              <p className="
                text-sm
                font-bold
                text-red-800
              ">
                Este crédito requiere atención
              </p>

              <p className="
                text-sm
                text-red-600
              ">
                Tiene {cuotasVencidas}
                {' '}
                {cuotasVencidas === 1
                  ? 'cuota vencida'
                  : 'cuotas vencidas'
                }.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* ================================================= */}
      {/* ALERTA SALDO A FAVOR */}
      {/* ================================================= */}

      {notasSaldoAFavor.length > 0 && (

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-3
          bg-emerald-50
          border
          border-emerald-200
          rounded-xl
          px-4
          py-3
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-9
              h-9
              rounded-lg
              bg-emerald-100
              text-emerald-600
              flex
              items-center
              justify-center
              shrink-0
            ">

              <BadgeDollarSign
                className="w-5 h-5"
              />

            </div>

            <div>

              <p className="
                text-sm
                font-bold
                text-emerald-800
              ">
                El cliente tiene saldo a favor
              </p>

              {notasSaldoAFavor.map(
                (nota, i) => (

                  <p
                    key={i}
                    className="
                      text-sm
                      text-emerald-700
                    "
                  >
                    {nota}
                  </p>

                )
              )}

            </div>

          </div>

        </div>

      )}


      {/* ================================================= */}
      {/* RESUMEN FINANCIERO */}
      {/* ================================================= */}

      <section>

        <div className="
          mb-3
        ">

          <h2 className="
            text-lg
            font-bold
            text-stone-900
          ">
            Resumen financiero
          </h2>

          <p className="
            text-sm
            text-stone-500
          ">
            Estado económico actual del crédito
          </p>

        </div>


        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          <FinancialCard
            icon={Wallet}
            label="Total del crédito"
            value={
              `$ ${money(
                credito.montoFinal
              )}`
            }
            description="Importe total a devolver"
            variant="blue"
          />

          <FinancialCard
            icon={HandCoins}
            label="Total cobrado"
            value={
              `$ ${money(
                montoCobrado
              )}`
            }
            description="Pagos registrados"
            variant="green"
          />

          <FinancialCard
            icon={CircleDollarSign}
            label="Saldo pendiente"
            value={
              `$ ${money(
                saldoPendiente
              )}`
            }
            description={
              saldoPendiente > 0
                ? 'Pendiente de cobro'
                : 'Crédito cancelado'
            }
            variant={
              saldoPendiente > 0
                ? 'amber'
                : 'green'
            }
          />

          <FinancialCard
            icon={TrendingUp}
            label="Avance"
            value={`${porcentaje}%`}
            description={
              `${cuotasPagadas} de ${cuotasOrdenadas.length} cuotas pagadas`
            }
            variant="green"
          />

        </div>

      </section>


      {/* ================================================= */}
      {/* INFORMACION + PROXIMA CUOTA */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-[minmax(0,1fr)_360px]
        gap-5
      ">

        {/* INFORMACION */}

        <div className="
          bg-white
          border
          border-stone-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b
            border-stone-100
          ">

            <h3 className="
              font-bold
              text-stone-900
            ">
              Información del crédito
            </h3>

          </div>

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            divide-y
            sm:divide-y-0
            sm:divide-x
            divide-stone-100
          ">

            <DetailItem
              icon={UserRound}
              label="Cliente"
              value={
                clienteNombre
              }
              secondary={
                `DNI ${credito.cliente?.dni || '-'}`
              }
            />

            <DetailItem
              icon={UserRound}
              label="Cobrador"
              value={
                cobradorNombre
              }
              secondary="Responsable de cobranza"
            />

            <DetailItem
              icon={ReceiptText}
              label="Plan"
              value={
                credito.tipoPlan
                  ?.descripcion ||
                '-'
              }
              secondary={
                credito.tipoPlan?.dias
                  ? `Cada ${credito.tipoPlan.dias} días`
                  : 'Plan del crédito'
              }
            />

            <DetailItem
              icon={CalendarDays}
              label="Otorgamiento"
              value={
                formatDate(
                  credito.fechaOtorgamiento
                )
              }
              secondary="Fecha de alta"
            />

          </div>

        </div>


        {/* PROXIMA CUOTA */}

        <div className={`
          border
          rounded-2xl
          shadow-sm
          overflow-hidden

          ${
            proximaCuota
              ? `
                bg-white
                border-amber-200
              `
              : `
                bg-emerald-50
                border-emerald-200
              `
          }
        `}>

          {proximaCuota ? (

            <>

              <div className="
                flex
                items-center
                justify-between
                px-5
                py-4
                border-b
                border-amber-100
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <CalendarCheck
                    className="
                      w-5
                      h-5
                      text-amber-600
                    "
                  />

                  <h3 className="
                    font-bold
                    text-stone-900
                  ">
                    Próxima cuota
                  </h3>

                </div>

                <EstadoCuotaBadge
                  estado={
                    proximaCuota.estado
                  }
                />

              </div>

              <div className="p-5">

                <div className="
                  flex
                  items-end
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="
                      text-sm
                      text-stone-500
                    ">
                      Cuota
                    </p>

                    <p className="
                      text-3xl
                      font-bold
                      text-stone-900
                    ">
                      #{proximaCuota.numeroCuota}
                    </p>

                  </div>

                  <div className="
                    text-right
                  ">

                    <p className="
                      text-sm
                      text-stone-500
                    ">
                      Importe
                    </p>

                    <p className="
                      text-2xl
                      font-bold
                      text-amber-700
                    ">
                      $ {money(
                        Number(
                          proximaCuota.monto
                        ) -
                        Number(
                          proximaCuota.montoPago || 0
                        )
                      )}
                    </p>

                  </div>

                </div>


                <div className="
                  flex
                  items-center
                  gap-2
                  mt-4
                  pt-4
                  border-t
                  border-stone-100
                  text-sm
                  text-stone-600
                ">

                  <Clock3
                    className="
                      w-4
                      h-4
                      text-stone-400
                    "
                  />

                  Vence el

                  <span className="
                    font-bold
                    text-stone-800
                  ">
                    {formatDate(
                      proximaCuota
                        .fechaVencimiento
                    )}
                  </span>

                </div>


                <button
                  onClick={() => {

                    setCuotaSeleccionada(
                      proximaCuota
                    )

                    setModalPagoOpen(
                      true
                    )

                  }}
                  className="
                    w-full
                    h-11
                    mt-4
                    bg-amber-600
                    hover:bg-amber-700
                    text-white
                    rounded-xl
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition
                  "
                >

                  <HandCoins
                    className="w-4 h-4"
                  />

                  Registrar cobro

                </button>

              </div>

            </>

          ) : (

            <div className="
              p-6
              text-center
            ">

              <div className="
                w-14
                h-14
                mx-auto
                rounded-full
                bg-emerald-100
                text-emerald-600
                flex
                items-center
                justify-center
                mb-3
              ">

                <CheckCircle2
                  className="w-7 h-7"
                />

              </div>

              <p className="
                font-bold
                text-emerald-800
              ">
                Crédito finalizado
              </p>

              <p className="
                text-sm
                text-emerald-600
                mt-1
              ">
                Todas las cuotas fueron pagadas.
              </p>

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* AVANCE */}
      {/* ================================================= */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        p-5
      ">

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-end
          justify-between
          gap-3
          mb-4
        ">

          <div>

            <h3 className="
              font-bold
              text-stone-900
            ">
              Avance del crédito
            </h3>

            <p className="
              text-sm
              text-stone-500
              mt-1
            ">
              {cuotasPagadas} de
              {' '}
              {cuotasOrdenadas.length}
              {' '}
              cuotas completamente pagadas
            </p>

          </div>

          <div className="
            flex
            items-baseline
            gap-1
          ">

            <span className="
              text-2xl
              font-bold
              text-emerald-600
            ">
              {porcentaje}%
            </span>

            <span className="
              text-xs
              text-stone-400
            ">
              completado
            </span>

          </div>

        </div>

        <div className="
          w-full
          h-3
          bg-stone-100
          rounded-full
          overflow-hidden
        ">

          <div
            className="
              h-full
              bg-emerald-500
              rounded-full
              transition-all
              duration-500
            "
            style={{
              width:
                `${porcentaje}%`
            }}
          />

        </div>


        <div className="
          grid
          grid-cols-3
          gap-3
          mt-5
        ">

          <MiniCounter
            label="Total"
            value={
              cuotasOrdenadas.length
            }
            variant="default"
          />

          <MiniCounter
            label="Pagadas"
            value={
              cuotasPagadas
            }
            variant="green"
          />

          <MiniCounter
            label="Pendientes"
            value={
              cuotasPendientes
            }
            variant={
              cuotasVencidas > 0
                ? 'red'
                : 'blue'
            }
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* CUOTAS */}
      {/* ================================================= */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        {/* HEADER TABLA */}

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-3
          px-5
          md:px-6
          py-5
          border-b
          border-stone-100
        ">

          <div>

            <h3 className="
              font-bold
              text-lg
              text-stone-900
            ">
              Cronograma de cuotas
            </h3>

            <p className="
              text-sm
              text-stone-500
              mt-1
            ">
              Historial de vencimientos y pagos
            </p>

          </div>

          <div className="
            flex
            items-center
            gap-2
          ">

            <span className="
              bg-stone-100
              text-stone-600
              px-3
              py-1.5
              rounded-full
              text-xs
              font-semibold
            ">
              {cuotasOrdenadas.length}
              {' '}
              cuotas
            </span>

            {cuotasVencidas > 0 && (

              <span className="
                bg-red-100
                text-red-700
                px-3
                py-1.5
                rounded-full
                text-xs
                font-bold
              ">
                {cuotasVencidas}
                {' '}
                vencidas
              </span>

            )}

          </div>

        </div>


        {/* TABLA */}

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
            text-sm
            min-w-[900px]
          ">

            <thead className="
              bg-stone-50
              text-stone-500
            ">

              <tr>

                <th className="
                  text-left
                  font-semibold
                  px-5
                  py-3
                ">
                  Cuota
                </th>

                <th className="
                  text-left
                  font-semibold
                  px-5
                  py-3
                ">
                  Pago esperado
                </th>

                <th className="
                  text-left
                  font-semibold
                  px-5
                  py-3
                ">
                  Vencimiento
                </th>

                <th className="
                  text-right
                  font-semibold
                  px-5
                  py-3
                ">
                  Importe
                </th>

                <th className="
                  text-right
                  font-semibold
                  px-5
                  py-3
                ">
                  Cobrado
                </th>

                <th className="
                  text-right
                  font-semibold
                  px-5
                  py-3
                ">
                  Saldo
                </th>

                <th className="
                  text-center
                  font-semibold
                  px-5
                  py-3
                ">
                  Estado
                </th>

                <th className="
                  text-right
                  font-semibold
                  px-5
                  py-3
                ">
                  Acción
                </th>

              </tr>

            </thead>


            <tbody className="
              divide-y
              divide-stone-100
            ">

              {cuotasOrdenadas.map(
                cuota => {

                  const saldo =
                    Math.max(
                      0,
                      Number(
                        cuota.monto
                      ) -
                      Number(
                        cuota.montoPago || 0
                      )
                    )

                  const pagada =
                    cuota.estado ===
                    'PAGADA'

                  const vencida =
                    cuota.estado ===
                    'VENCIDA'

                  return (

                    <tr
                      key={cuota.id}
                      className={`
                        transition

                        ${
                          vencida
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : 'hover:bg-stone-50'
                        }
                      `}
                    >

                      {/* NUMERO */}

                      <td className="
                        px-5
                        py-4
                      ">

                        <div className="
                          flex
                          items-center
                          gap-3
                        ">

                          <div className={`
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            font-bold

                            ${
                              pagada
                                ? `
                                  bg-emerald-100
                                  text-emerald-700
                                `
                                : vencida
                                  ? `
                                    bg-red-100
                                    text-red-700
                                  `
                                  : `
                                    bg-stone-100
                                    text-stone-700
                                  `
                            }
                          `}>
                            {cuota.numeroCuota}
                          </div>

                        </div>

                      </td>


                      {/* PAGO ESPERADO */}

                      <td className="
                        px-5
                        py-4
                        text-stone-600
                      ">
                        {formatDate(
                          cuota.fechaPagoEsperada
                        )}
                      </td>


                      {/* VENCIMIENTO */}

                      <td className="
                        px-5
                        py-4
                      ">

                        <span className={`
                          ${
                            vencida
                              ? `
                                text-red-700
                                font-semibold
                              `
                              : `
                                text-stone-600
                              `
                          }
                        `}>
                          {formatDate(
                            cuota.fechaVencimiento
                          )}
                        </span>

                      </td>


                      {/* MONTO */}

                      <td className="
                        px-5
                        py-4
                        text-right
                        font-semibold
                        text-stone-800
                      ">
                        $ {money(
                          cuota.monto
                        )}
                      </td>


                      {/* PAGADO */}

                      <td className="
                        px-5
                        py-4
                        text-right
                        font-semibold
                        text-emerald-600
                      ">
                        $ {money(
                          cuota.montoPago
                        )}
                      </td>


                      {/* SALDO */}

                      <td className="
                        px-5
                        py-4
                        text-right
                      ">

                        <span className={`
                          font-bold

                          ${
                            saldo === 0
                              ? 'text-stone-400'
                              : vencida
                                ? 'text-red-600'
                                : 'text-amber-700'
                          }
                        `}>
                          $ {money(saldo)}
                        </span>

                      </td>


                      {/* ESTADO */}

                      <td className="
                        px-5
                        py-4
                        text-center
                      ">

                        <EstadoCuotaBadge
                          estado={
                            cuota.estado
                          }
                        />

                      </td>


                      {/* ACCION */}

                      <td className="
                        px-5
                        py-4
                        text-right
                      ">

                        {pagada ? (

                          <div className="
                            inline-flex
                            items-center
                            gap-1.5
                            text-emerald-600
                            text-sm
                            font-semibold
                          ">

                            <CheckCircle2
                              className="w-4 h-4"
                            />

                            Pagada

                          </div>

                        ) : (

                          <button
                            onClick={() => {

                              setCuotaSeleccionada(
                                cuota
                              )

                              setModalPagoOpen(
                                true
                              )

                            }}
                            className={`
                              h-9
                              px-3
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              text-sm
                              font-bold
                              text-white
                              transition

                              ${
                                vencida
                                  ? `
                                    bg-red-600
                                    hover:bg-red-700
                                  `
                                  : `
                                    bg-amber-600
                                    hover:bg-amber-700
                                  `
                              }
                            `}
                          >

                            <HandCoins
                              className="w-4 h-4"
                            />

                            {
                              cuota.estado ===
                              'PARCIAL'
                                ? 'Completar'
                                : 'Cobrar'
                            }

                          </button>

                        )}

                      </td>

                    </tr>

                  )

                }
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================================= */}
      {/* MODAL PAGO */}
      {/* ================================================= */}

      <PagoCuotaModal
        isOpen={
          modalPagoOpen &&
          !confirmacionPendiente
        }
        cuota={
          cuotaSeleccionada
        }
        onClose={() => {

          setModalPagoOpen(false)
          setCuotaSeleccionada(null)

        }}
        onConfirm={
          registrarPago
        }
        isLoading={
          loadingPago
        }
      />

      <ConfirmCascadaModal
        isOpen={
          !!confirmacionPendiente
        }
        cuotasAfectadas={
          confirmacionPendiente
            ?.cuotasAfectadas ||
          []
        }
        saldoAFavor={
          confirmacionPendiente
            ?.saldoAFavor ||
          0
        }
        onCancel={() =>
          setConfirmacionPendiente(null)
        }
        onConfirm={
          confirmarCascada
        }
        isLoading={
          loadingPago
        }
      />

    </div>

  )

}


/* ===================================================== */
/* FINANCIAL CARD */
/* ===================================================== */

function FinancialCard({
  icon: Icon,
  label,
  value,
  description,
  variant = 'blue'
}) {

  const styles = {

    blue: {
      border:
        'border-blue-200',
      icon:
        'bg-blue-100 text-blue-700',
      value:
        'text-blue-700'
    },

    green: {
      border:
        'border-emerald-200',
      icon:
        'bg-emerald-100 text-emerald-700',
      value:
        'text-emerald-700'
    },

    amber: {
      border:
        'border-amber-200',
      icon:
        'bg-amber-100 text-amber-700',
      value:
        'text-amber-700'
    },

    red: {
      border:
        'border-red-200',
      icon:
        'bg-red-100 text-red-700',
      value:
        'text-red-700'
    }

  }

  const current =
    styles[variant] ||
    styles.blue

  return (

    <div className={`
      bg-white
      border
      rounded-2xl
      p-5
      shadow-sm
      ${current.border}
    `}>

      <div className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div>

          <p className="
            text-sm
            font-semibold
            text-stone-500
          ">
            {label}
          </p>

          <p className={`
            text-2xl
            xl:text-3xl
            font-bold
            tracking-tight
            mt-2
            ${current.value}
          `}>
            {value}
          </p>

        </div>

        <div className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          shrink-0
          ${current.icon}
        `}>

          <Icon
            className="w-5 h-5"
          />

        </div>

      </div>

      <p className="
        text-xs
        text-stone-400
        mt-3
      ">
        {description}
      </p>

    </div>

  )

}


/* ===================================================== */
/* DETAIL ITEM */
/* ===================================================== */

function DetailItem({
  icon: Icon,
  label,
  value,
  secondary
}) {

  return (

    <div className="
      p-5
    ">

      <div className="
        flex
        items-center
        gap-2
        text-stone-400
        mb-2
      ">

        <Icon
          className="w-4 h-4"
        />

        <p className="
          text-xs
          uppercase
          tracking-wide
          font-semibold
        ">
          {label}
        </p>

      </div>

      <p className="
        font-bold
        text-stone-800
        truncate
      ">
        {value || '-'}
      </p>

      {secondary && (

        <p className="
          text-xs
          text-stone-400
          mt-1
        ">
          {secondary}
        </p>

      )}

    </div>

  )

}


/* ===================================================== */
/* MINI COUNTER */
/* ===================================================== */

function MiniCounter({
  label,
  value,
  variant
}) {

  const styles = {

    default:
      'bg-stone-50 text-stone-800',

    green:
      'bg-emerald-50 text-emerald-700',

    blue:
      'bg-blue-50 text-blue-700',

    red:
      'bg-red-50 text-red-700'

  }

  return (

    <div className={`
      rounded-xl
      p-3
      text-center
      ${styles[variant]}
    `}>

      <p className="
        text-xl
        font-bold
      ">
        {value}
      </p>

      <p className="
        text-xs
        opacity-70
        mt-0.5
      ">
        {label}
      </p>

    </div>

  )

}


/* ===================================================== */
/* ESTADO CUOTA */
/* ===================================================== */

function EstadoCuotaBadge({
  estado
}) {

  const styles = {

    PAGADA:
      'bg-emerald-100 text-emerald-700',

    PARCIAL:
      'bg-amber-100 text-amber-700',

    VENCIDA:
      'bg-red-100 text-red-700',

    PENDIENTE:
      'bg-blue-100 text-blue-700'

  }

  return (

    <span className={`
      inline-flex
      items-center
      px-2.5
      py-1
      rounded-full
      text-[11px]
      font-bold
      tracking-wide
      ${
        styles[estado] ||
        'bg-stone-100 text-stone-600'
      }
    `}>
      {estado || 'PENDIENTE'}
    </span>

  )

}


/* ===================================================== */
/* ESTADO CREDITO */
/* ===================================================== */

function EstadoCreditoBadge({
  estado
}) {

  const finalizado =
    estado === 'FINALIZADO' ||
    estado === 'PAGADO'

  const cancelado =
    estado === 'CANCELADO'

  return (

    <span className={`
      inline-flex
      items-center
      gap-1.5
      px-3
      py-1
      rounded-full
      text-xs
      font-bold

      ${
        finalizado
          ? `
            bg-emerald-100
            text-emerald-700
          `
          : cancelado
            ? `
              bg-red-100
              text-red-700
            `
            : `
              bg-blue-100
              text-blue-700
            `
      }
    `}>

      <span className={`
        w-1.5
        h-1.5
        rounded-full

        ${
          finalizado
            ? 'bg-emerald-500'
            : cancelado
              ? 'bg-red-500'
              : 'bg-blue-500'
        }
      `} />

      {estado || 'ACTIVO'}

    </span>

  )

}