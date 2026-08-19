export default function ClienteAvatar({

  cliente,

  size = 48

}) {

  const iniciales =
    `${cliente?.nombre?.[0] || ''}${cliente?.apellido?.[0] || ''}`
      .toUpperCase()

  return (

    <div

      style={{
        width: size,
        height: size
      }}

      className="
        rounded-full
        bg-cyan-600
        flex
        items-center
        justify-center
        font-bold
        text-white
        shrink-0
      "

    >

      {iniciales}

    </div>

  )

}