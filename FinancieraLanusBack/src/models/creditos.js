export const CreditoModel = (sequelize, DataTypes) => {
  return sequelize.define('Creditos', {

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    ownerId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    clienteId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    cobradorId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    tipoPlanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    numeroCredito: {
  type: DataTypes.INTEGER,
  unique: true
},

    cantidadCuotas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    montoCredito: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },

    montoEfectivo: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0
    },

    montoTransferencia: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0
    },

    interes: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },

    diasGracia: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    montoFinal: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },

    valorCuota: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
tokenConsulta: {
  type: DataTypes.STRING(100),
  unique: true
},
    tipoTransaccion: {
      type: DataTypes.ENUM(
        'EFECTIVO',
        'TRANSFERENCIA'
      ),
      allowNull: false
    },

    fechaOtorgamiento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    observaciones: {
      type: DataTypes.TEXT
    },

    estado: {
      type: DataTypes.ENUM(
        'NUEVO',
        'EN_CURSO',
        'FINALIZADO',
        'CANCELADO'
      ),
      defaultValue: 'NUEVO'
    },

    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    /*
    =====================================================
    BAJA DE CRÉDITO (con motivo). Ver diagnóstico: cada
    motivo impacta distinto el cálculo de %Cobranza/ECU:

    - ERROR: nunca se pagó nada, se marca activo=false
      (sale de todos los cálculos, pasado y futuro, como si
      nunca hubiera existido). Solo se permite si el crédito
      no tiene ningún pago registrado.

    - PAGO_COMPLETO: se paga el saldo restante vía la misma
      cascada que un pago normal (calcularCuotasAfectadas),
      así ECU/%Cobranza no cambian de fórmula, solo ven un
      pago más, igual que si el cliente hubiese pagado todo
      de una vez.

    - MAL_PAGO: estado pasa a CANCELADO, las cuotas ya
      vencidas/impagas quedan intactas (el mal historial de
      cobranza no se borra), y las cuotas que todavía no
      vencieron se desactivan para que dejen de aparecer en
      "A Recaudar" futuro. No suma a Terminados en ECU (ver
      nota en cajaController/creditoController: es una
      decisión tomada sin confirmación explícita, fácil de
      invertir si no es lo que se espera).
    =====================================================
    */

    motivoBaja: {
      type: DataTypes.ENUM(
        'ERROR',
        'PAGO_COMPLETO',
        'MAL_PAGO'
      ),
      allowNull: true
    },

    fechaBaja: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    observacionesBaja: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
};