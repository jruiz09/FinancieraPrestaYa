import Money
  from './Money'

export default function InfoCard({

  icon,

  title,

  value,

  amount,

  color = 'cyan',

  onClick

}) {

  const colores = {

    cyan:
      'from-cyan-600 to-cyan-500',

    red:
      'from-red-600 to-red-500',

    orange:
      'from-orange-500 to-amber-500',

    green:
      'from-green-600 to-green-500',

    purple:
      'from-violet-600 to-violet-500'

  }

  return (

    <button

      onClick={onClick}

      className={`
        w-full
        rounded-3xl
        p-5
        bg-gradient-to-br
        ${colores[color]}
        text-left
        shadow-xl
        active:scale-[0.98]
        transition
      `}

    >

      <div
        className="
          flex
          justify-between
          items-start
        "
      >

        <div>

          <p
            className="
              text-white/80
              text-sm
            "
          >
            {title}
          </p>

          <h2
            className="
              text-4xl
              font-bold
              mt-1
            "
          >
            {value}
          </h2>

          {

            amount != null && (

              <Money

                value={amount}

                className="
                  block
                  mt-2
                  text-lg
                  text-white
                  font-semibold
                "

              />

            )

          }

        </div>

        <div
          className="
            text-white
            opacity-90
          "
        >
          {icon}
        </div>

      </div>

    </button>

  )

}