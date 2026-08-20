import React,
{
  useEffect,
  useState
}
from 'react'

import {
  CalendarX2
} from 'lucide-react'

import {
  diaNoLaborableService
}
from '../services/diaNoLaborableService'

import DiaNoLaborableModal
from '../components/DiaNoLaborableModal'

import Permission
from '../components/Permission'

import { PERMISSIONS }
from '../constants/permissions'

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

    <div className="space-y-6 pb-10">

      {/* HEADER */}
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-stone-200
          bg-gradient-to-br
          from-stone-50
          via-white
          to-amber-50
          px-5
          py-6
          shadow-sm
          sm:px-7
          sm:py-7
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-48
            w-48
            rounded-full
            bg-amber-200/30
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                mb-2
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-200
                bg-amber-50
                px-3
                py-1
                text-xs
                font-semibold
                text-amber-700
              "
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Configuración
            </div>

            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-stone-900
                sm:text-3xl
              "
            >
              Días no laborables
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Feriados y días en que no
              se agendan vencimientos.
            </p>
          </div>

          <Permission permission={PERMISSIONS.HOLIDAYS_CREATE}>
            <button
              type="button"
              onClick={() => {

                setDiaEditar(null)

                setOpenModal(true)

              }}
              className="
                inline-flex
                min-h-[46px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-stone-900
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-md
              "
            >
              <span className="text-xl leading-none">+</span>
              Nuevo día
            </button>
          </Permission>
        </div>
      </section>

      {/* LISTADO */}
      {loading ? (

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-14
                  animate-pulse
                  rounded-xl
                  bg-stone-100
                "
              />
            ))}
          </div>
        </div>

      ) : dias.length === 0 ? (

        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-stone-300
            bg-white
            px-5
            py-12
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-stone-100
            "
          >
            <CalendarX2 className="h-5 w-5 text-stone-500" />
          </div>

          <p className="mt-3 font-semibold text-stone-700">
            No hay días no laborables cargados
          </p>

          <p className="mt-1 text-sm text-stone-400">
            Agregá feriados para que no se
            programen vencimientos esos días.
          </p>
        </div>

      ) : (

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-stone-200
            bg-white
            shadow-sm
          "
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-stone-50/80">

                <tr
                  className="
                    border-b
                    border-stone-200
                    text-xs
                    uppercase
                    tracking-wide
                    text-stone-500
                  "
                >

                  <th className="px-5 py-3 text-left">
                    Fecha
                  </th>

                  <th className="px-4 py-3 text-left">
                    Descripción
                  </th>

                  <th className="px-5 py-3 text-right">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-stone-100">

                {dias.map((dia) => (

                  <tr
                    key={dia.id}
                    className="transition hover:bg-amber-50/40"
                  >

                    <td className="px-5 py-4 font-semibold text-stone-800">
                      {
                        dia.fecha
                          .split('-')
                          .reverse()
                          .join('/')
                      }
                    </td>

                    <td className="px-4 py-4 text-stone-600">
                      {dia.descripcion}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <Permission permission={PERMISSIONS.HOLIDAYS_EDIT}>
                          <button
                            type="button"
                            onClick={() => {

                              setDiaEditar(dia)

                              setOpenModal(true)

                            }}
                            className="
                              rounded-lg
                              border
                              border-stone-200
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-stone-600
                              transition
                              hover:border-amber-300
                              hover:bg-amber-50
                              hover:text-amber-700
                            "
                          >
                            Editar
                          </button>
                        </Permission>

                        <Permission permission={PERMISSIONS.HOLIDAYS_DELETE}>
                          <button
                            type="button"
                            onClick={() =>
                              eliminar(dia.id)
                            }
                            className="
                              rounded-lg
                              border
                              border-red-100
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-red-500
                              transition
                              hover:bg-red-50
                            "
                          >
                            Eliminar
                          </button>
                        </Permission>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>
        </div>

      )}

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