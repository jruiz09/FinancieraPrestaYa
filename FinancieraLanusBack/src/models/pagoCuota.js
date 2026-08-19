export const PagoCuotaModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'PagoCuota',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue:
          DataTypes.UUIDV4,
        primaryKey: true
      },

      cuotaId: {
        type: DataTypes.UUID,
        allowNull: false
      },

      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },

      monto: {
        type:
          DataTypes.DECIMAL(
            12,
            2
          ),
        allowNull: false
      },

      tipoTransaccion: {
        type: DataTypes.ENUM(
          'EFECTIVO',
          'TRANSFERENCIA'
        ),
        allowNull: false,
        defaultValue:
          'EFECTIVO'
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      indexes: [
        {
          fields: [
            'cuota_id'
          ]
        },
        {
          fields: [
            'fecha'
          ]
        },
        {
          fields: [
            'tipo_transaccion'
          ]
        }
      ]
    }
  );
};