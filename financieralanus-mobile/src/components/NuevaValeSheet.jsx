import {
  useState
} from 'react'

import BottomSheet
  from './BottomSheet'

import MoneyInput
  from './MoneyInput'

import {
  Wallet
} from 'lucide-react'

const TIPOS = [

  { value: 'ADELANTO', label: 'Adelanto' },

  { value: 'COMBUSTIBLE', label: 'Combustible' },

  { value: 'GASTOS', label: 'Gastos' },

  { value: 'OTROS', label: 'Otros' }

]

export default function NuevaValeSheet({

  onClose,

  onConfirm

}) {

  const [tipo,
    setTipo] =
      useState(
        'ADELANTO'
      )

  const [monto,
    setMonto] =
      useState(0)

  const [observaciones,
    setObservaciones] =
      useState('')

  const handleSubmit =
    e => {

      e.preventDefault()

      if (

        monto <= 0

      ) {

        return

      }

      onConfirm({

        tipo,

        monto,

        observaciones

      })

    }

  return (

    <BottomSheet

      title="Nuevo Vale"

      onClose={onClose}

    >

      <form

        onSubmit={handleSubmit}

        className="
          space-y-6
        "

      >

        <div>

          <label
            className="
              block
              mb-2
              text-sm
              text-slate-400
            "
          >

            Tipo

          </label>

          <div
            className="
              grid
              grid-cols-2
              gap-2
            "
          >

            {

              TIPOS.map(

                opcion => (

                  <button

                    key={opcion.value}

                    type="button"

                    onClick={() =>

                      setTipo(
                        opcion.value
                      )

                    }

                    className={`
                      rounded-2xl
                      py-3
                      font-semibold
                      transition

                      ${

                        opcion.value === tipo

                          ?

                          'bg-cyan-600'

                          :

                          'bg-slate-800 text-slate-300'

                      }
                    `}

                  >

                    {opcion.label}

                  </button>

                )

              )

            }

          </div>

        </div>

        <div>

          <label
            className="
              block
              mb-2
              text-sm
              text-slate-400
            "
          >

            Monto

          </label>

          <MoneyInput

            autoFocus

            value={monto}

            onChange={
              setMonto
            }

          />

        </div>

        <div>

          <label
            className="
              block
              mb-2
              text-sm
              text-slate-400
            "
          >

            Observaciones

          </label>

          <textarea

            rows={4}

            value={
              observaciones
            }

            onChange={e =>

              setObservaciones(
                e.target.value
              )

            }

            placeholder="Motivo del vale (opcional)..."

            className="
              w-full
              rounded-2xl
              border
              border-slate-700
              bg-slate-800
              p-4
              resize-none
              outline-none
              focus:border-cyan-500
            "

          />

        </div>

        <button

          type="submit"

          disabled={
            monto <= 0
          }

          className={`
            w-full
            rounded-2xl
            py-4
            font-bold
            text-lg
            flex
            justify-center
            items-center
            gap-2

            ${

              monto <= 0

                ?

                'bg-slate-700 text-slate-500'

                :

                'bg-cyan-600 hover:bg-cyan-500'

            }

          `}

        >

          <Wallet
            size={22}
          />

          Cargar vale

        </button>

      </form>

    </BottomSheet>

  )

}
