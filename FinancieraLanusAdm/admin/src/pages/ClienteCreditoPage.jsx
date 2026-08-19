import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useParams
} from 'react-router-dom'

import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  CreditCard,
  HandCoins,
  Loader2,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Wallet
} from 'lucide-react'

import {
  creditoPublicService
} from '../services/creditoPublicService'


export default function ClienteCreditoPage() {

  const { token } =
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
    mostrarTodas,
    setMostrarTodas
  ] = useState(false)


  /* ===================================================== */
  /* CARGA */
  /* ===================================================== */

  useEffect(() => {

    cargarCredito()

  }, [token])


  const cargarCredito =
    async () => {

      try {

        setLoading(true)
        setError(false)

        const data =
          await creditoPublicService
            .consultar(token)

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
      ] = fechaLimpia
        .split('-')

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


  /* ===================================================== */
  /* CUOTAS */
  /* ===================================================== */

  const cuotas =
    useMemo(() => {

      if (!credito?.cuotas)
        return []

      return [
        ...credito.cuotas
      ].sort(
        (a, b) =>
          a.numeroCuota -
          b.numeroCuota
      )

    }, [credito])


  const cuotasPagadas =
    cuotas.filter(
      cuota =>
        cuota.estado ===
        'PAGADA'
    ).length


  const cuotasVencidas =
    cuotas.filter(
      cuota =>
        cuota.estado ===
        'VENCIDA'
    ).length


  const montoCobrado =
    cuotas.reduce(
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


  const porcentaje =
    cuotas.length
      ? Math.round(
          (
            cuotasPagadas *
            100
          ) /
          cuotas.length
        )
      : 0


  const proximaCuota =
    cuotas.find(
      cuota =>
        cuota.estado !==
        'PAGADA'
    )


  const saldoProximaCuota =
    proximaCuota
      ? Math.max(
          0,
          Number(
            proximaCuota.monto || 0
          ) -
          Number(
            proximaCuota.montoPago || 0
          )
        )
      : 0


  const creditoFinalizado =
    cuotas.length > 0 &&
    cuotasPagadas ===
      cuotas.length


  const cuotasVisibles =
    mostrarTodas
      ? cuotas
      : cuotas.slice(0, 5)


  /* ===================================================== */
  /* LOADING */
  /* ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-stone-50
        flex
        items-center
        justify-center
        px-4
      ">

        <div className="
          text-center
        ">

          <div className="
            w-14
            h-14
            mx-auto
            bg-amber-100
            rounded-2xl
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
            font-bold
            text-stone-800
          ">
            Consultando tu crédito
          </p>

          <p className="
            text-sm
            text-stone-500
            mt-1
          ">
            Estamos obteniendo la
            información actualizada.
          </p>

        </div>

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
        min-h-screen
        bg-stone-50
        flex
        items-center
        justify-center
        px-4
      ">

        <div className="
          bg-white
          border
          border-stone-200
          rounded-3xl
          shadow-sm
          p-7
          w-full
          max-w-sm
          text-center
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
              className="
                w-6
                h-6
              "
            />

          </div>

          <h1 className="
            text-xl
            font-bold
            text-stone-900
          ">
            Crédito no encontrado
          </h1>

          <p className="
            text-sm
            text-stone-500
            mt-2
            leading-relaxed
          ">
            El enlace puede ser incorrecto
            o ya no estar disponible.
          </p>

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


  const cobradorNombre =
    credito.cobrador
      ? `${credito.cobrador.apellido || ''} ${credito.cobrador.nombre || ''}`.trim()
      : 'Sin cobrador asignado'


  return (

    <div className="
      min-h-screen
      bg-stone-50
      text-stone-900
    ">

      {/* ================================================= */}
      {/* BARRA SUPERIOR */}
      {/* ================================================= */}

      <div className="
        bg-white
        border-b
        border-stone-200
      ">

        <div className="
          max-w-4xl
          mx-auto
          h-16
          px-4
          sm:px-6
          flex
          items-center
          justify-between
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-10
              h-10
              bg-amber-100
              text-amber-700
              rounded-xl
              flex
              items-center
              justify-center
            ">

              <CreditCard
                className="
                  w-5
                  h-5
                "
              />

            </div>

            <div>

              <p className="
                font-bold
                leading-tight
              ">
                Presta Ya
              </p>

              <p className="
                text-xs
                text-stone-400
              ">
                Consulta de crédito
              </p>

            </div>

          </div>


          <div className="
            flex
            items-center
            gap-1.5
            text-xs
            font-semibold
            text-emerald-700
          ">

            <ShieldCheck
              className="
                w-4
                h-4
              "
            />

            <span className="
              hidden
              sm:inline
            ">
              Consulta segura
            </span>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <main className="
        max-w-4xl
        mx-auto
        px-4
        sm:px-6
        py-5
        sm:py-8
      ">

        <div className="
          space-y-5
        ">


          {/* ================================================= */}
          {/* BIENVENIDA */}
          {/* ================================================= */}

          <section className="
            bg-white
            border
            border-stone-200
            rounded-3xl
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
              sm:p-6
            ">

              <div className="
                flex
                flex-col
                sm:flex-row
                sm:items-start
                sm:justify-between
                gap-4
              ">

                <div>

                  <p className="
                    text-sm
                    font-medium
                    text-stone-500
                  ">
                    Hola,
                  </p>

                  <h1 className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    tracking-tight
                    mt-0.5
                  ">
                    {credito.cliente?.nombre || 'Cliente'}
                  </h1>

                  <p className="
                    text-sm
                    text-stone-500
                    mt-2
                  ">
                    Este es el estado actualizado
                    de tu crédito.
                  </p>

                </div>


                <EstadoCreditoBadge
                  estado={
                    credito.estado
                  }
                />

              </div>


              <div className="
                mt-5
                pt-5
                border-t
                border-stone-100
                flex
                flex-wrap
                gap-x-6
                gap-y-3
              ">

                <div>

                  <p className="
                    text-xs
                    text-stone-400
                    font-medium
                  ">
                    N° DE CRÉDITO
                  </p>

                  <p className="
                    font-bold
                    text-stone-800
                    mt-0.5
                  ">
                    {numeroCredito}
                  </p>

                </div>


                {credito.tipoPlan?.descripcion && (

                  <div>

                    <p className="
                      text-xs
                      text-stone-400
                      font-medium
                    ">
                      PLAN
                    </p>

                    <p className="
                      font-semibold
                      text-stone-700
                      mt-0.5
                    ">
                      {credito.tipoPlan.descripcion}
                    </p>

                  </div>

                )}


                {credito.fechaOtorgamiento && (

                  <div>

                    <p className="
                      text-xs
                      text-stone-400
                      font-medium
                    ">
                      OTORGADO
                    </p>

                    <p className="
                      font-semibold
                      text-stone-700
                      mt-0.5
                    ">
                      {formatDate(
                        credito.fechaOtorgamiento
                      )}
                    </p>

                  </div>

                )}

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* ALERTA VENCIDAS */}
          {/* ================================================= */}

          {cuotasVencidas > 0 && (

            <div className="
              bg-red-50
              border
              border-red-200
              rounded-2xl
              p-4
              flex
              items-start
              gap-3
            ">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-red-100
                text-red-600
                flex
                items-center
                justify-center
                shrink-0
              ">

                <AlertTriangle
                  className="
                    w-5
                    h-5
                  "
                />

              </div>

              <div>

                <p className="
                  font-bold
                  text-red-800
                ">
                  Tenés {cuotasVencidas}
                  {' '}
                  {cuotasVencidas === 1
                    ? 'cuota vencida'
                    : 'cuotas vencidas'
                  }
                </p>

                <p className="
                  text-sm
                  text-red-600
                  mt-1
                ">
                  Te recomendamos comunicarte
                  con tu cobrador para regularizar
                  el crédito.
                </p>

              </div>

            </div>

          )}


          {/* ================================================= */}
          {/* PROXIMA CUOTA */}
          {/* ================================================= */}

          {proximaCuota ? (

            <section className="
              bg-amber-50
              border
              border-amber-200
              rounded-3xl
              overflow-hidden
            ">

              <div className="
                p-5
                sm:p-6
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-3
                ">

                  <div className="
                    flex
                    items-center
                    gap-2
                  ">

                    <CalendarDays
                      className="
                        w-5
                        h-5
                        text-amber-700
                      "
                    />

                    <p className="
                      font-bold
                      text-amber-900
                    ">
                      Próxima cuota
                    </p>

                  </div>

                  <EstadoCuotaBadge
                    estado={
                      proximaCuota.estado
                    }
                  />

                </div>


                <div className="
                  mt-5
                ">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wide
                    font-semibold
                    text-amber-700
                  ">
                    Importe pendiente
                  </p>

                  <p className="
                    text-4xl
                    sm:text-5xl
                    font-bold
                    tracking-tight
                    text-stone-900
                    mt-1
                  ">
                    $ {money(
                      saldoProximaCuota
                    )}
                  </p>

                  {proximaCuota.estado ===
                    'PARCIAL' && (

                    <p className="
                      text-sm
                      text-amber-700
                      mt-2
                    ">
                      Ya abonaste
                      {' '}
                      <strong>
                        $ {money(
                          proximaCuota.montoPago
                        )}
                      </strong>
                      {' '}
                      de esta cuota.
                    </p>

                  )}

                </div>


                <div className="
                  grid
                  grid-cols-2
                  gap-3
                  mt-5
                ">

                  <div className="
                    bg-white/70
                    border
                    border-amber-100
                    rounded-xl
                    p-3
                  ">

                    <p className="
                      text-xs
                      text-stone-500
                    ">
                      Vencimiento
                    </p>

                    <div className="
                      flex
                      items-center
                      gap-1.5
                      mt-1
                    ">

                      <Clock3
                        className="
                          w-4
                          h-4
                          text-amber-600
                        "
                      />

                      <p className="
                        font-bold
                        text-stone-800
                      ">
                        {formatDate(
                          proximaCuota
                            .fechaVencimiento
                        )}
                      </p>

                    </div>

                  </div>


                  <div className="
                    bg-white/70
                    border
                    border-amber-100
                    rounded-xl
                    p-3
                  ">

                    <p className="
                      text-xs
                      text-stone-500
                    ">
                      Número de cuota
                    </p>

                    <p className="
                      font-bold
                      text-stone-800
                      mt-1
                    ">
                      {proximaCuota.numeroCuota}
                      {' de '}
                      {cuotas.length}
                    </p>

                  </div>

                </div>

              </div>

            </section>

          ) : (

            <section className="
              bg-emerald-50
              border
              border-emerald-200
              rounded-3xl
              p-6
              text-center
            ">

              <div className="
                w-14
                h-14
                mx-auto
                bg-emerald-100
                text-emerald-600
                rounded-full
                flex
                items-center
                justify-center
              ">

                <CheckCircle2
                  className="
                    w-7
                    h-7
                  "
                />

              </div>

              <h2 className="
                text-xl
                font-bold
                text-emerald-900
                mt-3
              ">
                Crédito finalizado
              </h2>

              <p className="
                text-sm
                text-emerald-700
                mt-1
              ">
                No tenés cuotas pendientes.
              </p>

            </section>

          )}


          {/* ================================================= */}
          {/* RESUMEN */}
          {/* ================================================= */}

          <section>

            <div className="
              mb-3
            ">

              <h2 className="
                text-lg
                font-bold
              ">
                Resumen de tu crédito
              </h2>

              <p className="
                text-sm
                text-stone-500
              ">
                Importes actualizados según
                los pagos registrados.
              </p>

            </div>


            <div className="
              grid
              grid-cols-2
              lg:grid-cols-3
              gap-3
            ">

              <ResumenCard
                icon={Wallet}
                label="Total"
                value={
                  `$ ${money(
                    credito.montoFinal
                  )}`
                }
                variant="blue"
              />

              <ResumenCard
                icon={HandCoins}
                label="Pagado"
                value={
                  `$ ${money(
                    montoCobrado
                  )}`
                }
                variant="green"
              />

              <ResumenCard
                icon={CircleDollarSign}
                label="Saldo pendiente"
                value={
                  `$ ${money(
                    saldoPendiente
                  )}`
                }
                variant={
                  saldoPendiente > 0
                    ? 'amber'
                    : 'green'
                }
                fullMobile
              />

            </div>

          </section>


          {/* ================================================= */}
          {/* AVANCE */}
          {/* ================================================= */}

          <section className="
            bg-white
            border
            border-stone-200
            rounded-2xl
            shadow-sm
            p-5
          ">

            <div className="
              flex
              items-end
              justify-between
              gap-3
            ">

              <div>

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <TrendingUp
                    className="
                      w-5
                      h-5
                      text-emerald-600
                    "
                  />

                  <h2 className="
                    font-bold
                  ">
                    Avance
                  </h2>

                </div>

                <p className="
                  text-sm
                  text-stone-500
                  mt-1
                ">
                  {cuotasPagadas}
                  {' de '}
                  {cuotas.length}
                  {' cuotas pagadas'}
                </p>

              </div>


              <p className="
                text-2xl
                font-bold
                text-emerald-600
              ">
                {porcentaje}%
              </p>

            </div>


            <div className="
              h-3
              bg-stone-100
              rounded-full
              overflow-hidden
              mt-4
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

          </section>


          {/* ================================================= */}
          {/* COBRADOR */}
          {/* ================================================= */}

          <section className="
            bg-white
            border
            border-stone-200
            rounded-2xl
            shadow-sm
            p-5
          ">

            <div className="
              flex
              items-center
              gap-4
            ">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-stone-100
                text-stone-600
                flex
                items-center
                justify-center
                shrink-0
              ">

                <UserRound
                  className="
                    w-5
                    h-5
                  "
                />

              </div>

              <div>

                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  font-semibold
                  text-stone-400
                ">
                  Tu cobrador
                </p>

                <p className="
                  font-bold
                  text-stone-800
                  mt-0.5
                ">
                  {cobradorNombre}
                </p>

                <p className="
                  text-xs
                  text-stone-500
                  mt-0.5
                ">
                  Responsable de tu cobranza
                </p>

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* HISTORIAL */}
          {/* ================================================= */}

          <section className="
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
              flex
              items-center
              justify-between
              gap-3
            ">

              <div>

                <h2 className="
                  font-bold
                ">
                  Historial de cuotas
                </h2>

                <p className="
                  text-xs
                  text-stone-500
                  mt-0.5
                ">
                  Vencimientos y pagos
                  de tu crédito
                </p>

              </div>


              <span className="
                bg-stone-100
                text-stone-600
                px-2.5
                py-1
                rounded-full
                text-xs
                font-bold
              ">
                {cuotas.length}
              </span>

            </div>


            <div className="
              divide-y
              divide-stone-100
            ">

              {cuotasVisibles.map(
                cuota => {

                  const pagada =
                    cuota.estado ===
                    'PAGADA'

                  const vencida =
                    cuota.estado ===
                    'VENCIDA'

                  const parcial =
                    cuota.estado ===
                    'PARCIAL'

                  const saldoCuota =
                    Math.max(
                      0,
                      Number(
                        cuota.monto || 0
                      ) -
                      Number(
                        cuota.montoPago || 0
                      )
                    )

                  return (

                    <div
                      key={cuota.id}
                      className={`
                        p-4
                        sm:p-5

                        ${
                          vencida
                            ? 'bg-red-50/40'
                            : ''
                        }
                      `}
                    >

                      <div className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      ">

                        <div className="
                          flex
                          gap-3
                          min-w-0
                        ">

                          <div className={`
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            font-bold
                            shrink-0

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
                                  : parcial
                                    ? `
                                      bg-amber-100
                                      text-amber-700
                                    `
                                    : `
                                      bg-blue-100
                                      text-blue-700
                                    `
                            }
                          `}>

                            {pagada ? (

                              <Check
                                className="
                                  w-5
                                  h-5
                                "
                              />

                            ) : (

                              cuota.numeroCuota

                            )}

                          </div>


                          <div className="
                            min-w-0
                          ">

                            <div className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            ">

                              <p className="
                                font-bold
                                text-stone-800
                              ">
                                Cuota {cuota.numeroCuota}
                              </p>

                              <EstadoCuotaBadge
                                estado={
                                  cuota.estado
                                }
                              />

                            </div>


                            <div className="
                              flex
                              items-center
                              gap-1.5
                              text-xs
                              text-stone-500
                              mt-1.5
                            ">

                              <CalendarDays
                                className="
                                  w-3.5
                                  h-3.5
                                "
                              />

                              Vence
                              {' '}
                              {formatDate(
                                cuota.fechaVencimiento
                              )}

                            </div>

                          </div>

                        </div>


                        <div className="
                          text-right
                          shrink-0
                        ">

                          <p className="
                            font-bold
                            text-stone-800
                          ">
                            $ {money(
                              cuota.monto
                            )}
                          </p>

                          {parcial && (

                            <p className="
                              text-xs
                              font-semibold
                              text-amber-700
                              mt-1
                            ">
                              Falta $
                              {money(
                                saldoCuota
                              )}
                            </p>

                          )}

                          {pagada && (

                            <p className="
                              text-xs
                              text-emerald-600
                              mt-1
                            ">
                              Abonada
                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                  )

                }
              )}

            </div>


            {cuotas.length > 5 && (

              <button
                type="button"
                onClick={() =>
                  setMostrarTodas(
                    prev => !prev
                  )
                }
                className="
                  w-full
                  h-12
                  border-t
                  border-stone-100
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-sm
                  font-bold
                  text-stone-600
                  hover:bg-stone-50
                  transition
                "
              >

                {mostrarTodas ? (
                  <>
                    Ver menos

                    <ChevronUp
                      className="
                        w-4
                        h-4
                      "
                    />
                  </>
                ) : (
                  <>
                    Ver todas las cuotas

                    <ChevronDown
                      className="
                        w-4
                        h-4
                      "
                    />
                  </>
                )}

              </button>

            )}

          </section>


          {/* ================================================= */}
          {/* AYUDA */}
          {/* ================================================= */}

          <section className="
            bg-amber-50
            border
            border-amber-200
            rounded-2xl
            p-5
            text-center
          ">

            <p className="
              font-bold
              text-amber-900
            ">
              ¿Tenés alguna consulta?
            </p>

            <p className="
              text-sm
              text-amber-800/70
              mt-1
            ">
              Comunicate con tu cobrador
              o con Presta Ya.
            </p>

          </section>


          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <footer className="
            text-center
            pt-2
            pb-4
          ">

            <div className="
              inline-flex
              items-center
              gap-1.5
              text-xs
              text-stone-400
            ">

              <ShieldCheck
                className="
                  w-3.5
                  h-3.5
                "
              />

              Información actualizada
              de tu crédito

            </div>

          </footer>

        </div>

      </main>

    </div>

  )

}


