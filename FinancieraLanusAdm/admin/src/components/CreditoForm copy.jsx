import React, { useEffect, useMemo, useState } from "react";
import { clientService } from "../services/clientService";
import { tipoPlanService } from "../services/tipoPlanService";
import { creditoService } from "../services/creditoService";
import { useNavigate } from "react-router-dom";

export default function CreditoForm() {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [simulacion, setSimulacion] = useState(null);
  const [loadingSimulacion, setLoadingSimulacion] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [creditoCreado, setCreditoCreado] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clienteId: "",
    tipoPlanId: "",
    montoCredito: "",
    interes: "",
    cantidadCuotas: "",
    diasGracia: 0,
    tipoTransaccion: "EFECTIVO",
    fechaOtorgamiento: new Date().toISOString().split("T")[0],
    observaciones: "",
  });

  const clienteSeleccionado = useMemo(
    () => clientes.find((c) => c.id === formData.clienteId),
    [clientes, formData.clienteId],
  );

  const planSeleccionado = useMemo(
    () => planes.find((p) => p.id === formData.tipoPlanId),
    [planes, formData.tipoPlanId],
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    simularCredito();
  }, [
    formData.tipoPlanId,
    formData.montoCredito,
    formData.interes,
    formData.cantidadCuotas,
    formData.diasGracia,
    formData.fechaOtorgamiento,
  ]);

  const cargarDatos = async () => {
    try {
      const clientesData = await clientService.list(1, 100);
      console.log(clientesData);

      const planesData = await tipoPlanService.list(1, 100);

      setClientes(clientesData.clients || []);
      setPlanes(planesData.tiposPlan || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const simularCredito = async () => {
    if (
      !formData.tipoPlanId ||
      !formData.montoCredito ||
      !formData.cantidadCuotas
    ) {
      setSimulacion(null);
      return;
    }

    try {
      setLoadingSimulacion(true);

      const data = await creditoService.simular({
        tipoPlanId: formData.tipoPlanId,

        cantidadCuotas: Number(formData.cantidadCuotas),

        montoCredito: Number(formData.montoCredito),

        interes: Number(formData.interes),

        diasGracia: Number(formData.diasGracia),

        fechaOtorgamiento: formData.fechaOtorgamiento,
      });

      setSimulacion(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSimulacion(false);
    }
  };

  const resumen = useMemo(() => {
    const monto = Number(formData.montoCredito) || 0;

    const interes = Number(formData.interes) || 0;

    const cuotas = Number(formData.cantidadCuotas) || 1;

    const montoFinal = monto + (monto * interes) / 100;

    const valorCuota = Math.ceil(montoFinal / cuotas / 50) * 50;

    return {
      montoFinal,
      valorCuota,
    };
  }, [formData.montoCredito, formData.interes, formData.cantidadCuotas]);

  const handleCrearCredito = async () => {
    try {
      setMensajeError("");

      setLoadingGuardar(true);

      const response = await creditoService.create({
        ...formData,
        montoCredito: Number(formData.montoCredito),
        interes: Number(formData.interes),
        cantidadCuotas: Number(formData.cantidadCuotas),
        diasGracia: Number(formData.diasGracia),
      });

      setCreditoCreado(response.data);

      setShowConfirmModal(false);

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);

      setMensajeError(
        error?.response?.data?.message || "Error al generar crédito",
      );
    } finally {
      setLoadingGuardar(false);
    }
  };
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded shadow p-6 space-y-5">
          <h2 className="text-xl font-semibold">Datos del Crédito</h2>
          {mensajeError && (
            <div
              className="
      bg-red-50
      border
      border-red-200
      text-red-700
      rounded-lg
      p-3
    "
            >
              {mensajeError}
            </div>
          )}
          <div>
            <label className="block mb-1 text-sm font-medium">Cliente</label>

            <select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="">Seleccionar...</option>

              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.apellido}, {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          {clienteSeleccionado && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 text-sm">
              <p>
                <strong>DNI:</strong> {clienteSeleccionado.dni}
              </p>

              <p>
                <strong>Celular:</strong> {clienteSeleccionado.celular}
              </p>

              <p>
                <strong>Cobrador:</strong>{" "}
                {clienteSeleccionado.collector?.apellido}{" "}
                {clienteSeleccionado.collector?.nombre}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Monto Crédito
              </label>

              <input
                type="number"
                name="montoCredito"
                value={formData.montoCredito}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Interés %
              </label>

              <input
                type="number"
                name="interes"
                value={formData.interes}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Tipo Plan
              </label>

              <select
                name="tipoPlanId"
                value={formData.tipoPlanId}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              >
                <option value="">Seleccionar...</option>

                {planes.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Cantidad Cuotas
              </label>

              <input
                type="number"
                name="cantidadCuotas"
                value={formData.cantidadCuotas}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Días Gracia
              </label>

              <input
                type="number"
                name="diasGracia"
                value={formData.diasGracia}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Tipo Transacción
              </label>

              <select
                name="tipoTransaccion"
                value={formData.tipoTransaccion}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              >
                <option value="EFECTIVO">Efectivo</option>

                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Fecha Otorgamiento
            </label>

            <input
              type="date"
              name="fechaOtorgamiento"
              value={formData.fechaOtorgamiento}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Observaciones
            </label>

            <textarea
              rows="4"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={loadingGuardar}
            className="
    w-full py-3
    bg-cyan-500
    hover:bg-cyan-600
    text-white
    rounded
    font-semibold
  "
          >
            Generar Crédito
          </button>
        </div>

        <div>
          <div className="sticky top-6 bg-white dark:bg-gray-800 rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>

            {loadingSimulacion && (
              <p className="text-sm text-cyan-500 mb-4">Simulando crédito...</p>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Monto Final</p>

                <p className="text-2xl font-bold text-green-500">
                  $
                  {simulacion
                    ? Number(simulacion.montoFinal).toLocaleString("es-AR")
                    : resumen.montoFinal.toLocaleString("es-AR")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Valor Cuota</p>

                <p className="text-2xl font-bold text-cyan-500">
                  $
                  {simulacion
                    ? Number(simulacion.valorCuota).toLocaleString("es-AR")
                    : resumen.valorCuota.toLocaleString("es-AR")}
                </p>
              </div>

              {planSeleccionado && (
                <div>
                  <p className="text-sm text-gray-500">Frecuencia</p>

                  <p className="font-medium">
                    Cada {planSeleccionado.dias} día(s)
                  </p>
                </div>
              )}

              {simulacion && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500">Cuotas Generadas</p>

                  <p className="text-2xl font-bold">
                    {simulacion.cuotas.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {simulacion && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Simulación de Cuotas</h3>

            <span className="text-sm text-gray-500">
              {simulacion.cuotas.length} cuotas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3">Cuota</th>

                  <th className="text-left py-3">Fecha Pago</th>

                  <th className="text-left py-3">Vencimiento</th>

                  <th className="text-right py-3">Monto</th>
                </tr>
              </thead>

              <tbody>
                {simulacion.cuotas.map((cuota) => (
                  <tr
                    key={cuota.numeroCuota}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 font-medium">{cuota.numeroCuota}</td>

                    <td>
                      {new Date(cuota.fechaPagoEsperada).toLocaleDateString(
                        "es-AR",
                      )}
                    </td>

                    <td>
                      {new Date(cuota.fechaVencimiento).toLocaleDateString(
                        "es-AR",
                      )}
                    </td>

                    <td className="text-right font-semibold text-green-500">
                      ${Number(cuota.monto).toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loadingGuardar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />

                <p className="font-semibold">Generando crédito...</p>

                <p className="text-sm text-gray-500 mt-2">
                  Creando cabecera y cuotas
                </p>
              </div>
            </div>
          )}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Confirmar Crédito</h3>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ¿Desea generar el siguiente crédito?
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>Monto Crédito</span>
                    <span className="font-semibold">
                      $
                      {Number(formData.montoCredito || 0).toLocaleString(
                        "es-AR",
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Monto Final</span>
                    <span className="font-semibold text-green-500">
                      ${(simulacion?.montoFinal || 0).toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Cuotas</span>
                    <span className="font-semibold">
                      {formData.cantidadCuotas}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Valor Cuota</span>
                    <span className="font-semibold text-cyan-500">
                      ${(simulacion?.valorCuota || 0).toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="
            px-4 py-2
            border
            rounded
          "
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleCrearCredito}
                    className="
            px-4 py-2
            bg-cyan-500
            hover:bg-cyan-600
            text-white
            rounded
          "
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>

              <h3 className="text-2xl font-bold mb-2">Crédito Generado</h3>

              <p className="text-gray-500 mb-6">
                El crédito fue creado correctamente.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Cliente</span>

                <span className="font-semibold">
                  {clienteSeleccionado?.apellido} {clienteSeleccionado?.nombre}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Monto Final</span>

                <span className="font-semibold text-green-500">
                  $
                  {Number(creditoCreado?.montoFinal || 0).toLocaleString(
                    "es-AR",
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Cuotas</span>

                <span className="font-semibold">
                  {creditoCreado?.cantidadCuotas}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate("/creditos")}
                className="
            px-4 py-2
            border
            rounded
          "
              >
                Listado
              </button>

              <button
                onClick={() => navigate(`/creditos/${creditoCreado.id}`)}
                className="
            px-4 py-2
            bg-cyan-500
            hover:bg-cyan-600
            text-white
            rounded
          "
              >
                Ver Crédito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
