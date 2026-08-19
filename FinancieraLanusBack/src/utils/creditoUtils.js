import { DiaNoLaborable } from '../models/index.js';

export const esDiaHabil = async (fecha) => {
  const dia = fecha.getDay();

  if (dia === 0 || dia === 6) {
    return false;
  }

  const fechaString = fecha
    .toISOString()
    .split('T')[0];

  const noLaborable = await DiaNoLaborable.findOne({
    where: {
      fecha: fechaString,
      activo: true
    }
  });

  return !noLaborable;
};

export const obtenerProximoDiaHabil = async (fecha) => {
  let nuevaFecha = new Date(fecha);

  while (!(await esDiaHabil(nuevaFecha))) {
    nuevaFecha.setDate(
      nuevaFecha.getDate() + 1
    );
  }

  return nuevaFecha;
};