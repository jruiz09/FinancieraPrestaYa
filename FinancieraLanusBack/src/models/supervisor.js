export const SupervisorModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'Supervisores',
    {

      id: {
        type: DataTypes.UUID,
        defaultValue:
          DataTypes.UUIDV4,
        primaryKey: true
      },

      ownerId: {
        type: DataTypes.UUID,
        allowNull: false
      },

      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      celular: {
        type: DataTypes.STRING(30)
      },
userId: {
  type: DataTypes.UUID,
  allowNull: true,
  unique: true
},
oficinaId: {
  type: DataTypes.UUID,
  allowNull: false
},
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }

    }
  )
}