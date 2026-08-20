import BottomSheet
  from './BottomSheet'

import Money
  from './Money'

export default function ConfirmDialog({

  title = 'Confirmar',

  message,

  cuotasAfectadas = [],

  saldoAFavor = 0,

  confirmLabel = 'Confirmar',

  cancelLabel = 'Cancelar',

  isLoading = false,

  onConfirm,

  onCancel

}) {

  return (

    <BottomSheet

      title={title}

      onClose={onCancel}

    >

      <div className="
        space-y-5
      ">

        {

          message &&

          <p className="
            text-sm
            text-slate-300
          ">

            {message}

          </p>

        }

        {

          cuotasAfectadas.length > 0 &&

          <div className="
            rounded-2xl
            bg-slate-800
            divide-y
            divide-slate-700
            overflow-hidden
          ">

            {

              cuotasAfectadas.map(
                c => (

                  <div
                    key={c.id}
                    className="
                      flex
                      justify-between
                      items-center
                      px-4
                      py-3
                      text-sm
                    "
                  >

                    <span className="
                      text-slate-300
                    ">
                      Cuota #{c.numeroCuota}
                    </span>

                    <Money
                      value={c.monto}
                      className="
                        font-semibold
                        text-cyan-400
                      "
                    />

                  </div>

                )
              )

            }

          </div>

        }

        {

          saldoAFavor > 0 &&

          <div className="
            rounded-2xl
            bg-emerald-950/40
            border
            border-emerald-800
            px-4
            py-3
            text-sm
            text-emerald-300
          ">

            Queda un saldo a favor
            del cliente de{' '}

            <Money
              value={saldoAFavor}
              className="font-bold"
            />

          </div>

        }

        <div className="
          flex
          gap-3
        ">

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="
              flex-1
              rounded-2xl
              py-3
              font-bold
              bg-slate-800
              hover:bg-slate-700
              transition
            "
          >

            {cancelLabel}

          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="
              flex-1
              rounded-2xl
              py-3
              font-bold
              bg-cyan-600
              hover:bg-cyan-500
              active:scale-[0.98]
              transition
            "
          >

            {
              isLoading
                ? 'Guardando...'
                : confirmLabel
            }

          </button>

        </div>

      </div>

    </BottomSheet>

  )

}
