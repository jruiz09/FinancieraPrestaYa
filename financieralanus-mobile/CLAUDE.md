# Financiera Lanús — Mobile PWA (FinancieraLanusMobile)

## Contexto del sistema

Financiera Lanús es un sistema integral para la administración de créditos personales y cobranzas, compuesto por tres proyectos independientes: esta PWA mobile (FinancieraLanusMobile), el backend (FinancieraLanusBack) y el panel administrativo (FinancieraLanusAdm).

El proyecto se encuentra en una etapa avanzada de desarrollo. **Antes de modificar código existente, revisar siempre la implementación actual.** No reinventar funcionalidades ya implementadas.

Principios que el sistema debe priorizar siempre: simplicidad, rapidez de uso, productividad del cobrador, bajo mantenimiento, escalabilidad, reutilización de código.

## Uso — MUY IMPORTANTE

Esta aplicación la usan **Cobradores** y **Supervisores**.

**No existen dos aplicaciones móviles.** Es una única PWA que adapta automáticamente sus pantallas según el rol autenticado (`COBRADOR` o `SUPERVISOR`). El Supervisor usa exactamente la misma app: **no crear otra aplicación ni otro Login.** Las pantallas dependen únicamente del rol.

## Stack

- React
- Vite
- TailwindCSS
- Zustand
- Axios
- React Router
- PWA

## Estado actual — ya implementado

El módulo Mobile del cobrador ya está implementado: Login, Dashboard, Perfil, Clientes, Créditos, Cuotas, Cobros, Ayudas. **Toda nueva funcionalidad debe reutilizar estos componentes**, no recrearlos.

## Filosofía de diseño (no negociable)

La app está pensada para usarse en la calle. Debe minimizar la cantidad de toques necesarios para realizar una cobranza. Siempre priorizar:

- Botones grandes
- Pocas pantallas
- Acciones rápidas
- Mínima escritura
- Operación con una sola mano

Lenguaje visual: fondo oscuro, tarjetas grandes, bordes redondeados, botones táctiles grandes, colores consistentes, espaciados amplios. **No introducir estilos diferentes al ya establecido.**

## Acciones rápidas

Siempre que sea posible, incorporar: Llamar, WhatsApp, Navegar con Google Maps. Si existe una acción rápida disponible, priorizarla sobre una navegación adicional dentro de la app.

## Componentes reutilizables existentes

`Money`, `BadgeEstado`, `ClienteAvatar`, `Toast`, `SearchSelect`, `SearchBar`, `Pagination`, `Loading`, `ConfirmDialog`, `ErrorAlert`.

**Antes de crear un componente nuevo, verificar si alguno de estos ya cubre la necesidad.** No duplicar componentes.

## Datos de cliente disponibles

Los clientes poseen: nombre, apellido, celular, direccion, latitud, longitud, mapsUrl, foto. Usar estos datos para potenciar las acciones rápidas (llamar, WhatsApp, navegar) y mejorar la experiencia en terreno.

## Backend

Consumir siempre los endpoints específicos de Mobile expuestos por el backend, por ejemplo:

```
/mobile/dashboard
/mobile/perfil
/mobile/clientes
/mobile/cuotas
/mobile/ayudas
/mobile/supervisor/*
```

No asumir contratos de endpoints administrativos.

## Restricciones (no negociables)

- No modificar la arquitectura del proyecto.
- No realizar refactors masivos. No mover archivos sin que se solicite explícitamente.
- No modificar funcionalidades que ya funcionan.
- Implementar únicamente el alcance solicitado.

## Calidad del código

Reutilizar componentes existentes, evitar duplicación, mantener consistencia de nombres y estilo, eliminar imports sin uso, no dejar código comentado, no introducir dependencias innecesarias, código listo para producción.

## Roadmap de referencia

Próximos módulos a incorporar de forma incremental: Dashboard Supervisor, Geolocalización, Indicadores de gestión.
