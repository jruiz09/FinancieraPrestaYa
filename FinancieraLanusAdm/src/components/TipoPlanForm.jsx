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

  const inputClass = `
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
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          Descripción
        </label>

        <input
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Ej: Plan semanal 12 cuotas"
          className={inputClass}
        />

        {errors.descripcion && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            {errors.descripcion}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          Días
        </label>

        <input
          type="number"
          min="1"
          name="dias"
          value={formData.dias}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Ej: 7"
          className={inputClass}
        />

        {errors.dias && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            {errors.dias}
          </p>
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