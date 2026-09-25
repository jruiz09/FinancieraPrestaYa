import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

import { UserModel } from './user.js';
import { RoleModel } from './role.js';
import { OwnerModel } from './owner.js';
import { CollectorModel } from './collector.js';
import { ClientModel } from './client.js';
import { ClientFotoModel } from './clientFoto.js';
import { TipoPlanModel } from './tipoPlan.js';
import { DiaNoLaborableModel } from './diasnolaborales.js';
import { CreditoModel } from './creditos.js';
import { CreditoDetalleModel } from './creditodetalles.js';
import { AyudaModel } from './ayuda.js';
import { SupervisorModel } from './supervisor.js';
import { ZoneModel } from './zonas.js';
import { OficinaModel } from './oficina.js';
import { PermissionModel } from './permission.js';
import { RolePermissionModel } from './rolePermission.js';
import { ValeModel } from './vale.js';
import { RegistroDiarioZonaModel } from './registroDiarioZona.js';
import {
  PagoCuotaModel
} from './pagoCuota.js';
import { NotificacionModel } from './notificacion.js';
import { MovimientoCajaModel } from './movimientoCaja.js';

const Ayuda = AyudaModel(sequelize, DataTypes);
const Zone = ZoneModel(sequelize, DataTypes);
const Oficina = OficinaModel(sequelize, DataTypes);

const Role = RoleModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Owner = OwnerModel(sequelize, DataTypes);
const Collector = CollectorModel(sequelize, DataTypes);
const Client = ClientModel(sequelize, DataTypes);
const ClientFoto = ClientFotoModel(sequelize, DataTypes);
const TipoPlan = TipoPlanModel(sequelize, DataTypes);
const DiaNoLaborable = DiaNoLaborableModel(sequelize, DataTypes);
const Credito = CreditoModel(sequelize, DataTypes);
const CreditoDetalle = CreditoDetalleModel(sequelize, DataTypes);
const PagoCuota = PagoCuotaModel(sequelize, DataTypes);
const Supervisor = SupervisorModel(sequelize, DataTypes);
const Permission = PermissionModel(sequelize, DataTypes);
const RolePermission = RolePermissionModel(sequelize, DataTypes);
const Vale = ValeModel(sequelize, DataTypes);
const RegistroDiarioZona = RegistroDiarioZonaModel(sequelize, DataTypes);
const Notificacion = NotificacionModel(sequelize, DataTypes);
const MovimientoCaja = MovimientoCajaModel(sequelize, DataTypes);


  Owner.hasMany(Zone, {
  foreignKey: 'ownerId',
  as: 'zones'
})

Zone.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner'
})

//
// OFICINAS
// Un Owner tiene varias Oficinas. Una Oficina agrupa Zonas
// (muchos a muchos: una misma Zona puede pertenecer a más de
// una Oficina). Un Usuario puede pertenecer a una o varias
// Oficinas (muchos a muchos); eso determina qué Zonas puede
// llegar a ver/elegir en el resto de la app. Si un usuario no
// tiene ninguna Oficina asignada, no hay restricción (ve todo,
// como antes de esta feature).
//

Owner.hasMany(Oficina, {
  foreignKey: 'ownerId',
  as: 'oficinas'
})

Oficina.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner'
})

Oficina.belongsToMany(Zone, {
  through: 'OficinaZonas',
  foreignKey: 'oficinaId',
  otherKey: 'zoneId',
  as: 'zonas'
})

Zone.belongsToMany(Oficina, {
  through: 'OficinaZonas',
  foreignKey: 'zoneId',
  otherKey: 'oficinaId',
  as: 'oficinas'
})

User.belongsToMany(Oficina, {
  through: 'UsuarioOficinas',
  foreignKey: 'userId',
  otherKey: 'oficinaId',
  as: 'oficinas'
})

Oficina.belongsToMany(User, {
  through: 'UsuarioOficinas',
  foreignKey: 'oficinaId',
  otherKey: 'userId',
  as: 'usuarios'
})

//
// Un Cobrador, Supervisor o Cliente pertenece a UNA sola
// Oficina (a diferencia de Zone, que puede estar en varias).
// Si la misma persona trabaja para dos oficinas, se da de
// alta como dos registros separados, uno por oficina.
//

Oficina.hasMany(Collector, {
  foreignKey: 'oficinaId',
  as: 'collectors'
})

Collector.belongsTo(Oficina, {
  foreignKey: 'oficinaId',
  as: 'oficina'
})

Oficina.hasMany(Supervisor, {
  foreignKey: 'oficinaId',
  as: 'supervisores'
})

Supervisor.belongsTo(Oficina, {
  foreignKey: 'oficinaId',
  as: 'oficina'
})

Oficina.hasMany(Client, {
  foreignKey: 'oficinaId',
  as: 'clients'
})

