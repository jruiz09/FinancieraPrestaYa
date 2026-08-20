export const ValeModel = (sequelize, DataTypes) => {
  return sequelize.define('Vale', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    collectorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    supervisorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM('ADELANTO', 'COMBUSTIBLE', 'GASTOS', 'OTROS'),
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'RENDIDO', 'ANULADO'),
      allowNull: false,
      defaultValue: 'PENDIENTE',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    usuarioEntregaId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    usuarioRecepcionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    indexes: [
      {
        fields: ['fecha'],
      },
    ],
  });
};
