import React, {
  useEffect,
  useState
} from 'react'

import {
  Wallet,
  HandCoins,
  CircleDollarSign,
  TriangleAlert,
  CreditCard,
  Clock3,
  CalendarX2,
  Users,
  ArrowUpRight,
  ReceiptText,
  ShieldCheck
} from 'lucide-react'

import {
  dashboardService
} from '../services/dashboardService'

export default function DashboardPage() {

  const [loading, setLoading] =
    useState(true)

  const [resumen, setResumen] =
    useState(null)

  const [error, setError] =
    useState(false)

  useEffect(() => {
    cargarDashboard()
  }, [])

  const cargarDashboard =
    async () => {

      setLoading(true)
      setError(false)

      try {

        const data =
          await dashboardService.resumen()

        setResumen(data)

      } catch (error) {

        console.error(error)

        setError(true)

      } finally {

        setLoading(false)

      }

    }

  const money = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      'es-AR',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    )

  }

  const creditNumber = (value) => {

    return `CR-${String(
      value || 0
    ).padStart(
      6,
      '0'
    )}`

  }

  if (loading) {

    return (

      <div className="space-y-6">

        <div>

          <div className="
            h-8
            w-48
            bg-stone-200
            rounded-lg
            animate-pulse
          " />

          <div className="
            h-4
            w-72
            bg-stone-100
            rounded
            mt-3
            animate-pulse
          " />

        </div>

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          {[1, 2, 3, 4].map(
            (item) => (

              <div
                key={item}
                className="
                  h-40
                  bg-white
                  border
                  border-stone-200
                  rounded-2xl
                  animate-pulse
                "
              />

            )
          )}

        </div>

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          {[1, 2, 3, 4].map(
            (item) => (

              <div
                key={item}
                className="
                  h-32
                  bg-white
                  border
                  border-stone-200
                  rounded-2xl
                  animate-pulse
                "
              />

            )
          )}

        </div>

      </div>

    )

  }

  if (
    error ||
    !resumen
  ) {

    return (

      <div className="
        bg-red-50
        border
        border-red-200
        rounded-2xl
        p-6
      ">

        <div className="
          flex
          items-start
          gap-4
        ">

          <div className="
            w-11
            h-11
            rounded-xl
            bg-red-100
            flex
            items-center
            justify-center
            shrink-0
          ">

            <TriangleAlert
              className="
                w-5
                h-5
                text-red-600
              "
            />

          </div>

          <div>

            <h2 className="
              font-bold
              text-red-900
            ">
              No pudimos cargar el dashboard
            </h2>

            <p className="
              text-sm
              text-red-700
              mt-1
            ">
              Ocurrió un problema al obtener
              la información.
            </p>

            <button
              onClick={cargarDashboard}
              className="
                mt-4
                px-4
                py-2
                bg-red-600
                hover:bg-red-700
                text-white
                text-sm
                font-semibold
                rounded-lg
                transition
              "
            >
              Reintentar
            </button>

          </div>

        </div>

      </div>

    )

  }

  return (

    <div className="
      space-y-8
      pb-8
    ">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-end
        md:justify-between
        gap-4
      ">

        <div>

          <p className="
            text-sm
            font-semibold
            text-amber-700
            mb-1
          ">
            Resumen general
          </p>

          <h1 className="
            text-3xl
            md:text-4xl
            font-bold
            tracking-tight
            text-stone-900
          ">
            Dashboard
          </h1>

          <p className="
            text-stone-500
            mt-2
            max-w-2xl
          ">
            Estado actual de la cartera,
            cobranzas y créditos de la financiera.
          </p>

        </div>

        <div className="
          inline-flex
          items-center
          gap-2
          self-start
          md:self-auto
          bg-emerald-50
          border
          border-emerald-200
          text-emerald-700
          px-3
          py-2
          rounded-xl
          text-sm
          font-medium
        ">

          <ShieldCheck
            className="w-4 h-4"
          />

          Información actualizada

        </div>

      </div>

      {/* ========================================= */}
      {/* SITUACION FINANCIERA */}
      {/* ========================================= */}

      <section className="space-y-4">

        <div>

          <h2 className="
            text-lg
            font-bold
            text-stone-900
          ">
            Situación financiera
          </h2>

          <p className="
            text-sm
            text-stone-500
            mt-1
          ">
            Vista rápida del dinero prestado,
            pendiente, cobrado y en mora.
          </p>

        </div>

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          {/* CAPITAL PRESTADO */}

          <MetricCard
            title="Capital prestado"
            value={`$ ${money(
              resumen.capitalPrestado
            )}`}
            description="Dinero actualmente colocado"
            icon={Wallet}
            variant="blue"
          />

          {/* SALDO A COBRAR */}

          <MetricCard
            title="Saldo a cobrar"
            value={`$ ${money(
              resumen.saldoCobrar
            )}`}
            description="Capital todavía pendiente"
            icon={HandCoins}
            variant="amber"
          />

          {/* COBRADO HOY */}

          <MetricCard
            title="Cobrado hoy"
            value={`$ ${money(
              resumen.cobradoHoy
            )}`}
            description="Ingresos registrados hoy"
            icon={CircleDollarSign}
            variant="green"
          />

          {/* MORA */}

          <MetricCard
            title="Mora total"
            value={`$ ${money(
              resumen.moraTotal
            )}`}
            description="Importe actualmente vencido"
            icon={TriangleAlert}
            variant="red"
            alert={
              Number(
                resumen.moraTotal
              ) > 0
            }
          />

        </div>

      </section>

      {/* ========================================= */}
      {/* CARTERA */}
      {/* ========================================= */}

      <section className="space-y-4">

        <div>

          <h2 className="
            text-lg
            font-bold
            text-stone-900
          ">
            Estado de la cartera
          </h2>

          <p className="
            text-sm
            text-stone-500
            mt-1
          ">
            Créditos, cuotas y clientes
            que requieren seguimiento.
          </p>

        </div>

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          <CounterCard
            title="Créditos activos"
            value={
              resumen.creditosActivos
            }
            description="Créditos vigentes"
            icon={CreditCard}
            variant="blue"
          />

          <CounterCard
            title="Cuotas pendientes"
            value={
              resumen.cuotasPendientes
            }
            description="Todavía no vencieron"
            icon={Clock3}
            variant="amber"
          />

          <CounterCard
            title="Cuotas vencidas"
            value={
              resumen.cuotasVencidas
            }
            description={
              Number(
                resumen.cuotasVencidas
              ) > 0
                ? 'Requieren atención'
                : 'Sin vencimientos'
            }
            icon={CalendarX2}
            variant="red"
            alert={
              Number(
                resumen.cuotasVencidas
              ) > 0
            }
          />

          <CounterCard
            title="Clientes activos"
            value={
              resumen.clientesActivos
            }
            description="Con actividad vigente"
            icon={Users}
            variant="green"
          />

        </div>

      </section>

      {/* ========================================= */}
      {/* ACTIVIDAD Y ALERTAS */}
      {/* ========================================= */}

      <section className="space-y-4">

        <div>

          <h2 className="
            text-lg
            font-bold
            text-stone-900
          ">
            Actividad y seguimiento
          </h2>

          <p className="
            text-sm
            text-stone-500
            mt-1
          ">
            Últimos créditos registrados y
            principales vencimientos.
          </p>

        </div>

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-5
        ">

          {/* ================================= */}
          {/* ULTIMOS CREDITOS */}
          {/* ================================= */}

          <div className="
            bg-white
            border
            border-stone-200
            rounded-2xl
            overflow-hidden
            shadow-sm
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-4
              px-5
              py-4
              border-b
              border-stone-100
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                ">

                  <ReceiptText
                    className="
                      w-5
                      h-5
                      text-blue-600
                    "
                  />

                </div>

                <div>

                  <h3 className="
                    font-bold
                    text-stone-900
                  ">
                    Últimos créditos
                  </h3>

                  <p className="
                    text-xs
                    text-stone-500
                  ">
                    Operaciones recientes
                  </p>

                </div>

              </div>

            </div>

            <div className="
              divide-y
              divide-stone-100
            ">

              {resumen.ultimosCreditos
                ?.length === 0 && (

                <EmptyState
                  icon={CreditCard}
                  title="Sin créditos recientes"
                  description={
                    'Todavía no hay operaciones para mostrar.'
                  }
                />

              )}

              {resumen.ultimosCreditos
                ?.map(
                  (credito) => (

                    <div
                      key={credito.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        px-5
                        py-4
                        hover:bg-stone-50
                        transition
                      "
                    >

                      <div className="
                        min-w-0
                      ">

                        <div className="
                          flex
                          items-center
                          gap-2
                          mb-1
                        ">

                          <span className="
                            font-bold
                            text-blue-700
                            text-sm
                          ">
                            {
                              creditNumber(
                                credito.numeroCredito
                              )
                            }
                          </span>

                          <span className="
                            bg-blue-50
                            text-blue-700
                            text-[11px]
                            font-semibold
                            px-2
                            py-0.5
                            rounded-full
                          ">
                            Nuevo
                          </span>

                        </div>

                        <p className="
                          text-sm
                          text-stone-600
                          truncate
                        ">
                          {
                            credito.cliente
                              ?.apellido
                          }
                          {' '}
                          {
                            credito.cliente
                              ?.nombre
                          }
                        </p>

                      </div>

                      <div className="
                        text-right
                        shrink-0
                      ">

                        <p className="
                          font-bold
                          text-stone-900
                        ">
                          $ {money(
                            credito.montoFinal
                          )}
                        </p>

                        <p className="
                          text-xs
                          text-stone-400
                          mt-1
                        ">
                          Monto final
                        </p>

                      </div>

                    </div>

                  )
                )}

            </div>

          </div>

          {/* ================================= */}
          {/* MOROSIDAD */}
          {/* ================================= */}

          <div className="
            bg-white
            border
            border-stone-200
            rounded-2xl
            overflow-hidden
            shadow-sm
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-4
              px-5
              py-4
              border-b
              border-stone-100
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-red-50
                  flex
                  items-center
                  justify-center
                ">

                  <TriangleAlert
                    className="
                      w-5
                      h-5
                      text-red-600
                    "
                  />

                </div>

                <div>

                  <h3 className="
                    font-bold
                    text-stone-900
                  ">
                    Atención de mora
                  </h3>

                  <p className="
                    text-xs
                    text-stone-500
                  ">
                    Principales cuotas vencidas
                  </p>

                </div>

              </div>

              {Number(
                resumen.cuotasVencidas
              ) > 0 && (

                <span className="
                  bg-red-100
                  text-red-700
                  px-2.5
                  py-1
                  rounded-full
                  text-xs
                  font-bold
                ">
                  {
                    resumen.cuotasVencidas
                  } vencidas
                </span>

              )}

            </div>

            <div className="
              divide-y
              divide-stone-100
            ">

              {resumen.topMorosos
                ?.length === 0 && (

                <div className="
                  px-5
                  py-8
                  text-center
                ">

                  <div className="
                    w-12
                    h-12
                    mx-auto
                    rounded-full
                    bg-emerald-50
                    flex
                    items-center
                    justify-center
                    mb-3
                  ">

                    <ShieldCheck
                      className="
                        w-6
                        h-6
                        text-emerald-600
                      "
                    />

                  </div>

                  <p className="
                    font-semibold
                    text-stone-800
                  ">
                    Sin cuotas vencidas
                  </p>

                  <p className="
                    text-sm
                    text-stone-500
                    mt-1
                  ">
                    La cartera no presenta
                    vencimientos pendientes.
                  </p>

                </div>

              )}

              {resumen.topMorosos
                ?.map(
                  (cuota) => (

                    <div
                      key={cuota.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        px-5
                        py-4
                        hover:bg-red-50/40
                        transition
                      "
                    >

                      <div className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                      ">

                        <div className="
                          w-2
                          h-10
                          rounded-full
                          bg-red-500
                          shrink-0
                        " />

                        <div className="
                          min-w-0
                        ">

                          <p className="
                            font-semibold
                            text-stone-900
                            truncate
                          ">
                            {
                              cuota.credito
                                ?.cliente
                                ?.apellido
                            }
                            {' '}
                            {
                              cuota.credito
                                ?.cliente
                                ?.nombre
                            }
                          </p>

                          <p className="
                            text-sm
                            text-red-600
                            font-medium
                            mt-0.5
                          ">
                            Cuota #
                            {cuota.numeroCuota}
                            {' · '}
                            Vencida
                          </p>

                        </div>

                      </div>

                      <div className="
                        text-right
                        shrink-0
                      ">

                        <p className="
                          text-sm
                          font-bold
                          text-stone-700
                        ">
                          {
                            creditNumber(
                              cuota.credito
                                ?.numeroCredito
                            )
                          }
                        </p>

                        <ArrowUpRight
                          className="
                            w-4
                            h-4
                            text-stone-400
                            ml-auto
                            mt-1
                          "
                        />

                      </div>

                    </div>

                  )
                )}

            </div>

          </div>

        </div>

      </section>

    </div>

  )

}


/* ===================================================== */
/* METRIC CARD */
/* ===================================================== */

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
  alert = false
}) {

  const styles = {

    blue: {
      card:
        'border-blue-200 bg-gradient-to-br from-white to-blue-50/60',
      icon:
        'bg-blue-100 text-blue-700',
      value:
        'text-blue-700'
    },

    green: {
      card:
        'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60',
      icon:
        'bg-emerald-100 text-emerald-700',
      value:
        'text-emerald-700'
    },

    amber: {
      card:
        'border-amber-200 bg-gradient-to-br from-white to-amber-50/60',
      icon:
        'bg-amber-100 text-amber-700',
      value:
        'text-amber-700'
    },

    red: {
      card:
        'border-red-200 bg-gradient-to-br from-white to-red-50/70',
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
      relative
      overflow-hidden
      border
      rounded-2xl
      p-5
      shadow-sm
      transition
      hover:shadow-md
      ${current.card}
    `}>

      {alert && (

        <div className="
          absolute
          top-0
          left-0
          right-0
          h-1
          bg-red-500
        " />

      )}

      <div className="
        flex
        items-start
        justify-between
        gap-4
      ">

        <div>

          <p className="
            text-sm
            font-semibold
            text-stone-600
          ">
            {title}
          </p>

          <p className={`
            text-2xl
            md:text-3xl
            font-bold
            tracking-tight
            mt-3
            ${current.value}
          `}>
            {value}
          </p>

        </div>

        <div className={`
          w-11
          h-11
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
        text-stone-500
        mt-3
      ">
        {description}
      </p>

    </div>

  )

}


/* ===================================================== */
/* COUNTER CARD */
/* ===================================================== */

function CounterCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
  alert = false
}) {

  const styles = {

    blue: {
      border: 'border-blue-200',
      icon: 'bg-blue-50 text-blue-700',
      value: 'text-blue-700'
    },

    green: {
      border: 'border-emerald-200',
      icon: 'bg-emerald-50 text-emerald-700',
      value: 'text-emerald-700'
    },

    amber: {
      border: 'border-amber-200',
      icon: 'bg-amber-50 text-amber-700',
      value: 'text-amber-700'
    },

    red: {
      border: 'border-red-200',
      icon: 'bg-red-50 text-red-700',
      value: 'text-red-700'
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
      transition
      hover:shadow-md
      ${current.border}
    `}>

      <div className="
        flex
        items-center
        justify-between
        gap-4
      ">

        <div className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          ${current.icon}
        `}>

          <Icon
            className="w-5 h-5"
          />

        </div>

        {alert && (

          <span className="
            bg-red-100
            text-red-700
            text-[11px]
            font-bold
            px-2
            py-1
            rounded-full
          ">
            ATENCIÓN
          </span>

        )}

      </div>

      <div className="mt-4">

        <p className={`
          text-3xl
          font-bold
          ${current.value}
        `}>
          {value || 0}
        </p>

        <p className="
          font-semibold
          text-stone-800
          text-sm
          mt-1
        ">
          {title}
        </p>

        <p className="
          text-xs
          text-stone-500
          mt-1
        ">
          {description}
        </p>

      </div>

    </div>

  )

}


/* ===================================================== */
/* EMPTY STATE */
/* ===================================================== */

function EmptyState({
  icon: Icon,
  title,
  description
}) {

  return (

    <div className="
      px-5
      py-8
      text-center
    ">

      <div className="
        w-12
        h-12
        mx-auto
        rounded-full
        bg-stone-100
        flex
        items-center
        justify-center
        mb-3
      ">

        <Icon
          className="
            w-5
            h-5
            text-stone-500
          "
        />

      </div>

      <p className="
        font-semibold
        text-stone-800
      ">
        {title}
      </p>

      <p className="
        text-sm
        text-stone-500
        mt-1
      ">
        {description}
      </p>

    </div>

  )

}