Client.belongsTo(Oficina, {
  foreignKey: 'oficinaId',
  as: 'oficina'
})

Zone.hasMany(
  Collector,
  {
    foreignKey: {
      name: 'zoneId',
      allowNull: false
    },
    as: 'collectors'
  }
)

Collector.belongsTo(
  Zone,
  {
    foreignKey: 'zoneId',
    as: 'zone'
  }
)
  // OWNER --> SUPERVISOR
  //
  //
  Owner.hasMany(
  Supervisor,
  {
    foreignKey: {
      name: 'ownerId',
      allowNull: false
    },
    as: 'supervisores'
  }
)

Supervisor.belongsTo(
  Owner,
  {
    foreignKey: 'ownerId',
    as: 'owner'
  }
)

Supervisor.hasMany(
  Collector,
  {
    foreignKey: {
      name: 'supervisorId',
      allowNull: true
    },
    as: 'collectors'
  }
)

Collector.belongsTo(
  Supervisor,
  {
    foreignKey:
      'supervisorId',
    as: 'supervisor'
  }
)
//
// ROLES -> USERS
//
Role.hasMany(User, {
  foreignKey: {
    name: 'roleId',
    allowNull: false,
  },
  as: 'users',
});

User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
});

//
// OWNERS -> USERS
//
Owner.hasMany(User, {
  foreignKey: {
    name: 'ownerId',
    allowNull: true,
  },
  as: 'users',
});

User.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});


Ayuda.belongsTo(
  Collector,
  {
    foreignKey: 'origenId',
    as: 'origenCobrador'
  }
)

Ayuda.belongsTo(
  Collector,
  {
    foreignKey: 'destinoId',
    as: 'destinoCobrador'
  }
)

Ayuda.belongsTo(
  Supervisor,
  {
    foreignKey: 'destinoId',
    as: 'destinoSupervisor'
  }
)

Ayuda.belongsTo(
  Supervisor,
  {
    foreignKey: 'origenId',
    as: 'origenSupervisor'
  }
)


User.hasOne(
  Collector,
  {
    foreignKey: 'userId',
    as: 'collector'
  }
)

Collector.belongsTo(
  User,
  {
    foreignKey: 'userId',
    as: 'user'
  }
)

User.hasOne(
  Supervisor,
  {
    foreignKey: 'userId',
    as: 'supervisor'
  }
)

Supervisor.belongsTo(
  User,
  {
    foreignKey: 'userId',
    as: 'user'
  }
)

//
// SUPERVISORES <-> ZONAS (muchos a muchos)
// Un supervisor puede tener asignadas varias zonas, más allá
// de las zonas de sus propios cobradores (supervisorId), para
// cubrir zonas de otros supervisores o de otros cobradores.
//
Supervisor.belongsToMany(
  Zone,
  {
    through: 'SupervisorZonas',
    foreignKey: 'supervisorId',
    otherKey: 'zoneId',
    as: 'zonas'
  }
)

Zone.belongsToMany(
  Supervisor,
  {
    through: 'SupervisorZonas',
    foreignKey: 'zoneId',
    otherKey: 'supervisorId',
    as: 'supervisores'
  }
)


//
// OWNERS -> COLLECTORS
//
Owner.hasMany(Collector, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'collectors',
});

Collector.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

//
// OWNERS -> CLIENTS
//
Owner.hasMany(Client, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'clients',
});

Client.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

//
// CLIENT -> FOTOS (una o varias fotos por cliente)
//
Client.hasMany(ClientFoto, {
  foreignKey: {
    name: 'clientId',
    allowNull: false,
  },
  as: 'fotos',
  onDelete: 'CASCADE',
});

ClientFoto.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

//
// COLLECTORS -> CLIENTS
//
Collector.hasMany(Client, {
  foreignKey: {
    name: 'cobradorId',
    allowNull: false,
  },
  as: 'clients',
});

Client.belongsTo(Collector, {
  foreignKey: 'cobradorId',
  as: 'collector',
});

//
// OWNERS -> CREDITOS
//
Owner.hasMany(Credito, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'creditos',
});

Credito.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

//
// USUARIOS -> CREDITOS (quien dio de baja)
//
User.hasMany(Credito, {
  foreignKey: {
    name: 'usuarioBajaId',
    allowNull: true,
  },
  as: 'creditosDadosDeBaja',
});

Credito.belongsTo(User, {
  foreignKey: 'usuarioBajaId',
  as: 'usuarioBaja',
});

//
// CLIENTS -> CREDITOS
//
Client.hasMany(Credito, {
  foreignKey: {
    name: 'clienteId',
    allowNull: false,
  },
  as: 'creditos',
});

Credito.belongsTo(Client, {
  foreignKey: 'clienteId',
  as: 'cliente',
});

