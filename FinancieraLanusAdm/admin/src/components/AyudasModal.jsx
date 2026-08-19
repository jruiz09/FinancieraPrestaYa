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
          Nueva Ayuda
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
                isLoading
              }
              className="
                px-4
                py-2
                bg-cyan-500
                text-white
                rounded
              "
            >
              Guardar
            </button>

          </div>

        </form>

      </div>

    </div>

  )

}