import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  ArrowLeft,
  Navigation,
  Wallet,
  CheckCircle2
} from 'lucide-react'

import Toast
  from '../../components/Toast'

import Money
  from '../../components/Money'

import ClienteAvatar
  from '../../components/ClienteAvatar'

import PagoModal
  from '../../components/PagoModal'

import ConfirmDialog
  from '../../components/ConfirmDialog'

import {
  mobileService
} from '../../services/mobileService'

export default function RecorridoPage() {

  const navigate =
    useNavigate()

  const [clientes,
    setClientes] =
      useState([])

  const [loading,
    setLoading] =
      useState(true)

  const [indice,
    setIndice] =
      useState(-1)

  const [toast,
    setToast] =
      useState(null)

  const [cuotaSeleccionada,
    setCuotaSeleccionada] =
      useState(null)

  const [confirmacionPendiente,
    setConfirmacionPendiente] =
      useState(null)

  const [confirmando,
    setConfirmando] =
      useState(false)

  useEffect(() => {

    cargar()

  }, [])

  const cargar =
    async () => {

      try {

        setLoading(true)

        const data =
          await mobileService.recorrido()

        setClientes(data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    }

  const mostrarToast =
    (
      message,
      type='success'
    ) => {

      setToast({

        message,

        type

      })

      setTimeout(

        () =>

          setToast(null),

        2500

      )

    }

  const irConMaps =
    (cliente) => {

      if (

        !cliente.cliente.latitud ||

        !cliente.cliente.longitud

      ) {

        mostrarToast(

          'El cliente no tiene ubicación',

          'error'

        )

        return

      }

      window.open(

`https://www.google.com/maps/dir/?api=1&destination=${cliente.cliente.latitud},${cliente.cliente.longitud}`,

'_blank'

      )

    }

  const avanzarDespuesDePago =
    async () => {

      setCuotaSeleccionada(
        null
      )

      const siguiente =
        indice + 1

      if (
        siguiente >=
        clientes.length
      ) {

        setIndice(-2)

        return

      }

      setIndice(
        siguiente
      )

      await cargar()

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
          'Cobro registrado'
        )

        await avanzarDespuesDePago()

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
          'Cobro registrado'
        )

        setConfirmacionPendiente(null)

        await avanzarDespuesDePago()

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

      <div
        className="
          text-center
          py-20
        "
      >

        Cargando recorrido...

      </div>

    )

  }

  const totalPendiente =
    clientes.reduce(

      (a,c)=>

        a +

        Number(
          c.saldoCredito || 0
        ),

      0

    )

      if (indice === -2) {

    return (

      <div className="space-y-6">

        <div
          className="
            bg-slate-900
            rounded-3xl
            p-8
            text-center
          "
        >

          <CheckCircle2
            size={70}
            className="
              mx-auto
              text-green-500
            "
          />

          <h2
            className="
              mt-5
              text-3xl
              font-bold
            "
          >

            ¡Recorrido finalizado!

          </h2>

          <p
            className="
              mt-2
              text-slate-400
            "
          >

            Excelente trabajo.

          </p>

          <button

            onClick={() =>
              navigate('/')
            }

            className="
              mt-8
              w-full
              bg-cyan-600
              rounded-2xl
              py-4
              font-semibold
            "

          >

            Volver al inicio

          </button>

        </div>

      </div>

    )

  }

  if (indice === -1) {

    return (

      <>

        <Toast
          show={!!toast}
          message={toast?.message}
          type={toast?.type}
        />

        <div className="space-y-6">

          <button

            onClick={() =>
              navigate(-1)
            }

            className="
              flex
              items-center
              gap-2
              text-cyan-400
            "

          >

            <ArrowLeft size={20} />

            Volver

          </button>

          <div
            className="
              rounded-3xl
              bg-gradient-to-r
              from-cyan-600
              to-cyan-500
              p-6
            "
          >

            <h1
              className="
                text-3xl
                font-bold
              "
            >

              🚗 Recorrido

            </h1>

            <p
              className="
                mt-2
                opacity-90
              "
            >

              Clientes pendientes de hoy

            </p>

            <div
              className="
                mt-8
              "
            >

              <p className="text-sm">

                Clientes

              </p>

              <h2
                className="
                  text-5xl
                  font-bold
                "
              >

                {clientes.length}

              </h2>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p className="text-sm">

                Importe pendiente

              </p>

              <Money

                value={totalPendiente}

                className="
                  text-4xl
                  font-bold
                "

              />

            </div>

            <button

              onClick={() =>
                setIndice(0)
              }

              className="
                mt-8
                w-full
                bg-white
                text-cyan-700
                rounded-2xl
                py-4
                font-bold
              "

            >

              Comenzar recorrido

            </button>

          </div>

        </div>

      </>

    )

  }

  const cliente =
    clientes[indice]

  return (

    <>

      <Toast
        show={!!toast}
        message={toast?.message}
        type={toast?.type}
      />

      <div className="space-y-5">

        <div
          className="
            flex
            justify-between
            items-center
          "
        >

          <button

            onClick={() =>
              navigate(-1)
            }

            className="
              text-cyan-400
            "

          >

            <ArrowLeft />

          </button>

          <strong>

            Cliente {indice + 1} de {clientes.length}

          </strong>

          <div />

        </div>

        <div
          className="
            h-2
            rounded-full
            bg-slate-800
          "
        >

          <div

            className="
              h-full
              rounded-full
              bg-cyan-500
            "

            style={{

              width:

`${((indice+1)*100)/clientes.length}%`

            }}

          />

        </div>

        <div
          className="
            bg-slate-900
            rounded-3xl
            p-6
          "
        >

          <div
            className="
              flex
              gap-4
              items-center
            "
          >

            <ClienteAvatar
              cliente={cliente.cliente}
              size={64}
            />

            <div>

              <h2
                className="
                  text-2xl
                  font-bold
                "
              >

                {cliente.cliente.nombre}

                {' '}

                {cliente.cliente.apellido}

              </h2>

              <p
                className="
                  text-slate-400
                "
              >

                {cliente.cliente.direccion}

              </p>

            </div>

          </div>

          <div
            className="
              mt-8
            "
          >

            <p
              className="
                text-sm
                text-slate-500
              "
            >

              Próxima cuota

            </p>

            <Money

              value={
                cliente.proximaCuota?.saldo || 0
              }

              className="
                text-5xl
                font-bold
              "

            />

            <p
              className="
                mt-2
                text-slate-400
              "
            >

              Cuota Nº

              {' '}

              {

                cliente.proximaCuota
                  ?.numeroCuota

              }

            </p>

            <p
              className="
                text-slate-400
              "
            >

              {

                cliente.cuotasPendientes

              }

              {' '}cuotas pendientes

            </p>

          </div>

          <div
            className="
              mt-8
              grid
              grid-cols-2
              gap-3
            "
          >

            <button

              onClick={() =>
                irConMaps(cliente)
              }

              className="
                rounded-2xl
                py-4
                bg-slate-800
                flex
                justify-center
                items-center
                gap-2
              "

            >

              <Navigation size={20}/>

              Ir

            </button>

            <button

              onClick={() =>
                setCuotaSeleccionada(
                  cliente.proximaCuota
                )
              }

              className="
                rounded-2xl
                py-4
                bg-cyan-600
                flex
                justify-center
                items-center
                gap-2
              "

            >

              <Wallet size={20}/>

              Cobrar

            </button>

          </div>

        </div>

      </div>

      {

        cuotaSeleccionada &&
        !confirmacionPendiente &&

        <PagoModal

          cuota={

            {

              ...cuotaSeleccionada,

              saldo:
                cuotaSeleccionada.saldo

            }

          }

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