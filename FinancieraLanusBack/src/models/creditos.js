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
    }
  });
};