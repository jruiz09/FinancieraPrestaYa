export default function ConfirmCascadaModal({
  isOpen,
  cuotasAfectadas = [],
  saldoAFavor = 0,
  onCancel,
  onConfirm,
  isLoading
}) {

  if (!isOpen) {
    return null;
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
        rounded-xl
        shadow-2xl
        w-full
        max-w-lg
      ">

        <div className="
          p-4
          border-b
        ">

          <h2 className="
            text-xl
            font-bold
          ">
            Confirmar cobro
          </h2>

          <p className="
            text-sm
            text-gray-500
          ">
            Este pago afecta {cuotasAfectadas.length} cuotas
          </p>

        </div>

        <div className="
          p-5
          space-y-4
        ">

          <div className="
            bg-gray-50
            rounded-lg
            divide-y
            divide-gray-200
          ">

            {cuotasAfectadas.map(c => (

              <div
                key={c.id}
                className="
                  flex
                  justify-between
                  px-4
                  py-2
                  text-sm
                "
              >
                <span>
                  Cuota #{c.numeroCuota}
                </span>

                <strong>
                  $
                  {Number(c.monto).toLocaleString('es-AR')}
                </strong>

              </div>

            ))}

          </div>

          {saldoAFavor > 0 && (

            <div className="
              bg-emerald-50
              border
              border-emerald-200
              text-emerald-700
              rounded
              p-3
              text-sm
            ">
              Queda un saldo a favor del cliente de
              {' '}
              <strong>
                $
                {saldoAFavor.toLocaleString('es-AR')}
              </strong>
            </div>

          )}

          <div className="
            flex
            justify-end
            gap-2
          ">

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="
                px-4
                py-2
                bg-gray-300
                hover:bg-gray-400
                rounded
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="
                px-4
                py-2
                bg-green-500
                hover:bg-green-600
                disabled:bg-gray-400
                text-white
                rounded
              "
            >
              {
                isLoading
                  ? 'Guardando...'
                  : 'Confirmar y registrar'
              }
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
