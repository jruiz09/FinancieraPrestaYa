import Money
  from '../Money'

export default function BarraProgreso({

  actual,

  total,

  cobrado

}) {

  const porcentaje =
    total === 0
      ? 0
      : (actual * 100) / total

  return (

    <div
      className="
        bg-slate-900
        rounded-3xl
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

          <h3
            className="
              font-bold
              text-lg
            "
          >
            Progreso
          </h3>

          <p
            className="
              text-slate-400
            "
          >

            {actual}

            {' de '}

            {total}

            {' clientes'}

          </p>

        </div>

        <Money

          value={cobrado}

          className="
            text-xl
            font-bold
            text-cyan-400
          "

        />

      </div>

      <div
        className="
          mt-4
          h-3
          rounded-full
          bg-slate-800
          overflow-hidden
        "
      >

        <div

          style={{
            width:
              `${porcentaje}%`
          }}

          className="
            h-full
            bg-cyan-500
            transition-all
            duration-500
          "

        />

      </div>

    </div>

  )

}