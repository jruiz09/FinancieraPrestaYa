export default function Logo({

  size = 48

}) {

  return (

    <div
      style={{
        width: size,
        height: size
      }}
      className="
        rounded-full
        bg-gradient-to-br
        from-teal-400
        to-cyan-600
        flex
        items-center
        justify-center
        shadow-lg
      "
    >

      <span
        className="
          text-white
          font-black
        "
        style={{
          fontSize:
            size / 2.4
        }}
      >
        PY
      </span>

    </div>

  )

}