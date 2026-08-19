# Financiera Lanús

# Guía de Desarrollo del Proyecto

---

# Objetivo

Financiera Lanús es un sistema integral para la administración de créditos personales y cobranzas.

El sistema debe priorizar siempre:

- Simplicidad
- Rapidez de uso
- Productividad del cobrador
- Bajo mantenimiento
- Escalabilidad
- Reutilización de código

Actualmente el proyecto se encuentra en una etapa avanzada de desarrollo.

Antes de modificar código existente debe revisarse la implementación actual.

No reinventar funcionalidades ya implementadas.

---

# Arquitectura General

El sistema está compuesto por tres proyectos independientes.

## FinancieraLanusAdm

Tecnologías:

- React
- Vite
- TailwindCSS
- Zustand
- Axios
- React Router

Aplicación utilizada por:

- Administrativos
- Administradores

---

## FinancieraLanusMobile

Tecnologías:

- React
- Vite
- TailwindCSS
- Zustand
- Axios
- React Router
- PWA

Aplicación utilizada por:

- Cobradores
- Supervisores

No existen dos aplicaciones móviles.

La misma PWA adapta automáticamente sus pantallas según el rol autenticado.

---

## FinancieraLanusBack

Tecnologías:

- Node.js
- Express
- Sequelize
- MySQL

Arquitectura:

