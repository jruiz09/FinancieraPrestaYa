import {

  MapPin,

  Navigation,

  Wallet,

  SkipForward

} from 'lucide-react'

import ClienteAvatar
  from '../ClienteAvatar'

import Money
  from '../Money'

export default function ClienteActualCard({

  cliente,

  onIr,

  onCobrar,

  onOmitir

}) {

  if (!cliente)
    return null

  return (

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
          items-center
          gap-4
        "
      >

        <ClienteAvatar
          cliente={cliente}
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

              cliente.nombre

            }

            {' '}

            {

              cliente.apellido

            }

          </h2>

          <p
            className="
              text-slate-400
            "
          >

            {

              cliente.direccion

            }

          </p>

        </div>

      </div>

      <div
        className="
          mt-8
          grid
          grid-cols-2
          gap-4
        "
      >

        <div>

          <p
            className="
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
              text-3xl
              font-bold
            "

          />

        </div>

        <div>

          <p
            className="
              text-slate-500
            "
          >
            Cuotas
          </p>

          <h2
            className="
              text-3xl
              font-bold
            "
          >

            {

              cliente.cantidadCuotas

            }

          </h2>

        </div>

      </div>

      <div
        className="
          mt-8
          space-y-3
        "
      >

        <button

          onClick={
            onIr
          }

          className="
            w-full
            py-4
            rounded-2xl
            bg-slate-800
            flex
            justify-center
            gap-2
          "

        >

          <Navigation />

          Ir con Maps

        </button>

        <button

          onClick={
            onCobrar
          }

          className="
            w-full
            py-4
            rounded-2xl
            bg-cyan-600
            flex
            justify-center
            gap-2
            font-semibold
          "

        >

          <Wallet />

          Cobrar

        </button>

        <button

          onClick={
            onOmitir
          }

          className="
            w-full
            py-4
            rounded-2xl
            bg-red-900/40
            flex
            justify-center
            gap-2
          "

        >

          <SkipForward />

          Omitir

        </button>

      </div>

    </div>

  )

}