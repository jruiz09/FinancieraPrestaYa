export const RolePermissionModel = (sequelize, DataTypes) => {
  return sequelize.define('RolePermission', {
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    timestamps: false,
  });
};
