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
import { ShieldCheck } from 'lucide-react'

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
              Roles
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Definí roles y sus permisos
              dentro del panel.
            </p>
          </div>

          <Permission permission={PERMISSIONS.ROLES_CREATE}>
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
              Nuevo rol
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

          placeholder="Buscar rol..."

          value={search}

          onChange={setSearch}

        />
      </section>

      {

        isLoading

        ?

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

        :

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

                    <th className="px-5 py-3 text-right">

                      Acciones

                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-stone-100">

                  {

                    paginatedRoles.length === 0

                    ?

                    <tr>

                      <td

                        colSpan="5"

                        className="px-5 py-12 text-center text-stone-400"

                      >

                        No se encontraron roles.

                      </td>

                    </tr>

                    :

                    paginatedRoles.map(role => (

                      <tr

                        key={role.id}

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
                              <ShieldCheck className="h-4 w-4" />
                            </div>

                            <span className="font-semibold text-stone-800">
                              {role.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-stone-600">

                          {role.description}

                        </td>

                        <td className="px-4 py-4 text-center text-stone-600">

                          {role.usersCount}

                        </td>

                        <td className="px-4 py-4 text-center text-stone-600">

                          {role.permissionsCount}

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <Permission permission={PERMISSIONS.ROLES_EDIT}>

                              <button

                                type="button"

                                onClick={() =>

                                  openEditModal(role)

                                }

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

                            <Permission permission={PERMISSIONS.ROLES_DELETE}>

                              <button

                                type="button"

                                onClick={() =>

                                  handleDelete(role.id)

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

                    ))

                  }

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