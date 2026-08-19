export default function Money({

  value = 0,

  className = ''

}) {

  return (

    <span
      className={className}
    >

      {

        Number(value)
          .toLocaleString(

            'es-AR',

            {

              style: 'currency',

              currency: 'ARS',

              maximumFractionDigits: 0

            }

          )

      }

    </span>

  )

}