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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div>

          <label className="mb-1.5 block text-sm font-medium text-stone-700">

            Nombre

          </label>

          <input

            name="name"

            value={formData.name}

            onChange={handleChange}

            disabled={isLoading}

            className={`
              w-full
              rounded-xl
              border
              ${errors.name ? 'border-red-300' : 'border-stone-200'}
              bg-stone-50
              px-3.5
              py-2.5
              text-sm
              text-stone-900
              outline-none
              transition
              placeholder:text-stone-400
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100
              disabled:cursor-not-allowed
              disabled:opacity-60
            `}
          />

          {

            errors.name &&

            <p className="mt-1.5 text-xs font-medium text-red-500">

              {errors.name}

            </p>

          }

        </div>

        <div>

          <label className="mb-1.5 block text-sm font-medium text-stone-700">

            Descripción

          </label>

          <input

            name="description"

            value={formData.description}

            onChange={handleChange}

            disabled={isLoading}

            className="
              w-full
              rounded-xl
              border
              border-stone-200
              bg-stone-50
              px-3.5
              py-2.5
              text-sm
              text-stone-900
              outline-none
              transition
              placeholder:text-stone-400
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100
              disabled:cursor-not-allowed
              disabled:opacity-60
            "

          />

        </div>

      </div>

      <div className="flex items-center justify-between">

        <h3 className="font-bold text-stone-900">

          Permisos

        </h3>

        <span
          className="
            rounded-full
            bg-stone-100
            px-3
            py-1
            text-xs
            font-bold
            text-stone-600
          "
        >

          {formData.permissions.length} seleccionados

        </span>

      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

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

                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"

                >

                  <div className="mb-3 flex items-center justify-between">

                    <h4 className="font-semibold text-stone-800">

                      {module}

                    </h4>

                    <button

                      type="button"

                      onClick={() =>

                        toggleModule(module)

                      }

                      className="text-xs font-semibold text-amber-700 hover:text-amber-800"

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

                          className="flex cursor-pointer items-center gap-2 text-sm text-stone-700"

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

                            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"

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

          className="
            inline-flex
            min-h-[42px]
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-stone-900
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-stone-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "

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