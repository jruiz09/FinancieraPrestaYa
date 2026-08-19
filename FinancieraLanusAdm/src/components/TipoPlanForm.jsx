import React, { useState, useEffect } from 'react'

export default function TipoPlanForm({
  initialData = {},
  onSubmit,
  isLoading
}) {
  const [formData, setFormData] = useState({
    descripcion: '',
    dias: '',
    ...initialData
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({
      descripcion: '',
      dias: '',
      ...initialData
    })
  }, [initialData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }

    if (!formData.dias || Number(formData.dias) <= 0) {
      newErrors.dias = 'Los días deben ser mayores a 0'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      dias: Number(formData.dias)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción
        </label>

        <input
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.descripcion
              ? 'border-red-500'
              : 'dark:border-gray-600'
          }`}
        />

        {errors.descripcion && (
          <p className="text-red-500 text-xs mt-1">
            {errors.descripcion}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Días
        </label>

        <input
          type="number"
          min="1"
          name="dias"
          value={formData.dias}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full p-2 border rounded bg-white dark:bg-gray-700 ${
            errors.dias
              ? 'border-red-500'
              : 'dark:border-gray-600'
          }`}
        />

        {errors.dias && (
          <p className="text-red-500 text-xs mt-1">
            {errors.dias}
          </p>
        )}
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