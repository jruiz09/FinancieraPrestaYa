import React, {
  useState
} from 'react'

const MOTIVOS = [
  {
    value: 'ERROR',
    label: 'Error de carga',
    descripcion:
      'El crédito se cargó por error y nunca se registró ningún pago. Se revierte por completo, como si nunca hubiese existido.'
  },
  {
    value: 'PAGO_COMPLETO',
    label: 'Pago completo anticipado',
    descripcion:
      'El cliente pagó todo el saldo restante antes de tiempo. Se registra un pago por el saldo total y el crédito queda finalizado.'
  },
  {
    value: 'MAL_PAGO',
    label: 'Mal pago (se resigna el crédito)',
    descripcion:
      'Se da de baja por falta de pago. Las cuotas ya vencidas quedan en el historial tal cual están; solo se cancelan las que todavía no vencieron.'
  }
]

export default function BajaCreditoModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) {

  const [motivo, setMotivo] =
    useState('')

  const [observaciones, setObservaciones] =
    useState('')

  if (!isOpen) {
    return null
  }

  const motivoSeleccionado =
    MOTIVOS.find(m => m.value === motivo)

  const handleConfirm = () => {

    if (!motivo) return

    onConfirm({ motivo, observaciones })

  }

  return (

    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
      p-4
    ">

      <div className="
        bg-white
        rounded-2xl
        shadow-2xl
        w-full
        max-w-lg
      ">

        <div className="p-5 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">
            Dar de baja este crédito
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Esta acción es sensible: elegí el motivo con cuidado,
            cada uno afecta distinto los indicadores de cobranza.
          </p>
        </div>

        <div className="p-5 space-y-4">

          <div className="space-y-2">

            {MOTIVOS.map(m => (

              <label
                key={m.value}
                className={`
                  block
                  rounded-xl
                  border
                  p-3
                  cursor-pointer
                  transition

                  ${motivo === m.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:bg-stone-50'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="motivo"
                    value={m.value}
                    checked={motivo === m.value}
                    onChange={() => setMotivo(m.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-bold text-stone-800">
                      {m.label}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {m.descripcion}
                    </p>
                  </div>
                </div>
              </label>

            ))}

          </div>

          {motivoSeleccionado?.value === 'ERROR' && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              Si este crédito ya tiene algún pago registrado, el
              sistema va a rechazar la baja por este motivo.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Detalle adicional sobre la baja..."
              className="
                w-full
                px-3
                py-2
                border
                border-stone-300
                rounded-xl
                bg-white
                outline-none
                focus:border-amber-500
                text-sm
              "
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4
                py-2
                rounded-xl
                border
                border-stone-200
                text-sm
                font-semibold
                text-stone-600
                hover:bg-stone-50
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || !motivo}
              className="
                px-4
                py-2
                rounded-xl
                bg-red-600
                hover:bg-red-700
                text-white
                text-sm
                font-semibold
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {isLoading ? 'Procesando...' : 'Confirmar baja'}
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}
