import React, {
  useEffect,
  useState
} from 'react'

import {
  Banknote,
  CalendarDays,
  ChevronDown,
  CreditCard,
  HandCoins,
  Loader2,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  UserRound
} from 'lucide-react'

import {
  reporteService
} from '../services/reporteService'


export default function ResumenRecaudacionPage() {

  /*
  =====================================================
  FECHAS
  =====================================================
  */

  const hoy =
    new Date()

  const fechaHoy =
    formatearFechaInput(
      hoy
    )

  const inicioMes =
    formatearFechaInput(
      new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        1
      )
    )


  /*
  =====================================================
  STATE
  =====================================================
  */

  const [
    fechaDesde,
    setFechaDesde
  ] = useState(
    inicioMes
  )

  const [
    fechaHasta,
    setFechaHasta
  ] = useState(
    fechaHoy
  )

  const [
    cobradorId,
    setCobradorId
  ] = useState('')

  const [
    data,
    setData
  ] = useState(null)

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')


  /*
  =====================================================
  CARGA
  =====================================================
  */

  const cargarDatos =
    async () => {

      try {

        setLoading(true)
        setError('')

        const response =
          await reporteService
            .recaudacion({
              fechaDesde,
              fechaHasta,
              cobradorId
            })

        setData(
          response
        )

      } catch (error) {

        console.error(error)

        setError(
          error?.response
            ?.data
            ?.message ||
          'No se pudo cargar el resumen de recaudación.'
        )

      } finally {

        setLoading(false)
      }
    }


  useEffect(() => {

    cargarDatos()

  }, [])


  /*
  =====================================================
  DATOS
  =====================================================
  */

  const resumen =
    data?.resumen || {
      aRecaudar: 0,
      recaudado: 0,
      efectivo: 0,
      transferencia: 0,
      diferencia: 0,
      porcentajeRecaudacion: 0
    }


  const cobradores =
    data?.cobradores || []


  const porDia =
    data?.porDia || []


  /*
  =====================================================
  HELPERS
  =====================================================
  */

  const money =
    value =>
      Number(
        value || 0
      ).toLocaleString(
        'es-AR'
      )


  const porcentaje =
    Math.min(
      Math.max(
        Number(
          resumen
            .porcentajeRecaudacion ||
          0
        ),
        0
      ),
      100
    )


  /*
  =====================================================
  FILTROS RAPIDOS
  =====================================================
  */

  const aplicarHoy = () => {

    setFechaDesde(
      fechaHoy
    )

    setFechaHasta(
      fechaHoy
    )
  }


  const aplicarSemana = () => {

    const actual =
      new Date()

    const dia =
      actual.getDay()

    const diferencia =
      dia === 0
        ? -6
        : 1 - dia

    const lunes =
      new Date(
        actual
      )

    lunes.setDate(
      actual.getDate() +
      diferencia
    )

    setFechaDesde(
      formatearFechaInput(
        lunes
      )
    )

    setFechaHasta(
      fechaHoy
    )
  }


  const aplicarMes = () => {

    setFechaDesde(
      inicioMes
    )

    setFechaHasta(
      fechaHoy
    )
  }


  /*
  =====================================================
  LOADING INICIAL
  =====================================================
  */

  if (
    loading &&
    !data
  ) {

    return (

      <div className="
        min-h-[500px]
        flex
        flex-col
        items-center
        justify-center
        text-stone-500
      ">

        <div className="
          w-14
          h-14
          rounded-2xl
          bg-amber-100
          flex
          items-center
          justify-center
          mb-4
        ">

          <Loader2
            className="
              w-7
              h-7
              text-amber-600
              animate-spin
            "
          />

        </div>

        <p className="
          font-semibold
          text-stone-700
        ">
          Cargando recaudación...
        </p>

        <p className="
          text-sm
          text-stone-400
          mt-1
        ">
          Estamos preparando el resumen
        </p>

      </div>
    )
  }


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
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          ">

            <div className="
              flex
              items-start
              gap-4
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

                <HandCoins
                  className="
                    w-6
                    h-6
                  "
                />

              </div>

              <div>

                <h1 className="
                  text-2xl
                  md:text-3xl
                  font-bold
                  tracking-tight
                  text-stone-900
                ">
                  Resumen de recaudación
                </h1>

                <p className="
                  text-sm
                  md:text-base
                  text-stone-500
                  mt-1
                ">
                  Seguimiento de cobranza,
                  efectivo y transferencias
                </p>

              </div>

            </div>

            <button
              onClick={
                cargarDatos
              }
              disabled={
                loading
              }
              className="
                h-10
                px-4
                inline-flex
                items-center
                justify-center
                gap-2
                bg-stone-900
                hover:bg-stone-800
                disabled:opacity-60
                text-white
                rounded-xl
                text-sm
                font-semibold
                transition
              "
            >

              {loading ? (

                <Loader2
                  className="
                    w-4
                    h-4
                    animate-spin
                  "
                />

              ) : (

                <RefreshCw
                  className="
                    w-4
                    h-4
                  "
                />

              )}

              Actualizar

            </button>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* FILTROS */}
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
          xl:flex-row
          xl:items-end
          gap-4
        ">

          {/* DESDE */}

          <div className="
            flex-1
          ">

            <label className="
              block
              text-xs
              uppercase
              tracking-wide
              font-bold
              text-stone-500
              mb-2
            ">
              Desde
            </label>

            <div className="
              relative
            ">

              <CalendarDays
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-stone-400
                  pointer-events-none
                "
              />

              <input
                type="date"
                value={
                  fechaDesde
                }
                onChange={
                  e =>
                    setFechaDesde(
                      e.target.value
                    )
                }
                className="
                  w-full
                  h-11
                  pl-10
                  pr-3
                  border
                  border-stone-200
                  rounded-xl
                  bg-white
                  text-stone-800
                  outline-none
                  focus:ring-2
                  focus:ring-amber-500/20
                  focus:border-amber-500
                "
              />

            </div>

          </div>


          {/* HASTA */}

          <div className="
            flex-1
          ">

            <label className="
              block
              text-xs
              uppercase
              tracking-wide
              font-bold
              text-stone-500
              mb-2
            ">
              Hasta
            </label>

            <div className="
              relative
            ">

              <CalendarDays
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-stone-400
                  pointer-events-none
                "
              />

              <input
                type="date"
                value={
                  fechaHasta
                }
                onChange={
                  e =>
                    setFechaHasta(
                      e.target.value
                    )
                }
                className="
                  w-full
                  h-11
                  pl-10
                  pr-3
                  border
                  border-stone-200
                  rounded-xl
                  bg-white
                  text-stone-800
                  outline-none
                  focus:ring-2
                  focus:ring-amber-500/20
                  focus:border-amber-500
                "
              />

            </div>

          </div>


          {/* COBRADOR */}

          <div className="
            flex-1
          ">

            <label className="
              block
              text-xs
              uppercase
              tracking-wide
              font-bold
              text-stone-500
              mb-2
            ">
              Cobrador
            </label>

            <div className="
              relative
            ">

              <UserRound
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-stone-400
                  pointer-events-none
                "
              />

              <select
                value={
                  cobradorId
                }
                onChange={
                  e =>
                    setCobradorId(
                      e.target.value
                    )
                }
                className="
                  w-full
                  h-11
                  pl-10
                  pr-9
                  appearance-none
                  border
                  border-stone-200
                  rounded-xl
                  bg-white
                  text-stone-800
                  outline-none
                  focus:ring-2
                  focus:ring-amber-500/20
                  focus:border-amber-500
                "
              >

                <option value="">
                  Todos los cobradores
                </option>

                {cobradores.map(
                  cobrador => (

                    <option
                      key={
                        cobrador.id
                      }
                      value={
                        cobrador.id
                      }
                    >
                      {cobrador.nombre}
                    </option>

                  )
                )}

              </select>

              <ChevronDown
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-stone-400
                  pointer-events-none
                "
              />

            </div>

          </div>


          {/* CONSULTAR */}

          <button
            onClick={
              cargarDatos
            }
            disabled={
              loading
            }
            className="
              h-11
              px-5
              inline-flex
              items-center
              justify-center
              gap-2
              bg-amber-600
              hover:bg-amber-700
              disabled:opacity-60
              text-white
              rounded-xl
              font-bold
              transition
            "
          >

            {loading ? (

              <Loader2
                className="
                  w-4
                  h-4
                  animate-spin
                "
              />

            ) : (

              <Search
                className="
                  w-4
                  h-4
                "
              />

            )}

            Consultar

          </button>

        </div>


        {/* ATAJOS */}

        <div className="
          flex
          flex-wrap
          items-center
          gap-2
          mt-4
          pt-4
          border-t
          border-stone-100
        ">

          <span className="
            text-xs
            font-semibold
            text-stone-400
            mr-1
          ">
            Período rápido:
          </span>

          <FiltroRapido
            label="Hoy"
            onClick={
              aplicarHoy
            }
          />

          <FiltroRapido
            label="Esta semana"
            onClick={
              aplicarSemana
            }
          />

          <FiltroRapido
            label="Este mes"
            onClick={
              aplicarMes
            }
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="
          bg-red-50
          border
          border-red-200
          rounded-xl
          px-4
          py-3
          text-sm
          font-medium
          text-red-700
        ">
          {error}
        </div>

      )}


      {/* ================================================= */}
      {/* RESUMEN PRINCIPAL */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-3
        gap-4
      ">

        <ResumenCard
          icon={
            CalendarDays
          }
          label="A recaudar"
          value={
            `$ ${money(
              resumen.aRecaudar
            )}`
          }
          description="
            Cuotas esperadas en el período
          "
          variant="blue"
        />

        <ResumenCard
          icon={
            HandCoins
          }
          label="Recaudado"
          value={
            `$ ${money(
              resumen.recaudado
            )}`
          }
          description="
            Total efectivamente cobrado
          "
          variant="green"
        />

        <ResumenCard
          icon={
            resumen.diferencia > 0
              ? TrendingDown
              : TrendingUp
          }
          label="Diferencia"
          value={
            `$ ${money(
              resumen.diferencia
            )}`
          }
          description={
            resumen.diferencia > 0
              ? 'Pendiente respecto de lo esperado'
              : 'Recaudación igual o superior a lo esperado'
          }
          variant={
            resumen.diferencia > 0
              ? 'red'
              : 'green'
          }
        />

      </div>


      {/* ================================================= */}
      {/* MEDIOS DE PAGO */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-4
      ">

        <ResumenCard
          icon={
            Banknote
          }
          label="Efectivo"
          value={
            `$ ${money(
              resumen.efectivo
            )}`
          }
          description="
            Cobranza recibida en efectivo
          "
          variant="amber"
        />

        <ResumenCard
          icon={
            CreditCard
          }
          label="Transferencias"
          value={
            `$ ${money(
              resumen.transferencia
            )}`
          }
          description="
            Cobranza recibida por transferencia
          "
          variant="blue"
        />

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
          sm:justify-between
          gap-3
          mb-4
        ">

          <div>

            <h2 className="
              font-bold
              text-stone-900
            ">
              Cumplimiento de recaudación
            </h2>

            <p className="
              text-sm
              text-stone-500
              mt-1
            ">
              Recaudado respecto de las
              cuotas esperadas en el período
            </p>

          </div>

          <div className="
            flex
            items-baseline
            gap-1
          ">

            <span className="
              text-3xl
              font-bold
              text-emerald-600
            ">
              {
                Number(
                  resumen
                    .porcentajeRecaudacion ||
                  0
                )
                  .toLocaleString(
                    'es-AR'
                  )
              }%
            </span>

          </div>

        </div>

        <div className="
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

      </div>


      {/* ================================================= */}
      {/* EVOLUCION DIARIA */}
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
          px-5
          py-4
          border-b
          border-stone-100
        ">

          <h2 className="
            font-bold
            text-stone-900
          ">
            Evolución diaria
          </h2>

          <p className="
            text-sm
            text-stone-500
            mt-1
          ">
            Recaudación día por día
          </p>

        </div>

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
            min-w-[800px]
            text-sm
          ">

            <thead className="
              bg-stone-50
              text-stone-500
            ">

              <tr>

                <th className="
                  px-5
                  py-3
                  text-left
                  font-semibold
                ">
                  Fecha
                </th>

                <th className="
                  px-5
                  py-3
                  text-right
                  font-semibold
                ">
                  A recaudar
                </th>

                <th className="
                  px-5
                  py-3
                  text-right
                  font-semibold
                ">
                  Recaudado
                </th>

                <th className="
                  px-5
                  py-3
                  text-right
                  font-semibold
                ">
                  Efectivo
                </th>

                <th className="
                  px-5
                  py-3
                  text-right
                  font-semibold
                ">
                  Transferencia
                </th>

                <th className="
                  px-5
                  py-3
                  text-right
                  font-semibold
                ">
                  Diferencia
                </th>

              </tr>

            </thead>

            <tbody className="
              divide-y
              divide-stone-100
            ">

              {porDia.map(
                dia => (

                  <tr
                    key={
                      dia.fecha
                    }
                    className="
                      hover:bg-stone-50
                      transition
                    "
                  >

                    <td className="
                      px-5
                      py-4
                      font-semibold
                      text-stone-700
                    ">
                      {
                        formatDate(
                          dia.fecha
                        )
                      }
                    </td>

                    <td className="
                      px-5
                      py-4
                      text-right
                    ">
                      $ {money(
                        dia.aRecaudar
                      )}
                    </td>

                    <td className="
                      px-5
                      py-4
                      text-right
                      font-bold
                      text-emerald-600
                    ">
                      $ {money(
                        dia.recaudado
                      )}
                    </td>

                    <td className="
                      px-5
                      py-4
                      text-right
                      text-amber-700
                    ">
                      $ {money(
                        dia.efectivo
                      )}
                    </td>

                    <td className="
                      px-5
                      py-4
                      text-right
                      text-blue-700
                    ">
                      $ {money(
                        dia.transferencia
                      )}
                    </td>

                    <td className={`
                      px-5
                      py-4
                      text-right
                      font-bold

                      ${
                        Number(
                          dia.diferencia
                        ) > 0
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }
                    `}>
                      $ {money(
                        dia.diferencia
                      )}
                    </td>

                  </tr>

                )
              )}

              {porDia.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      px-5
                      py-12
                      text-center
                      text-stone-400
                    "
                  >
                    No hay movimientos
                    para este período.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================================= */}
      {/* COBRADORES */}
      {/* ================================================= */}

      {!cobradorId && (

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

            <h2 className="
              font-bold
              text-stone-900
            ">
              Recaudación por cobrador
            </h2>

            <p className="
              text-sm
              text-stone-500
              mt-1
            ">
              Comparativa del período seleccionado
            </p>

          </div>

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              min-w-[950px]
              text-sm
            ">

              <thead className="
                bg-stone-50
                text-stone-500
              ">

                <tr>

                  <th className="
                    px-5
                    py-3
                    text-left
                    font-semibold
                  ">
                    Cobrador
                  </th>

                  <th className="
                    px-5
                    py-3
                    text-right
                    font-semibold
                  ">
                    A recaudar
                  </th>

                  <th className="
                    px-5
                    py-3
                    text-right
                    font-semibold
                  ">
                    Recaudado
                  </th>

                  <th className="
                    px-5
                    py-3
                    text-right
                    font-semibold
                  ">
                    Efectivo
                  </th>

                  <th className="
                    px-5
                    py-3
                    text-right
                    font-semibold
                  ">
                    Transferencia
                  </th>

                  <th className="
                    px-5
                    py-3
                    text-right
                    font-semibold
                  ">
                    Diferencia
                  </th>

                  <th className="
                    px-5
                    py-3
                    text-center
                    font-semibold
                  ">
                    Cumplimiento
                  </th>

                </tr>

              </thead>

              <tbody className="
                divide-y
                divide-stone-100
              ">

                {cobradores.map(
                  cobrador => (

                    <tr
                      key={
                        cobrador.id
                      }
                      className="
                        hover:bg-stone-50
                        transition
                      "
                    >

                      <td className="
                        px-5
                        py-4
                      ">

                        <div className="
                          flex
                          items-center
                          gap-3
                        ">

                          <div className="
                            w-9
                            h-9
                            rounded-xl
                            bg-amber-100
                            text-amber-700
                            flex
                            items-center
                            justify-center
                          ">

                            <UserRound
                              className="
                                w-4
                                h-4
                              "
                            />

                          </div>

                          <span className="
                            font-bold
                            text-stone-800
                          ">
                            {
                              cobrador.nombre
                            }
                          </span>

                        </div>

                      </td>

                      <td className="
                        px-5
                        py-4
                        text-right
                      ">
                        $ {money(
                          cobrador.aRecaudar
                        )}
                      </td>

                      <td className="
                        px-5
                        py-4
                        text-right
                        font-bold
                        text-emerald-600
                      ">
                        $ {money(
                          cobrador.recaudado
                        )}
                      </td>

                      <td className="
                        px-5
                        py-4
                        text-right
                      ">
                        $ {money(
                          cobrador.efectivo
                        )}
                      </td>

                      <td className="
                        px-5
                        py-4
                        text-right
                      ">
                        $ {money(
                          cobrador.transferencia
                        )}
                      </td>

                      <td className={`
                        px-5
                        py-4
                        text-right
                        font-bold

                        ${
                          Number(
                            cobrador.diferencia
                          ) > 0
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }
                      `}>
                        $ {money(
                          cobrador.diferencia
                        )}
                      </td>

                      <td className="
                        px-5
                        py-4
                        text-center
                      ">

                        <span className={`
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-bold

                          ${
                            cobrador
                              .porcentajeRecaudacion >=
                            100
                              ? `
                                bg-emerald-100
                                text-emerald-700
                              `
                              : cobrador
                                  .porcentajeRecaudacion >=
                                80
                                ? `
                                  bg-amber-100
                                  text-amber-700
                                `
                                : `
                                  bg-red-100
                                  text-red-700
                                `
                          }
                        `}>
                          {
                            cobrador
                              .porcentajeRecaudacion
                          }%
                        </span>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </div>

      )}

    </div>
  )
}


/*
=====================================================
CARD
=====================================================
*/

function ResumenCard({
  icon: Icon,
  label,
  value,
  description,
  variant = 'blue'
}) {

  const variants = {

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
        'text-red-600'
    }

  }


  const current =
    variants[variant] ||
    variants.blue


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
        gap-4
      ">

        <div className="
          min-w-0
        ">

          <p className="
            text-sm
            font-semibold
            text-stone-500
          ">
            {label}
          </p>

          <p className={`
            text-2xl
            md:text-3xl
            font-bold
            tracking-tight
            mt-2
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
            className="
              w-5
              h-5
            "
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


/*
=====================================================
FILTRO RAPIDO
=====================================================
*/

function FiltroRapido({
  label,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={
        onClick
      }
      className="
        px-3
        py-1.5
        bg-stone-100
        hover:bg-amber-100
        text-stone-600
        hover:text-amber-800
        rounded-lg
        text-xs
        font-semibold
        transition
      "
    >
      {label}
    </button>
  )
}


/*
=====================================================
FECHAS
=====================================================
*/

function formatearFechaInput(
  fecha
) {

  const anio =
    fecha.getFullYear()

  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(
      2,
      '0'
    )

  const dia =
    String(
      fecha.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${anio}-${mes}-${dia}`
}


function formatDate(
  fecha
) {

  if (!fecha) {
    return '-'
  }

  const [
    anio,
    mes,
    dia
  ] =
    String(fecha)
      .split('T')[0]
      .split('-')

  return `${dia}/${mes}/${anio}`
}