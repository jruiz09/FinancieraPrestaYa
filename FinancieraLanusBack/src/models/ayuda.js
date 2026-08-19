export const AyudaModel = (
  sequelize,
  DataTypes
) => {

  return sequelize.define(
    'Ayudas',
    {

      id: {
        type: DataTypes.UUID,
        defaultValue:
          DataTypes.UUIDV4,
        primaryKey: true
      },
      numeroAyuda: {
  type: DataTypes.STRING,
  unique: true
},

      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },

      origenTipo: {
        type: DataTypes.ENUM(
          'OFICINA',
          'SUPERVISOR',
          'COBRADOR'
        ),
        allowNull: false
      },

      origenId: {
        type: DataTypes.UUID,
        allowNull: true
      },

      destinoTipo: {
        type: DataTypes.ENUM(
          'SUPERVISOR',
          'COBRADOR'
        ),
        allowNull: false
      },

      destinoId: {
        type: DataTypes.UUID,
        allowNull: false
      },

      monto: {
        type: DataTypes.DECIMAL(
          12,
          2
        ),
        allowNull: false
      },
      estado: {
  type: DataTypes.ENUM(
    'PENDIENTE',
    'ACEPTADA',
    'RECHAZADA'
  ),
  allowNull: false,
  defaultValue: 'PENDIENTE'
},

      observaciones: {
        type: DataTypes.TEXT
      },
      fechaAceptacion: {
  type: DataTypes.DATE,
  allowNull: true
},

fechaRechazo: {
  type: DataTypes.DATE,
  allowNull: true
},

motivoRechazo: {
  type: DataTypes.TEXT,
  allowNull: true
},

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }

    }
  )
}