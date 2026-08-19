import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  mobileService
} from '../../services/mobileService'

import {
  useAuthStore
} from '../../store/useAuthStore'

export default function DashboardPage() {

  const navigate =
    useNavigate()

  const user =
    useAuthStore(
      state => state.user
    )

  const [data,
    setData] =
      useState(null)

  const [loading,
    setLoading] =
      useState(true)

  useEffect(() => {

    cargar()

  }, [])

  const cargar =
    async () => {

      try {

        const response =
          await mobileService
            .dashboard()

        setData(response)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    }

  const obtenerSaludo =
    () => {

      const hora =
        new Date()
          .getHours()

      if (hora < 12)
        return '🌅 Buenos días'

      if (hora < 20)
        return '☀️ Buenas tardes'

      return '🌙 Buenas noches'

    }

  const nombreRol = {

    COBRADOR:
      'Cobrador',

    SUPERVISOR:
      'Supervisor',

    ADMIN:
      'Administrador'

  }

  const isSupervisor =
    user?.role === 'SUPERVISOR'

  const firstCard = {
    label: isSupervisor
      ? 'Cobrado hoy'
      : 'Cobros de hoy',
    value: isSupervisor
      ? data?.cobradoHoy ?? 0
      : data?.cobrosHoy ?? 0,
    color: 'text-white'
  }

  const secondCard = {
    label: isSupervisor
      ? 'Cobradores activos'
      : 'Vencidas',
    value: isSupervisor
      ? data?.cobradoresActivos ?? 0
      : data?.vencidas ?? 0,
    color: isSupervisor
      ? 'text-teal-300'
      : 'text-red-400'
  }

  if (loading) {

    return (

      <div
        className="
          flex
          justify-center
          items-center
          h-64
        "
      >
        Cargando...
      </div>

    )

  }

  return (

    <div className="space-y-5">

      <div
        className="
          bg-gradient-to-br
          from-cyan-700
          to-cyan-500
          rounded-3xl
          p-6
          shadow-xl
        "
      >

        <p
          className="
            text-cyan-100
            text-sm
          "
        >
          {obtenerSaludo()}
        </p>

        <h1
          className="
            text-3xl
            font-bold
            mt-1
            text-white
          "
        >
          {user?.name}
        </h1>

        <p
          className="
            text-cyan-100
            mt-2
          "
        >
          {
            nombreRol[
              user?.role
            ] ||
            user?.role
          }
        </p>

      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >

        <div
          className="
            bg-slate-900
            rounded-2xl
            p-5
          "
        >

          <p
            className="
              text-slate-400
              text-sm
            "
          >
            {firstCard.label}
          </p>

          <h2
            className="
              text-4xl
              font-bold
              mt-2
            "
          >
            {firstCard.value}
          </h2>

        </div>

        <div
          className="
            bg-slate-900
            rounded-2xl
            p-5
          "
        >

          <p
            className="
              text-slate-400
              text-sm
            "
          >
            {secondCard.label}
          </p>

          <h2
            className={`
              text-4xl
              font-bold
              mt-2
              ${secondCard.color}
            `}
          >
            {secondCard.value}
          </h2>

        </div>

      </div>

      {
        isSupervisor && (
          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <div
              className="
                bg-slate-900
                rounded-2xl
                p-5
              "
            >
              <p
                className="
                  text-slate-400
                  text-sm
                "
              >
                Clientes visitados
              </p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-2
                "
              >
                {data?.clientesVisitadosHoy ?? 0}
              </h2>
            </div>

            <div
              className="
                bg-slate-900
                rounded-2xl
                p-5
              "
            >
              <p
                className="
                  text-slate-400
                  text-sm
                "
              >
                Cobradores activos
              </p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-2
                "
              >
                {data?.cobradoresActivos ?? 0}
              </h2>
            </div>
          </div>
        )
      }

      <div
        className="
          bg-orange-500/15
          border
          border-orange-500/40
          rounded-2xl
          p-5
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

            <p
              className="
                text-orange-300
                text-sm
              "
            >
              Ayudas pendientes
            </p>

            <h2
              className="
                text-3xl
                font-bold
                mt-1
              "
            >
              {
                data?.ayudasPendientes ??
                0
              }
            </h2>

          </div>

          <div
            className="
              text-5xl
            "
          >
            🤝
          </div>

        </div>

      </div>

      <div>

        <p
          className="
            text-slate-400
            text-sm
            mb-3
          "
        >
          ¿Qué querés hacer?
        </p>

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >

          <button

            onClick={() =>
              navigate(
                isSupervisor
                  ? '/equipo'
                  : '/cobros'
              )
            }

            className="
              bg-cyan-600
              rounded-2xl
              py-5
              font-semibold
              active:scale-95
              transition
            "
          >

            {isSupervisor ? '👥' : '💰'}

            <div
              className="
                mt-2
              "
            >
              {isSupervisor ? 'Equipo' : 'Cobrar'}
            </div>

          </button>

          <button

            onClick={() =>
              navigate(
                isSupervisor
                  ? '/indicadores'
                  : '/buscar'
              )
            }

            className="
              bg-slate-800
              rounded-2xl
              py-5
              font-semibold
              active:scale-95
              transition
            "
          >

            {isSupervisor ? '📊' : '🔎'}

            <div
              className="
                mt-2
              "
            >
              {isSupervisor ? 'Indicadores' : 'Buscar'}
            </div>

          </button>

        </div>

      </div>

    </div>

  )

}