import {
  Route,
  Users,
  Wallet
} from 'lucide-react'

import Money
  from '../Money'

export default function RecorridoHeader({

  clientes,

  importe

}) {

  return (

    <div
      className="
        rounded-3xl
        bg-gradient-to-r
        from-cyan-600
        to-cyan-500
        p-6
        text-white
      "
    >

      <Route
        size={36}
      />

      <h1
        className="
          mt-3
          text-3xl
          font-bold
        "
      >

        Recorrido

      </h1>

      <p
        className="
          opacity-90
        "
      >

        Cobros del día

      </p>

      <div
        className="
          mt-6
          grid
          grid-cols-2
          gap-4
        "
      >

        <div>

          <Users />

          <h2
            className="
              mt-2
              text-2xl
              font-bold
            "
          >

            {clientes}

          </h2>

          <small>

            Clientes

          </small>

        </div>

        <div>

          <Wallet />

          <Money

            value={importe}

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

      </div>

    </div>

  )

}