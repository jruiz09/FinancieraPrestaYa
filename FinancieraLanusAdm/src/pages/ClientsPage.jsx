import React, {
  useEffect,
  useState,
} from "react";

import Pagination from "../components/Pagination";
import ErrorAlert from "../components/ErrorAlert";
import ClientModal from "../components/ClientModal";
import Permission from "../components/Permission";
import { PERMISSIONS } from "../constants/permissions";

import {
  clientService,
} from "../services/clientService";

import {
  collectorService,
} from "../services/collectorService";

import {
  useAuthStore,
} from "../store/useAuthStore";

export default function ClientsPage() {
  const ownerId = useAuthStore(
    (state) => state.ownerId,
  );

  const [clients, setClients] =
    useState([]);

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
    selectedClient,
    setSelectedClient,
  ] = useState({});

  const [
    isModalLoading,
    setIsModalLoading,
  ] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data =
        await clientService.list(
          page,
          limit,
          ownerId,
        );

      setClients(
        data.clients || [],
      );

      setTotal(
        data.total || 0,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al cargar clientes",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollectors =
    async () => {
      try {
        const data =
          await collectorService.list(
            1,
            100,
            ownerId,
          );

        setCollectors(
          data.collectors || [],
        );
      } catch (err) {
        console.error(
          "Error cargando cobradores",
          err,
        );
      }
    };

  useEffect(() => {
    if (ownerId) {
      fetchClients();
      fetchCollectors();
    }
  }, [page, ownerId]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedClient({});
    setModalOpen(true);
  };

  const openEditModal = (
    client,
  ) => {
    setModalMode("edit");
    setSelectedClient(client);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClient({});
  };

  const handleSaveClient =
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
          await clientService.create(
            payload,
          );
        } else {
          await clientService.update(
            selectedClient.id,
            payload,
          );
        }

        await fetchClients();

        closeModal();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al guardar cliente",
        );
      } finally {
        setIsModalLoading(false);
      }
    };

  const handleDeactivate =
    async (id) => {
      if (
        !window.confirm(
          "¿Desactivar este cliente?",
        )
      ) {
        return;
      }

      try {
        await clientService.deactivate(
          id,
        );

        await fetchClients();
      } catch {
        setError(
          "Error al desactivar cliente",
        );
      }
    };

  const clientesFiltrados =
    clients.filter((client) => {
      const termino =
        search
          .trim()
          .toLowerCase();

      if (!termino) {
        return true;
      }

      const texto = `
        ${client.nombre || ""}
        ${client.apellido || ""}
        ${client.dni || ""}
        ${client.celular || ""}
        ${client.direccion || ""}
        ${client.collector?.nombre || ""}
        ${client.collector?.apellido || ""}
      `.toLowerCase();

      return texto.includes(
        termino,
      );
    });

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

              Gestión comercial
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
              Clientes
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
              Administrá clientes,
              cobradores y ubicaciones.
            </p>
          </div>

          <Permission permission={PERMISSIONS.CLIENTS_CREATE}>
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

              Nuevo cliente
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

      {/* RESUMEN + BUSCADOR */}
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
              htmlFor="buscar-cliente"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-stone-700
                dark:text-stone-300
              "
            >
              Buscar cliente
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
                id="buscar-cliente"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Nombre, apellido, DNI, celular o cobrador..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-stone-200
                  bg-stone-50
                  py-3
                  pl-11
                  pr-10
                  text-sm
                  outline-none
                  transition
                  focus:border-amber-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-amber-100
                  dark:border-stone-700
                  dark:bg-stone-800
                  dark:text-white
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
              Clientes
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
              {total}
            </span>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      {isLoading ? (
        <ClientsLoading />
      ) : (
        <>
          {/* MOBILE */}
          <div
            className="
              space-y-3
              lg:hidden
            "
          >
            {clientesFiltrados.length ===
            0 ? (
              <EmptyClients />
            ) : (
              clientesFiltrados.map(
                (client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
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
                Listado de clientes
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-stone-400
                "
              >
                Información y asignación
                de cobradores
              </p>
            </div>

            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[1050px]
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
                      Cliente
                    </th>

                    <th className="px-4 py-3 text-left">
                      DNI
                    </th>

                    <th className="px-4 py-3 text-left">
                      Celular
                    </th>

                    <th className="px-4 py-3 text-left">
                      Dirección
                    </th>

                    <th className="px-4 py-3 text-left">
                      Cobrador
                    </th>

                    <th className="px-4 py-3 text-center">
                      Mapa
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
                  {clientesFiltrados.length ===
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
                        clientes.
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.map(
                      (client) => (
                        <tr
                          key={
                            client.id
                          }
                          className="
                            transition
                            hover:bg-amber-50/40
                            dark:hover:bg-stone-800/60
                          "
                        >
                          <td className="px-5 py-4">
                            <div
                              className="
                                font-semibold
                                text-stone-800
                                dark:text-stone-100
                              "
                            >
                              {
                                client.apellido
                              }
                              ,{" "}
                              {
                                client.nombre
                              }
                            </div>

                            <div
                              className="
                                mt-1
                                text-xs
                                text-stone-400
                              "
                            >
                              Cliente
                            </div>
                          </td>

                          <td
                            className="
                              px-4
                              py-4
                              font-medium
                              text-stone-600
                              dark:text-stone-300
                            "
                          >
                            {client.dni ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {client.celular ? (
                              <a
                                href={`tel:${client.celular}`}
                                className="
                                  text-stone-600
                                  hover:text-amber-700
                                  dark:text-stone-300
                                "
                              >
                                {
                                  client.celular
                                }
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div
                              className="
                                max-w-[230px]
                                truncate
                                text-stone-600
                                dark:text-stone-300
                              "
                              title={
                                client.direccion
                              }
                            >
                              {client.direccion ||
                                "-"}
                            </div>
                          </td>

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
                              {client
                                .collector
                                ? `${client.collector.apellido || ""}, ${client.collector.nombre || ""}`
                                : "Sin asignar"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {client.latitud &&
                            client.longitud ? (
                              <a
                                href={`https://www.google.com/maps?q=${client.latitud},${client.longitud}`}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                  inline-flex
                                  h-9
                                  items-center
                                  justify-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-stone-200
                                  bg-white
                                  px-3
                                  text-xs
                                  font-semibold
                                  text-stone-600
                                  transition
                                  hover:border-amber-300
                                  hover:bg-amber-50
                                  hover:text-amber-700
                                  dark:border-stone-700
                                  dark:bg-stone-800
                                "
                              >
                                📍 Mapa
                              </a>
                            ) : (
                              <span
                                className="
                                  text-xs
                                  text-stone-400
                                "
                              >
                                Sin ubicación
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >
                              <Permission permission={PERMISSIONS.CLIENTS_EDIT}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      client,
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

                              <Permission permission={PERMISSIONS.CLIENTS_DELETE}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeactivate(
                                      client.id,
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

      <ClientModal
        isOpen={modalOpen}
        title={
          modalMode === "create"
            ? "Nuevo cliente"
            : "Editar cliente"
        }
        initialData={
          selectedClient
        }
        collectors={collectors}
        onSubmit={
          handleSaveClient
        }
        onClose={closeModal}
        isLoading={
          isModalLoading
        }
      />
    </div>
  );
}

function ClientCard({
  client,
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
        <div>
          <p
            className="
              font-bold
              text-stone-800
              dark:text-white
            "
          >
            {client.apellido},{" "}
            {client.nombre}
          </p>

          <p
            className="
              mt-1
              text-sm
              text-stone-400
            "
          >
            DNI {client.dni || "-"}
          </p>
        </div>

        {client.latitud &&
          client.longitud && (
            <a
              href={`https://www.google.com/maps?q=${client.latitud},${client.longitud}`}
              target="_blank"
              rel="noreferrer"
              className="
                rounded-lg
                bg-amber-50
                px-3
                py-2
                text-xs
                font-semibold
                text-amber-700
              "
            >
              📍 Mapa
            </a>
          )}
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
        <div>
          <p className="text-xs text-stone-400">
            Celular
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
            {client.celular ||
              "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-stone-400">
            Cobrador
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
            {client.collector
              ? `${client.collector.apellido || ""}, ${client.collector.nombre || ""}`
              : "-"}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-stone-400">
            Dirección
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
            {client.direccion ||
              "-"}
          </p>
        </div>
      </div>

      <div
        className="
          mt-4
          flex
          gap-2
        "
      >
        <Permission permission={PERMISSIONS.CLIENTS_EDIT}>
          <button
            type="button"
            onClick={() =>
              onEdit(client)
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

        <Permission permission={PERMISSIONS.CLIENTS_DELETE}>
          <button
            type="button"
            onClick={() =>
              onDeactivate(
                client.id,
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
      </div>
    </article>
  );
}

function ClientsLoading() {
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

function EmptyClients() {
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
        No se encontraron clientes
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