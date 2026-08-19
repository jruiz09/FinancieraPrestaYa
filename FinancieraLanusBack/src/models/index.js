import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

import { UserModel } from './user.js';
import { RoleModel } from './role.js';
import { OwnerModel } from './owner.js';
import { CollectorModel } from './collector.js';
import { ClientModel } from './client.js';
import { TipoPlanModel } from './tipoPlan.js';
import { DiaNoLaborableModel } from './diasnolaborales.js';
import { CreditoModel } from './creditos.js';
import { CreditoDetalleModel } from './creditodetalles.js';
import { AyudaModel } from './ayuda.js';
import { SupervisorModel } from './supervisor.js';
import { ZoneModel } from './zonas.js';
import { PermissionModel } from './permission.js';
import { RolePermissionModel } from './rolePermission.js';
import { ValeModel } from './vale.js';
import {
  PagoCuotaModel
} from './pagoCuota.js';

const Ayuda = AyudaModel(sequelize, DataTypes);
const Zone = ZoneModel(sequelize, DataTypes);

const Role = RoleModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Owner = OwnerModel(sequelize, DataTypes);
const Collector = CollectorModel(sequelize, DataTypes);
const Client = ClientModel(sequelize, DataTypes);
const TipoPlan = TipoPlanModel(sequelize, DataTypes);
const DiaNoLaborable = DiaNoLaborableModel(sequelize, DataTypes);
const Credito = CreditoModel(sequelize, DataTypes);
const CreditoDetalle = CreditoDetalleModel(sequelize, DataTypes);
const PagoCuota = PagoCuotaModel(sequelize, DataTypes);
const Supervisor = SupervisorModel(sequelize, DataTypes);
const Permission = PermissionModel(sequelize, DataTypes);
const RolePermission = RolePermissionModel(sequelize, DataTypes);
const Vale = ValeModel(sequelize, DataTypes);


  Owner.hasMany(Zone, {
  foreignKey: 'ownerId',
  as: 'zones'
})

Zone.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner'
})

Zone.hasMany(
  Collector,
  {
    foreignKey: 'zoneId',
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

export {
  sequelize,
  Role,
  User,
  Owner,
  Collector,
  Client,
  TipoPlan,
  DiaNoLaborable,
  Credito,
  CreditoDetalle,
  PagoCuota,
  Supervisor,
  Ayuda,
  Zone,
  Permission,
  RolePermission,
  Vale,
};