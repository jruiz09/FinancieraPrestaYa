import { useEffect, useState } from 'react'

import ErrorAlert
  from '../components/ErrorAlert'

import AyudaModal
  from '../components/AyudasModal'

import { ayudaService }
  from '../services/ayudaService'

import { supervisorService }
  from '../services/supervisorService'

import { collectorService }
  from '../services/collectorService'

import { useAuthStore }
  from '../store/useAuthStore'

export default function AyudasPage() {

  const ownerId =
    useAuthStore(
      (state) => state.ownerId
    )

  const [ayudas, setAyudas] =
    useState([])

  const [supervisores,
    setSupervisores] =
    useState([])

  const [cobradores,
    setCobradores] =
    useState([])

  const [loading,
    setLoading] =
    useState(true)

  const [modalOpen,
    setModalOpen] =
    useState(false)

  const [modalLoading,
    setModalLoading] =
    useState(false)

  const [error,
    setError] =
    useState('')

  useEffect(() => {

    cargarDatos()

  }, [])

  const cargarDatos =
    async () => {

      try {

        setLoading(true)

        const [
          ayudasData,
          supervisoresData,
          cobradoresData
        ] =
          await Promise.all([

            ayudaService.listar(),

            supervisorService.listar(
              1,
              100
            ),

            collectorService.list(
              1,
              100,
              ownerId
            )

          ])

        setAyudas(
          ayudasData || []
        )

        setSupervisores(
          supervisoresData.supervisores || []
        )

        setCobradores(
          cobradoresData.collectors || []
        )

      } catch (err) {

        setError(
          'Error cargando ayudas'
        )

      } finally {

        setLoading(false)

      }

    }

  const handleCrearAyuda =
    async (data) => {

      try {

        setModalLoading(true)

        await ayudaService.crear(
          data
        )

        await cargarDatos()

        setModalOpen(false)

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Error creando ayuda'
        )

      } finally {

        setModalLoading(false)

      }

    }

  const handleEliminar =
    async (id) => {

      if (
        !window.confirm(
          '¿Eliminar ayuda?'
        )
      ) {
        return
      }

      try {

        await ayudaService.eliminar(
          id
        )

        cargarDatos()

      } catch {

        setError(
          'Error eliminando ayuda'
        )

      }

    }

  const pendientes =
    ayudas.filter(
      a =>
        a.estado ===
        'PENDIENTE'
    ).length

  const aceptadas =
    ayudas.filter(
      a =>
        a.estado ===
        'ACEPTADA'
    ).length

  const rechazadas =
    ayudas.filter(
      a =>
        a.estado ===
        'RECHAZADA'
    ).length

  const totalMonto =
    ayudas.reduce(
      (acc, item) =>
        acc +
        Number(
          item.monto || 0
        ),
      0
    )

  const obtenerDestino =
    (ayuda) => {

      if (
        ayuda.destinoTipo ===
        'SUPERVISOR'
      ) {

        return ayuda
          .destinoSupervisor
          ? `${ayuda.destinoSupervisor.apellido}, ${ayuda.destinoSupervisor.nombre}`
          : '-'

      }

      return ayuda
        .destinoCobrador
        ? `${ayuda.destinoCobrador.apellido}, ${ayuda.destinoCobrador.nombre}`
        : '-'

    }

  const badgeEstado =
    (estado) => {

      switch (estado) {

        case 'ACEPTADA':
          return `
            bg-green-100
            text-green-700
          `

        case 'RECHAZADA':
          return `
            bg-red-100
            text-red-700
          `

        default:
          return `
            bg-yellow-100
            text-yellow-700
          `
      }

    }

  return (

    <div className="p-6">

      <div
        className="
          flex
          justify-between
          items-center
          mb-6
        "
      >

        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Ayudas
        </h1>

        <button
          onClick={() =>
            setModalOpen(true)
          }
          className="
            bg-cyan-500
            hover:bg-cyan-600
            text-white
            px-4
            py-2
            rounded
          "
        >
          + Nueva Ayuda
        </button>

      </div>

      <ErrorAlert
        message={error}
        onDismiss={() =>
          setError('')
        }
      />

      <div
        className="
          grid
          grid-cols-4
          gap-4
          mb-6
        "
      >

        <div
          className="
            bg-white
            rounded
            shadow
            p-4
          "
        >
          <p>Total</p>

          <p
            className="
              text-2xl
              font-bold
            "
          >
            {ayudas.length}
          </p>
        </div>

        <div
          className="
            bg-yellow-50
            rounded
            shadow
            p-4
          "
        >
          <p>Pendientes</p>

          <p
            className="
              text-2xl
              font-bold
            "
          >
            {pendientes}
          </p>
        </div>

        <div
          className="
            bg-green-50
            rounded
            shadow
            p-4
          "
        >
          <p>Aceptadas</p>

          <p
            className="
              text-2xl
              font-bold
            "
          >
            {aceptadas}
          </p>
        </div>

        <div
          className="
            bg-cyan-50
            rounded
            shadow
            p-4
          "
        >
          <p>Monto Total</p>

          <p
            className="
              text-xl
              font-bold
            "
          >
            $
            {totalMonto.toLocaleString(
              'es-AR'
            )}
          </p>
        </div>

      </div>

      {loading ? (

        <div>
          Cargando...
        </div>

      ) : (

        <div
          className="
            bg-white
            rounded
            shadow
            overflow-x-auto
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
              "
            >

              <tr>

                <th className="p-3 text-left">
                  Nº
                </th>

                <th className="p-3 text-left">
                  Fecha
                </th>

                <th className="p-3 text-left">
                  Destino
                </th>

                <th className="p-3 text-left">
                  Tipo
                </th>

                <th className="p-3 text-left">
                  Monto
                </th>

                <th className="p-3 text-left">
                  Estado
                </th>

                <th className="p-3 text-left">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {ayudas.map(
                (ayuda) => (

                  <tr
                    key={ayuda.id}
                    className="
                      border-t
                    "
                  >

                    <td className="p-3">
                      {ayuda.numeroAyuda}
                    </td>

                    <td className="p-3">
                      {ayuda.fecha}
                    </td>

                    <td className="p-3">
                      {
                        obtenerDestino(
                          ayuda
                        )
                      }
                    </td>

                    <td className="p-3">
                      {
                        ayuda.destinoTipo
                      }
                    </td>

                    <td className="p-3">
                      $
                      {Number(
                        ayuda.monto
                      ).toLocaleString(
                        'es-AR'
                      )}
                    </td>

                    <td className="p-3">

                      <span
                        className={`
                          px-2
                          py-1
                          rounded
                          text-xs
                          font-medium
                          ${badgeEstado(
                            ayuda.estado
                          )}
                        `}
                      >
                        {
                          ayuda.estado
                        }
                      </span>

                    </td>

                    <td className="p-3">

                      <button
                        onClick={() =>
                          handleEliminar(
                            ayuda.id
                          )
                        }
                        className="
                          text-red-600
                        "
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

      <AyudaModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={
          handleCrearAyuda
        }
        supervisores={
          supervisores
        }
        cobradores={
          cobradores
        }
        isLoading={
          modalLoading
        }
      />

    </div>

  )

}