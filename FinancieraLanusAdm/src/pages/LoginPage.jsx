import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import ErrorAlert from "../components/ErrorAlert";
import { obtenerPrimeraRutaAccesible } from "../utils/permissionRoutes";

export default function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { user, token } = response.data.data;

      login(user, token);

      navigate(obtenerPrimeraRutaAccesible(user.permissions), {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al iniciar sesión. Intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100">

      {/* PANEL IZQUIERDO */}

      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950">

        <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-20 text-white">

          <div className="flex items-center gap-5">

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl">

              <span className="text-4xl">💰</span>

            </div>

            <div>

              <h1 className="text-5xl font-bold tracking-tight">

                Presta YA!

              </h1>

              <p className="mt-2 text-blue-100 text-lg">

                Sistema Integral de gestión financiera

              </p>

            </div>

          </div>

          <div className="mt-20 space-y-8">

            <div>

              <h2 className="text-2xl font-semibold">

                Todo el negocio en un solo lugar.

              </h2>

              <p className="mt-4 max-w-lg text-blue-100 leading-8">

                Administre clientes, créditos, cobranzas, ingresos,
                reportes y toda la operación diaria desde una única
                plataforma segura y moderna.

              </p>

            </div>

            <div className="grid grid-cols-2 gap-6 pt-8">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

                <div className="text-amber-400 text-2xl mb-2">

                  ✓

                </div>

                <h3 className="font-semibold">

                  Gestión de Clientes

                </h3>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

                <div className="text-amber-400 text-2xl mb-2">

                  ✓

                </div>

                <h3 className="font-semibold">

                  Créditos

                </h3>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

                <div className="text-amber-400 text-2xl mb-2">

                  ✓

                </div>

                <h3 className="font-semibold">

                  Cobranzas

                </h3>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

                <div className="text-amber-400 text-2xl mb-2">

                  ✓

                </div>

                <h3 className="font-semibold">

                  Reportes

                </h3>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* PANEL DERECHO */}

      <div className="flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">

          {/* LOGO MOBILE */}

          <div className="mb-10 text-center lg:hidden">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">

              <span className="text-4xl">

                💰

              </span>

            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-800">

              Presta YA!

            </h1>

            <p className="mt-2 text-slate-500">

              Sistema Integral de Gestión

            </p>

          </div>

          {/* CARD */}

          <div className="rounded-3xl border border-slate-200 bg-stone-50 p-8 shadow-2xl">

            <h2 className="text-3xl font-bold text-slate-800">

              Bienvenido

            </h2>

            <p className="mt-2 text-slate-500">

              Ingrese sus credenciales para continuar.

            </p>

            <div className="mt-6">

              <ErrorAlert
                message={error}
                onDismiss={() => setError("")}
              />

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Usuario

                </label>

                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Ingrese su usuario"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Contraseña

                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Ingrese su contraseña"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                />

              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isLoading ? (

                  <div className="flex items-center gap-3">

                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >

                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-20"
                      />

                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />

                    </svg>

                    Ingresando...

                  </div>

                ) : (

                  "Ingresar al sistema"

                )}

              </button>

            </form>

            <div className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">

              © 2026 Presta YA!

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}