import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import MobileLayout
  from '../layouts/MobileLayout'

import ProtectedRoute
  from './ProtectedRoute'

import LoginPage
  from '../pages/auth/LoginPage'

import DashboardPage
  from '../pages/dashboard/DashboardPage'

import EquipoPage
  from '../pages/dashboard/EquipoPage'

import IndicadoresPage
  from '../pages/dashboard/IndicadoresPage'

import CobrosPage
  from '../pages/cobros/CobrosPage'

import AyudasPage
  from '../pages/ayudas/AyudasPage'

import ValesPage
  from '../pages/vales/ValesPage'

import PerfilPage
  from '../pages/profile/PerfilPage'

  import BuscarPage
  from '../pages/buscar/BuscarPage'

import DetalleCreditoPage
  from '../pages/credito/DetalleCreditoPage'
import RecorridoPage from '../pages/recorrido/RecorridoPage'

export default function AppRouter() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={

            <ProtectedRoute>

              <MobileLayout />

            </ProtectedRoute>

          }
        >

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
          

          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/equipo"
            element={
              <EquipoPage />
            }
          />

          <Route
            path="/indicadores"
            element={
              <IndicadoresPage />
            }
          />

          <Route
            path="/cobros"
            element={
              <CobrosPage />
            }
          />

          <Route
            path="/recorrido"
            element={<RecorridoPage />}
          />

          <Route
            path="/buscar"
            element={
              <BuscarPage />
            }
          />

          <Route
            path="/credito/:id"
            element={
              <DetalleCreditoPage />
            }
          />

          <Route
            path="/ayudas"
            element={
              <AyudasPage />
            }
          />

          <Route
            path="/vales"
            element={
              <ValesPage />
            }
          />

          <Route
            path="/perfil"
            element={
              <PerfilPage />
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>

  )

}