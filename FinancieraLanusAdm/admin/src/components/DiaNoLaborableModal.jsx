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

  return (

    <div
      className="
        fixed
        inset-0
        bg-black/40
        flex
        items-center
        justify-center
      "
    >

      <form
        onSubmit={guardar}
        className="
          bg-white
          p-6
          rounded
          shadow
          w-[450px]
        "
      >

        <h2 className="text-xl font-bold mb-4">

          {
            dia
              ? 'Editar'
              : 'Nuevo'
          }

          {' '}
          Día No Laborable

        </h2>

        <div className="space-y-4">

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded
              p-2
            "
          />

          <input
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
            placeholder="Descripción"
            className="
              w-full
              border
              rounded
              p-2
            "
          />

        </div>

        <div
          className="
            flex
            justify-end
            gap-2
            mt-6
          "
        >

          <button
            type="button"
            onClick={onClose}
            className="
              border
              px-4
              py-2
              rounded
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="
              bg-cyan-500
              text-white
              px-4
              py-2
              rounded
            "
          >
            Guardar
          </button>

        </div>

      </form>

    </div>
  )
}