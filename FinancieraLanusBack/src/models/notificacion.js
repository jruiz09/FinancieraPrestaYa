export const NotificacionModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'Notificaciones',
    {

      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      tipo: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'PAGO_REGISTRADO'
      },

      mensaje: {
        type: DataTypes.STRING(255),
        allowNull: false
      },

      leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }

    }
  );

};
