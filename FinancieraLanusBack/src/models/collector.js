export const CollectorModel = (sequelize, DataTypes) => {
  return sequelize.define('Collector', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    celular: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    supervisorId: {
  type: DataTypes.UUID,
  allowNull: true
},
zoneId: {
  type: DataTypes.UUID,
  allowNull: true
},
userId: {
  type: DataTypes.UUID,
  allowNull: true,
  unique: true
}
  });
};
