import React,
{
  useEffect,
  useState
}
from 'react'

import {
  diaNoLaborableService
}
from '../services/diaNoLaborableService'

export default function DiaNoLaborableModal({

  open,
  onClose,
  dia,
  onSuccess

}) {

  const [fecha,
    setFecha] =
      useState('')

  const [descripcion,
    setDescripcion] =
      useState('')

  useEffect(() => {

    if (dia) {

      setFecha(
        dia.fecha
      )

      setDescripcion(
        dia.descripcion
      )

    } else {

      setFecha('')

      setDescripcion('')

    }

  }, [dia])

  useEffect(() => {

    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }

  }, [open])

  useEffect(() => {

    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }

  }, [open, onClose])

  if (!open)
    return null

  const guardar =
    async (e) => {

      e.preventDefault()

      const payload = {
        fecha,
        descripcion
      }

      if (dia) {

        await diaNoLaborableService
          .actualizar(
            dia.id,
            payload
          )

      } else {

        await diaNoLaborableService
          .crear(
            payload
          )

      }

      onSuccess()
    }

  const inputClass = `
    w-full
    rounded-xl
    border
    border-stone-200
    bg-stone-50
    px-3.5
    py-2.5
    text-sm
    text-stone-900
    outline-none
    transition
    placeholder:text-stone-400
    focus:border-amber-400
    focus:bg-white
    focus:ring-4
    focus:ring-amber-100
  `

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-stone-950/50
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >

      <form
        onSubmit={guardar}
        className="
          flex
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-stone-200
          bg-white
          shadow-2xl
          sm:max-w-md
          sm:rounded-3xl
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            border-b
            border-stone-200
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >

          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-amber-600
              "
            >
              Día no laborable
            </p>

            <h2 className="mt-0.5 text-lg font-bold text-stone-900 sm:text-xl">
              {dia ? 'Editar día' : 'Nuevo día'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-stone-100
              text-xl
              text-stone-500
              transition
              hover:bg-stone-200
              hover:text-stone-800
            "
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>

        <div className="space-y-4 p-5">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Fecha
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(
                  e.target.value
                )
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Descripción
            </label>

            <input
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              placeholder="Ej: Feriado nacional"
              className={inputClass}
            />
          </div>

        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-stone-200
            bg-white
            px-5
            py-4
            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >

          <button
            type="button"
            onClick={onClose}
            className="
              min-h-[42px]
              rounded-xl
              border
              border-stone-200
              px-5
              py-2.5
              text-sm
              font-semibold
              text-stone-600
              transition
              hover:bg-stone-50
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="
              inline-flex
              min-h-[42px]
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-stone-900
              px-6
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-stone-800
            "
          >
            Guardar
          </button>

        </div>

      </form>

    </div>
  )
}