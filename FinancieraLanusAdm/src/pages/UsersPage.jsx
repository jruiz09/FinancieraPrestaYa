import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import ErrorAlert from '../components/ErrorAlert'
import UserModal from '../components/UserModal'
import { userService } from '../services/userService'
import { roleService } from '../services/roleService'
import Permission from '../components/Permission'
import usePermissions from '../hooks/usePermissions'
import { PERMISSIONS } from '../constants/permissions'

export default function UsersPage() {
  const { can } = usePermissions()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedUser, setSelectedUser] = useState({})
  const [isModalLoading, setIsModalLoading] = useState(false)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await userService.list(page, limit)
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await roleService.list()
      setRoles(data || [])
    } catch (err) {
      console.error('Error cargando roles', err)
      setRoles([])
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [page])

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedUser({})
    setModalOpen(true)
  }

  const openEditModal = (u) => {
    setModalMode('edit')
    setSelectedUser(u)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUser({})
  }

  const handleSaveUser = async (formData) => {
    setIsModalLoading(true)
    setError('')
    try {
      if (modalMode === 'create') {
        await userService.create(formData)
      } else {
        await userService.update(selectedUser.id, formData)
      }
      fetchUsers()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar usuario')
    } finally {
      setIsModalLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      try {
        await userService.delete(id)
        fetchUsers()
      } catch (err) {
        setError('Error al eliminar usuario')
      }
    }
  }

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    return role?.name || 'N/A'
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
              Accesos al sistema
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
              Usuarios
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Administrá los usuarios con
              acceso al panel.
            </p>
          </div>

          <Permission permission={PERMISSIONS.USERS_CREATE}>
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
              Nuevo usuario
            </button>
          </Permission>
        </div>
      </section>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

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
          placeholder="Buscar por nombre, username o email..."
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
                    <th className="px-5 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Rol</th>
                    {
                      can(PERMISSIONS.USERS_EDIT) ||
                      can(PERMISSIONS.USERS_DELETE)
                        ? (
                          <th className="px-5 py-3 text-right">
                            Acciones
                          </th>
                        )
                        : null
                    }
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center text-stone-400">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="transition hover:bg-amber-50/40">
                        <td className="px-5 py-4 font-semibold text-stone-800">
                          {u.name}
                        </td>
                        <td className="px-4 py-4 text-stone-600">
                          {u.username}
                        </td>
                        <td className="px-4 py-4 text-stone-600">
                          {u.email}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-blue-50
                              px-2.5
                              py-1
                              text-xs
                              font-bold
                              text-blue-700
                            "
                          >
                            {getRoleName(u.roleId)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Permission permission={PERMISSIONS.USERS_EDIT}>
                              <button
                                type="button"
                                onClick={() => openEditModal(u)}
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

                            <Permission permission={PERMISSIONS.USERS_DELETE}>
                              <button
                                type="button"
                                onClick={() => handleDelete(u.id)}
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

      <UserModal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
        initialData={selectedUser}
        roles={roles}
        onSubmit={handleSaveUser}
        onClose={closeModal}
        isLoading={isModalLoading}
      />
    </div>
  )
}
