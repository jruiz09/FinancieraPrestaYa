import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import ErrorAlert from '../components/ErrorAlert'
import UserModal from '../components/UserModal'
import { userService } from '../services/userService'
import { roleService } from '../services/roleService'
import { useAuthStore } from '../store/useAuthStore'
import Permission from '../components/Permission'
import usePermissions from '../hooks/usePermissions'
import { PERMISSIONS } from '../constants/permissions'

export default function UsersPage() {
  const user = useAuthStore((state) => state.user)
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
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
<Permission permission={PERMISSIONS.USERS_CREATE}>
  <button
    onClick={openCreateModal}
    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded font-medium"
  >
    + Nuevo
  </button>
</Permission>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      <SearchBar placeholder="Buscar por nombre, username o email..." value={search} onChange={setSearch} />

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Username</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Rol</th>
                  {
  can(PERMISSIONS.USERS_EDIT) ||
  can(PERMISSIONS.USERS_DELETE)
    ? (
      <th className="px-4 py-3 text-left font-semibold">
        Acciones
      </th>
    )
    : null
}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      Sin usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.username}</td>
                      <td className="px-4 py-3 text-sm">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100">
                          {getRoleName(u.roleId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                     <Permission permission={PERMISSIONS.USERS_EDIT}>
  <button
    onClick={() => openEditModal(user)}
    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
  >
    Editar
  </button>
</Permission>
                        <Permission permission={PERMISSIONS.USERS_DELETE}>
  <button
    onClick={() => handleDelete(user.id)}
    className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
  >
    Eliminar
  </button>
</Permission>
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
