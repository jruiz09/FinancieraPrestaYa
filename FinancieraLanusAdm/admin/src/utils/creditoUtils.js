export const formatCreditoNumber = (
  numero
) =>
  `CR-${String(numero)
    .padStart(6, '0')}`;