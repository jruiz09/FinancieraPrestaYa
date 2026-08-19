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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.name ? 'border-red-500' : 'dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.username ? 'border-red-500' : 'dark:border-gray-600'
          }`}
          disabled={isLoading || !!initialData.id}
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.email ? 'border-red-500' : 'dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contraseña {initialData.id && '(dejar vacío para no cambiar)'}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.password ? 'border-red-500' : 'dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <select
          name="roleId"
          value={formData.roleId}
          onChange={handleChange}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.roleId ? 'border-red-500' : 'dark:border-gray-600'
          }`}
          disabled={isLoading}
        >
          <option value="">Seleccionar rol...</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded font-medium disabled:opacity-50"
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
