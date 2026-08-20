import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Pagination from "../components/Pagination";
import ErrorAlert from "../components/ErrorAlert";
import CollectorModal from "../components/CollectorModal";
import Permission from "../components/Permission";
import { PERMISSIONS } from "../constants/permissions";

import {
  collectorService,
} from "../services/collectorService";

import {
  useAuthStore,
} from "../store/useAuthStore";

export default function CollectorsPage() {
  const ownerId = useAuthStore(
    (state) => state.ownerId,
  );

  const [collectors, setCollectors] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [limit] =
    useState(10);

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("create");

  const [
    selectedCollector,
    setSelectedCollector,
  ] = useState({});

  const [
    isModalLoading,
    setIsModalLoading,
  ] = useState(false);

  const fetchCollectors = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data =
        await collectorService.list(
          page,
          limit,
          ownerId,
        );

      setCollectors(
        data.collectors || [],
      );

      setTotal(
        data.total || 0,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al cargar cobradores",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ownerId) {
      fetchCollectors();
    }
  }, [page, ownerId]);

  const openCreateModal = () => {
    setModalMode("create");

    setSelectedCollector({});

    setModalOpen(true);
  };

  const openEditModal = (
    collector,
  ) => {
    setModalMode("edit");

    setSelectedCollector({
      ...collector,

      zoneId:
        collector.zone?.id ||
        collector.zoneId ||
        "",

      supervisorId:
        collector.supervisor?.id ||
        collector.supervisorId ||
        "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setSelectedCollector({});
  };

  const handleSaveCollector =
    async (formData) => {
      setIsModalLoading(true);
      setError("");

      try {
        const payload = {
          ...formData,
          ownerId,
        };

        if (
          modalMode === "create"
        ) {
          await collectorService.create(
            payload,
          );
        } else {
          await collectorService.update(
            selectedCollector.id,
            payload,
          );
        }

        await fetchCollectors();

        closeModal();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al guardar cobrador",
        );
      } finally {
        setIsModalLoading(false);
      }
    };

  const handleDeactivate =
    async (id) => {
      if (
        !window.confirm(
          "¿Desactivar este cobrador?",
        )
      ) {
        return;
      }

      try {
        await collectorService.deactivate(
          id,
        );

        await fetchCollectors();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al desactivar cobrador",
        );
      }
    };

  const collectorsFiltrados =
    useMemo(() => {
      const termino = search
        .trim()
        .toLowerCase();

      if (!termino) {
        return collectors;
      }

      return collectors.filter(
        (collector) => {
          const texto = `
            ${collector.nombre || ""}
            ${collector.apellido || ""}
            ${collector.dni || ""}
            ${collector.celular || ""}
            ${collector.zone?.nombre || ""}
            ${collector.supervisor?.nombre || ""}
            ${collector.supervisor?.apellido || ""}
          `.toLowerCase();

          return texto.includes(
            termino,
          );
        },
      );
    }, [collectors, search]);

  const resumen = useMemo(() => {
    return {
      activos:
        collectors.filter(
          (collector) =>
            collector.activo,
        ).length,

      inactivos:
        collectors.filter(
          (collector) =>
            !collector.activo,
        ).length,
    };
  }, [collectors]);

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

              Equipo de cobranza
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
              Cobradores
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
              Administrá cobradores,
              zonas, supervisores y
              accesos a la aplicación.
            </p>
          </div>

          <Permission permission={PERMISSIONS.COLLECTORS_CREATE}>
            <button
              type="button"
              onClick={
                openCreateModal
              }
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

              Nuevo cobrador
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

      {/* RESUMEN */}
      <section
        className="
          grid
          grid-cols-3
          gap-3
        "
      >
        <MetricCard
          label="Total"
          value={total}
        />

        <MetricCard
          label="Activos"
          value={resumen.activos}
          type="active"
        />

        <MetricCard
          label="Inactivos"
          value={resumen.inactivos}
          type="inactive"
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
              htmlFor="buscar-cobrador"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-stone-700
                dark:text-stone-300
              "
            >
              Buscar cobrador
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
                id="buscar-cobrador"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Nombre, apellido, DNI, zona o supervisor..."
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
                    flex
                    items-center
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
                collectorsFiltrados.length
              }
            </span>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      {isLoading ? (
        <CollectorsLoading />
      ) : (
        <>
          {/* MOBILE */}
          <div
            className="
              space-y-3
              lg:hidden
            "
          >
            {collectorsFiltrados.length ===
            0 ? (
              <EmptyCollectors />
            ) : (
              collectorsFiltrados.map(
                (collector) => (
                  <CollectorCard
                    key={
                      collector.id
                    }
                    collector={
                      collector
                    }
                    onEdit={
                      openEditModal
                    }
                    onDeactivate={
                      handleDeactivate
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
                Listado de cobradores
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-stone-400
                "
              >
                Asignaciones, zonas y
                estado operativo
              </p>
            </div>

            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[950px]
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
                      Cobrador
                    </th>

                    <th className="px-4 py-3 text-left">
                      DNI
                    </th>

                    <th className="px-4 py-3 text-left">
                      Celular
                    </th>

                    <th className="px-4 py-3 text-left">
                      Zona
                    </th>

                    <th className="px-4 py-3 text-left">
                      Supervisor
                    </th>

                    <th className="px-4 py-3 text-center">
                      Estado
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
                  {collectorsFiltrados.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="
                          px-5
                          py-12
                          text-center
                          text-stone-400
                        "
                      >
                        No se encontraron
                        cobradores.
                      </td>
                    </tr>
                  ) : (
                    collectorsFiltrados.map(
                      (collector) => (
                        <tr
                          key={
                            collector.id
                          }
                          className="
                            transition
                            hover:bg-amber-50/40
                            dark:hover:bg-stone-800/60
                          "
                        >
                          {/* COBRADOR */}
                          <td className="px-5 py-4">
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >
                              <Avatar
                                collector={
                                  collector
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
                                  {
                                    collector.apellido
                                  }
                                  ,{" "}
                                  {
                                    collector.nombre
                                  }
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-xs
                                    text-stone-400
                                  "
                                >
                                  Cobrador
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* DNI */}
                          <td
                            className="
                              px-4
                              py-4
                              font-medium
                              text-stone-600
                              dark:text-stone-300
                            "
                          >
                            {collector.dni ||
                              "-"}
                          </td>

                          {/* CELULAR */}
                          <td className="px-4 py-4">
                            {collector.celular ? (
                              <a
                                href={`tel:${collector.celular}`}
                                className="
                                  text-stone-600
                                  transition
                                  hover:text-amber-700
                                  dark:text-stone-300
                                "
                              >
                                {
                                  collector.celular
                                }
                              </a>
                            ) : (
                              <span className="text-stone-400">
                                -
                              </span>
                            )}
                          </td>

                          {/* ZONA */}
                          <td className="px-4 py-4">
                            <span
                              className="
                                inline-flex
                                rounded-lg
                                bg-stone-100
                                px-2.5
                                py-1.5
                                text-xs
                                font-medium
                                text-stone-600
                                dark:bg-stone-800
                                dark:text-stone-300
                              "
                            >
                              {collector.zone
                                ?.nombre ||
                                "Sin zona"}
                            </span>
                          </td>

                          {/* SUPERVISOR */}
                          <td
                            className="
                              px-4
                              py-4
                              text-stone-600
                              dark:text-stone-300
                            "
                          >
                            {collector.supervisor
                              ? `${collector.supervisor.apellido || ""}, ${collector.supervisor.nombre || ""}`
                              : "-"}
                          </td>

                          {/* ESTADO */}
                          <td className="px-4 py-4 text-center">
                            <StatusBadge
                              active={
                                collector.activo
                              }
                            />
                          </td>

                          {/* ACCIONES */}
                          <td className="px-5 py-4">
                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >
                              <Permission permission={PERMISSIONS.COLLECTORS_EDIT}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      collector,
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-stone-200
                                    bg-white
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
                                    dark:bg-stone-800
                                    dark:text-stone-300
                                  "
                                >
                                  Editar
                                </button>
                              </Permission>

                              {collector.activo && (
                                <Permission permission={PERMISSIONS.COLLECTORS_DELETE}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeactivate(
                                        collector.id,
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
                                    Desactivar
                                  </button>
                                </Permission>
                              )}
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

          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={
              setPage
            }
          />
        </>
      )}

      <CollectorModal
        isOpen={modalOpen}
        title={
          modalMode === "create"
            ? "Nuevo cobrador"
            : "Editar cobrador"
        }
        initialData={
          selectedCollector
        }
        onSubmit={
          handleSaveCollector
        }
        onClose={closeModal}
        isLoading={
          isModalLoading
        }
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  type,
}) {
  const valueClass =
    type === "active"
      ? `
        text-emerald-600
        dark:text-emerald-400
      `
      : type === "inactive"
        ? `
          text-red-500
          dark:text-red-400
        `
        : `
          text-stone-900
          dark:text-white
        `;

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
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
}

function Avatar({
  collector,
}) {
  const nombre =
    collector.nombre?.trim() ||
    "";

  const apellido =
    collector.apellido?.trim() ||
    "";

  const initials = `${
    nombre.charAt(0)
  }${apellido.charAt(0)}`.toUpperCase();

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
      {initials || "C"}
    </div>
  );
}

function StatusBadge({
  active,
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
          active
            ? `
              border-emerald-200
              bg-emerald-50
              text-emerald-700
              dark:border-emerald-900
              dark:bg-emerald-950/40
              dark:text-emerald-300
            `
            : `
              border-red-200
              bg-red-50
              text-red-600
              dark:border-red-900
              dark:bg-red-950/40
              dark:text-red-300
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
            active
              ? "bg-emerald-500"
              : "bg-red-500"
          }
        `}
      />

      {active
        ? "Activo"
        : "Inactivo"}
    </span>
  );
}

function CollectorCard({
  collector,
  onEdit,
  onDeactivate,
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
            min-w-0
            items-center
            gap-3
          "
        >
          <Avatar
            collector={collector}
          />

          <div className="min-w-0">
            <p
              className="
                truncate
                font-bold
                text-stone-800
                dark:text-white
              "
            >
              {collector.apellido},{" "}
              {collector.nombre}
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              DNI{" "}
              {collector.dni || "-"}
            </p>
          </div>
        </div>

        <StatusBadge
          active={
            collector.activo
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
            collector.celular ||
            "-"
          }
        />

        <Info
          label="Zona"
          value={
            collector.zone
              ?.nombre ||
            "Sin zona"
          }
        />

        <div className="col-span-2">
          <Info
            label="Supervisor"
            value={
              collector.supervisor
                ? `${collector.supervisor.apellido || ""}, ${collector.supervisor.nombre || ""}`
                : "-"
            }
          />
        </div>
      </div>

      <div
        className="
          mt-4
          flex
          gap-2
        "
      >
        <Permission permission={PERMISSIONS.COLLECTORS_EDIT}>
          <button
            type="button"
            onClick={() =>
              onEdit(collector)
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

        {collector.activo && (
          <Permission permission={PERMISSIONS.COLLECTORS_DELETE}>
            <button
              type="button"
              onClick={() =>
                onDeactivate(
                  collector.id,
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
              Desactivar
            </button>
          </Permission>
        )}
      </div>
    </article>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div>
      <p
        className="
          text-xs
          text-stone-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
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

function CollectorsLoading() {
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

function EmptyCollectors() {
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
        👤
      </div>

      <p
        className="
          mt-3
          font-semibold
          text-stone-700
          dark:text-stone-200
        "
      >
        No se encontraron cobradores
      </p>

      <p
        className="
          mt-1
          text-sm
          text-stone-400
        "
      >
        Probá modificando la búsqueda.
      </p>
    </div>
  );
}