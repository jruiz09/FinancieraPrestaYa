import {
  useEffect,
  useState
} from 'react'

import BottomSheet
  from './BottomSheet'

import MoneyInput
  from './MoneyInput'

import {
  HandCoins
} from 'lucide-react'

import {
  mobileService
} from '../services/mobileService'

export default function NuevaAyudaSheet({

  onClose,

  onConfirm

}) {

  const [destinatarios, setDestinatarios] =
    useState([])

  const [cargandoDestinatarios, setCargandoDestinatarios] =
    useState(true)

  const [destino, setDestino] =
    useState('')

  const [monto,
    setMonto] =
      useState(0)

  const [observaciones,
    setObservaciones] =
      useState('')

  useEffect(() => {

    mobileService
      .destinatariosAyuda()
      .then(data =>
        setDestinatarios(data || [])
      )
      .finally(() =>
        setCargandoDestinatarios(false)
      )

  }, [])

  const handleSubmit =
    e => {

      e.preventDefault()

      if (
        monto <= 0 ||
        !destino
      ) {

        return

      }

      const [destinoTipo, destinoId] =
        destino.split('|')

      onConfirm({

        destinoTipo,

        destinoId,

        monto,

        observaciones

      })

    }

  return (

    <BottomSheet

      title="Enviar Ayuda"

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

            Enviar a

          </label>

          <select

            value={destino}

            onChange={e =>
              setDestino(e.target.value)
            }

            disabled={cargandoDestinatarios}

            className="
              w-full
              rounded-2xl
              border
              border-slate-700
              bg-slate-800
              p-4
              outline-none
              focus:border-cyan-500
            "

          >

            <option value="">

              {

                cargandoDestinatarios

                  ? 'Cargando...'

                  : 'Seleccioná un destinatario...'

              }

            </option>

            {destinatarios.map(d => (

              <option
                key={`${d.tipo}|${d.id}`}
                value={`${d.tipo}|${d.id}`}
              >
                {
                  d.tipo === 'SUPERVISOR'
                    ? `Supervisor · ${d.nombre}`
                    : `Cobrador · ${d.nombre}`
                }
              </option>

            ))}

          </select>

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

            Importe

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
            monto <= 0 ||
            !destino
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

              monto <= 0 || !destino

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

          Enviar ayuda

        </button>

      </form>

    </BottomSheet>

  )

}
