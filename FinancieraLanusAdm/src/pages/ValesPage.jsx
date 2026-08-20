import { useEffect, useState } from 'react'

import { Wallet } from 'lucide-react'

import ErrorAlert
  from '../components/ErrorAlert'

import ValeModal
  from '../components/ValeModal'

import Permission
  from '../components/Permission'

import { PERMISSIONS }
  from '../constants/permissions'

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
            bg-emerald-100
            text-emerald-700
          `

        case 'ANULADO':
          return `
            bg-red-100
            text-red-700
          `

        default:
          return `
            bg-amber-100
            text-amber-700
          `
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
              Equipo de cobranza
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
              Vales
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Adelantos otorgados a
              cobradores y supervisores.
            </p>
          </div>

          <Permission permission={PERMISSIONS.VALES_CREATE}>
            <button
              type="button"
              onClick={() =>
                setModalOpen(true)
              }
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
              Nuevo vale
            </button>
          </Permission>

        </div>
      </section>

      <ErrorAlert
        message={error}
        onDismiss={() =>
          setError('')
        }
      />

      {/* MÉTRICAS */}
      <section
        className="
          grid
          grid-cols-2
          gap-3
          lg:gap-4
        "
      >

        <MetricCard
          label="Total de vales"
          value={vales.length}
          variant="stone"
        />

        <MetricCard
          label="Monto total vigente"
          value={`$ ${totalMonto.toLocaleString('es-AR')}`}
          variant="amber"
        />

      </section>

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

      ) : vales.length === 0 ? (

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
            <Wallet className="h-5 w-5 text-stone-500" />
          </div>

          <p className="mt-3 font-semibold text-stone-700">
            No hay vales registrados
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
            <table
              className="
                w-full
                text-sm
              "
            >

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
                    Nº
                  </th>

                  <th className="px-4 py-3 text-left">
                    Fecha
                  </th>

                  <th className="px-4 py-3 text-left">
                    Destino
                  </th>

                  <th className="px-4 py-3 text-left">
                    Tipo
                  </th>

                  <th className="px-4 py-3 text-left">
                    Monto
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

                {vales.map(
                  (vale) => (

                    <tr
                      key={vale.id}
                      className="transition hover:bg-amber-50/40"
                    >

                      <td className="px-5 py-4 font-semibold text-stone-800">
                        {vale.numero}
                      </td>

                      <td className="px-4 py-4 text-stone-600">
                        {vale.fecha}
                      </td>

                      <td className="px-4 py-4 text-stone-600">
                        {
                          obtenerDestino(
                            vale
                          )
                        }
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-stone-100
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-stone-600
                          "
                        >
                          {
                            TIPO_LABEL[vale.tipo] ||
                            vale.tipo
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold text-stone-800">
                        $
                        {Number(
                          vale.monto
                        ).toLocaleString(
                          'es-AR'
                        )}
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

                      <td className="px-5 py-4">

                        <div className="flex justify-end">

                          {vale.estado === 'PENDIENTE' && (

                            <Permission permission={PERMISSIONS.VALES_DELETE}>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAnular(
                                    vale.id
                                  )
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
                                Anular
                              </button>
                            </Permission>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>
          </div>

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

function MetricCard({
  label,
  value,
  variant
}) {

  const colors = {

    stone: {
      value: 'text-stone-900'
    },

    amber: {
      value: 'text-amber-600'
    }

  }

  const current =
    colors[variant] || colors.stone

  return (

    <div
      className="
        rounded-2xl
        border
        border-stone-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >

      <p
        className="
          text-xs
          font-medium
          text-stone-500
          sm:text-sm
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-2xl
          font-bold
          tracking-tight
          sm:text-3xl
          ${current.value}
        `}
      >
        {value}
      </p>

    </div>

  )

}
