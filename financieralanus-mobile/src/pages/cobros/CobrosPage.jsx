import {
  useEffect,
  useState
} from 'react'

import Toast
  from '../../components/Toast'

import PagoModal
  from '../../components/PagoModal'

import ConfirmDialog
  from '../../components/ConfirmDialog'

import SectionTitle
  from '../../components/SectionTitle'

import Money
  from '../../components/Money'

import EmptyState
  from '../../components/EmptyState'

import CuotaCard
  from '../../components/CuotaCard'

import {
  mobileService
} from '../../services/mobileService'

import {
  useAuthStore
} from '../../store/useAuthStore'

export default function CobrosPage() {

  const user =
    useAuthStore(
      state => state.user
    )

  const role =
    user?.role?.name ||
    user?.role

  const esSupervisor =
    role === 'SUPERVISOR'

  const [toast,
    setToast] =
      useState(null)

  const [tab,
    setTab] =
      useState('HOY')

  const [cuotas,
    setCuotas] =
      useState([])

  const [loading,
    setLoading] =
      useState(true)

  const [cuotaSeleccionada,
    setCuotaSeleccionada] =
      useState(null)

  const [confirmacionPendiente,
    setConfirmacionPendiente] =
      useState(null)

  const [confirmando,
    setConfirmando] =
      useState(false)

  const [zonas,
    setZonas] =
      useState([])

  const [zonaSeleccionada,
    setZonaSeleccionada] =
      useState('')

  useEffect(() => {

    if (!esSupervisor) {
      return
    }

    mobileService.zonas()
      .then(setZonas)
      .catch(
        error => console.error(error)
      )

  }, [esSupervisor])

  useEffect(() => {

    cargar()

  }, [tab, zonaSeleccionada])

  const cargar =
    async () => {

      try {

        setLoading(true)

        const zoneId =
          esSupervisor
            ? zonaSeleccionada
            : undefined

        const data =

          tab === 'HOY'

            ? await mobileService.cuotasHoy(zoneId)

            : await mobileService.cuotasAtrasadas(zoneId)

        setCuotas(data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    }

  const registrarPago =
    async (payload) => {

      try {

        const respuesta =
          await mobileService.pagarCuota(

            cuotaSeleccionada.id,

            payload

          )

        if (respuesta.requiereConfirmacion) {

          setConfirmacionPendiente({
            cuotaId: cuotaSeleccionada.id,
            payload,
            ...respuesta.data
          })

          return
        }

        mostrarToast(

          '✅ Pago registrado correctamente',

          'success'

        )

        setCuotaSeleccionada(null)

        await cargar()

      } catch (error) {

        mostrarToast(

          error.response?.data?.message ||

          '❌ Error al registrar pago',

          'error'

        )

      }

    }

  const confirmarCascada =
    async () => {

      try {

        setConfirmando(true)

        await mobileService.pagarCuota(

          confirmacionPendiente.cuotaId,

          {
            ...confirmacionPendiente.payload,
            confirmado: true
          }

        )

        mostrarToast(

          '✅ Pago registrado correctamente',

          'success'

        )

        setConfirmacionPendiente(null)

        setCuotaSeleccionada(null)

        await cargar()

      } catch (error) {

        mostrarToast(

          error.response?.data?.message ||

          '❌ Error al registrar pago',

          'error'

        )

      } finally {

        setConfirmando(false)

      }

    }

  const mostrarToast = (

    message,

    type = 'success'

  ) => {

    setToast({

      message,

      type

    })

    setTimeout(

      () => setToast(null),

      2500

    )

  }

  const totalPendiente =

    cuotas.reduce(

      (total, cuota) =>

        total +

        (

          Number(cuota.monto) -

          Number(cuota.montoPago)

        ),

      0

    )

  return (

    <>

      <Toast

        show={!!toast}

        message={toast?.message}

        type={toast?.type}

      />

      <div
        className="
          space-y-5
        "
      >

        <SectionTitle

          title={
            esSupervisor
              ? '📋 Cuotas'
              : '💰 Cobros'
          }

          subtitle={
            esSupervisor
              ? 'Cuotas de los cobradores de tu zona'
              : 'Gestioná las cuotas de tus clientes'
          }

        />

        {esSupervisor &&
          zonas.length > 1 && (

          <select

            value={zonaSeleccionada}

            onChange={e =>
              setZonaSeleccionada(
                e.target.value
              )
            }

            className="
              w-full
              bg-slate-900
              rounded-2xl
              px-4
              py-3
              text-sm
              font-medium
              border
              border-slate-800
            "

          >

            <option value="">
              Todas mis zonas
            </option>

            {zonas.map(
              zona => (
                <option
                  key={zona.id}
                  value={zona.id}
                >
                  {zona.nombre}
                </option>
              )
            )}

          </select>

        )}

        <div
          className="
            bg-slate-900
            rounded-2xl
            p-5
          "
        >

          <p
            className="
              text-sm
              text-slate-400
            "
          >

            {

              tab === 'HOY'

                ? 'Cobros de hoy'

                : 'Cuotas vencidas'

            }

          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            {cuotas.length}

            {' '}cuotas

          </h2>

          <Money

            value={totalPendiente}

            className="
              text-xl
              font-bold
              text-cyan-400
            "

          />

        </div>

        <div
          className="
            flex
            gap-2
          "
        >

          <button

            onClick={() =>
              setTab('HOY')
            }

            className={`

              flex-1

              py-3

              rounded-xl

              font-semibold

              transition

              ${

                tab === 'HOY'

                  ? 'bg-cyan-600'

                  : 'bg-slate-800'

              }

            `}
          >

            Hoy

          </button>

          <button

            onClick={() =>
              setTab('ATRASADAS')
            }

            className={`

              flex-1

              py-3

              rounded-xl

              font-semibold

              transition

              ${

                tab === 'ATRASADAS'

                  ? 'bg-red-600'

                  : 'bg-slate-800'

              }

            `}
          >

            Atrasadas

          </button>

        </div>

        {

          loading && (

            <div
              className="
                text-center
                text-slate-400
                py-10
              "
            >

              Cargando...

            </div>

          )

        }

        {

          !loading &&

          cuotas.length === 0 && (

            <EmptyState

              emoji="💸"

              title="No hay cuotas"

              subtitle={

                tab === 'HOY'

                  ? 'No tenés cobros para hoy.'

                  : 'No existen cuotas vencidas.'

              }

            />

          )

        }

        {

          !loading &&

          cuotas.map(

            cuota => (

              <CuotaCard

                key={cuota.id}

                cuota={cuota}

                onCobrar={

                  esSupervisor
                    ? undefined
                    : setCuotaSeleccionada

                }

                mostrarCobrador={
                  esSupervisor
                }

              />

            )

          )

        }

        {

          cuotaSeleccionada &&
          !confirmacionPendiente && (

            <PagoModal

              cuota={

                cuotaSeleccionada

              }

              onClose={() =>

                setCuotaSeleccionada(null)

              }

              onConfirm={

                registrarPago

              }

            />

          )

        }

        {

          confirmacionPendiente && (

            <ConfirmDialog

              title="Confirmar cobro"

              message={
                `Este pago afecta ${confirmacionPendiente.cuotasAfectadas.length} cuotas.`
              }

              cuotasAfectadas={
                confirmacionPendiente.cuotasAfectadas
              }

              saldoAFavor={
                confirmacionPendiente.saldoAFavor
              }

              isLoading={confirmando}

              onCancel={() =>
                setConfirmacionPendiente(null)
              }

              onConfirm={confirmarCascada}

            />

          )

        }

      </div>

    </>

  )

}