import React, { useEffect, useMemo, useState } from 'react'

import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import ErrorAlert from '../components/ErrorAlert'
import Permission from '../components/Permission'
import RoleModal from '../components/RoleModal'

import { roleService } from '../services/roleService'
import { permissionService } from '../services/permissionService'

import { PERMISSIONS } from '../constants/permissions'
import usePermissions from '../hooks/usePermissions'

export default function RolesPage() {

  const { can } = usePermissions()

  const [roles, setRoles] = useState([])

  const [page, setPage] = useState(1)

  const [limit] = useState(10)

  const [search, setSearch] = useState('')

  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)

  const [modalMode, setModalMode] = useState('create')

  const [selectedRole, setSelectedRole] = useState({})

  const [isModalLoading, setIsModalLoading] = useState(false)

  const [permissions, setPermissions] = useState([])

const fetchPermissions = async () => {

  try {

    const data =
      await permissionService.list()

    setPermissions(data)

  }

  catch (err) {

    console.error(err)

  }

}

  const fetchRoles = async () => {

    setIsLoading(true)

    setError('')

    try {

      const data =
        await roleService.list()

      setRoles(data)

    }

    catch (err) {

      setError(

        err.response?.data?.message ||

        'Error al cargar roles'

      )

    }

    finally {

      setIsLoading(false)

    }

  }


  useEffect(() => {

    fetchRoles()

    fetchPermissions()

  }, [])

  const filteredRoles = useMemo(() => {

    if (!search.trim()) {

      return roles

    }

    return roles.filter(role =>

      role.name
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      role.description
        ?.toLowerCase()
        .includes(search.toLowerCase())

    )

  }, [roles, search])

  const total = filteredRoles.length

  const paginatedRoles = filteredRoles.slice(

    (page - 1) * limit,

    page * limit

  )

  const openCreateModal = () => {

    setSelectedRole({})

    setModalMode('create')

    setModalOpen(true)

  }

  const openEditModal = async (role) => {

    setIsModalLoading(true)

    try {

      const data =
        await roleService.getById(role.id)

      setSelectedRole(data)

      setModalMode('edit')

      setModalOpen(true)

    }

    catch (err) {

      setError(

        err.response?.data?.message ||

        'Error cargando rol'

      )

    }

    finally {

      setIsModalLoading(false)

    }

  }

  const closeModal = () => {

    setModalOpen(false)

    setSelectedRole({})

  }

  const handleSaveRole = async (formData) => {

    setIsModalLoading(true)

    setError('')

    try {

      if (modalMode === 'create') {

        await roleService.create(formData)

      }

      else {

        await roleService.update(

          selectedRole.id,

          {

            name: formData.name,

            description: formData.description

          }

        )

        await roleService.updatePermissions(

          selectedRole.id,

          formData.permissions

        )

      }

      closeModal()

      fetchRoles()

    }

    catch (err) {

      setError(

        err.response?.data?.message ||

        'Error al guardar'

      )

    }

    finally {

      setIsModalLoading(false)

    }

  }

  const handleDelete = async (id) => {

    if (

      !window.confirm(

        '¿Eliminar este rol?'

      )

    ) {

      return

    }

    try {

      await roleService.delete(id)

      fetchRoles()

    }

    catch (err) {

      setError(

        err.response?.data?.message ||

        'Error al eliminar'

      )

    }

  }

  return (

    <div>

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-2xl font-semibold">

          Roles

        </h2>

        <Permission permission={PERMISSIONS.ROLES_CREATE}>

          <button

            onClick={openCreateModal}

            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"

          >

            + Nuevo

          </button>

        </Permission>

      </div>

      <ErrorAlert

        message={error}

        onDismiss={() => setError('')}

      />

      <SearchBar

        placeholder="Buscar rol..."

        value={search}

        onChange={setSearch}

      />

      {

        isLoading

        ?

        <div className="py-8 text-center">

          Cargando...

        </div>

        :

        <>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">

            <table className="w-full text-sm">

              <thead className="bg-gray-100 dark:bg-gray-700">

                <tr>

                  <th className="px-4 py-3 text-left">

                    Nombre

                  </th>

                  <th className="px-4 py-3 text-left">

                    Descripción

                  </th>

                  <th className="px-4 py-3 text-center">

                    Usuarios

                  </th>

                  <th className="px-4 py-3 text-center">

                    Permisos

                  </th>

                  <th className="px-4 py-3 text-center">

                    Acciones

                  </th>

                </tr>

              </thead>

              <tbody>

                {

                  paginatedRoles.length === 0

                  ?

                  <tr>

                    <td

                      colSpan="5"

                      className="text-center py-8"

                    >

                      Sin registros

                    </td>

                  </tr>

                  :

                  paginatedRoles.map(role => (

                    <tr

                      key={role.id}

                      className="border-b dark:border-gray-700"

                    >

                      <td className="px-4 py-3 font-medium">

                        {role.name}

                      </td>

                      <td className="px-4 py-3">

                        {role.description}

                      </td>

                      <td className="px-4 py-3 text-center">

                        {role.usersCount}

                      </td>

                      <td className="px-4 py-3 text-center">

                        {role.permissionsCount}

                      </td>

                      <td className="px-4 py-3 flex justify-center gap-2">

                        <Permission permission={PERMISSIONS.ROLES_EDIT}>

                          <button

                            onClick={() =>

                              openEditModal(role)

                            }

                            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"

                          >

                            Editar

                          </button>

                        </Permission>

                        <Permission permission={PERMISSIONS.ROLES_DELETE}>

                          <button

                            onClick={() =>

                              handleDelete(role.id)

                            }

                            className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"

                          >

                            Eliminar

                          </button>

                        </Permission>

                      </td>

                    </tr>

                  ))

                }

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

      }

      <RoleModal

        isOpen={modalOpen}

        title={

          modalMode === 'create'

            ? 'Nuevo Rol'

            : 'Editar Rol'

        }

        initialData={selectedRole}

        permissions={permissions}

        onSubmit={handleSaveRole}

        onClose={closeModal}

        isLoading={isModalLoading}

      />

    </div>

  )

}