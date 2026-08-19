# FinancieraLanusBack

Backend de Financiera Lanús con Express, Sequelize, JWT y roles.

## Estructura

- `src/app.js` - Configuración del servidor y middleware.
- `src/server.js` - Entrada de la aplicación.
- `src/config` - Configuraciones de base de datos y autenticación.
- `src/models` - Modelos Sequelize y asociaciones.
- `src/routes` - Rutas de la API.
- `src/controllers` - Lógica de los endpoints.
- `src/middleware` - Autenticación y control de acceso.
- `src/seeders` - Scripts de inicialización.

## Instalación

1. Copiar `.env.example` a `.env`.
2. Ajustar `DATABASE_URL` y `JWT_SECRET`.
3. Ejecutar `npm install`.
4. Iniciar la aplicación: `npm run dev`.

## Notas

- Usamos MySQL como base de datos.
- `src/seeders/seedRoles.js` crea los roles iniciales.
