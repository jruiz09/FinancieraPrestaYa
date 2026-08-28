import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  ArrowLeft,
  Plus
} from 'lucide-react'

import {
  mobileService
} from '../../services/mobileService'

import ValeCard
  from '../../components/ValeCard'

import NuevaValeSheet
  from '../../components/NuevaValeSheet'

import Toast
  from '../../components/Toast'

export default function ValesPage() {

  const navigate =
    useNavigate()

  const [loading,
    setLoading] =
      useState(true)

  const [vales,
    setVales] =
      useState([])

  const [mostrarNuevo,
    setMostrarNuevo] =
      useState(false)

  const [toast,
    setToast] =
      useState(null)

  useEffect(() => {

    cargar()

  }, [])

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
        () =>
          setToast(null),
        2500
      )

    }

  const cargar =
    async () => {

      try {

        setLoading(true)

        const data =
          await mobileService
            .vales()

        setVales(
          data || []
        )

      } finally {

        setLoading(false)

      }

    }

  const crearVale =
    async payload => {

      try {

        await mobileService
          .crearVale(
            payload
          )

        mostrarToast(
          'Vale cargado'
        )

        setMostrarNuevo(
          false
        )

        cargar()

      } catch {

        mostrarToast(
          'No se pudo cargar el vale',
          'error'
        )

      }

    }

  if (loading) {

    return (

      <div
        className="
          flex
          justify-center
          py-20
        "
      >

        Cargando...

      </div>

    )

  }

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
        pb-24
      "
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
          flex
          justify-between
          items-center
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
            "
          >

            Mis Vales

          </h1>

          <p
            className="
              text-slate-400
            "
          >

            Adelantos y vales propios

          </p>

        </div>

        <button

          onClick={() =>

            setMostrarNuevo(
              true
            )

          }

          className="
            h-14
            w-14
            rounded-full
            bg-cyan-600
            flex
            justify-center
            items-center
            shadow-lg
          "

        >

          <Plus />

        </button>

      </div>

      {

        vales.length === 0 &&

        <div
          className="
            bg-slate-900
            rounded-3xl
            p-10
            text-center
          "
        >

          <h2
            className="
              text-xl
              font-bold
            "
          >

            No tenés vales registrados

          </h2>

          <p
            className="
              mt-2
              text-slate-400
            "
          >

            Cargá un vale propio o esperá a que la oficina te otorgue uno.

          </p>

        </div>

      }

      <div
        className="
          space-y-4
        "
      >

        {

          vales.map(

            vale => (

              <ValeCard

                key={
                  vale.id
                }

                vale={
                  vale
                }

              />

            )

          )

        }

      </div>

    </div>

    {

      mostrarNuevo &&

      <NuevaValeSheet

        onClose={() =>

          setMostrarNuevo(
            false
          )

        }

        onConfirm={
          crearVale
        }

      />

    }

    </>

  )

}