//
// COLLECTORS -> CREDITOS
//
Collector.hasMany(Credito, {
  foreignKey: {
    name: 'cobradorId',
    allowNull: false,
  },
  as: 'creditos',
});

Credito.belongsTo(Collector, {
  foreignKey: 'cobradorId',
  as: 'cobrador',
});

//
// TIPOS PLAN -> CREDITOS
//
TipoPlan.hasMany(Credito, {
  foreignKey: {
    name: 'tipoPlanId',
    allowNull: false,
  },
  as: 'creditos',
});

Credito.belongsTo(TipoPlan, {
  foreignKey: 'tipoPlanId',
  as: 'tipoPlan',
});

//
// CREDITOS -> CUOTAS
//
Credito.hasMany(CreditoDetalle, {
  foreignKey: {
    name: 'creditoId',
    allowNull: false,
  },
  as: 'cuotas',
});

CreditoDetalle.belongsTo(Credito, {
  foreignKey: 'creditoId',
  as: 'credito',
});
//
// CUOTAS -> PAGOS
//

CreditoDetalle.hasMany(
  PagoCuota,
  {
    foreignKey: {
      name: 'cuotaId',
      allowNull: false
    },
    as: 'pagos'
  }
);

PagoCuota.belongsTo(
  CreditoDetalle,
  {
    foreignKey: 'cuotaId',
    as: 'cuota'
  }
);


Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});

Owner.hasMany(Vale, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'vales',
});

Vale.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

Collector.hasMany(Vale, {
  foreignKey: {
    name: 'collectorId',
    allowNull: true,
  },
  as: 'vales',
});

Vale.belongsTo(Collector, {
  foreignKey: 'collectorId',
  as: 'collector',
});

Supervisor.hasMany(Vale, {
  foreignKey: {
    name: 'supervisorId',
    allowNull: true,
  },
  as: 'vales',
});

Vale.belongsTo(Supervisor, {
  foreignKey: 'supervisorId',
  as: 'supervisor',
});

User.hasMany(Vale, {
  foreignKey: 'usuarioEntregaId',
  as: 'valesEntregados',
});

Vale.belongsTo(User, {
  foreignKey: 'usuarioEntregaId',
  as: 'usuarioEntrega',
});

User.hasMany(Vale, {
  foreignKey: 'usuarioRecepcionId',
  as: 'valesRecibidos',
});

Vale.belongsTo(User, {
  foreignKey: 'usuarioRecepcionId',
  as: 'usuarioRecepcion',
});

Owner.hasMany(RegistroDiarioZona, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'registrosDiariosZona',
});

RegistroDiarioZona.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

Zone.hasMany(RegistroDiarioZona, {
  foreignKey: {
    name: 'zoneId',
    allowNull: false,
  },
  as: 'registrosDiarios',
});

RegistroDiarioZona.belongsTo(Zone, {
  foreignKey: 'zoneId',
  as: 'zone',
});

//
// OWNERS -> NOTIFICACIONES
//
Owner.hasMany(Notificacion, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'notificaciones',
});

Notificacion.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

//
// CREDITOS -> NOTIFICACIONES
//
Credito.hasMany(Notificacion, {
  foreignKey: {
    name: 'creditoId',
    allowNull: true,
  },
  as: 'notificaciones',
});

Notificacion.belongsTo(Credito, {
  foreignKey: 'creditoId',
  as: 'credito',
});

//
// OWNERS -> MOVIMIENTOS DE CAJA
//
Owner.hasMany(MovimientoCaja, {
  foreignKey: {
    name: 'ownerId',
    allowNull: false,
  },
  as: 'movimientosCaja',
});

MovimientoCaja.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
});

//
// ZONAS -> MOVIMIENTOS DE CAJA
// (zona obligatoria: mismo criterio que Collector.zoneId)
//
Zone.hasMany(MovimientoCaja, {
  foreignKey: {
    name: 'zoneId',
    allowNull: false,
  },
  as: 'movimientosCaja',
});

MovimientoCaja.belongsTo(Zone, {
  foreignKey: 'zoneId',
  as: 'zone',
});

//
// USUARIOS -> MOVIMIENTOS DE CAJA (quien lo cargó)
//
User.hasMany(MovimientoCaja, {
  foreignKey: {
    name: 'usuarioId',
    allowNull: false,
  },
  as: 'movimientosCaja',
});

MovimientoCaja.belongsTo(User, {
  foreignKey: 'usuarioId',
  as: 'usuario',
});

export {
  sequelize,
  Role,
  User,
  Owner,
  Collector,
  Client,
  ClientFoto,
  TipoPlan,
  DiaNoLaborable,
  Credito,
  CreditoDetalle,
  PagoCuota,
  Supervisor,
  Ayuda,
  Zone,
  Oficina,
  Permission,
  RolePermission,
  Vale,
  RegistroDiarioZona,
  Notificacion,
  MovimientoCaja,
};