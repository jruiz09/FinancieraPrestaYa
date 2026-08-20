import { useEffect, useState } from 'react'

import ErrorAlert
  from '../components/ErrorAlert'

import ValeModal
  from '../components/ValeModal'

import { valeService }
  from '../services/valeService'

import { supervisorService }
  from '../services/supervisorService'

import { collectorService }
  from '../services/collectorService'

import { useAuthStore }
  from '../store/useAuthStore'

const TIPO_LABEL = {
  ADELANTO: 'Adelanto',
  COMBUSTIBLE: 'Combustible',
  GASTOS: 'Gastos',
  OTROS: 'Otros'
}

export default function ValesPage() {

  const ownerId =
    useAuthStore(
      (state) => state.ownerId
    )

  const [vales, setVales] =
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
          valesData,
          supervisoresData,
          cobradoresData
        ] =
          await Promise.all([

            valeService.listar(),

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

        setVales(
          valesData || []
        )

        setSupervisores(
          supervisoresData.supervisores || []
        )

        setCobradores(
          cobradoresData.collectors || []
        )

      } catch {

        setError(
          'Error cargando vales'
        )

      } finally {

        setLoading(false)

      }

    }

  const handleCrearVale =
    async (data) => {

      try {

        setModalLoading(true)

        await valeService.crear(
          data
        )

        await cargarDatos()

        setModalOpen(false)

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Error creando vale'
        )

      } finally {

        setModalLoading(false)

      }

    }

  const handleAnular =
    async (id) => {

      if (
        !window.confirm(
          '¿Anular este vale?'
        )
      ) {
        return
      }

      try {

        await valeService.anular(
          id
        )

        cargarDatos()

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Error anulando vale'
        )

      }

    }

  const totalMonto =
    vales
      .filter(v => v.estado !== 'ANULADO')
      .reduce(
        (acc, item) =>
          acc +
          Number(
            item.monto || 0
          ),
        0
      )

  const obtenerDestino =
    (vale) => {

      if (vale.supervisor) {

        return `${vale.supervisor.apellido}, ${vale.supervisor.nombre}`
      }

      return vale.collector
        ? `${vale.collector.apellido}, ${vale.collector.nombre}`
        : '-'

    }

  const badgeEstado =
    (estado) => {

      switch (estado) {

        case 'RENDIDO':
          return `
            bg-green-100
            text-green-700
          `

        case 'ANULADO':
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
          Vales
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
          + Nuevo Vale
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
          grid-cols-2
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
          <p>Total de vales</p>

          <p
            className="
              text-2xl
              font-bold
            "
          >
            {vales.length}
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
          <p>Monto total vigente</p>

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

              {vales.map(
                (vale) => (

                  <tr
                    key={vale.id}
                    className="
                      border-t
                    "
                  >

                    <td className="p-3">
                      {vale.numero}
                    </td>

                    <td className="p-3">
                      {vale.fecha}
                    </td>

                    <td className="p-3">
                      {
                        obtenerDestino(
                          vale
                        )
                      }
                    </td>

                    <td className="p-3">
                      {
                        TIPO_LABEL[vale.tipo] ||
                        vale.tipo
                      }
                    </td>

                    <td className="p-3">
                      $
                      {Number(
                        vale.monto
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
                            vale.estado
                          )}
                        `}
                      >
                        {
                          vale.estado
                        }
                      </span>

                    </td>

                    <td className="p-3">

                      {vale.estado === 'PENDIENTE' && (

                        <button
                          onClick={() =>
                            handleAnular(
                              vale.id
                            )
                          }
                          className="
                            text-red-600
                          "
                        >
                          Anular
                        </button>

                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

      <ValeModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={
          handleCrearVale
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
