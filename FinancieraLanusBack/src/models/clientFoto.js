export const ClientFotoModel = (sequelize, DataTypes) => {
  return sequelize.define('ClientFoto', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
};
