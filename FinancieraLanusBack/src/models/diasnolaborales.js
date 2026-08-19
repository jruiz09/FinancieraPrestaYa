export const DiaNoLaborableModel = (sequelize, DataTypes) => {
  return sequelize.define('DiasNoLaborables', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true
    },

    descripcion: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });
};