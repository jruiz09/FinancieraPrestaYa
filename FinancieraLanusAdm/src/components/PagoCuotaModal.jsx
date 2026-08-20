import React,
{
  useEffect,
  useMemo,
  useState
}
from 'react';

export default function PagoCuotaModal({
  isOpen,
  cuota,
  onClose,
  onConfirm,
  isLoading
}) {

  const saldoPendiente =
    useMemo(() => {

      if (!cuota) return 0;

      return (
        Number(cuota.monto)
        -
        Number(cuota.montoPago || 0)
      );

    }, [cuota]);

  const [error,
    setError] =
      useState('');

  const [formData,
    setFormData] =
      useState({
        montoPago: 0,
        tipoTransaccion: 'EFECTIVO',
        observaciones: ''
      });

  useEffect(() => {

    if (!cuota) return;

    setFormData({
      montoPago: saldoPendiente,
      tipoTransaccion:
        cuota.tipoTransaccion ||
        'EFECTIVO',
      observaciones: ''
    });

    setError('');

  }, [
    cuota,
    saldoPendiente
  ]);

  if (
    !isOpen ||
    !cuota
  ) {
    return null;
  }

  const handleChange =
    (e) => {

      const {
        name,
        value
      } = e.target;

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (
        name ===
        'montoPago'
      ) {

        const monto =
          Number(value);

        if (
          !Number.isFinite(monto) ||
          monto <= 0
        ) {

          setError(
            'Debe ingresar un importe válido.'
          );

        } else {

          setError('');
        }
      }
    };

  const handleSubmit =
    (e) => {

      e.preventDefault();

      const monto =
        Number(
          formData.montoPago
        );

      if (
        !Number.isFinite(monto) ||
        monto <= 0
      ) {

        setError(
          'Debe ingresar un importe válido.'
        );

        return;
      }

      onConfirm(formData);
    };

  const excedente =
    useMemo(() => {

      const monto =
        Number(formData.montoPago);

      return monto > saldoPendiente
        ? monto - saldoPendiente
        : 0;

    }, [
      formData.montoPago,
      saldoPendiente
    ]);

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
          flex
          justify-between
          items-center
        ">

          <div>

            <h2 className="
              text-xl
              font-bold
            ">
              Registrar Pago
            </h2>

            <p className="
              text-sm
              text-gray-500
            ">
              Cuota #
              {cuota.numeroCuota}
            </p>

          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              text-gray-500
              hover:text-gray-700
            "
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="
            p-5
            space-y-5
          "
        >

          <div className="
            bg-gray-50
            rounded-lg
            p-4
            space-y-2
          ">

            <div className="
              flex
              justify-between
            ">
              <span>
                Monto Cuota
              </span>

              <strong>
                $
                {Number(
                  cuota.monto
                ).toLocaleString(
                  'es-AR'
                )}
              </strong>
            </div>

            <div className="
              flex
              justify-between
            ">
              <span>
                Ya Pagado
              </span>

              <strong className="
                text-green-600
              ">
                $
                {Number(
                  cuota.montoPago || 0
                ).toLocaleString(
                  'es-AR'
                )}
              </strong>
            </div>

            <div className="
              flex
              justify-between
            ">
              <span>
                Saldo Pendiente
              </span>

              <strong className="
                text-red-600
              ">
                $
                {saldoPendiente.toLocaleString(
                  'es-AR'
                )}
              </strong>
            </div>

          </div>

          <div>

            <label className="
              block
              text-sm
              font-medium
              mb-1
            ">
              Importe a Cobrar
            </label>

            <input
              type="number"
              step="0.01"
              name="montoPago"
              value={formData.montoPago}
              onChange={handleChange}
              className="
                w-full
                p-2
                border
                rounded
              "
            />

            {excedente > 0 && (

              <p className="
                text-sm
                text-amber-700
                mt-1
              ">
                El excedente de $
                {excedente.toLocaleString('es-AR')}
                {' '}
                se aplicará automáticamente
                a otras cuotas del crédito.
              </p>

            )}

          </div>

          <div>

            <label className="
              block
              text-sm
              font-medium
              mb-1
            ">
              Tipo Transacción
            </label>

            <select
              name="tipoTransaccion"
              value={
                formData.tipoTransaccion
              }
              onChange={handleChange}
              className="
                w-full
                p-2
                border
                rounded
              "
            >
              <option value="EFECTIVO">
                Efectivo
              </option>

              <option value="TRANSFERENCIA">
                Transferencia
              </option>

            </select>

          </div>

          <div>

            <label className="
              block
              text-sm
              font-medium
              mb-1
            ">
              Observaciones
            </label>

            <textarea
              rows="3"
              name="observaciones"
              value={
                formData.observaciones
              }
              onChange={handleChange}
              className="
                w-full
                p-2
                border
                rounded
              "
            />

          </div>

          {error && (

            <div className="
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded
              p-3
              text-sm
            ">
              {error}
            </div>

          )}

          <div className="
            flex
            justify-end
            gap-2
          ">

            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              disabled={
                isLoading ||
                !!error
              }
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
                  : 'Registrar Pago'
              }
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}