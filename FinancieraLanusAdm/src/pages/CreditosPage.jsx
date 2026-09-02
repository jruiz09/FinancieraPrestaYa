import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import CreditosTable from "../components/CreditosTable";
import Permission from "../components/Permission";
import ZonaMultiSelect from "../components/ZonaMultiSelect";
import { PERMISSIONS } from "../constants/permissions";

import {
  creditoService,
} from "../services/creditoService";

import { zoneService } from "../services/zoneService";

const ZONA_FILTRO_STORAGE_KEY = "creditos_zona_filtro";

const cargarZonaIdsGuardadas = () => {
  try {
    const stored = localStorage.getItem(
      ZONA_FILTRO_STORAGE_KEY,
    );

    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export default function CreditosPage() {
  const navigate = useNavigate();

  const [creditos, setCreditos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [zonas, setZonas] = useState([]);

  const [selectedZoneIds, setSelectedZoneIds] =
    useState(cargarZonaIdsGuardadas);

  const [resumen, setResumen] = useState({
    total: 0,
    enCurso: 0,
    finalizados: 0,
    nuevos: 0,
  });

  useEffect(() => {
    zoneService
      .list()
      .then((data) => setZonas(data || []))
      .catch((error) => console.error(error));
  }, []);

  const handleZoneChange = (zoneIds) => {
    setSelectedZoneIds(zoneIds);

    localStorage.setItem(
      ZONA_FILTRO_STORAGE_KEY,
      JSON.stringify(zoneIds),
    );
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const data = await creditoService.list(
        1,
        100,
        selectedZoneIds,
      );

      setCreditos(
        data.creditos || [],
      );

      setResumen(
        data.resumen || {
          total: 0,
          enCurso: 0,
          finalizados: 0,
          nuevos: 0,
        },
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZoneIds]);

  const creditosFiltrados = useMemo(() => {
    const termino = search
      .trim()
      .toLowerCase();

    if (!termino) {
      return creditos;
    }

    return creditos.filter((credito) => {
      const texto = `
        ${credito.id || ""}
        ${credito.numeroCredito || ""}
        ${credito.cliente?.nombre || ""}
        ${credito.cliente?.apellido || ""}
        ${credito.cobrador?.nombre || ""}
        ${credito.cobrador?.apellido || ""}
        ${credito.tipoPlan?.descripcion || ""}
        ${credito.estado || ""}
      `.toLowerCase();

      return texto.includes(termino);
    });
  }, [creditos, search]);

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
        {/* decoración */}
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

              Gestión financiera
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
              Créditos
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
              Consultá, administrá y seguí el estado
              de todos los créditos.
            </p>
          </div>

          <Permission permission={PERMISSIONS.CREDITS_CREATE}>
            <button
              type="button"
              onClick={() =>
                navigate("/nuevocredito")
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
                duration-200
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-md
                active:translate-y-0
                dark:bg-amber-500
                dark:text-stone-950
                dark:hover:bg-amber-400
              "
            >
              <span className="text-xl leading-none">
                +
              </span>

              Nuevo crédito
            </button>
          </Permission>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section
        className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
          lg:gap-4
        "
      >
        <MetricCard
          label="Total créditos"
          value={resumen.total}
          icon="▣"
          color="stone"
        />

        <MetricCard
          label="En curso"
          value={resumen.enCurso}
          icon="↗"
          color="emerald"
        />

        <MetricCard
          label="Finalizados"
          value={resumen.finalizados}
          icon="✓"
          color="amber"
        />

        <MetricCard
          label="Nuevos"
          value={resumen.nuevos}
          icon="+"
          color="blue"
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
            md:items-center
            md:justify-between
          "
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="buscar-credito"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-stone-700
                dark:text-stone-300
              "
            >
              Buscar crédito
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
                id="buscar-credito"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cliente, cobrador, plan o número..."
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
                  dark:focus:bg-stone-800
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
                    transition
                    hover:text-stone-700
                    dark:hover:text-stone-200
                  "
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="md:w-64">
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-stone-700
                dark:text-stone-300
              "
            >
              Zona
            </label>

            <ZonaMultiSelect
              zonas={zonas}
              selectedZoneIds={selectedZoneIds}
              onChange={handleZoneChange}
            />
          </div>

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              md:justify-end
              md:self-end
              md:pb-3
            "
          >
            <span
              className="
                text-sm
                text-stone-500
                dark:text-stone-400
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
              {creditosFiltrados.length}
            </span>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <section>
        {loading ? (
          <LoadingState />
        ) : (
          <CreditosTable
            creditos={creditosFiltrados}
          />
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}) {
  const colors = {
    stone: {
      icon: `
        bg-stone-100
        text-stone-700
        dark:bg-stone-800
        dark:text-stone-200
      `,
      value: `
        text-stone-900
        dark:text-white
      `,
    },

    emerald: {
      icon: `
        bg-emerald-50
        text-emerald-600
        dark:bg-emerald-950/40
        dark:text-emerald-400
      `,
      value: `
        text-emerald-600
        dark:text-emerald-400
      `,
    },

    amber: {
      icon: `
        bg-amber-50
        text-amber-600
        dark:bg-amber-950/40
        dark:text-amber-400
      `,
      value: `
        text-amber-600
        dark:text-amber-400
      `,
    },

    blue: {
      icon: `
        bg-blue-50
        text-blue-600
        dark:bg-blue-950/40
        dark:text-blue-400
      `,
      value: `
        text-blue-600
        dark:text-blue-400
      `,
    },
  };

  const current =
    colors[color] || colors.stone;

  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-stone-200
        bg-white
        p-4
        shadow-sm
        transition
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-5
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
              tracking-tight
              sm:text-3xl
              ${current.value}
            `}
          >
            {value}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-lg
            font-bold
            ${current.icon}
          `}
        >
          {icon}
        </div>
      </div>
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
        p-6
        shadow-sm
        dark:border-stone-700
        dark:bg-stone-900
      "
    >
      <div className="space-y-4">
        <div
          className="
            h-5
            w-40
            animate-pulse
            rounded
            bg-stone-200
            dark:bg-stone-700
          "
        />

        {[1, 2, 3, 4].map((item) => (
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
        ))}
      </div>
    </div>
  );
}