# FinancieraLanus Admin

Frontend administrativo con React, Vite, TailwindCSS, React Router y Zustand.

## Instalación

```bash
cd FinancieraLanusAdm/admin
npm install
cp .env.example .env
```

## Configuración

Edita `.env` y actualiza la URL de la API (por defecto es http://localhost:4000/api):

```env
VITE_API_URL=http://localhost:4000/api
```

## Desarrollo

```bash
npm run dev
```

Accede a http://localhost:5173

## Características

- Autenticación completa (login, logout, token persistente)
- Rutas protegidas
- Diseño responsivo con TailwindCSS
- Tema oscuro elegante
- Manejo de errores de autenticación
- Interceptores Axios para JWT

## Stack

- React 18
- Vite 5
- TailwindCSS 3
- React Router DOM 6
- Axios
- Zustand
