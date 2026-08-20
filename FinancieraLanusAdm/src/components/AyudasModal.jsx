import {
  useEffect,
  useState
}
from 'react'

export default function AyudaModal({

  isOpen,
  onClose,
  onSubmit,

  supervisores = [],
  cobradores = [],

  isLoading

}) {

  const [formData,
    setFormData] =
    useState({

      fecha:
        new Date()
          .toISOString()
          .split('T')[0],

      destinoTipo:
        'COBRADOR',

      destinoId: '',

      monto: '',

      observaciones: ''

    })

  useEffect(() => {

    if (!isOpen) return

    setFormData({

      fecha:
        new Date()
          .toISOString()
          .split('T')[0],

      destinoTipo:
        'COBRADOR',

      destinoId: '',

      monto: '',

      observaciones: ''

    })

  }, [isOpen])

  useEffect(() => {

    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }

  }, [isOpen])

  useEffect(() => {

    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }

  }, [isOpen, isLoading, onClose])

  if (!isOpen)
    return null

  const destinos =
    formData.destinoTipo ===
    'SUPERVISOR'
      ? supervisores
      : cobradores

  const handleSubmit =
    (e) => {

      e.preventDefault()

      onSubmit({

        ...formData,

        origenTipo:
          'OFICINA'

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
  `

  const labelClass =
    'mb-1.5 block text-sm font-medium text-stone-700'

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-stone-950/50
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose()
        }
      }}
    >

      <div
        className="
          flex
          max-h-[96dvh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-stone-200
          bg-white
          shadow-2xl
          sm:max-h-[92vh]
          sm:max-w-lg
          sm:rounded-3xl
        "
      >

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            border-stone-200
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Ayuda
            </p>

            <h2 className="mt-0.5 text-lg font-bold text-stone-900 sm:text-xl">
              Nueva ayuda
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-stone-100
              text-xl
              text-stone-500
              transition
              hover:bg-stone-200
              hover:text-stone-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="flex min-h-0 flex-1 flex-col"
        >

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">

          <div>
            <label className={labelClass}>
              Fecha
            </label>

            <input
              type="date"
              value={
                formData.fecha
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fecha:
                    e.target.value
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Destinatario
            </label>

            <select
              value={
                formData.destinoTipo
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destinoTipo:
                    e.target.value,
                  destinoId: ''
                })
              }
              className={inputClass}
            >
              <option
                value="COBRADOR"
              >
                Cobrador
              </option>

              <option
                value="SUPERVISOR"
              >
                Supervisor
              </option>

            </select>
          </div>

          <div>
            <label className={labelClass}>
              {
                formData.destinoTipo === 'SUPERVISOR'
                  ? 'Supervisor'
                  : 'Cobrador'
              }
            </label>

            <select
              value={
                formData.destinoId
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destinoId:
                    e.target.value
                })
              }
              className={inputClass}
            >

              <option value="">
                Seleccionar
              </option>

              {destinos.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >

                    {item.apellido}
                    {', '}
                    {item.nombre}

                  </option>

                )
              )}

            </select>
          </div>

          <div>
            <label className={labelClass}>
              Monto
            </label>

            <input
              type="number"
              placeholder="Monto"
              value={
                formData.monto
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monto:
                    e.target.value
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Observaciones
            </label>

            <textarea
              rows={4}
              placeholder="Observaciones (opcional)"
              value={
                formData.observaciones
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observaciones:
                    e.target.value
                })
              }
              className={inputClass}
            />
          </div>

        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-stone-200
            bg-white
            px-5
            py-4
            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={isLoading}
            className="
              min-h-[42px]
              rounded-xl
              border
              border-stone-200
              px-5
              py-2.5
              text-sm
              font-semibold
              text-stone-600
              transition
              hover:bg-stone-50
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              isLoading
            }
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

      </div>

    </div>

  )

}