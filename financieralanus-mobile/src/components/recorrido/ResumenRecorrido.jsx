import {
  Users,
  Wallet,
  Route
} from 'lucide-react'

import Money
  from '../Money'

export default function ResumenRecorrido({

  resumen

}) {

  return (

    <div
      className="
        bg-gradient-to-r
        from-cyan-600
        to-cyan-500
        rounded-3xl
        p-5
        text-white
      "
    >

      <h2
        className="
          text-2xl
          font-bold
        "
      >

        🚗 Recorrido de hoy

      </h2>

      <div
        className="
          mt-5
          grid
          grid-cols-3
          gap-4
        "
      >

        <div>

          <Users />

          <p
            className="
              mt-2
              text-2xl
              font-bold
            "
          >

            {resumen.clientes}

          </p>

          <small>
            Clientes
          </small>

        </div>

        <div>

          <Wallet />

          <Money

            value={
              resumen.total
            }

            className="
              mt-2
              text-2xl
              font-bold
            "

          />

          <small>
            Pendiente
          </small>

        </div>

        <div>

          <Route />

          <p
            className="
              mt-2
              text-2xl
              font-bold
            "
          >

            {resumen.km}

          </p>

          <small>
            Km
          </small>

        </div>

      </div>

    </div>

  )

}