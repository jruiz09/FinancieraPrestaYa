import { useEffect, useState } from 'react'

import { Handshake } from 'lucide-react'

import ErrorAlert
  from '../components/ErrorAlert'

import AyudaModal
  from '../components/AyudasModal'

import Permission
  from '../components/Permission'

import { PERMISSIONS }
  from '../constants/permissions'

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
            bg-emerald-100
            text-emerald-700
          `

        case 'RECHAZADA':
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
              Ayudas
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Adelantos entre cobradores
              y supervisores.
            </p>
          </div>

          <Permission permission={PERMISSIONS.AYUDAS_CREATE}>
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
              Nueva ayuda
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
          lg:grid-cols-4
          lg:gap-4
        "
      >

        <MetricCard
          label="Total"
          value={ayudas.length}
          variant="stone"
        />

        <MetricCard
          label="Pendientes"
          value={pendientes}
          variant="amber"
        />

        <MetricCard
          label="Aceptadas"
          value={aceptadas}
          variant="emerald"
        />

        <MetricCard
          label="Monto total"
          value={`$ ${totalMonto.toLocaleString('es-AR')}`}
          variant="blue"
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

      ) : ayudas.length === 0 ? (

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
            <Handshake className="h-5 w-5 text-stone-500" />
          </div>

          <p className="mt-3 font-semibold text-stone-700">
            No hay ayudas registradas
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

                {ayudas.map(
                  (ayuda) => (

                    <tr
                      key={ayuda.id}
                      className="transition hover:bg-amber-50/40"
                    >

                      <td className="px-5 py-4 font-semibold text-stone-800">
                        {ayuda.numeroAyuda || '-'}
                      </td>

                      <td className="px-4 py-4 text-stone-600">
                        {ayuda.fecha}
                      </td>

                      <td className="px-4 py-4 text-stone-600">
                        {
                          obtenerDestino(
                            ayuda
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
                            ayuda.destinoTipo
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold text-stone-800">
                        $
                        {Number(
                          ayuda.monto
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
                              ayuda.estado
                            )}
                          `}
                        >
                          {
                            ayuda.estado
                          }
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end">

                          <Permission permission={PERMISSIONS.AYUDAS_DELETE}>
                            <button
                              type="button"
                              onClick={() =>
                                handleEliminar(
                                  ayuda.id
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
                              Eliminar
                            </button>
                          </Permission>

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

function MetricCard({
  label,
  value,
  variant
}) {

  const colors = {

    stone: {
      icon: 'bg-stone-100 text-stone-700',
      value: 'text-stone-900'
    },

    amber: {
      icon: 'bg-amber-50 text-amber-600',
      value: 'text-amber-600'
    },

    emerald: {
      icon: 'bg-emerald-50 text-emerald-600',
      value: 'text-emerald-600'
    },

    blue: {
      icon: 'bg-blue-50 text-blue-600',
      value: 'text-blue-600'
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