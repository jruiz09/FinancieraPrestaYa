import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import ErrorAlert from '../components/ErrorAlert'
import TipoPlanModal from '../components/TipoPlanModal'
import { tipoPlanService } from '../services/tipoPlanService'

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
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Tipos de Plan
        </h2>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded font-medium"
        >
          + Nuevo
        </button>
      </div>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
      />

      <SearchBar
        placeholder="Buscar por descripción..."
        value={search}
        onChange={setSearch}
      />

      {isLoading ? (
        <div className="text-center py-8">
          Cargando...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Descripción
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Días
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTiposPlan.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Sin tipos de plan
                    </td>
                  </tr>
                ) : (
                  filteredTiposPlan.map((tipoPlan) => (
                    <tr
                      key={tipoPlan.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3">
                        {tipoPlan.descripcion}
                      </td>

                      <td className="px-4 py-3">
                        {tipoPlan.dias}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tipoPlan.activo
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100'
                          }`}
                        >
                          {tipoPlan.activo
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() =>
                            openEditModal(tipoPlan)
                          }
                          className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          Editar
                        </button>

                        {tipoPlan.activo && (
                          <button
                            onClick={() =>
                              handleDeactivate(
                                tipoPlan.id
                              )
                            }
                            className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                          >
                            Desactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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