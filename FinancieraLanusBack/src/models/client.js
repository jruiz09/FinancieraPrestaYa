export const ClientModel = (sequelize, DataTypes) => {
  return sequelize.define('Client', {
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
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    latitud: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: true,
    },
    longitud: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: true,
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    mapsUrl: {
  type: DataTypes.TEXT,
  allowNull: true
},
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    cobradorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ubicacionOriginal: {
  type: DataTypes.TEXT,
  allowNull: true
},
  });
};
