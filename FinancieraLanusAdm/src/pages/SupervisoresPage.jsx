import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supervisorService,
} from "../services/supervisorService";

import SupervisorModal from "../components/SupervisorModal";
import ErrorAlert from "../components/ErrorAlert";
import Permission from "../components/Permission";
import { PERMISSIONS } from "../constants/permissions";

export default function SupervisoresPage() {
  const [
    supervisores,
    setSupervisores,
  ] = useState([]);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    supervisorEdit,
    setSupervisorEdit,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await supervisorService.listar(
          1,
          100,
        );

      setSupervisores(
        data.supervisores || [],
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Error al cargar supervisores",
      );
    } finally {
      setLoading(false);
    }
  };

  const guardar = async (
    form,
  ) => {
    try {
      setSaving(true);
      setError("");

      if (supervisorEdit) {
        await supervisorService.actualizar(
          supervisorEdit.id,
          form,
        );
      } else {
        await supervisorService.crear(
          form,
        );
      }

      setModalOpen(false);
      setSupervisorEdit(null);

      await cargar();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Error al guardar supervisor",
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (
    id,
  ) => {
    if (
      !window.confirm(
        "¿Eliminar supervisor?",
      )
    ) {
      return;
    }

    try {
      setError("");

      await supervisorService.eliminar(
        id,
      );

      await cargar();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Error al eliminar supervisor",
      );
    }
  };

  const abrirNuevo = () => {
    setSupervisorEdit(null);
    setModalOpen(true);
  };

  const abrirEdicion = (
    supervisor,
  ) => {
    setSupervisorEdit(
      supervisor,
    );

    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setSupervisorEdit(null);
  };

  const supervisoresFiltrados =
    useMemo(() => {
      const termino = search
        .trim()
        .toLowerCase();

      if (!termino) {
        return supervisores;
      }

      return supervisores.filter(
        (supervisor) => {
          const texto = `
            ${supervisor.nombre || ""}
            ${supervisor.apellido || ""}
            ${supervisor.celular || ""}
            ${supervisor.email || ""}
            ${supervisor.user?.username || ""}
          `.toLowerCase();

          return texto.includes(
            termino,
          );
        },
      );
    }, [
      supervisores,
      search,
    ]);

  const conUsuario =
    supervisores.filter(
      (supervisor) =>
        supervisor.userId ||
        supervisor.user,
    ).length;

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}
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
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
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

              Equipo de supervisión
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
              Supervisores
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
                dark:text-stone-400
              "
            >
              Administrá supervisores
              y sus accesos a la
              aplicación.
            </p>
          </div>

          <Permission permission={PERMISSIONS.SUPERVISORS_CREATE}>
            <button
              type="button"
              onClick={abrirNuevo}
              className="
                inline-flex
                min-h-[46px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-stone-900
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-md
                dark:bg-amber-500
                dark:text-stone-950
                dark:hover:bg-amber-400
              "
            >
              <span className="text-xl">
                +
              </span>

              Nuevo supervisor
            </button>
          </Permission>
        </div>
      </section>

      <ErrorAlert
        message={error}
        onDismiss={() =>
          setError("")
        }
      />

      {/* MÉTRICAS */}
      <section
        className="
          grid
          grid-cols-2
          gap-3
        "
      >
        <MetricCard
          label="Supervisores"
          value={
            supervisores.length
          }
        />

        <MetricCard
          label="Con acceso"
          value={conUsuario}
          active
        />
      </section>

      {/* BUSCADOR */}
      <section
        className="
          rounded-2xl
          border
          border-stone-200
          bg-white
          p-4
          shadow-sm
          sm:p-5
          dark:border-stone-700
          dark:bg-stone-900
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div className="flex-1">
            <label
              htmlFor="buscar-supervisor"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-stone-700
                dark:text-stone-300
              "
            >
              Buscar supervisor
            </label>

            <div className="relative">
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-0
                  flex
                  items-center
                  pl-4
                  text-stone-400
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>

              <input
                id="buscar-supervisor"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Nombre, apellido, email o celular..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-stone-200
                  bg-stone-50
                  py-3
                  pl-11
                  pr-11
                  text-sm
                  text-stone-900
                  outline-none
                  transition
                  placeholder:text-stone-400
                  focus:border-amber-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-amber-100
                  dark:border-stone-700
                  dark:bg-stone-800
                  dark:text-white
                  dark:focus:border-amber-600
                  dark:focus:ring-amber-900/30
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    inset-y-0
                    right-0
                    px-4
                    text-stone-400
                    hover:text-stone-700
                  "
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              pb-3
            "
          >
            <span
              className="
                text-sm
                text-stone-500
              "
            >
              Mostrando
            </span>

            <span
              className="
                rounded-full
                bg-stone-100
                px-3
                py-1
                text-sm
                font-bold
                text-stone-700
                dark:bg-stone-800
                dark:text-stone-200
              "
            >
              {
                supervisoresFiltrados.length
              }
            </span>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* MOBILE */}
          <div
            className="
              space-y-3
              lg:hidden
            "
          >
            {supervisoresFiltrados.length ===
            0 ? (
              <EmptyState />
            ) : (
              supervisoresFiltrados.map(
                (supervisor) => (
                  <SupervisorCard
                    key={
                      supervisor.id
                    }
                    supervisor={
                      supervisor
                    }
                    onEdit={
                      abrirEdicion
                    }
                    onDelete={
                      eliminar
                    }
                  />
                ),
              )
            )}
          </div>

          {/* DESKTOP */}
          <div
            className="
              hidden
              overflow-hidden
              rounded-2xl
              border
              border-stone-200
              bg-white
              shadow-sm
              lg:block
              dark:border-stone-700
              dark:bg-stone-900
            "
          >
            <div
              className="
                border-b
                border-stone-200
                px-5
                py-4
                dark:border-stone-700
              "
            >
              <h2
                className="
                  font-semibold
                  text-stone-800
                  dark:text-stone-100
                "
              >
                Listado de supervisores
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-stone-400
                "
              >
                Información y acceso
                al sistema
              </p>
            </div>

            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[850px]
                  text-sm
                "
              >
                <thead
                  className="
                    bg-stone-50/80
                    dark:bg-stone-800/60
                  "
                >
                  <tr
                    className="
                      border-b
                      border-stone-200
                      text-xs
                      uppercase
                      tracking-wide
                      text-stone-500
                      dark:border-stone-700
                      dark:text-stone-400
                    "
                  >
                    <th className="px-5 py-3 text-left">
                      Supervisor
                    </th>

                    <th className="px-4 py-3 text-left">
                      Celular
                    </th>

                    <th className="px-4 py-3 text-left">
                      Email
                    </th>

                    <th className="px-4 py-3 text-center">
                      Acceso
                    </th>

                    <th className="px-5 py-3 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody
                  className="
                    divide-y
                    divide-stone-100
                    dark:divide-stone-800
                  "
                >
                  {supervisoresFiltrados.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="
                          px-5
                          py-12
                          text-center
                          text-stone-400
                        "
                      >
                        No se encontraron
                        supervisores.
                      </td>
                    </tr>
                  ) : (
                    supervisoresFiltrados.map(
                      (s) => (
                        <tr
                          key={s.id}
                          className="
                            transition
                            hover:bg-amber-50/40
                            dark:hover:bg-stone-800/60
                          "
                        >
                          <td className="px-5 py-4">
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >
                              <Avatar
                                supervisor={
                                  s
                                }
                              />

                              <div>
                                <p
                                  className="
                                    font-semibold
                                    text-stone-800
                                    dark:text-stone-100
                                  "
                                >
                                  {s.apellido},{" "}
                                  {s.nombre}
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-xs
                                    text-stone-400
                                  "
                                >
                                  Supervisor
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {s.celular ? (
                              <a
                                href={`tel:${s.celular}`}
                                className="
                                  text-stone-600
                                  hover:text-amber-700
                                  dark:text-stone-300
                                "
                              >
                                {s.celular}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td
                            className="
                              px-4
                              py-4
                              text-stone-600
                              dark:text-stone-300
                            "
                          >
                            {s.email ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <AccessBadge
                              enabled={
                                !!(
                                  s.userId ||
                                  s.user
                                )
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >
                              <Permission permission={PERMISSIONS.SUPERVISORS_EDIT}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirEdicion(
                                      s,
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-stone-200
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-stone-600
                                    transition
                                    hover:border-amber-300
                                    hover:bg-amber-50
                                    hover:text-amber-700
                                    dark:border-stone-700
                                    dark:text-stone-300
                                  "
                                >
                                  Editar
                                </button>
                              </Permission>

                              <Permission permission={PERMISSIONS.SUPERVISORS_DELETE}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminar(
                                      s.id,
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-red-100
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-red-500
                                    transition
                                    hover:bg-red-50
                                    dark:border-red-900/50
                                    dark:hover:bg-red-950/30
                                  "
                                >
                                  Eliminar
                                </button>
                              </Permission>
                            </div>
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <SupervisorModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardar}
        supervisor={
          supervisorEdit
        }
        isLoading={saving}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  active = false,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-stone-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
        dark:border-stone-700
        dark:bg-stone-900
      "
    >
      <p
        className="
          text-xs
          font-medium
          text-stone-500
          sm:text-sm
          dark:text-stone-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-2xl
          font-bold
          sm:text-3xl
          ${
            active
              ? `
                text-emerald-600
                dark:text-emerald-400
              `
              : `
                text-stone-900
                dark:text-white
              `
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

function Avatar({
  supervisor,
}) {
  const iniciales = `${
    supervisor.nombre?.charAt(
      0,
    ) || ""
  }${
    supervisor.apellido?.charAt(
      0,
    ) || ""
  }`.toUpperCase();

  return (
    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-amber-100
        text-xs
        font-bold
        text-amber-700
        dark:bg-amber-950/50
        dark:text-amber-300
      "
    >
      {iniciales || "S"}
    </div>
  );
}

function AccessBadge({
  enabled,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-semibold
        ${
          enabled
            ? `
              border-emerald-200
              bg-emerald-50
              text-emerald-700
              dark:border-emerald-900
              dark:bg-emerald-950/40
              dark:text-emerald-300
            `
            : `
              border-stone-200
              bg-stone-50
              text-stone-500
              dark:border-stone-700
              dark:bg-stone-800
              dark:text-stone-400
            `
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            enabled
              ? "bg-emerald-500"
              : "bg-stone-400"
          }
        `}
      />

      {enabled
        ? "Habilitado"
        : "Sin acceso"}
    </span>
  );
}

function SupervisorCard({
  supervisor,
  onEdit,
  onDelete,
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-stone-200
        bg-white
        p-4
        shadow-sm
        dark:border-stone-700
        dark:bg-stone-900
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <Avatar
            supervisor={
              supervisor
            }
          />

          <div>
            <p
              className="
                font-bold
                text-stone-800
                dark:text-white
              "
            >
              {supervisor.apellido},{" "}
              {supervisor.nombre}
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              Supervisor
            </p>
          </div>
        </div>

        <AccessBadge
          enabled={
            !!(
              supervisor.userId ||
              supervisor.user
            )
          }
        />
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
          rounded-xl
          bg-stone-50
          p-3
          dark:bg-stone-800/70
        "
      >
        <Info
          label="Celular"
          value={
            supervisor.celular ||
            "-"
          }
        />

        <Info
          label="Email"
          value={
            supervisor.email ||
            "-"
          }
        />
      </div>

      <div
        className="
          mt-4
          flex
          gap-2
        "
      >
        <Permission permission={PERMISSIONS.SUPERVISORS_EDIT}>
          <button
            type="button"
            onClick={() =>
              onEdit(supervisor)
            }
            className="
              flex-1
              rounded-xl
              border
              border-stone-200
              py-2.5
              text-sm
              font-semibold
              text-stone-700
              dark:border-stone-700
              dark:text-stone-200
            "
          >
            Editar
          </button>
        </Permission>

        <Permission permission={PERMISSIONS.SUPERVISORS_DELETE}>
          <button
            type="button"
            onClick={() =>
              onDelete(
                supervisor.id,
              )
            }
            className="
              rounded-xl
              border
              border-red-100
              px-4
              py-2.5
              text-sm
              font-semibold
              text-red-500
              dark:border-red-900/50
            "
          >
            Eliminar
          </button>
        </Permission>
      </div>
    </article>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-stone-400">
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-sm
          font-medium
          text-stone-700
          dark:text-stone-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-stone-200
        bg-white
        p-5
        shadow-sm
        dark:border-stone-700
        dark:bg-stone-900
      "
    >
      <div className="space-y-3">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-16
                animate-pulse
                rounded-xl
                bg-stone-100
                dark:bg-stone-800
              "
            />
          ),
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-stone-300
        bg-white
        px-5
        py-12
        text-center
        dark:border-stone-700
        dark:bg-stone-900
      "
    >
      <div className="text-3xl">
        👥
      </div>

      <p
        className="
          mt-3
          font-semibold
          text-stone-700
          dark:text-stone-200
        "
      >
        No se encontraron supervisores
      </p>
    </div>
  );
}