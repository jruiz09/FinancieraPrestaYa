import {
  useEffect,
  useState
}
from 'react'

const TIPOS = [
  { value: 'ADELANTO', label: 'Adelanto' },
  { value: 'COMBUSTIBLE', label: 'Combustible' },
  { value: 'GASTOS', label: 'Gastos' },
  { value: 'OTROS', label: 'Otros' }
]

export default function ValeModal({

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

      tipo:
        'ADELANTO',

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

      tipo:
        'ADELANTO',

      monto: '',

      observaciones: ''

    })

  }, [isOpen])

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

      const payload = {

        fecha:
          formData.fecha,

        tipo:
          formData.tipo,

        monto:
          formData.monto,

        observaciones:
          formData.observaciones
      }

      if (
        formData.destinoTipo ===
        'SUPERVISOR'
      ) {

        payload.supervisorId =
          formData.destinoId

      } else {

        payload.collectorId =
          formData.destinoId
      }

      onSubmit(payload)
    }

  return (

    <div
      className="
        fixed inset-0
        bg-black/40
        flex
        items-center
        justify-center
        z-50
      "
    >

      <div
        className="
          bg-white
          rounded-xl
          p-6
          w-full
          max-w-lg
        "
      >

        <h2
          className="
            text-xl
            font-bold
            mb-4
          "
        >
          Nuevo Vale
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >

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
            className="
              w-full
              border
              rounded
              p-2
            "
          />

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
            className="
              w-full
              border
              rounded
              p-2
            "
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
            className="
              w-full
              border
              rounded
              p-2
            "
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

          <select
            value={
              formData.tipo
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                tipo:
                  e.target.value
              })
            }
            className="
              w-full
              border
              rounded
              p-2
            "
          >

            {TIPOS.map(
              (item) => (

                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>

              )
            )}

          </select>

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
            className="
              w-full
              border
              rounded
              p-2
            "
          />

          <textarea
            rows={4}
            placeholder="Observaciones"
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
            className="
              w-full
              border
              rounded
              p-2
            "
          />

          <div
            className="
              flex
              justify-end
              gap-2
            "
          >

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                px-4
                py-2
                border
                rounded
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.destinoId ||
                !formData.monto
              }
              className="
                px-4
                py-2
                bg-cyan-500
                hover:bg-cyan-600
                disabled:bg-gray-300
                text-white
                rounded
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
