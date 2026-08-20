import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import ErrorAlert from '../components/ErrorAlert'
import TipoPlanModal from '../components/TipoPlanModal'
import Permission from '../components/Permission'
import { PERMISSIONS } from '../constants/permissions'
import { tipoPlanService } from '../services/tipoPlanService'
import { ReceiptText } from 'lucide-react'

export default function TiposPlanPage() {
  const [tiposPlan, setTiposPlan] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedTipoPlan, setSelectedTipoPlan] = useState({})
  const [isModalLoading, setIsModalLoading] = useState(false)

  const fetchTiposPlan = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await tipoPlanService.list(page, limit)

      setTiposPlan(data.tiposPlan)
      setTotal(data.total)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error al cargar tipos de plan'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTiposPlan()
  }, [page])

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedTipoPlan({})
    setModalOpen(true)
  }

  const openEditModal = (tipoPlan) => {
    setModalMode('edit')
    setSelectedTipoPlan(tipoPlan)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedTipoPlan({})
  }

  const handleSaveTipoPlan = async (formData) => {
    setIsModalLoading(true)
    setError('')

    try {
      if (modalMode === 'create') {
        await tipoPlanService.create(formData)
      } else {
        await tipoPlanService.update(
          selectedTipoPlan.id,
          formData
        )
      }

      fetchTiposPlan()
      closeModal()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error al guardar tipo de plan'
      )
    } finally {
      setIsModalLoading(false)
    }
  }

  const handleDeactivate = async (id) => {
    if (
      window.confirm(
        '¿Desactivar este tipo de plan?'
      )
    ) {
      try {
        await tipoPlanService.deactivate(id)
        fetchTiposPlan()
      } catch {
        setError(
          'Error al desactivar tipo de plan'
        )
      }
    }
  }

  const filteredTiposPlan = tiposPlan.filter((tp) =>
    tp.descripcion
      ?.toLowerCase()
      .includes(search.toLowerCase())
  )

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
              Tipos de plan
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Definí los plazos disponibles
              para armar créditos.
            </p>
          </div>

          <Permission permission={PERMISSIONS.PLAN_TYPES_CREATE}>
            <button
              type="button"
              onClick={openCreateModal}
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
              Nuevo tipo de plan
            </button>
          </Permission>
        </div>
      </section>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
      />

      {/* BUSCADOR */}
      <section
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
        <SearchBar
          placeholder="Buscar por descripción..."
          value={search}
          onChange={setSearch}
        />
      </section>

      {isLoading ? (

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

      ) : (
        <>
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
                      Descripción
                    </th>

                    <th className="px-4 py-3 text-left">
                      Días
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
                  {filteredTiposPlan.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-5 py-12 text-center text-stone-400"
                      >
                        No se encontraron tipos de plan.
                      </td>
                    </tr>
                  ) : (
                    filteredTiposPlan.map((tipoPlan) => (
                      <tr
                        key={tipoPlan.id}
                        className="transition hover:bg-amber-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-amber-50
                                text-amber-700
                              "
                            >
                              <ReceiptText className="h-4 w-4" />
                            </div>

                            <span className="font-semibold text-stone-800">
                              {tipoPlan.descripcion}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-stone-600">
                          {tipoPlan.dias}
                          {' '}
                          {Number(tipoPlan.dias) === 1 ? 'día' : 'días'}
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
                              ${
                                tipoPlan.activo
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            `}
                          >
                            {tipoPlan.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Permission permission={PERMISSIONS.PLAN_TYPES_EDIT}>
                              <button
                                type="button"
                                onClick={() => openEditModal(tipoPlan)}
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

                            {tipoPlan.activo && (
                              <Permission permission={PERMISSIONS.PLAN_TYPES_DELETE}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeactivate(tipoPlan.id)
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
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      )}

      <TipoPlanModal
        isOpen={modalOpen}
        title={
          modalMode === 'create'
            ? 'Nuevo Tipo de Plan'
            : 'Editar Tipo de Plan'
        }
        initialData={selectedTipoPlan}
        onSubmit={handleSaveTipoPlan}
        onClose={closeModal}
        isLoading={isModalLoading}
      />
    </div>
  )
}