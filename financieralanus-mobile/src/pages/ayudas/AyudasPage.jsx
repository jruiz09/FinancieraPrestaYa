import {
  useEffect,
  useState
} from 'react'

import {
  Plus
} from 'lucide-react'

import {
  mobileService
} from '../../services/mobileService'

import Toast
  from '../../components/Toast'

import AyudaCard
  from '../../components/AyudaCard'

import AyudasTabs
  from '../../components/AyudasTabs'

import NuevaAyudaSheet
  from '../../components/NuevaAyudaSheet'

export default function AyudasPage() {

  const [loading,
    setLoading] =
      useState(true)

  const [tab,
    setTab] =
      useState(
        'RECIBIDAS'
      )

  const [toast,
    setToast] =
      useState(null)

  const [mostrarNueva,
    setMostrarNueva] =
      useState(false)

  const [recibidas,
    setRecibidas] =
      useState([])

  const [enviadas,
    setEnviadas] =
      useState([])

  useEffect(() => {

    cargar()

  }, [])

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

        ()=>

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
            .ayudas()

        setRecibidas(
          data.recibidas
        )

        setEnviadas(
          data.enviadas
        )

      } finally {

        setLoading(false)

      }

    }

  const crearAyuda =
    async payload => {

      try {

        await mobileService
          .crearAyuda(
            payload
          )

        mostrarToast(
          'Ayuda enviada'
        )

        setMostrarNueva(
          false
        )

        cargar()

      } catch {

        mostrarToast(
          'No se pudo enviar la ayuda',
          'error'
        )

      }

    }

  const aceptarAyuda =
    async id => {

      try {

        await mobileService
          .aceptarAyuda(
            id
          )

        mostrarToast(
          'Ayuda aceptada'
        )

        cargar()

      } catch {

        mostrarToast(
          'Error',
          'error'
        )

      }

    }

  const rechazarAyuda =
    async id => {

      const motivo =
        prompt(
          'Motivo del rechazo'
        ) || ''

      try {

        await mobileService
          .rechazarAyuda(

            id,

            motivo

          )

        mostrarToast(
          'Ayuda rechazada'
        )

        cargar()

      } catch {

        mostrarToast(
          'Error',
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

  const listado =

    tab === 'RECIBIDAS'

      ? recibidas

      : enviadas

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

              Ayudas

            </h1>

            <p
              className="
                text-slate-400
              "
            >

              Gestión de ayudas

            </p>

          </div>

          <button

            onClick={()=>

              setMostrarNueva(
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

        <AyudasTabs

          tab={tab}

          setTab={setTab}

          recibidas={
            recibidas.length
          }

          enviadas={
            enviadas.length
          }

        />


                {

          listado.length === 0 &&

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

              {

                tab === 'RECIBIDAS'

                  ? 'No tenés ayudas recibidas'

                  : 'No enviaste ayudas'

              }

            </h2>

            <p
              className="
                mt-2
                text-slate-400
              "
            >

              {

                tab === 'RECIBIDAS'

                  ? 'Cuando otro cobrador o un supervisor te envíe una ayuda aparecerá aquí.'

                  : 'Presioná el botón + para solicitar una ayuda.'

              }

            </p>

          </div>

        }

        <div
          className="
            space-y-4
          "
        >

          {

            listado.map(

              ayuda => (

                <AyudaCard

                  key={
                    ayuda.id
                  }

                  ayuda={
                    ayuda
                  }

                  recibida={
                    tab ===
                    'RECIBIDAS'
                  }

                  onAceptar={
                    aceptarAyuda
                  }

                  onRechazar={
                    rechazarAyuda
                  }

                />

              )

            )

          }

        </div>

      </div>

      {

        mostrarNueva &&

        <NuevaAyudaSheet

          onClose={() =>

            setMostrarNueva(
              false
            )

          }

          onConfirm={
            crearAyuda
          }

        />

      }

    </>

  )

}