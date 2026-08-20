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

      aRecaudarManual: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      entregas: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
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

      ecu: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      recaudacionDiaSig: {
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
