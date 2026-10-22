import {
  UserX
} from 'lucide-react'

/*
Indica que se visitó al cliente y no pagó la cuota, con la
cantidad de veces (días distintos) y la fecha de la última
visita. Se registra desde mobile o desde el panel y se
limpia al pagar.
*/
export default function VisitaSinPagoTag({
  cuota
}) {

  const veces =
    Number(cuota?.visitasSinPago || 0)

  if (
    (!cuota?.fechaVisitaSinPago && veces === 0) ||
    cuota.estado === 'PAGADA'
  ) {
    return null
  }

  return (

    <span
      title="Se visitó al cliente y no pagó"
      className="
        inline-flex
        items-center
        gap-1
        px-2.5
        py-1
        rounded-full
        text-[11px]
        font-bold
        whitespace-nowrap
        bg-orange-100
        text-orange-700
      "
    >

      <UserX
        size={12}
      />

      {veces > 1
        ? `No pagó ${veces} veces`
        : 'No pagó'
      }

      {cuota.fechaVisitaSinPago && (
        <>
          {' · '}
          {
            cuota.fechaVisitaSinPago
              .split('-')
              .reverse()
              .join('/')
          }
        </>
      )}

    </span>

  )

}
