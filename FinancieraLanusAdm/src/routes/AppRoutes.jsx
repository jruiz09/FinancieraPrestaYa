import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

import AppLayout from "../layouts/AppLayout";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import CollectorsPage from "../pages/CollectorsPage";
import ClientsPage from "../pages/ClientsPage";
import UsersPage from "../pages/UsersPage";
import TipoPlanPage from "../pages/TipoPlanPage";
import NuevoCreditoPage from "../pages/NuevoCreditoPage";
import CreditosPage from "../pages/CreditosPage";
import CreditoDetallePage from "../pages/CreditoDetallePage";
import CuotasPage from "../pages/CuotasPage";
import DiasNoLaborablesPage
from '../pages/DiasNoLaborablesPage'
import ClienteCreditoPage from "../pages/ClienteCreditoPage";
import SupervisoresPage
from '../pages/SupervisoresPage';
import ClientesMapaPage
  from '../pages/ClientesMapaPage';
  import ResumenRecaudacionPage
from '../pages/ResumenRecaudacionPage';
import InformeDiarioPage
from '../pages/InformeDiarioPage';

import ProtectedRoute from "./ProtectedRoute";
import ZonesPage from "../pages/ZonesPage";
import AyudasPage from "../pages/AyudasPage";
import ValesPage from "../pages/ValesPage";
import RolesPage from "../pages/RolePage";

export default function AppRoutes() {

  const token =
    useAuthStore(
      (state) => state.token
    );

  return (

    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      {/* CONSULTA PÚBLICA DEL CLIENTE */}

      <Route
        path="/consulta/:token"
        element={
          <ClienteCreditoPage />
        }
      />

      {/* RUTAS PRIVADAS */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<DashboardPage />}
        />
<Route
  path="supervisores"
  element={
    <SupervisoresPage />
  }
/>
<Route
  path= "/clientes-mapa"
  element= {<ClientesMapaPage />}
/>
<Route
  path= "/zonas"
  element= {<ZonesPage />}
/>

<Route
  path= "/ayudas"
  element= {<AyudasPage />}
/>
<Route
  path= "/vales"
  element= {
    <ProtectedRoute requiredPermissions={['VALES_VIEW']}>
      <ValesPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="collectors"
          element={<CollectorsPage />}
        />

        <Route
          path="clients"
          element={<ClientsPage />}
        />
<Route
  path="/roles"
  element={<RolesPage />}
/>
        <Route
          path="users"
          element={
            <ProtectedRoute requiredPermissions={['USERS_VIEW']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="tipoplan"
          element={<TipoPlanPage />}
        />

        <Route
          path="nuevocredito"
          element={<NuevoCreditoPage />}
        />
        <Route
  path="recaudacion"
  element={
    <ResumenRecaudacionPage />
  }
/>

<Route
  path="informe-diario"
  element={
    <InformeDiarioPage />
  }
/>


<Route
  path="dias-no-laborables"
  element={
    <DiasNoLaborablesPage />
  }
/>
        <Route
          path="creditos"
          element={<CreditosPage />}
        />

        <Route
          path="creditos/:id"
          element={<CreditoDetallePage />}
        />

        <Route
          path="cuotas"
          element={<CuotasPage />}
        />

      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={
              token
                ? "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />

    </Routes>
  );
}