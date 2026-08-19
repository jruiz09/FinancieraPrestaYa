# Financiera Lanús — Panel Administrativo (FinancieraLanusAdm)

## Contexto del sistema

Financiera Lanús es un sistema integral para la administración de créditos personales y cobranzas, compuesto por tres proyectos independientes: este panel (FinancieraLanusAdm), el backend (FinancieraLanusBack) y la PWA mobile (FinancieraLanusMobile).

El proyecto se encuentra en una etapa avanzada de desarrollo. **Antes de modificar código existente, revisar siempre la implementación actual.** No reinventar funcionalidades ya implementadas.

Principios que el sistema debe priorizar siempre: simplicidad, rapidez de uso, productividad, bajo mantenimiento, escalabilidad, reutilización de código.

## Uso

Esta aplicación la usan: **Administrativos** y **Administradores**.

## Stack

- React
- Vite
- TailwindCSS
- Zustand
- Axios
- React Router

## Roles y comportamiento

Autenticación mediante JWT contra el backend. Roles existentes en el sistema: `COBRADOR`, `SUPERVISOR`, `ADMINISTRATIVO`, `ADMIN`. Esta app es consumida principalmente por los roles `ADMINISTRATIVO` y `ADMIN`; el comportamiento y las pantallas disponibles dependen del rol autenticado.

## Multiempresa

El sistema es multiempresa (entidad principal: **Owner**). Todo dato mostrado o gestionado desde este panel corresponde exclusivamente al Owner del usuario autenticado — el backend ya filtra por `ownerId` desde el JWT, pero no asumir ni hardcodear IDs de owner en el frontend.

## Entidades con las que interactúa este panel

`User`, `Role`, `Owner`, `Supervisor`, `Collector`, `Zone`, `Client`, `TipoPlan`, `Credito`, `CreditoDetalle`, `DiaNoLaborable`, `Ayuda`.

No asumir campos o relaciones distintas a las que expone el backend. Por ejemplo: los cobradores usan siempre `zoneId` (nunca un campo "zona" de texto libre), y un Supervisor no tiene relación directa con una Zona — administra zonas indirectamente a través de sus cobradores.

## Restricciones (no negociables)

- No modificar la arquitectura del proyecto ni nombres/contratos ya establecidos con el backend.
- No realizar refactors masivos. No mover archivos sin que se solicite explícitamente.
- No modificar funcionalidades que ya funcionan.
- Implementar únicamente el alcance solicitado. Si una mejora no es estrictamente necesaria para el requerimiento, no implementarla.

## Calidad del código

Todo código generado debe: reutilizar componentes y servicios existentes antes de crear nuevos, evitar duplicación, mantener consistencia de nombres y del estilo ya usado en el proyecto, eliminar imports sin uso, no dejar código comentado, no introducir dependencias innecesarias, ser fácil de leer y estar listo para producción.

## Forma de trabajo

Antes de crear un componente, hook, store o llamada a API nueva: **verificar primero si ya existe algo reutilizable en el proyecto.** Priorizar reutilización sobre duplicación. Cambios pequeños y consistentes.

## Roadmap de referencia

Módulos previstos a incorporar de forma incremental: Dashboard Administrativo, Caja diaria, Rendiciones, Gastos, Indicadores de gestión, Reportes, Notificaciones, Automatizaciones, Inteligencia comercial.
