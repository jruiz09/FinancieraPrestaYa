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
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_VIEW']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
<Route
  path="supervisores"
  element={
    <ProtectedRoute requiredPermissions={['SUPERVISORS_VIEW']}>
      <SupervisoresPage />
    </ProtectedRoute>
  }
/>
<Route
  path= "/clientes-mapa"
  element= {
    <ProtectedRoute requiredPermissions={['CLIENTS_VIEW']}>
      <ClientesMapaPage />
    </ProtectedRoute>
  }
/>
<Route
  path= "/zonas"
  element= {
    <ProtectedRoute requiredPermissions={['ZONES_VIEW']}>
      <ZonesPage />
    </ProtectedRoute>
  }
/>

<Route
  path= "/ayudas"
  element= {
    <ProtectedRoute requiredPermissions={['AYUDAS_VIEW']}>
      <AyudasPage />
    </ProtectedRoute>
  }
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
          element={
            <ProtectedRoute requiredPermissions={['COLLECTORS_VIEW']}>
              <CollectorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="clients"
          element={
            <ProtectedRoute requiredPermissions={['CLIENTS_VIEW']}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
<Route
  path="/roles"
  element={
    <ProtectedRoute requiredPermissions={['ROLES_VIEW']}>
      <RolesPage />
    </ProtectedRoute>
  }
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
          element={
            <ProtectedRoute requiredPermissions={['PLAN_TYPES_VIEW']}>
              <TipoPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="nuevocredito"
          element={
            <ProtectedRoute requiredPermissions={['CREDITS_CREATE']}>
              <NuevoCreditoPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="recaudacion"
  element={
    <ProtectedRoute requiredPermissions={['CREDITS_VIEW']}>
      <ResumenRecaudacionPage />
    </ProtectedRoute>
  }
/>

<Route
  path="informe-diario"
  element={
    <ProtectedRoute requiredPermissions={['DASHBOARD_VIEW']}>
      <InformeDiarioPage />
    </ProtectedRoute>
  }
/>


<Route
  path="dias-no-laborables"
  element={
    <ProtectedRoute requiredPermissions={['HOLIDAYS_VIEW']}>
      <DiasNoLaborablesPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="creditos"
          element={
            <ProtectedRoute requiredPermissions={['CREDITS_VIEW']}>
              <CreditosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="creditos/:id"
          element={
            <ProtectedRoute requiredPermissions={['CREDITS_VIEW']}>
              <CreditoDetallePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="cuotas"
          element={
            <ProtectedRoute requiredPermissions={['CREDITS_VIEW']}>
              <CuotasPage />
            </ProtectedRoute>
          }
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