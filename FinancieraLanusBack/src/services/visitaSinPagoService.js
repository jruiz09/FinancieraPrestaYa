/*
=====================================================
VISITA SIN PAGO

Registra que se visitó al cliente y no pagó la cuota. Cada
día distinto en que se marca suma 1 a visitasSinPago (ej.
"No pagó x2"); marcar dos veces el mismo día no suma de
nuevo. Desmarcar solo deshace la marca del día de hoy.

Se usa tanto desde mobile (cobrador) como desde el panel
admin. Al registrar un pago, registrarPagoCuota limpia la
fecha y el contador.
=====================================================
*/

const fechaHoy = () => {

  const ahora = new Date();

  const mes =
    String(ahora.getMonth() + 1)
      .padStart(2, '0');

  const dia =
    String(ahora.getDate())
      .padStart(2, '0');

  return `${ahora.getFullYear()}-${mes}-${dia}`;

};

export const registrarVisitaSinPago = async (
  cuota,
  marcar
) => {

  const hoy = fechaHoy();

  const marcadaHoy =
    cuota.fechaVisitaSinPago === hoy;

  if (marcar && !marcadaHoy) {

    cuota.fechaVisitaSinPago = hoy;

    cuota.visitasSinPago =
      Number(cuota.visitasSinPago || 0) + 1;

  }

  if (!marcar && marcadaHoy) {

    cuota.fechaVisitaSinPago = null;

    cuota.visitasSinPago =
      Math.max(
        Number(cuota.visitasSinPago || 0) - 1,
        0
      );

  }

  await cuota.save();

  return {
    id: cuota.id,
    fechaVisitaSinPago: cuota.fechaVisitaSinPago,
    visitasSinPago: cuota.visitasSinPago
  };

};
