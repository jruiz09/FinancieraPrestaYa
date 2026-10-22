import { useState } from 'react'

import toast from 'react-hot-toast'

import {
  UserX
} from 'lucide-react'

import {
  creditoService
} from '../services/creditoService'

const fechaHoy = () => {

  const ahora =
    new Date()

  const mes =
    String(ahora.getMonth() + 1)
      .padStart(2, '0')

  const dia =
    String(ahora.getDate())
      .padStart(2, '0')

  return `${ahora.getFullYear()}-${mes}-${dia}`

}

/*
Registra que se visitó al cliente y no pagó la cuota. Si ya
se marcó hoy, el botón permite quitar la marca del día.
*/
export default function VisitaSinPagoButton({
  cuota,
  onDone,
  className = ''
}) {

  const [
    guardando,
    setGuardando
  ] = useState(false)

  const marcadaHoy =
    cuota.fechaVisitaSinPago === fechaHoy()

  const toggle =
    async () => {

      try {

        setGuardando(true)

        await creditoService.visitaSinPago(
          cuota.id,
          !marcadaHoy
        )

        toast.success(
          marcadaHoy
            ? 'Marca "No pagó" quitada'
            : 'Visita sin pago registrada'
        )

        await onDone()

      } catch (error) {

        console.error(error)

        toast.error(
          error?.response
            ?.data
            ?.message ||
          'No se pudo registrar la visita'
        )

      } finally {

        setGuardando(false)

      }

    }

  return (

    <button
      type="button"
      onClick={toggle}
      disabled={guardando}
      title={
        marcadaHoy
          ? 'Quitar la marca de hoy'
          : 'Se visitó al cliente y no pagó'
      }
      className={`
        inline-flex
        items-center
        justify-center
        gap-1.5
        text-sm
        font-bold
        border
        transition
        disabled:opacity-60

        ${
          marcadaHoy
            ? `
              bg-stone-100
              border-stone-300
              text-stone-600
              hover:bg-stone-200
            `
            : `
              bg-orange-50
              border-orange-300
              text-orange-700
              hover:bg-orange-100
            `
        }

        ${className}
      `}
    >

      <UserX
        className="
          w-4
          h-4
        "
      />

      {marcadaHoy
        ? 'Quitar "No pagó"'
        : 'No pagó'
      }

    </button>

  )

}
