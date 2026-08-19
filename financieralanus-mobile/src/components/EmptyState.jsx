export default function EmptyState({

  emoji = '📭',

  title,

  subtitle

}) {

  return (

    <div
      className="
        py-16
        text-center
      "
    >

      <div
        className="
          text-6xl
        "
      >
        {emoji}
      </div>

      <h2
        className="
          mt-5
          text-xl
          font-bold
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          text-slate-400
        "
      >
        {subtitle}
      </p>

    </div>

  )

}