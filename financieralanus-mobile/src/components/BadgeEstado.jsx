export default function BadgeEstado({

  estado

}) {

  const estilos = {

    PENDIENTE: `
      bg-cyan-500/20
      text-cyan-300
    `,

    PARCIAL: `
      bg-yellow-500/20
      text-yellow-300
    `,

    VENCIDA: `
      bg-red-500/20
      text-red-300
    `,

    PAGADA: `
      bg-green-500/20
      text-green-300
    `

  }

  return (

    <span
      className={`
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${estilos[estado]}
      `}
    >

      {estado}

    </span>

  )

}