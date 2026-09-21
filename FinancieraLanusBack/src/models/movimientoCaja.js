export const MovimientoCajaModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'MovimientosCaja',
    {

      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      tipo: {
        type: DataTypes.ENUM(
          'INGRESO',
          'EGRESO'
        ),
        allowNull: false
      },

      medioPago: {
        type: DataTypes.ENUM(
          'EFECTIVO',
          'TRANSFERENCIA'
        ),
        allowNull: false,
        defaultValue: 'EFECTIVO'
      },

      monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },

      concepto: {
        type: DataTypes.STRING(255),
        allowNull: false
      },

      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }

    },
    {
      indexes: [
        {
          fields: ['fecha']
        }
      ]
    }
  );

};
