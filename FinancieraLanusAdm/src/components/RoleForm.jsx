import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

export default function RoleForm({

  initialData = {},

  permissions = [],

  onSubmit,

  isLoading

}) {

  const [formData, setFormData] = useState({

    name: '',

    description: '',

    permissions: []

  })

  const [errors, setErrors] = useState({})

  useEffect(() => {

    setFormData({

      name: initialData.name || '',

      description: initialData.description || '',

      permissions:

        initialData.permissions

          ? initialData.permissions.map(

              p => p.codigo

            )

          : []

    })

  }, [initialData])

  const groupedPermissions = useMemo(() => {

    const groups = {}

    permissions.forEach(permission => {

      if (!groups[permission.modulo]) {

        groups[permission.modulo] = []

      }

      groups[permission.modulo].push(permission)

    })

    return groups

  }, [permissions])

  const validate = () => {

    const e = {}

    if (!formData.name.trim()) {

      e.name = 'Nombre requerido'

    }

    return e

  }

  const handleChange = e => {

    const { name, value } = e.target

    setFormData({

      ...formData,

      [name]: value

    })

  }

  const togglePermission = codigo => {

    const exists =
      formData.permissions.includes(codigo)

    if (exists) {

      setFormData({

        ...formData,

        permissions:

          formData.permissions.filter(

            p => p !== codigo

          )

      })

    }

    else {

      setFormData({

        ...formData,

        permissions: [

          ...formData.permissions,

          codigo

        ]

      })

    }

  }

  const toggleModule = module => {

    const modulePermissions =
      groupedPermissions[module].map(

        p => p.codigo

      )

    const allSelected =
      modulePermissions.every(

        p => formData.permissions.includes(p)

      )

    if (allSelected) {

      setFormData({

        ...formData,

        permissions:

          formData.permissions.filter(

            p => !modulePermissions.includes(p)

          )

      })

    }

    else {

      const merged = new Set([

        ...formData.permissions,

        ...modulePermissions

      ])

      setFormData({

        ...formData,

        permissions: [...merged]

      })

    }

  }

  const handleSubmit = e => {

    e.preventDefault()

    const e2 = validate()

    if (Object.keys(e2).length) {

      setErrors(e2)

      return

    }

    onSubmit(formData)

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="block text-sm font-medium mb-1">

            Nombre

          </label>

          <input

            name="name"

            value={formData.name}

            onChange={handleChange}

            disabled={isLoading}

            className={`

              w-full

              rounded

              border

              p-2

              bg-white

              dark:bg-gray-700

              ${errors.name
                ? 'border-red-500'
                : 'dark:border-gray-600'}

            `}
          />

          {

            errors.name &&

            <p className="text-xs text-red-500 mt-1">

              {errors.name}

            </p>

          }

        </div>

        <div>

          <label className="block text-sm font-medium mb-1">

            Descripción

          </label>

          <input

            name="description"

            value={formData.description}

            onChange={handleChange}

            disabled={isLoading}

            className="

              w-full

              rounded

              border

              p-2

              bg-white

              dark:bg-gray-700

              dark:border-gray-600

            "

          />

        </div>

      </div>

      <div className="flex justify-between items-center">

        <h3 className="text-lg font-semibold">

          Permisos

        </h3>

        <span className="text-sm text-gray-500">

          {formData.permissions.length} permisos seleccionados

        </span>

      </div>

      <div className="grid grid-cols-2 gap-5">

        {

          Object.entries(groupedPermissions)

            .map(([module, list]) => {

              const selected =

                list.every(permission =>

                  formData.permissions.includes(

                    permission.codigo

                  )

                )

              return (

                <div

                  key={module}

                  className="border rounded-lg p-4 dark:border-gray-700"

                >

                  <div className="flex justify-between items-center mb-4">

                    <h4 className="font-semibold">

                      {module}

                    </h4>

                    <button

                      type="button"

                      onClick={() =>

                        toggleModule(module)

                      }

                      className="text-xs text-cyan-500 hover:underline"

                    >

                      {

                        selected

                          ? 'Quitar todo'

                          : 'Seleccionar todo'

                      }

                    </button>

                  </div>

                  <div className="space-y-2">

                    {

                      list.map(permission => (

                        <label

                          key={permission.codigo}

                          className="flex items-center gap-2 cursor-pointer"

                        >

                          <input

                            type="checkbox"

                            checked={

                              formData.permissions.includes(

                                permission.codigo

                              )

                            }

                            onChange={() =>

                              togglePermission(

                                permission.codigo

                              )

                            }

                          />

                          <span>

                            {permission.nombre}

                          </span>

                        </label>

                      ))

                    }

                  </div>

                </div>

              )

            })

        }

      </div>

      <div className="flex justify-end">

        <button

          type="submit"

          disabled={isLoading}

          className="px-6 py-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white"

        >

          {

            isLoading

              ? 'Guardando...'

              : 'Guardar'

          }

        </button>

      </div>

    </form>

  )

}