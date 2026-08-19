export default function SectionTitle({

  title,

  subtitle

}) {

  return (

    <div
      className="mb-5"
    >

      <h1
        className="
          text-3xl
          font-bold
        "
      >
        {title}
      </h1>

      {

        subtitle && (

          <p
            className="
              mt-1
              text-slate-400
            "
          >
            {subtitle}
          </p>

        )

      }

    </div>

  )

}