/* ===================================================== */
/* RESUMEN CARD */
/* ===================================================== */

function ResumenCard({
  icon: Icon,
  label,
  value,
  variant = 'blue',
  fullMobile = false
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
        'text-amber-800'
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
      p-4
      sm:p-5
      shadow-sm

      ${current.border}

      ${
        fullMobile
          ? 'col-span-2 lg:col-span-1'
          : ''
      }
    `}>

      <div className="
        flex
        items-start
        justify-between
        gap-2
      ">

        <div className="
          min-w-0
        ">

          <p className="
            text-xs
            sm:text-sm
            font-semibold
            text-stone-500
          ">
            {label}
          </p>

          <p className={`
            text-xl
            sm:text-2xl
            font-bold
            tracking-tight
            mt-1.5
            break-words
            ${current.value}
          `}>
            {value}
          </p>

        </div>


        <div className={`
          hidden
          sm:flex
          w-9
          h-9
          rounded-xl
          items-center
          justify-center
          shrink-0
          ${current.icon}
        `}>

          <Icon
            className="
              w-4
              h-4
            "
          />

        </div>

      </div>

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
      'bg-amber-100 text-amber-800',

    VENCIDA:
      'bg-red-100 text-red-700',

    PENDIENTE:
      'bg-blue-100 text-blue-700'

  }


  const labels = {

    PAGADA:
      'Pagada',

    PARCIAL:
      'Parcial',

    VENCIDA:
      'Vencida',

    PENDIENTE:
      'Pendiente'

  }


  return (

    <span className={`
      inline-flex
      items-center
      px-2.5
      py-1
      rounded-full
      text-[10px]
      sm:text-[11px]
      font-bold

      ${
        styles[estado] ||
        styles.PENDIENTE
      }
    `}>

      {
        labels[estado] ||
        estado ||
        'Pendiente'
      }

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
      self-start
      px-3
      py-1.5
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

      {
        finalizado
          ? 'Finalizado'
          : cancelado
            ? 'Cancelado'
            : 'Activo'
      }

    </span>

  )

}