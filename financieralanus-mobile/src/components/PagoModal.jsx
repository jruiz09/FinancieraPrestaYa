import {
  useState
} from 'react'

import {
  Wallet,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import BottomSheet
  from './BottomSheet'

import PagoResumen
  from './PagoResumen'

import MoneyInput
  from './MoneyInput'

import Money
  from './Money'

export default function PagoModal({

  cuota,

  onClose,

  onConfirm

}) {

  const [montoPago,
    setMontoPago] =
      useState(
        Number(cuota.saldo)
      )

  const [tipoTransaccion,
    setTipoTransaccion] =
      useState(
        'EFECTIVO'
      )

  const [observaciones,
    setObservaciones] =
      useState('')

  const [mostrarObs,
    setMostrarObs] =
      useState(false)

  const handleSubmit =
    e => {

      e.preventDefault()

      if (

        montoPago <= 0 ||

        montoPago >

        Number(cuota.saldo)

      ) {

        return

      }

      onConfirm({

        montoPago,

        tipoTransaccion,

        observaciones

      })

    }

  const saldoRestante =

    Number(cuota.saldo) -

    Number(montoPago)

  return (

    <BottomSheet

      title="Registrar Cobro"

      onClose={onClose}

    >

      <form

        onSubmit={handleSubmit}

        className="
          space-y-6
        "

      >

        <PagoResumen

          cuota={cuota}

        />

        <div>

          <label
            className="
              block
              mb-2
              text-sm
              text-slate-400
            "
          >

            ¿Cuánto recibiste?

          </label>

          <MoneyInput

            autoFocus

            value={montoPago}

            onChange={
              setMontoPago
            }

          />

          <div
            className="
              mt-3
              text-center
              text-sm
            "
          >

            {

              saldoRestante === 0 &&

              <span
                className="
                  text-green-400
                  font-medium
                "
              >

                ✔ La cuota quedará cancelada

              </span>

            }

            {

              saldoRestante > 0 &&

              <span
                className="
                  text-yellow-400
                "
              >

                Restarán{' '}

                <Money

                  value={
                    saldoRestante
                  }

                />

              </span>

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

            Tipo de cobro

          </label>

          <div
            className="
              flex
              rounded-2xl
              overflow-hidden
              bg-slate-800
            "
          >

            {

              [

                'EFECTIVO',

                'TRANSFERENCIA'

              ].map(

                tipo => (

                  <button

                    key={tipo}

                    type="button"

                    onClick={() =>

                      setTipoTransaccion(
                        tipo
                      )

                    }

                    className={`
                      flex-1
                      py-3
                      font-semibold
                      transition

                      ${

                        tipo ===

                        tipoTransaccion

                        ?

                        'bg-cyan-600'

                        :

                        'bg-transparent'

                      }

                    `}
                  >

                    {

                      tipo ===
                      'EFECTIVO'

                        ?

                        'Efectivo'

                        :

                        'Transferencia'

                    }

                  </button>

                )

              )

            }

          </div>

        </div>


                <div>

          <button

            type="button"

            onClick={() =>

              setMostrarObs(

                !mostrarObs

              )

            }

            className="
              w-full
              flex
              justify-between
              items-center
              py-2
              text-slate-300
              font-medium
            "

          >

            <span>

              Agregar observación

            </span>

            {

              mostrarObs

                ?

                <ChevronUp
                  size={18}
                />

                :

                <ChevronDown
                  size={18}
                />

            }

          </button>

          {

            mostrarObs &&

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

              placeholder="Escribí una observación (opcional)..."

              className="
                mt-3
                w-full
                rounded-2xl
                border
                border-slate-700
                bg-slate-800
                p-4
                outline-none
                resize-none
                focus:border-cyan-500
              "

            />

          }

        </div>

        <button

          type="submit"

          disabled={

            montoPago <= 0 ||

            montoPago >

            Number(cuota.saldo)

          }

          className={`
            w-full
            rounded-2xl
            py-4
            text-lg
            font-bold
            flex
            justify-center
            items-center
            gap-2
            transition

            ${

              montoPago <= 0 ||

              montoPago >

              Number(cuota.saldo)

                ?

                'bg-slate-700 text-slate-500 cursor-not-allowed'

                :

                'bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98]'

            }

          `}

        >

          <Wallet
            size={22}
          />

          Registrar Cobro

        </button>

      </form>

    </BottomSheet>

  )

}