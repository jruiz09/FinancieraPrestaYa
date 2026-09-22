export const OficinaModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'Oficina',
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
