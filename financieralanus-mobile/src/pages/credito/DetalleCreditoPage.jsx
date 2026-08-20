import {
  useEffect,
  useState
} from 'react'

import {
  useParams,
  useNavigate
} from 'react-router-dom'

import {
  ArrowLeft
} from 'lucide-react'

import {
  mobileService
} from '../../services/mobileService'

import PagoModal
  from '../../components/PagoModal'

import ConfirmDialog
  from '../../components/ConfirmDialog'

import Toast
  from '../../components/Toast'

import ClienteAvatar
  from '../../components/ClienteAvatar'

import Money
  from '../../components/Money'

import CuotaCard
  from '../../components/CuotaCard'

export default function DetalleCreditoPage() {

  const { id } =
    useParams()

  const navigate =
    useNavigate()

  const [credito,
    setCredito] =
      useState(null)

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

  const [toast,
    setToast] =
      useState(null)

  useEffect(() => {

    cargar()

  }, [id])

  const cargar =
    async () => {

      try {

        setLoading(true)

        const data =
          await mobileService
            .getCredito(id)

        setCredito(data)

      } finally {

        setLoading(false)

      }

    }

  const mostrarToast =
    (
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

  const registrarPago =
    async (payload) => {

      try {

        const respuesta =
          await mobileService
            .pagarCuota(
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
          'Pago registrado correctamente'
        )

        setCuotaSeleccionada(
          null
        )

        cargar()

      } catch (error) {

        mostrarToast(

          error.response?.data?.message ||

          'Error al registrar pago',

          'error'

        )

      }

    }

  const confirmarCascada =
    async () => {

      try {

        setConfirmando(true)

        await mobileService
          .pagarCuota(
            confirmacionPendiente.cuotaId,
            {
              ...confirmacionPendiente.payload,
              confirmado: true
            }
          )

        mostrarToast(
          'Pago registrado correctamente'
        )

        setConfirmacionPendiente(null)

        setCuotaSeleccionada(
          null
        )

        cargar()

      } catch (error) {

        mostrarToast(

          error.response?.data?.message ||

          'Error al registrar pago',

          'error'

        )

      } finally {

        setConfirmando(false)

      }

    }

  if (loading) {

    return (
      <div>
        Cargando...
      </div>
    )

  }

  const cuotasPagadas =
    credito.cuotas.filter(

      c =>
        c.estado ===
        'PAGADA'

    ).length

  const porcentaje = Math.round(

    cuotasPagadas *

    100 /

    credito.cuotas.length

  )
console.log(credito)
  return (

    <>

      <Toast

        show={!!toast}

        message={toast?.message}

        type={toast?.type}

      />

      <div
        className="space-y-5"
      >

        <button

          onClick={() =>
            navigate(-1)
          }

          className="
            flex
            items-center
            gap-2
            text-cyan-400
            font-medium
          "

        >

          <ArrowLeft
            size={20}
          />

          Volver

        </button>

        <div
          className="
            bg-slate-900
            rounded-3xl
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <ClienteAvatar
              cliente={
                credito.cliente
              }
              size={64}
            />

            <div>

              <h2
                className="
                  text-2xl
                  font-bold
                "
              >

                {
                  credito.cliente.nombre
                }

                {' '}

                {
                  credito.cliente.apellido
                }

              </h2>

              <p
                className="
                  text-slate-400
                "
              >

                DNI

                {' '}

                {
                  credito.cliente.dni
                }

              </p>

              <p
                className="
                  text-cyan-400
                  text-sm
                  mt-1
                "
              >

                Crédito #

                {
                  credito.numeroCredito
                }

              </p>

            </div>

          </div>

        </div>

        <div
          className="
            bg-gradient-to-br
            from-cyan-600
            to-cyan-500
            rounded-3xl
            p-5
          "
        >

          <p
            className="
              text-white/80
            "
          >

            Saldo pendiente

          </p>

          <Money

            value={
              credito.saldo
            }

            className="
              text-4xl
              font-bold
              text-white
              mt-2
            "

          />

          <p
            className="
              text-white/80
              mt-3
            "
          >

            {

              credito.cuotas.filter(

                c =>
                  c.estado !==
                  'PAGADA'

              ).length

            }

            {' '}cuotas pendientes

          </p>

        </div>

        <div
          className="
            bg-slate-900
            rounded-2xl
            p-4
          "
        >

          <div
            className="
              flex
              justify-between
              mb-2
            "
          >

            <span>

              Progreso del crédito

            </span>

            <strong>

              {porcentaje}%

            </strong>

          </div>

          <div
            className="
              h-3
              rounded-full
              bg-slate-800
              overflow-hidden
            "
          >

            <div

              style={{
                width:
                  `${porcentaje}%`
              }}

              className="
                h-full
                bg-cyan-500
              "

            />

          </div>

        </div>

        <div
          className="
            space-y-3
          "
        >

          {

            credito.cuotas.map(

              cuota => (

  <CuotaCard
  key={cuota.id}
  cuota={{
    ...cuota,
    credito
  }}
  totalCuotas={
    credito.cuotas.length
  }
  detalle
  onCobrar={
    setCuotaSeleccionada
  }
/>

              )

            )

          }

        </div>

      </div>

      {

        cuotaSeleccionada &&
        !confirmacionPendiente &&

        <PagoModal

          cuota={{
            ...cuotaSeleccionada,
            credito
          }}

          onClose={() =>
            setCuotaSeleccionada(
              null
            )
          }

          onConfirm={
            registrarPago
          }

        />

      }

      {

        confirmacionPendiente &&

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

      }

    </>

  )

}