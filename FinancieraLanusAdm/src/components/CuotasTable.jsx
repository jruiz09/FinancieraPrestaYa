import React, {
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Eye,
  HandCoins,
  Loader2,
  UserRound,
  WalletCards
} from 'lucide-react'

import {
  formatCreditoNumber
} from '../utils/creditoUtils'

import PagoCuotaModal
  from './PagoCuotaModal'

import ConfirmCascadaModal
  from './ConfirmCascadaModal'

import api
  from '../api/axios'


export default function CuotasTable({
  cuotas,
  loading,
  onReload
}) {

  const navigate =
    useNavigate()

  const [
    cuotaSeleccionada,
    setCuotaSeleccionada
  ] = useState(null)

  const [
    showModal,
    setShowModal
  ] = useState(false)

  const [
    guardando,
    setGuardando
  ] = useState(false)

  const [
    confirmacionPendiente,
    setConfirmacionPendiente
  ] = useState(null)


  /* ===================================================== */
  /* HELPERS */
  /* ===================================================== */

  const money =
    value =>
      Number(
        value || 0
      ).toLocaleString(
        'es-AR'
      )


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


  /* ===================================================== */
  /* MODAL */
  /* ===================================================== */

  const abrirModal =
    cuota => {

      setCuotaSeleccionada(
        cuota
      )

      setShowModal(true)

    }


  const cerrarModal =
    () => {

      setShowModal(false)

      setCuotaSeleccionada(
        null
      )

      setConfirmacionPendiente(
        null
      )

    }


  /* ===================================================== */
  /* PAGO */
  /* ===================================================== */

  const registrarPago =
    async formData => {

      try {

        setGuardando(true)

        const { data } =
          await api.post(
            `/creditos/cuotas/${cuotaSeleccionada.id}/pago`,
            formData
          )

        if (data.requiereConfirmacion) {

          setConfirmacionPendiente({
            formData,
            ...data.data
          })

          return
        }

        cerrarModal()

        await onReload()

      } catch (error) {

        console.error(error)

      } finally {

        setGuardando(false)

      }

    }


  const confirmarCascada =
    async () => {

      try {

        setGuardando(true)

        await api.post(
          `/creditos/cuotas/${cuotaSeleccionada.id}/pago`,
          {
            ...confirmacionPendiente.formData,
            confirmado: true
          }
        )

        cerrarModal()

        await onReload()

      } catch (error) {

        console.error(error)

      } finally {

        setGuardando(false)

      }

    }


  /* ===================================================== */
  /* LOADING */
  /* ===================================================== */

  if (loading) {

    return (

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        min-h-[300px]
        flex
        flex-col
        items-center
        justify-center
      ">

        <Loader2
          className="
            w-7
            h-7
            text-amber-600
            animate-spin
          "
        />

        <p className="
          font-semibold
          text-stone-700
          mt-3
        ">
          Cargando cuotas...
        </p>

        <p className="
          text-sm
          text-stone-400
          mt-1
        ">
          Consultando información
          de cobranza
        </p>

      </div>

    )

  }


  /* ===================================================== */
  /* SIN RESULTADOS */
  /* ===================================================== */

  if (!cuotas.length) {

    return (

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        py-14
        px-5
        text-center
      ">

        <div className="
          w-14
          h-14
          mx-auto
          bg-stone-100
          text-stone-400
          rounded-2xl
          flex
          items-center
          justify-center
        ">

          <WalletCards
            className="
              w-6
              h-6
            "
          />

        </div>

        <h3 className="
          font-bold
          text-stone-800
          mt-4
        ">
          No encontramos cuotas
        </h3>

        <p className="
          text-sm
          text-stone-500
          mt-1
        ">
          No hay resultados para
          los filtros seleccionados.
        </p>

      </div>

    )

  }


  return (

    <>

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="
          px-5
          md:px-6
          py-4
          border-b
          border-stone-100
          flex
          items-center
          justify-between
          gap-4
        ">

          <div>

            <h2 className="
              font-bold
              text-stone-900
            ">
              Detalle de cuotas
            </h2>

            <p className="
              text-xs
              sm:text-sm
              text-stone-500
              mt-0.5
            ">
              Vencimientos, saldos
              y acciones de cobranza
            </p>

          </div>


          <span className="
            px-3
            py-1.5
            bg-stone-100
            rounded-full
            text-xs
            font-bold
            text-stone-600
          ">
            {cuotas.length}
            {' '}
            {cuotas.length === 1
              ? 'resultado'
              : 'resultados'
            }
          </span>

        </div>


        {/* ================================================= */}
        {/* DESKTOP / LAPTOP */}
        {/* ================================================= */}

        <div className="
          hidden
          lg:block
          overflow-x-auto
        ">

          <table className="
            w-full
            min-w-[1050px]
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
                  Crédito / Cliente
                </th>

                <th className="
                  px-4
                  py-3
                  text-center
                  font-semibold
                ">
                  Cuota
                </th>

                <th className="
                  px-4
                  py-3
                  text-left
                  font-semibold
                ">
                  Vencimiento
                </th>

                <th className="
                  px-4
                  py-3
                  text-right
                  font-semibold
                ">
                  Importe
                </th>

                <th className="
                  px-4
                  py-3
                  text-right
                  font-semibold
                ">
                  Cobrado
                </th>

                <th className="
                  px-4
                  py-3
                  text-right
                  font-semibold
                ">
                  Saldo
                </th>

                <th className="
                  px-4
                  py-3
                  text-center
                  font-semibold
                ">
                  Estado
                </th>

                <th className="
                  px-5
                  py-3
                  text-right
                  font-semibold
                ">
                  Acción
                </th>

              </tr>

            </thead>


            <tbody className="
              divide-y
              divide-stone-100
            ">

              {cuotas.map(
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

                  const saldo =
                    cuota.saldo !==
                    undefined
                      ? Number(
                          cuota.saldo || 0
                        )
                      : Math.max(
                          0,
                          Number(
                            cuota.monto || 0
                          ) -
                          Number(
                            cuota.montoPago || 0
                          )
                        )

                  const cliente =
                    `${cuota.credito?.cliente?.apellido || ''} ${cuota.credito?.cliente?.nombre || ''}`
                      .trim()

                  return (

                    <tr
                      key={
                        cuota.id
                      }
                      className={`
                        transition

                        ${
                          vencida
                            ? `
                              bg-red-50/40
                              hover:bg-red-50/70
                            `
                            : parcial
                              ? `
                                bg-amber-50/20
                                hover:bg-amber-50/50
                              `
                              : `
                                hover:bg-stone-50
                              `
                        }
                      `}
                    >

                      {/* CREDITO / CLIENTE */}

                      <td className="
                        px-5
                        py-4
                      ">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/creditos/${cuota.creditoId}`
                            )
                          }
                          className="
                            text-left
                            group
                          "
                        >

                          <div className="
                            flex
                            items-center
                            gap-2
                          ">

                            <CreditCard
                              className="
                                w-4
                                h-4
                                text-amber-600
                              "
                            />

                            <span className="
                              font-bold
                              text-stone-800
                              group-hover:text-amber-700
                              transition
                            ">

                              {
                                formatCreditoNumber(
                                  cuota.credito
                                    ?.numeroCredito
                                )
                              }

                            </span>

                          </div>


                          <div className="
                            flex
                            items-center
                            gap-1.5
                            mt-1
                            ml-6
                            text-xs
                            text-stone-500
                          ">

                            <UserRound
                              className="
                                w-3
                                h-3
                              "
                            />

                            {cliente || '-'}

                          </div>

                        </button>

                      </td>


                      {/* CUOTA */}

                      <td className="
                        px-4
                        py-4
                        text-center
                      ">

                        <div className="
                          inline-flex
                          items-center
                          justify-center
                          min-w-[50px]
                          h-8
                          px-2
                          bg-stone-100
                          rounded-lg
                          font-bold
                          text-stone-700
                        ">

                          {cuota.numeroCuota}

                          <span className="
                            text-stone-400
                            font-normal
                            mx-1
                          ">
                            /
                          </span>

                          {cuota.credito
                            ?.cantidadCuotas ||
                            '-'
                          }

                        </div>

                      </td>


                      {/* VENCIMIENTO */}

                      <td className="
                        px-4
                        py-4
                      ">

                        <div className={`
                          flex
                          items-center
                          gap-2

                          ${
                            vencida
                              ? `
                                text-red-700
                                font-bold
                              `
                              : `
                                text-stone-600
                              `
                          }
                        `}>

                          <CalendarDays
                            className={`
                              w-4
                              h-4

                              ${
                                vencida
                                  ? 'text-red-500'
                                  : 'text-stone-400'
                              }
                            `}
                          />

                          {formatDate(
                            cuota.fechaVencimiento
                          )}

                        </div>

                      </td>


                      {/* IMPORTE */}

                      <td className="
                        px-4
                        py-4
                        text-right
                        font-semibold
                        text-stone-800
                      ">
                        $ {money(
                          cuota.monto
                        )}
                      </td>


                      {/* COBRADO */}

                      <td className="
                        px-4
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
                        px-4
                        py-4
                        text-right
                      ">

                        <span className={`
                          font-bold

                          ${
                            saldo <= 0
                              ? 'text-stone-400'
                              : vencida
                                ? 'text-red-600'
                                : 'text-amber-700'
                          }
                        `}>
                          $ {money(
                            saldo
                          )}
                        </span>

                      </td>


                      {/* ESTADO */}

                      <td className="
                        px-4
                        py-4
                        text-center
                      ">

                        <EstadoBadge
                          estado={
                            cuota.estado
                          }
                        />

                      </td>


                      {/* ACCIONES */}

                      <td className="
                        px-5
                        py-4
                      ">

                        <div className="
                          flex
                          items-center
                          justify-end
                          gap-2
                        ">

                          {!pagada && (

                            <button
                              type="button"
                              onClick={() =>
                                abrirModal(
                                  cuota
                                )
                              }
                              className={`
                                h-9
                                px-3
                                inline-flex
                                items-center
                                justify-center
                                gap-1.5
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
                                className="
                                  w-4
                                  h-4
                                "
                              />

                              {parcial
                                ? 'Completar'
                                : 'Cobrar'
                              }

                            </button>

                          )}


                          <button
                            type="button"
                            title="Ver crédito"
                            onClick={() =>
                              navigate(
                                `/creditos/${cuota.creditoId}`
                              )
                            }
                            className="
                              w-9
                              h-9
                              inline-flex
                              items-center
                              justify-center
                              border
                              border-stone-200
                              rounded-lg
                              text-stone-500
                              hover:bg-stone-100
                              hover:text-stone-900
                              transition
                            "
                          >

                            <Eye
                              className="
                                w-4
                                h-4
                              "
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )

                }
              )}

            </tbody>

          </table>

        </div>


        {/* ================================================= */}
        {/* MOBILE / TABLET */}
        {/* ================================================= */}

        <div className="
          lg:hidden
          divide-y
          divide-stone-100
        ">

          {cuotas.map(
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

              const saldo =
                cuota.saldo !==
                undefined
                  ? Number(
                      cuota.saldo || 0
                    )
                  : Math.max(
                      0,
                      Number(
                        cuota.monto || 0
                      ) -
                      Number(
                        cuota.montoPago || 0
                      )
                    )

              const cliente =
                `${cuota.credito?.cliente?.apellido || ''} ${cuota.credito?.cliente?.nombre || ''}`
                  .trim()

              return (

                <div
                  key={
                    cuota.id
                  }
                  className={`
                    p-4

                    ${
                      vencida
                        ? 'bg-red-50/30'
                        : ''
                    }
                  `}
                >

                  {/* CABECERA */}

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  ">

                    <div className="
                      min-w-0
                    ">

                      <div className="
                        flex
                        items-center
                        gap-2
                      ">

                        <CreditCard
                          className="
                            w-4
                            h-4
                            text-amber-600
                            shrink-0
                          "
                        />

                        <p className="
                          font-bold
                          text-stone-900
                        ">
                          {
                            formatCreditoNumber(
                              cuota.credito
                                ?.numeroCredito
                            )
                          }
                        </p>

                      </div>

                      <p className="
                        text-sm
                        text-stone-600
                        mt-1
                      ">
                        {cliente || '-'}
                      </p>

                    </div>


                    <EstadoBadge
                      estado={
                        cuota.estado
                      }
                    />

                  </div>


                  {/* CUOTA + FECHA */}

                  <div className="
                    grid
                    grid-cols-2
                    gap-3
                    mt-4
                  ">

                    <div className="
                      bg-stone-50
                      rounded-xl
                      p-3
                    ">

                      <p className="
                        text-xs
                        text-stone-400
                      ">
                        Cuota
                      </p>

                      <p className="
                        font-bold
                        text-stone-800
                        mt-0.5
                      ">

                        {cuota.numeroCuota}

                        {' de '}

                        {cuota.credito
                          ?.cantidadCuotas ||
                          '-'
                        }

                      </p>

                    </div>


                    <div className={`
                      rounded-xl
                      p-3

                      ${
                        vencida
                          ? 'bg-red-50'
                          : 'bg-stone-50'
                      }
                    `}>

                      <p className={`
                        text-xs

                        ${
                          vencida
                            ? 'text-red-500'
                            : 'text-stone-400'
                        }
                      `}>
                        Vencimiento
                      </p>

                      <p className={`
                        font-bold
                        mt-0.5

                        ${
                          vencida
                            ? 'text-red-700'
                            : 'text-stone-800'
                        }
                      `}>

                        {formatDate(
                          cuota.fechaVencimiento
                        )}

                      </p>

                    </div>

                  </div>


                  {/* DINERO */}

                  <div className="
                    grid
                    grid-cols-3
                    gap-2
                    mt-3
                    pt-3
                    border-t
                    border-stone-100
                  ">

                    <MoneyItem
                      label="Importe"
                      value={
                        cuota.monto
                      }
                    />

                    <MoneyItem
                      label="Cobrado"
                      value={
                        cuota.montoPago
                      }
                      variant="green"
                    />

                    <MoneyItem
                      label="Saldo"
                      value={
                        saldo
                      }
                      variant={
                        saldo <= 0
                          ? 'muted'
                          : vencida
                            ? 'red'
                            : 'amber'
                      }
                    />

                  </div>


                  {/* ACCIONES */}

                  <div className="
                    flex
                    gap-2
                    mt-4
                  ">

                    {!pagada && (

                      <button
                        type="button"
                        onClick={() =>
                          abrirModal(
                            cuota
                          )
                        }
                        className={`
                          flex-1
                          h-10
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          text-sm
                          font-bold
                          text-white

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
                          className="
                            w-4
                            h-4
                          "
                        />

                        {parcial
                          ? 'Completar pago'
                          : 'Registrar cobro'
                        }

                      </button>

                    )}


                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/creditos/${cuota.creditoId}`
                        )
                      }
                      className={`
                        h-10
                        px-4
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        border
                        border-stone-200
                        rounded-xl
                        text-sm
                        font-semibold
                        text-stone-600
                        hover:bg-stone-50

                        ${
                          pagada
                            ? 'flex-1'
                            : ''
                        }
                      `}
                    >

                      Ver crédito

                      <ArrowRight
                        className="
                          w-4
                          h-4
                        "
                      />

                    </button>

                  </div>

                </div>

              )

            }
          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <PagoCuotaModal
        isOpen={
          showModal &&
          !confirmacionPendiente
        }
        cuota={
          cuotaSeleccionada
        }
        onClose={
          cerrarModal
        }
        onConfirm={
          registrarPago
        }
        isLoading={
          guardando
        }
      />

      <ConfirmCascadaModal
        isOpen={
          !!confirmacionPendiente
        }
        cuotasAfectadas={
          confirmacionPendiente?.cuotasAfectadas ||
          []
        }
        saldoAFavor={
          confirmacionPendiente?.saldoAFavor ||
          0
        }
        onCancel={() =>
          setConfirmacionPendiente(null)
        }
        onConfirm={
          confirmarCascada
        }
        isLoading={
          guardando
        }
      />

    </>

  )

}


/* ===================================================== */
/* ESTADO BADGE */
/* ===================================================== */

function EstadoBadge({
  estado
}) {

  const styles = {

    PENDIENTE:
      'bg-blue-100 text-blue-700',

    PARCIAL:
      'bg-amber-100 text-amber-700',

    PAGADA:
      'bg-emerald-100 text-emerald-700',

    VENCIDA:
      'bg-red-100 text-red-700'

  }


  const labels = {

    PENDIENTE:
      'Pendiente',

    PARCIAL:
      'Parcial',

    PAGADA:
      'Pagada',

    VENCIDA:
      'Vencida'

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
      whitespace-nowrap

      ${
        styles[estado] ||
        'bg-stone-100 text-stone-600'
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
/* MONEY ITEM MOBILE */
/* ===================================================== */

function MoneyItem({
  label,
  value,
  variant = 'default'
}) {

  const styles = {

    default:
      'text-stone-800',

    green:
      'text-emerald-600',

    amber:
      'text-amber-700',

    red:
      'text-red-600',

    muted:
      'text-stone-400'

  }


  return (

    <div>

      <p className="
        text-[11px]
        text-stone-400
      ">
        {label}
      </p>

      <p className={`
        text-sm
        font-bold
        mt-0.5
        ${styles[variant]}
      `}>
        $ {Number(
          value || 0
        ).toLocaleString(
          'es-AR'
        )}
      </p>

    </div>

  )

}