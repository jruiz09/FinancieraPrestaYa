import React, { useState, useEffect } from 'react'

export default function UserForm({ initialData = {}, roles = [], oficinas = [], onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    roleId: '',
    ...initialData
  })
  const [errors, setErrors] = useState({})

  const [oficinaIds, setOficinaIds] = useState(
    (initialData.oficinas || []).map(o => o.id)
  )

  useEffect(() => {
    setFormData({
      name: '',
      username: '',
      password: '',
      roleId: '',
      ...initialData
    })

    setOficinaIds(
      (initialData.oficinas || []).map(o => o.id)
    )
  }, [initialData])

  const toggleOficina = (oficinaId) => {
    setOficinaIds(prev =>
      prev.includes(oficinaId)
        ? prev.filter(id => id !== oficinaId)
        : [...prev, oficinaId]
    )
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!formData.username.trim()) newErrors.username = 'Username es requerido'
    if (!initialData.id && !formData.password) newErrors.password = 'Contraseña es requerida'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
    if (!formData.roleId) newErrors.roleId = 'Rol es requerido'
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const { name, username, password, roleId } = formData
    onSubmit({ name, username, password, roleId, oficinaIds })
  }

  const inputClass = (hasError) => `
    w-full
    rounded-xl
    border
    ${hasError ? 'border-red-300' : 'border-stone-200'}
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
  `

  const labelClass =
    'mb-1.5 block text-sm font-medium text-stone-700'

  const errorClass =
    'mt-1.5 text-xs font-medium text-red-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClass(errors.name)}
          disabled={isLoading}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass}>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={inputClass(errors.username)}
          disabled={isLoading || !!initialData.id}
        />
        {errors.username && <p className={errorClass}>{errors.username}</p>}
      </div>

      <div>
        <label className={labelClass}>
          Contraseña {initialData.id && '(dejar vacío para no cambiar)'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass(errors.password)}
          disabled={isLoading}
        />
        {errors.password && <p className={errorClass}>{errors.password}</p>}
      </div>

      <div>
        <label className={labelClass}>Rol</label>
        <select
          name="roleId"
          value={formData.roleId}
          onChange={handleChange}
          className={inputClass(errors.roleId)}
          disabled={isLoading}
        >
          <option value="">Seleccionar rol...</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {errors.roleId && <p className={errorClass}>{errors.roleId}</p>}
      </div>

      <div>
        <p className={labelClass}>
          Oficinas
        </p>

        <p className="mb-2 text-xs text-stone-400">
          Si no se asigna ninguna, el usuario ve todo (sin restricción).
        </p>

        {oficinas.length === 0 ? (
          <p className="text-sm text-stone-400">
            No hay oficinas disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {oficinas.map(oficina => (
              <label
                key={oficina.id}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2.5
                  rounded-xl
                  border
                  border-stone-200
                  bg-stone-50/70
                  px-3.5
                  py-2.5
                  text-sm
                  text-stone-700
                  transition
                  hover:bg-stone-100
                "
              >
                <input
                  type="checkbox"
                  checked={oficinaIds.includes(oficina.id)}
                  disabled={isLoading}
                  onChange={() => toggleOficina(oficina.id)}
                  className="h-4 w-4 rounded accent-amber-500"
                />

                {oficina.nombre}
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="
          inline-flex
          w-full
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
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
