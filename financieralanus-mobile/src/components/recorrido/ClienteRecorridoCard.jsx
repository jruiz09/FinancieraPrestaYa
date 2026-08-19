import {
  MapPin,
  Navigation,
  Wallet
} from 'lucide-react'

import Money
  from '../Money'

import ClienteAvatar
  from '../ClienteAvatar'

export default function ClienteRecorridoCard({

  cliente,

  onIr,

  onCobrar

}) {

  return (

    <div
      className="
        bg-slate-900
        rounded-3xl
        p-5
        shadow-lg
        border
        border-slate-800
      "
    >

      <div
        className="
          flex
          gap-3
          items-center
        "
      >

        <ClienteAvatar
          cliente={cliente}
        />

        <div
          className="flex-1"
        >

          <h3
            className="
              text-lg
              font-bold
            "
          >

            {cliente.nombre}

            {' '}

            {cliente.apellido}

          </h3>

          <p
            className="
              text-slate-400
              text-sm
            "
          >

            {cliente.direccion}

          </p>

        </div>

      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-4
        "
      >

        <div>

          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Cuotas
          </p>

          <p
            className="
              text-xl
              font-bold
            "
          >
            {cliente.cantidadCuotas}
          </p>

        </div>

        <div>

          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Pendiente
          </p>

          <Money

            value={
              cliente.importePendiente
            }

            className="
              text-xl
              font-bold
            "

          />

        </div>

      </div>

      <div
        className="
          mt-6
          flex
          gap-3
        "
      >

        <button

          onClick={() =>
            onIr(cliente)
          }

          className="
            flex-1
            bg-slate-800
            rounded-2xl
            py-3
            flex
            justify-center
            items-center
            gap-2
          "

        >

          <Navigation
            size={18}
          />

          Ir

        </button>

        <button

          onClick={() =>
            onCobrar(cliente)
          }

          className="
            flex-1
            bg-cyan-600
            rounded-2xl
            py-3
            flex
            justify-center
            items-center
            gap-2
          "

        >

          <Wallet
            size={18}
          />

          Cobrar

        </button>

      </div>

    </div>

  )

}