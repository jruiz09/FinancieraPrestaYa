export default function Toast({

  show,

  message,

  type = 'success'

}) {

  if (!show) return null

  return (

    <div
      className={`
        fixed
        top-4
        left-1/2
        -translate-x-1/2
        z-[99999]
        px-4
        py-3
        rounded-xl
        shadow-lg
        text-white
        font-medium
        ${
          type === 'success'
            ? 'bg-green-600'
            : 'bg-red-600'
        }
      `}
    >
      {message}
    </div>

  )

}