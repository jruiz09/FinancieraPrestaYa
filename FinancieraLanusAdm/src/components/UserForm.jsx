import React, { useState, useEffect } from 'react'

export default function UserForm({ initialData = {}, roles = [], onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roleId: '',
    ...initialData
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      roleId: '',
      ...initialData
    })
  }, [initialData])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!formData.username.trim()) newErrors.username = 'Username es requerido'
    if (!formData.email.trim()) newErrors.email = 'Email es requerido'
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
    const { name, username, email, password, roleId } = formData
    onSubmit({ name, username, email, password, roleId })
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
        <label className={labelClass}>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={inputClass(errors.email)}
          disabled={isLoading}
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
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