```text
src/
│
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

---

# Arquitectura Backend

Debe mantenerse una separación estricta de responsabilidades.

## Controllers

Los controllers únicamente deben:

- Recibir requests
- Validar parámetros
- Invocar Services
- Devolver Responses

No colocar lógica de negocio.

---

## Services

Toda la lógica de negocio debe implementarse aquí.

---

## Repositories

Toda consulta compleja debe implementarse aquí.

---

## Models

Utilizar exclusivamente Sequelize.

No utilizar SQL embebido salvo necesidad extrema.

---

# Seguridad

Autenticación mediante JWT.

Roles existentes:

- COBRADOR
- SUPERVISOR
- ADMINISTRATIVO
- ADMIN

El comportamiento del sistema depende del rol autenticado.

---

# Multiempresa

El sistema es multiempresa.

La entidad principal es:

Owner

Toda entidad operativa pertenece a un Owner.

Ejemplos:

- Usuarios
- Supervisores
- Cobradores
- Clientes
- Créditos
- Cuotas
- Ayudas
- Zonas

Toda consulta debe filtrar automáticamente utilizando el ownerId obtenido desde el JWT.

Nunca devolver información perteneciente a otro Owner.

---

# Modelos Existentes

Actualmente existen implementados:

- User
- Role
- Owner
- Supervisor
- Collector
- Zone
- Client
- TipoPlan
- Credito
- CreditoDetalle
- DiaNoLaborable
- Ayuda

No crear modelos duplicados.

No modificar nombres de tablas.

---

# Relaciones

```text
Owner
│
├── Zones
│      │
│      └── Collectors
│               │
│               ├── Clients
│               │       │
│               │       └── Créditos
│               │                 │
│               │                 └── Cuotas
│               │
│               └── User
│
├── Supervisors
│        │
│        ├── Collectors
│        └── User
│
└── Users
```

---

# Usuarios

Cada Collector puede tener un User.

Cada Supervisor puede tener un User.

La autenticación Mobile utiliza siempre la entidad User.

No crear mecanismos alternativos de autenticación.

---

# Supervisores

Un Supervisor administra uno o varios cobradores.

No existe relación directa Supervisor → Zona.

La administración territorial se realiza mediante los cobradores.

Un supervisor puede administrar cobradores pertenecientes a distintas zonas.

---

# Cobradores

Los cobradores pertenecen a:

- Owner
- Supervisor
- Zone
- User (opcional)

Campos relevantes:

- nombre
- apellido
- dni
- celular
- zoneId
- supervisorId
- userId
- activo

No volver a utilizar un campo "zona" de tipo texto.

Siempre utilizar zoneId.

---

# Zonas

Las zonas son entidades independientes.

Campos principales:

- nombre
- descripcion
- color
- latitudCentro
- longitudCentro
- radioMetros

Los cobradores pertenecen a una zona mediante zoneId.

---

# Clientes

Los clientes poseen:

- nombre
- apellido
- celular
- direccion
- latitud
- longitud
- mapsUrl
- foto

Estos datos deben utilizarse para mejorar la experiencia Mobile.

---

# Créditos

Cada cliente puede tener múltiples créditos.

Cada crédito posee múltiples cuotas.

Las cuotas son la entidad principal utilizada por la aplicación Mobile.

---

# Mobile

Actualmente el módulo Mobile del cobrador ya se encuentra implementado.

Incluye:

- Login
- Dashboard
- Perfil
- Clientes
- Créditos
- Cuotas
- Cobros
- Ayudas

Toda nueva funcionalidad debe reutilizar estos componentes.

---

# Mobile Supervisor

El Supervisor utilizará exactamente la misma aplicación Mobile.

No crear otra aplicación.

No crear otro Login.

Las pantallas dependerán únicamente del rol autenticado.

---

# Filosofía Mobile

La aplicación está diseñada para utilizarse en la calle.

Debe minimizar la cantidad de toques necesarios para realizar una cobranza.

Siempre priorizar:

- Botones grandes
- Pocas pantallas
- Acciones rápidas
- Mínima escritura
- Operación con una sola mano

---

# Acciones rápidas

Siempre que sea posible incorporar:

- Llamar
- WhatsApp
- Navegar con Google Maps

Si existe una acción rápida disponible, priorizarla sobre una navegación adicional.

---

# Componentes reutilizables

Ya existen componentes reutilizables.

Antes de crear uno nuevo verificar si alguno de estos puede reutilizarse.

Componentes existentes:

- Money
- BadgeEstado
- ClienteAvatar
- Toast
- SearchSelect
- SearchBar
- Pagination
- Loading
- ConfirmDialog
- ErrorAlert

No duplicar componentes.

---

# Diseño

Toda la interfaz Mobile utiliza:

- Fondo oscuro
- Tarjetas grandes
- Bordes redondeados
- Botones táctiles grandes
- Colores consistentes
- Espaciados amplios

Mantener siempre el mismo lenguaje visual.

No introducir estilos diferentes.

---

# Backend Mobile

Siempre crear endpoints específicos para Mobile cuando sea necesario.

Ejemplo:

```text
/mobile/dashboard
/mobile/perfil
/mobile/clientes
/mobile/cuotas
/mobile/ayudas
/mobile/supervisor/*
```

No reutilizar endpoints administrativos cuando la respuesta requerida sea diferente.

---

# Convenciones

Utilizar siempre:

- async/await
- Sequelize
- include para relaciones
- Soft Delete
- Paginación
- Validaciones centralizadas

Evitar consultas SQL embebidas.

---

# Calidad del código

Todo código generado debe:

- Reutilizar componentes existentes
- Evitar duplicación
- Mantener consistencia de nombres
- Mantener el estilo del proyecto
- Eliminar imports sin uso
- No dejar código comentado
- No introducir dependencias innecesarias
- Ser fácil de leer
- Estar listo para producción

---

# Restricciones

No modificar:

- Modelos existentes
- Relaciones existentes
- Arquitectura del proyecto
- Nombres de tablas
- Nombres de columnas

No realizar refactors masivos.

No mover archivos sin solicitarlo.

No modificar funcionalidades que ya funcionan.

Implementar únicamente el alcance solicitado.

---

# Forma de trabajo

El proyecto ya se encuentra en una etapa avanzada.

Toda nueva funcionalidad debe implementarse mediante cambios pequeños y consistentes.

Antes de crear:

- Componentes
- Endpoints
- Servicios
- Modelos

Verificar si ya existe una implementación reutilizable.

Siempre priorizar reutilización sobre duplicación.

Las respuestas deben generar código listo para copiar y pegar.

Mantener siempre el mismo estilo de programación utilizado en el proyecto.

Si una mejora arquitectónica no es estrictamente necesaria para cumplir el requerimiento solicitado, no implementarla.

---

# Objetivo del Proyecto

Construir un sistema moderno de administración de créditos y cobranzas, optimizado para el trabajo diario de los cobradores y supervisores.

El sistema debe crecer de forma incremental incorporando nuevos módulos como:

- Dashboard Supervisor
- Dashboard Administrativo
- Caja diaria
- Rendiciones
- Gastos
- Geolocalización
- Indicadores de gestión
- Reportes
- Notificaciones
- Automatizaciones
- Inteligencia comercial

Toda nueva funcionalidad debe mantener los principios del proyecto:

- Simplicidad
- Productividad
- Escalabilidad
- Bajo mantenimiento
- Reutilización de código

El objetivo final es que tanto el cobrador como el supervisor puedan realizar la mayor cantidad de tareas posibles desde el teléfono móvil con la menor cantidad de interacciones, manteniendo una experiencia rápida, intuitiva y consistente.