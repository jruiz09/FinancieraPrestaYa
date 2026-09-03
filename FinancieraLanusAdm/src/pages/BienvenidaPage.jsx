import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore";
import { RUTAS_POR_PERMISO } from "../utils/permissionRoutes";

export default function BienvenidaPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore(
    (state) => state.user?.permissions || [],
  );

  const fecha = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const accesos = RUTAS_POR_PERMISO.filter((ruta) =>
    permissions.includes(ruta.permission),
  );

  return (
    <div className="space-y-6 pb-10">
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-stone-200
          bg-gradient-to-br
          from-stone-50
          via-white
          to-amber-50
          px-5
          py-6
          shadow-sm
          sm:px-7
          sm:py-7
          dark:border-stone-700
          dark:from-stone-900
          dark:via-stone-900
          dark:to-amber-950/30
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-48
            w-48
            rounded-full
            bg-amber-200/30
            blur-3xl
            dark:bg-amber-700/10
          "
        />

        <div className="relative">
          <div
            className="
              mb-2
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-amber-200
              bg-amber-50
              px-3
              py-1
              text-xs
              font-semibold
              capitalize
              text-amber-700
              dark:border-amber-800
              dark:bg-amber-950/40
              dark:text-amber-300
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-amber-500
              "
            />

            {fecha}
          </div>

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-stone-900
              sm:text-3xl
              dark:text-white
            "
          >
            Hola, {user?.name || "bienvenido/a"}
          </h1>

          <p
            className="
              mt-1
              max-w-xl
              text-sm
              text-stone-500
              sm:text-base
              dark:text-stone-400
            "
          >
            Elegí un módulo para empezar a trabajar.
          </p>
        </div>
      </section>

      <section>
        {accesos.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-stone-200
              bg-white
              p-6
              text-center
              text-sm
              text-stone-500
              shadow-sm
              dark:border-stone-700
              dark:bg-stone-900
              dark:text-stone-400
            "
          >
            Todavía no tenés módulos asignados. Consultá con un
            administrador.
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {accesos.map((acceso) => {
              const Icon = acceso.icon;

              return (
                <button
                  key={acceso.path}
                  type="button"
                  onClick={() => navigate(acceso.path)}
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-stone-200
                    bg-white
                    p-4
                    text-left
                    shadow-sm
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-amber-300
                    hover:shadow-md
                    dark:border-stone-700
                    dark:bg-stone-900
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-amber-50
                      text-amber-600
                      transition
                      group-hover:bg-amber-100
                      dark:bg-amber-950/40
                      dark:text-amber-400
                    "
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-stone-800
                      dark:text-stone-100
                    "
                  >
                    {acceso.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
