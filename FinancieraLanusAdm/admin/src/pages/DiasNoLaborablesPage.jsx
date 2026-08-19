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

import DiaNoLaborableModal
from '../components/DiaNoLaborableModal'

export default function DiasNoLaborablesPage() {

  const [dias,
    setDias] =
      useState([])

  const [loading,
    setLoading] =
      useState(true)

  const [openModal,
    setOpenModal] =
      useState(false)

  const [diaEditar,
    setDiaEditar] =
      useState(null)

  useEffect(() => {

    cargarDatos()

  }, [])

  const cargarDatos =
    async () => {

      try {

        setLoading(true)

        const data =
          await diaNoLaborableService
            .listar()

        setDias(
          data.diasNoLaborables || []
        )

      } finally {

        setLoading(false)

      }
    }

  const eliminar =
    async (id) => {

      if (
        !window.confirm(
          '¿Eliminar día no laborable?'
        )
      ) {
        return
      }

      await diaNoLaborableService
        .eliminar(id)

      cargarDatos()
    }

  return (

    <div className="space-y-6">

      <div
        className="
          flex
          justify-between
          items-center
        "
      >

        <div>

          <h1 className="text-3xl font-bold">
            Días No Laborables
          </h1>

          <p className="text-gray-500">
            Configuración de feriados
          </p>

        </div>

        <button
          onClick={() => {

            setDiaEditar(null)

            setOpenModal(true)

          }}
          className="
            bg-cyan-500
            hover:bg-cyan-600
            text-white
            px-4
            py-2
            rounded
          "
        >
          + Nuevo
        </button>

      </div>

      <div
        className="
          bg-white
          rounded
          shadow
          overflow-hidden
        "
      >

        <table className="w-full">

          <thead>

            <tr>

              <th className="p-3 text-left">
                Fecha
              </th>

              <th className="p-3 text-left">
                Descripción
              </th>

              <th className="p-3 text-center">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {dias.map((dia) => (

              <tr
                key={dia.id}
                className="border-t"
              >

                <td className="p-3">
                {
  dia.fecha
    .split('-')
    .reverse()
    .join('/')
}
                </td>

                <td className="p-3">
                  {dia.descripcion}
                </td>

                <td className="p-3 text-center">

                  <button
                    onClick={() => {

                      setDiaEditar(dia)

                      setOpenModal(true)

                    }}
                    className="
                      bg-blue-500
                      text-white
                      px-3
                      py-1
                      rounded
                      mr-2
                    "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      eliminar(dia.id)
                    }
                    className="
                      bg-red-500
                      text-white
                      px-3
                      py-1
                      rounded
                    "
                  >
                    Eliminar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <DiaNoLaborableModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        dia={diaEditar}
        onSuccess={() => {

          setOpenModal(false)

          cargarDatos()

        }}
      />

    </div>
  )
}