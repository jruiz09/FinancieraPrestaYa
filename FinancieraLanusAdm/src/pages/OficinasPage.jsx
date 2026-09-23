import { useEffect, useState } from 'react'

import { Building2 } from 'lucide-react'

import ErrorAlert
  from '../components/ErrorAlert'

import OficinaModal
  from '../components/OficinaModal'

import Permission
  from '../components/Permission'

import { PERMISSIONS }
  from '../constants/permissions'

import { oficinaService }
  from '../services/oficinaService'

export default function OficinasPage() {

  const [oficinas, setOficinas] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [modalOpen, setModalOpen] =
    useState(false)

  const [oficinaEdit, setOficinaEdit] =
    useState(null)

  const [guardando, setGuardando] =
    useState(false)

  useEffect(() => {

    cargar()

  }, [])

  const cargar = async () => {

    try {

      setLoading(true)

      const data =
        await oficinaService.list()

      setOficinas(data || [])

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Error al cargar oficinas'
      )

    } finally {

      setLoading(false)

    }

  }

  const abrirCrear = () => {

    setOficinaEdit(null)
    setModalOpen(true)

  }

  const abrirEditar = (oficina) => {

    setOficinaEdit(oficina)
    setModalOpen(true)

  }

  const cerrarModal = () => {

    setModalOpen(false)
    setOficinaEdit(null)

  }

  const guardar = async (form) => {

    try {

      setGuardando(true)

      if (oficinaEdit) {

        await oficinaService.update(
          oficinaEdit.id,
          form
        )

      } else {

        await oficinaService.create(
          form
        )

      }

      cerrarModal()

      await cargar()

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Error al guardar la oficina'
      )

    } finally {

      setGuardando(false)

    }

  }

  const handleDeactivate = async (id) => {

    if (
      !window.confirm(
        '¿Desactivar esta oficina?'
      )
    ) {
      return
    }

    try {

      await oficinaService.deactivate(id)

      cargar()

    } catch (err) {

      setError(
        'Error al desactivar la oficina'
      )

    }

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
              Organización
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
              Oficinas
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Agrupá zonas por oficina para
              controlar qué puede ver cada usuario.
            </p>
          </div>

          <Permission permission={PERMISSIONS.OFICINAS_CREATE}>
            <button
              type="button"
              onClick={abrirCrear}
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
              Nueva oficina
            </button>
          </Permission>

        </div>
      </section>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
      />

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

      ) : oficinas.length === 0 ? (

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
            <Building2 className="h-5 w-5 text-stone-500" />
          </div>

          <p className="mt-3 font-semibold text-stone-700">
            No hay oficinas cargadas
          </p>

          <p className="mt-1 text-sm text-stone-400">
            Creá una oficina y asignale las
            zonas que le correspondan.
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
                    Nombre
                  </th>

                  <th className="px-4 py-3 text-left">
                    Zonas
                  </th>

                  <th className="px-4 py-3 text-left">
                    Estado
                  </th>

                  <th className="px-5 py-3 text-right">
                    Acciones
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-stone-100">

                {oficinas.map((oficina) => (

                  <tr
                    key={oficina.id}
                    className="transition hover:bg-amber-50/40"
                  >
                    <td className="px-5 py-4 font-semibold text-stone-800">
                      {oficina.nombre}
                    </td>

                    <td className="px-4 py-4 text-stone-600">
                      {oficina.zonas?.length
                        ? oficina.zonas
                            .map(z => z.nombre)
                            .join(', ')
                        : '-'}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-bold
                          ${oficina.activa
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                          }
                        `}
                      >
                        {oficina.activa
                          ? 'Activa'
                          : 'Inactiva'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        <Permission permission={PERMISSIONS.OFICINAS_EDIT}>
                          <button
                            type="button"
                            onClick={() =>
                              abrirEditar(oficina)
                            }
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

                        <Permission permission={PERMISSIONS.OFICINAS_DELETE}>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeactivate(oficina.id)
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
                            Desactivar
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

      <OficinaModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardar}
        oficina={oficinaEdit}
        isLoading={guardando}
      />

    </div>

  )

}
