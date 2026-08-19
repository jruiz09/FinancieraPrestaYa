import { useEffect, useState } from 'react'

import ErrorAlert
  from '../components/ErrorAlert'

import ZoneModal
  from '../components/ZoneModal'

import { zoneService }
  from '../services/zoneService'

export default function ZonesPage() {

  const [zones, setZones] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [modalOpen, setModalOpen] =
    useState(false)

  const [modalMode, setModalMode] =
    useState('create')

  const [selectedZone, setSelectedZone] =
    useState({})

  const [isModalLoading, setIsModalLoading] =
    useState(false)

  useEffect(() => {

    fetchZones()

  }, [])

  const fetchZones = async () => {

    try {

      setLoading(true)

      const data =
        await zoneService.list()

      setZones(data)

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Error al cargar zonas'
      )

    } finally {

      setLoading(false)

    }

  }

  const openCreateModal = () => {

    setModalMode('create')

    setSelectedZone({})

    setModalOpen(true)

  }

  const openEditModal = (zone) => {

    setModalMode('edit')

    setSelectedZone(zone)

    setModalOpen(true)

  }

  const closeModal = () => {

    setModalOpen(false)

    setSelectedZone({})

  }

  const handleSaveZone = async (
    formData
  ) => {

    try {

      setIsModalLoading(true)

      if (
        modalMode === 'create'
      ) {

        await zoneService.create(
          formData
        )

      } else {

        await zoneService.update(
          selectedZone.id,
          formData
        )

      }

      await fetchZones()

      closeModal()

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Error al guardar zona'
      )

    } finally {

      setIsModalLoading(false)

    }

  }

  const handleDeactivate =
    async (id) => {

      if (
        !window.confirm(
          '¿Desactivar esta zona?'
        )
      ) {
        return
      }

      try {

        await zoneService.deactivate(
          id
        )

        fetchZones()

      } catch (err) {

        setError(
          'Error al desactivar zona'
        )

      }

    }

  return (

    <div>

      <div
        className="
          mb-6
          flex
          justify-between
          items-center
        "
      >

        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Zonas
        </h1>

        <button
          onClick={
            openCreateModal
          }
          className="
            px-4
            py-2
            bg-cyan-500
            hover:bg-cyan-600
            text-white
            rounded
          "
        >
          + Nueva Zona
        </button>

      </div>

      <ErrorAlert
        message={error}
        onDismiss={() =>
          setError('')
        }
      />

      {loading ? (

        <div>
          Cargando...
        </div>

      ) : (

        <div
          className="
            overflow-x-auto
            bg-white
            dark:bg-gray-800
            rounded
            shadow
          "
        >

          <table
            className="
              w-full
              text-sm
            "
          >

            <thead
              className="
                bg-gray-100
                dark:bg-gray-700
              "
            >

              <tr>

                <th
                  className="
                    px-4
                    py-3
                    text-left
                  "
                >
                  Nombre
                </th>

                <th
                  className="
                    px-4
                    py-3
                    text-left
                  "
                >
                  Color
                </th>

                <th
                  className="
                    px-4
                    py-3
                    text-left
                  "
                >
                  Radio
                </th>

                <th
                  className="
                    px-4
                    py-3
                    text-left
                  "
                >
                  Estado
                </th>

                <th
                  className="
                    px-4
                    py-3
                    text-left
                  "
                >
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {zones.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      text-center
                      py-8
                    "
                  >
                    Sin zonas
                  </td>

                </tr>

              ) : (

                zones.map(
                  (zone) => (

                    <tr
                      key={zone.id}
                      className="
                        border-b
                      "
                    >

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >
                        {zone.nombre}
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <div
                            style={{
                              background:
                                zone.color
                            }}
                            className="
                              w-5
                              h-5
                              rounded-full
                              border
                            "
                          />

                          {zone.color}

                        </div>

                      </td>

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >
                        {
                          zone.radioMetros
                        }
                        m
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >

                        <span
                          className={`
                            px-2
                            py-1
                            rounded
                            text-xs
                            ${
                              zone.activa
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }
                          `}
                        >
                          {
                            zone.activa
                              ? 'Activa'
                              : 'Inactiva'
                          }
                        </span>

                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          flex
                          gap-2
                        "
                      >

                        <button
                          onClick={() =>
                            openEditModal(
                              zone
                            )
                          }
                          className="
                            px-2
                            py-1
                            text-xs
                            bg-blue-500
                            text-white
                            rounded
                          "
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            handleDeactivate(
                              zone.id
                            )
                          }
                          className="
                            px-2
                            py-1
                            text-xs
                            bg-red-500
                            text-white
                            rounded
                          "
                        >
                          Desactivar
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      )}

      <ZoneModal

        isOpen={modalOpen}

        title={
          modalMode === 'create'
            ? 'Nueva Zona'
            : 'Editar Zona'
        }

        initialData={
          selectedZone
        }

        onSubmit={
          handleSaveZone
        }

        onClose={
          closeModal
        }

        isLoading={
          isModalLoading
        }

      />

    </div>

  )

}
