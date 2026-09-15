import React, {
  useEffect,
  useRef,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import toast from 'react-hot-toast'

import {
  Bell,
  CircleDollarSign,
  CheckCheck
} from 'lucide-react'

import {
  notificacionService
} from '../services/notificacionService'

import {
  useAuthStore
} from '../store/useAuthStore'

const INTERVALO_POLLING_MS = 30000

const formatRelativo = (fechaISO) => {

  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const diffMin = Math.floor((ahora - fecha) / 60000)

  if (diffMin < 1) return 'Recién'
  if (diffMin < 60) return `Hace ${diffMin} min`

  const diffHoras = Math.floor(diffMin / 60)
  if (diffHoras < 24) return `Hace ${diffHoras} h`

  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')

  return `${dia}/${mes}`

}


export default function NotificacionesBell() {

  const navigate = useNavigate()

  const permissions =
    useAuthStore(
      state => state.user?.permissions || []
    )

  const [open, setOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)

  const containerRef = useRef(null)

  /*
  null = todavía no cargamos nunca (evita mostrar un toast
  por cada notificación vieja en la primera carga).
  */
  const idsVistosRef = useRef(null)


  const mostrarAlerta = (notificacion) => {

    toast.custom(
      (t) => (

        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id)
            handleClickNotificacion(notificacion)
          }}
          className="
            flex
            items-center
            gap-3
            max-w-sm
            rounded-2xl
            border
            border-amber-200
            bg-white
            px-4
            py-3
            text-left
            shadow-lg
          "
        >

          <div className="
            w-9
            h-9
            shrink-0
            rounded-xl
            bg-emerald-100
            text-emerald-700
            flex
            items-center
            justify-center
          ">
            <CircleDollarSign className="w-4 h-4" />
          </div>

          <div className="min-w-0">

            <p className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-amber-700
            ">
              Nuevo pago
            </p>

            <p className="
              text-sm
              text-stone-700
              leading-snug
            ">
              {notificacion.mensaje}
            </p>

          </div>

        </button>

      ),
      { duration: 6000 }
    )

  }


  const cargar = async () => {

    try {

      const data = await notificacionService.list()

      const nuevas = data.notificaciones || []

      if (idsVistosRef.current) {

        const noVistasAun =
          nuevas.filter(n =>
            !n.leida &&
            !idsVistosRef.current.has(n.id)
          )

        noVistasAun.forEach(mostrarAlerta)

      }

      idsVistosRef.current =
        new Set(nuevas.map(n => n.id))

      setNotificaciones(nuevas)
      setNoLeidas(data.noLeidas || 0)

    } catch (error) {

      console.error(error)

    }

  }


  useEffect(() => {

    if (!permissions.includes('DASHBOARD_VIEW')) return

    cargar()

    const intervalo =
      setInterval(cargar, INTERVALO_POLLING_MS)

    return () => clearInterval(intervalo)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }

    }

    document.addEventListener('mousedown', handleClickOutside)

    return () =>
      document.removeEventListener('mousedown', handleClickOutside)

  }, [])


  const handleClickNotificacion = async (notificacion) => {

    if (!notificacion.leida) {

      try {

        await notificacionService.marcarLeida(notificacion.id)

        setNotificaciones(prev =>
          prev.map(n =>
            n.id === notificacion.id
              ? { ...n, leida: true }
              : n
          )
        )

        setNoLeidas(prev => Math.max(0, prev - 1))

      } catch (error) {

        console.error(error)

      }

    }

    setOpen(false)

    if (notificacion.creditoId) {
      navigate(`/creditos/${notificacion.creditoId}`)
    }

  }


  const handleMarcarTodasLeidas = async () => {

    try {

      await notificacionService.marcarTodasLeidas()

      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leida: true }))
      )

      setNoLeidas(0)

    } catch (error) {

      console.error(error)

    }

  }


  if (!permissions.includes('DASHBOARD_VIEW')) {
    return null
  }


  return (

    <div className="relative" ref={containerRef}>

      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        title="Notificaciones"
        className="
          relative
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-xl
          text-stone-500
          hover:text-stone-800
          hover:bg-stone-100
          transition
        "
      >

        <Bell className="w-5 h-5" />

        {noLeidas > 0 && (

          <span className="
            absolute
            top-1
            right-1
            min-w-[18px]
            h-[18px]
            px-1
            flex
            items-center
            justify-center
            rounded-full
            bg-red-500
            text-white
            text-[10px]
            font-bold
            leading-none
          ">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>

        )}

      </button>

      {open && (

        <div className="
          absolute
          right-0
          mt-2
          w-80
          max-h-96
          overflow-hidden
          flex
          flex-col
          rounded-2xl
          border
          border-stone-200
          bg-white
          shadow-lg
          z-40
        ">

          <div className="
            flex
            items-center
            justify-between
            gap-2
            px-4
            py-3
            border-b
            border-stone-100
          ">

            <p className="
              text-sm
              font-bold
              text-stone-800
            ">
              Notificaciones
            </p>

            {noLeidas > 0 && (

              <button
                type="button"
                onClick={handleMarcarTodasLeidas}
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-amber-700
                  hover:text-amber-800
                "
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas
              </button>

            )}

          </div>

          <div className="
            overflow-y-auto
            divide-y
            divide-stone-100
          ">

            {notificaciones.length === 0 && (

              <div className="
                px-4
                py-10
                text-center
                text-sm
                text-stone-400
              ">
                No hay notificaciones todavía.
              </div>

            )}

            {notificaciones.map(notificacion => (

              <button
                key={notificacion.id}
                type="button"
                onClick={() =>
                  handleClickNotificacion(notificacion)
                }
                className={`
                  w-full
                  flex
                  items-start
                  gap-3
                  px-4
                  py-3
                  text-left
                  transition
                  hover:bg-stone-50

                  ${notificacion.leida
                    ? ''
                    : 'bg-amber-50/60'
                  }
                `}
              >

                <div className="
                  w-8
                  h-8
                  shrink-0
                  rounded-lg
                  bg-emerald-100
                  text-emerald-700
                  flex
                  items-center
                  justify-center
                ">
                  <CircleDollarSign className="w-4 h-4" />
                </div>

                <div className="min-w-0">

                  <p className={`
                    text-sm
                    leading-snug

                    ${notificacion.leida
                      ? 'text-stone-600'
                      : 'font-semibold text-stone-900'
                    }
                  `}>
                    {notificacion.mensaje}
                  </p>

                  <p className="
                    text-xs
                    text-stone-400
                    mt-0.5
                  ">
                    {formatRelativo(notificacion.createdAt)}
                  </p>

                </div>

                {!notificacion.leida && (
                  <span className="
                    w-2
                    h-2
                    mt-1.5
                    shrink-0
                    rounded-full
                    bg-amber-500
                  " />
                )}

              </button>

            ))}

          </div>

        </div>

      )}

    </div>

  )

}
