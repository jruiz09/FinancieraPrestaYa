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

  const [montoEfectivo,
    setMontoEfectivo] =
      useState(
        Number(cuota.saldo)
      )

  const [montoTransferencia,
    setMontoTransferencia] =
      useState(0)

  const [mostrarTransferencia,
    setMostrarTransferencia] =
      useState(false)

  const [observaciones,
    setObservaciones] =
      useState('')

  const [mostrarObs,
    setMostrarObs] =
      useState(false)

  const totalIngresado =

    Number(montoEfectivo || 0) +

    Number(montoTransferencia || 0)

  const handleSubmit =
    e => {

      e.preventDefault()

      if (

        totalIngresado <= 0

      ) {

        return

      }

      onConfirm({

        montoEfectivo:
          Number(montoEfectivo || 0),

        montoTransferencia:
          Number(montoTransferencia || 0),

        observaciones

      })

    }

  const saldoRestante =

    Number(cuota.saldo) -

    totalIngresado

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

            ¿Cuánto recibiste en efectivo?

          </label>

          <MoneyInput

            autoFocus

            value={montoEfectivo}

            onChange={
              setMontoEfectivo
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

              saldoRestante < 0 &&

              <span
                className="
                  text-green-400
                  font-medium
                "
              >

                ✔ La cuota quedará cancelada
                {' — el excedente de '}

                <Money
                  value={
                    -saldoRestante
                  }
                />

                {' se aplica a otras cuotas'}

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

          <button

            type="button"

            onClick={() =>

              setMostrarTransferencia(

                !mostrarTransferencia

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

              Agregar transferencia

            </span>

            {

              mostrarTransferencia

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

            mostrarTransferencia &&

            <MoneyInput

              value={montoTransferencia}

              onChange={
                setMontoTransferencia
              }

            />

          }

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

            totalIngresado <= 0

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

              totalIngresado <= 0

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