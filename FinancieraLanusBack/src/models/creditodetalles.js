export const CreditoDetalleModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'CreditosDetalle',
    {

      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      creditoId: {
        type: DataTypes.UUID,
        allowNull: false
      },

      numeroCuota: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      monto: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false
      },
fechaPagoEsperada: {
  type: DataTypes.DATEONLY,
  allowNull: false
},
      montoPago: {
        type: DataTypes.DECIMAL(12,2),
        defaultValue: 0
      },

      fechaVencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },

      fechaPago: {
        type: DataTypes.DATEONLY
      },

      observaciones: {
        type: DataTypes.TEXT
      },

      diasAtraso: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },

      estado: {
        type: DataTypes.ENUM(
          'PENDIENTE',
          'PARCIAL',
          'PAGADA',
          'VENCIDA'
        ),
        defaultValue: 'PENDIENTE'
      },
  tipoTransaccion: {
  type: DataTypes.STRING(30),
  defaultValue: 'EFECTIVO'
},

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
     {
    indexes: [
   {
    unique: true,
    fields: ['credito_id', 'numero_cuota']
  }
    ]
  }
  );
};  