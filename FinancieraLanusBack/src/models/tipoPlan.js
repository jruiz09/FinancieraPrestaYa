
export const TipoPlanModel = (sequelize, DataTypes) => {
  return sequelize.define('TiposPlan', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      dias: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });
};
