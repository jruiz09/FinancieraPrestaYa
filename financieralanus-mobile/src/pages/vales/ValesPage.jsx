import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  ArrowLeft
} from 'lucide-react'

import {
  mobileService
} from '../../services/mobileService'

import ValeCard
  from '../../components/ValeCard'

export default function ValesPage() {

  const navigate =
    useNavigate()

  const [loading,
    setLoading] =
      useState(true)

  const [vales,
    setVales] =
      useState([])

  useEffect(() => {

    cargar()

  }, [])

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

          Adelantos recibidos de la oficina

        </p>

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

            Cuando la oficina te otorgue un vale, va a aparecer acá.

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

  )

}
