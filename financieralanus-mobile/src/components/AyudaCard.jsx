import {
  CheckCircle2,
  Clock3,
  XCircle,
  HandCoins
} from 'lucide-react'

import Money from './Money'

export default function AyudaCard({

  ayuda,

  recibida,

  onAceptar,

  onRechazar

}) {

  const nombre = recibida

    ? ayuda.origenTipo === 'SUPERVISOR'
      ? `${ayuda.origenSupervisor?.apellido}, ${ayuda.origenSupervisor?.nombre}`
      : `${ayuda.origenCobrador?.apellido}, ${ayuda.origenCobrador?.nombre}`

    : ayuda.destinoTipo === 'SUPERVISOR'
      ? `${ayuda.destinoSupervisor?.apellido}, ${ayuda.destinoSupervisor?.nombre}`
      : `${ayuda.destinoCobrador?.apellido}, ${ayuda.destinoCobrador?.nombre}`

  const color = {

    PENDIENTE: 'text-yellow-400',

    ACEPTADA: 'text-green-400',

    RECHAZADA: 'text-red-400'

  }

  const icono = {

    PENDIENTE: <Clock3 size={18} />,

    ACEPTADA: <CheckCircle2 size={18} />,

    RECHAZADA: <XCircle size={18} />

  }

  return (

    <div className="bg-slate-900 rounded-3xl p-5">

      <div className="flex justify-between">

        <div>

          <h2 className="font-bold">

            Ayuda #{ayuda.numeroAyuda}

          </h2>

          <p className="text-slate-400 text-sm mt-1">

            {

              recibida

                ? 'De '

                : 'Para '

            }

            {nombre}

          </p>

        </div>

        <div className={`flex gap-2 items-center ${color[ayuda.estado]}`}>

          {icono[ayuda.estado]}

          {ayuda.estado}

        </div>

      </div>

      <div className="mt-5">

        <Money

          value={ayuda.monto}

          className="text-3xl font-bold"

        />

      </div>

      {

        ayuda.observaciones &&

        <div className="mt-4 bg-slate-800 rounded-xl p-3 text-sm">

          {ayuda.observaciones}

        </div>

      }

      {

        recibida &&

        ayuda.estado === 'PENDIENTE' &&

        <div className="flex gap-3 mt-5">

          <button

            onClick={()=>

              onAceptar(ayuda.id)

            }

            className="flex-1 bg-green-600 rounded-xl py-3"

          >

            Aceptar

          </button>

          <button

            onClick={()=>

              onRechazar(ayuda.id)

            }

            className="flex-1 bg-red-600 rounded-xl py-3"

          >

            Rechazar

          </button>

        </div>

      }

    </div>

  )

}