# Financiera Lanús — Overview del Sistema

Financiera Lanús es un sistema integral para la administración de créditos personales y cobranzas. Este repo es un **monorepo** con tres proyectos independientes entre sí (cada uno con su propio stack, dependencias y CLAUDE.md específico):

```
FinancieraPrestaYa/
├── FinancieraLanusAdm/        → Panel web (Administrativos / Administradores)
├── FinancieraLanusBack/       → API (Node/Express/Sequelize/MySQL)
└── financieralanus-mobile/    → PWA (Cobradores / Supervisores)
```

**Cada subcarpeta tiene su propio `CLAUDE.md` con las reglas específicas de esa parte del stack.** Este archivo es solo el mapa general — al trabajar dentro de una subcarpeta, Claude Code también carga el CLAUDE.md local de esa carpeta, que tiene prioridad para detalles técnicos concretos.

El proyecto se encuentra en una **etapa avanzada de desarrollo**. Antes de modificar código existente, revisar siempre la implementación actual. No reinventar funcionalidades ya implementadas. No realizar refactors masivos ni mover archivos sin que se solicite explícitamente.

## Principios del sistema (aplican a las tres apps)

- Simplicidad
- Rapidez de uso
- Productividad del cobrador
- Bajo mantenimiento
- Escalabilidad
- Reutilización de código

## Modelo de dominio (compartido por las 3 apps)

El sistema es **multiempresa**. La entidad principal es **Owner** — toda entidad operativa (usuarios, supervisores, cobradores, clientes, créditos, cuotas, ayudas, zonas) pertenece a un Owner, y el backend filtra automáticamente por `ownerId` desde el JWT. Nunca debe filtrarse ni exponerse información de otro Owner.

Roles existentes: `COBRADOR`, `SUPERVISOR`, `ADMINISTRATIVO`, `ADMIN`. El comportamiento de cada app depende del rol autenticado.

```
Owner
├── Zones
│      └── Collectors
│               ├── Clients
│               │       └── Créditos → Cuotas
│               └── User
├── Supervisors
│        ├── Collectors
│        └── User
└── Users
```

Notas clave que aplican en toda la plataforma:
- La app **Mobile es una sola PWA** — no existen apps separadas para Cobrador y Supervisor. Se adapta por rol.
- Un Supervisor **no tiene relación directa con una Zona**; administra territorio indirectamente a través de sus cobradores.
- Los cobradores siempre usan `zoneId` (nunca un campo de texto libre "zona").
- La autenticación Mobile usa siempre la entidad `User`.

## Restricciones globales (no negociables en ningún proyecto)

- No modificar modelos, relaciones, arquitectura, nombres de tablas ni columnas existentes sin que se pida explícitamente.
- No modificar funcionalidades que ya funcionan.
- Implementar únicamente el alcance solicitado. Si una mejora no es estrictamente necesaria para el requerimiento, no implementarla.
- Priorizar siempre reutilización de componentes/servicios/endpoints existentes sobre crear algo nuevo desde cero.
- Código listo para producción: sin imports sin uso, sin código comentado, sin dependencias innecesarias.

## Roadmap de referencia (visión a futuro, no implementar salvo que se pida)

Dashboard Supervisor, Dashboard Administrativo, Caja diaria, Rendiciones, Gastos, Geolocalización, Indicadores de gestión, Reportes, Notificaciones, Automatizaciones, Inteligencia comercial.
