export const RegistroDiarioZonaModel = (sequelize, DataTypes) => {
  return sequelize.define(
    'RegistroDiarioZona',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      zoneId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      pr: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      mp: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      deja: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      entregasOverride: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      ecuOverride: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      recaudacionDiaSigOverride: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['zone_id', 'fecha'],
        },
      ],
    }
  );
};
