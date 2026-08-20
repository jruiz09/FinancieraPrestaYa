export const UserOwnerModel = (sequelize, DataTypes) => {
  return sequelize.define('UserOwner', {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    timestamps: false,
  });
};
