export const ZoneModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'Zone',
    {

      id: {
        type: DataTypes.UUID,
        defaultValue:
          DataTypes.UUIDV4,
        primaryKey: true
      },

      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },

      descripcion: {
        type: DataTypes.STRING,
        allowNull: true
      },

      color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#06b6d4'
      },

      latitudCentro: {
        type: DataTypes.DECIMAL(10,7),
        allowNull: false
      },

      longitudCentro: {
        type: DataTypes.DECIMAL(10,7),
        allowNull: false
      },

      radioMetros: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3000
      },

      activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      ownerId: {
        type: DataTypes.UUID,
        allowNull: false
      }

    }
  )

}