import Money from './Money'
import ClienteAvatar from './ClienteAvatar'

export default function PagoResumen({

  cuota

}) {

  const cliente =
    cuota.credito?.cliente

  return (

    <div
      className="
        bg-slate-800
        rounded-2xl
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <ClienteAvatar
          cliente={cliente}
        />

        <div>

          <h2
            className="
              text-xl
              font-bold
            "
          >

            {cliente?.nombre}

            {' '}

            {cliente?.apellido}

          </h2>

          <p
            className="
              text-slate-400
            "
          >

            Crédito #

            {cuota.credito?.numeroCredito}

            {' · '}

            Cuota

            {cuota.numeroCuota}

          </p>

        </div>

      </div>

      <div
        className="
          mt-6
          text-center
        "
      >

        <p
          className="
            text-slate-400
          "
        >

          Saldo pendiente

        </p>

        <Money

          value={cuota.saldo}

          className="
            text-5xl
            font-bold
            mt-2
          "

        />

      </div>

    </div>

  )

}