# Financiera Lanús — Backend (FinancieraLanusBack)

## Contexto del sistema

Financiera Lanús es un sistema integral para la administración de créditos personales y cobranzas, compuesto por tres proyectos independientes: este backend (FinancieraLanusBack), el panel administrativo (FinancieraLanusAdm) y la PWA mobile (FinancieraLanusMobile).

El proyecto se encuentra en una etapa avanzada de desarrollo. **Antes de modificar código existente, revisar siempre la implementación actual.** No reinventar funcionalidades ya implementadas.

Principios que el sistema debe priorizar siempre: simplicidad, rapidez de uso, productividad del cobrador, bajo mantenimiento, escalabilidad, reutilización de código.

## Stack

- Node.js
- Express
- Sequelize
- MySQL

## Arquitectura de carpetas

```
src/
├── config
├── controllers
├── services
├── repositories
├── middleware
├── validators
├── utils
├── routes
├── models
├── swagger
└── seeders
```

Toda nueva funcionalidad debe respetar esta estructura.

## Separación de responsabilidades (estricta)

- **Controllers**: únicamente reciben requests, validan parámetros, invocan Services y devuelven Responses. **No colocar lógica de negocio acá.**
- **Services**: toda la lógica de negocio se implementa acá.
- **Repositories**: toda consulta compleja se implementa acá.
- **Models**: usar exclusivamente Sequelize. No usar SQL embebido salvo necesidad extrema.

## Seguridad

- Autenticación mediante JWT.
- Roles existentes: `COBRADOR`, `SUPERVISOR`, `ADMINISTRATIVO`, `ADMIN`.
- El comportamiento del sistema depende del rol autenticado.

## Multiempresa

El sistema es multiempresa. La entidad principal es **Owner**. Toda entidad operativa (usuarios, supervisores, cobradores, clientes, créditos, cuotas, ayudas, zonas) pertenece a un Owner.

**Toda consulta debe filtrar automáticamente utilizando el `ownerId` obtenido desde el JWT. Nunca devolver información perteneciente a otro Owner.**

## Modelos existentes

`User`, `Role`, `Owner`, `Supervisor`, `Collector`, `Zone`, `Client`, `TipoPlan`, `Credito`, `CreditoDetalle`, `DiaNoLaborable`, `Ayuda`.

No crear modelos duplicados. No modificar nombres de tablas ni de columnas.

## Relaciones

```
Owner
├── Zones
│      └── Collectors
│               ├── Clients
│               │       └── Créditos
│               │                 └── Cuotas
│               └── User
├── Supervisors
│        ├── Collectors
│        └── User
└── Users
```

Notas clave:
- Cada Collector puede tener un User (opcional). Cada Supervisor puede tener un User.
- La autenticación Mobile utiliza siempre la entidad User. No crear mecanismos alternativos de autenticación.
- Un Supervisor administra uno o varios cobradores. **No existe relación directa Supervisor → Zona**; la administración territorial se realiza mediante los cobradores. Un supervisor puede administrar cobradores de distintas zonas.
- Cobradores pertenecen a Owner, Supervisor, Zone y User (opcional). Campos: nombre, apellido, dni, celular, zoneId, supervisorId, userId, activo. **Nunca usar un campo "zona" de tipo texto — siempre `zoneId`.**
- Zonas: nombre, descripcion, color, latitudCentro, longitudCentro, radioMetros.
- Clientes: nombre, apellido, celular, direccion, latitud, longitud, mapsUrl, foto.
- Cada cliente puede tener múltiples créditos; cada crédito, múltiples cuotas. Las cuotas son la entidad principal usada por Mobile.

## Endpoints Mobile

Siempre crear endpoints específicos para Mobile cuando la respuesta requerida sea diferente a la administrativa (no reutilizar endpoints admin en ese caso):

```
/mobile/dashboard
/mobile/perfil
/mobile/clientes
/mobile/cuotas
/mobile/ayudas
/mobile/supervisor/*
```

## Convenciones de código

- async/await
- Sequelize con `include` para relaciones
- Soft Delete
- Paginación
- Validaciones centralizadas
- Evitar SQL embebido

## Restricciones (no negociables)

- No modificar modelos, relaciones, arquitectura, nombres de tablas ni columnas existentes.
- No realizar refactors masivos. No mover archivos sin que se solicite explícitamente.
- No modificar funcionalidades que ya funcionan.
- Implementar únicamente el alcance solicitado. Si una mejora arquitectónica no es estrictamente necesaria para el requerimiento, no implementarla.

## Calidad del código

Todo código generado debe: reutilizar componentes/servicios/repositorios existentes, evitar duplicación, mantener consistencia de nombres y estilo del proyecto, eliminar imports sin uso, no dejar código comentado, no introducir dependencias innecesarias, ser fácil de leer y estar listo para producción.

## Forma de trabajo

Antes de crear un endpoint, servicio o modelo nuevo: **verificar primero si ya existe algo reutilizable.** Priorizar reutilización sobre duplicación. Cambios pequeños y consistentes, no monolíticos.
