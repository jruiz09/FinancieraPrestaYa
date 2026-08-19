import {
  useState
} from 'react'

import BottomSheet
  from './BottomSheet'

import MoneyInput
  from './MoneyInput'

import {
  HandCoins
} from 'lucide-react'

export default function NuevaAyudaSheet({

  onClose,

  onConfirm

}) {

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

        monto,

        observaciones

      })

    }

  return (

    <BottomSheet

      title="Solicitar Ayuda"

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

            Importe solicitado

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

            rows={5}

            value={
              observaciones
            }

            onChange={e =>

              setObservaciones(
                e.target.value
              )

            }

            placeholder="Motivo de la ayuda..."

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

          <HandCoins
            size={22}
          />

          Solicitar ayuda

        </button>

      </form>

    </BottomSheet>

  )

}