import React from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  formatCreditoNumber,
} from "../utils/creditoUtils";

export default function CreditosTable({
  creditos,
}) {
  const navigate = useNavigate();

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case "NUEVO":
        return {
          label: "Nuevo",
          className: `
            border-blue-200
            bg-blue-50
            text-blue-700
            dark:border-blue-900
            dark:bg-blue-950/40
            dark:text-blue-300
          `,
          dot: "bg-blue-500",
        };

      case "EN_CURSO":
        return {
          label: "En curso",
          className: `
            border-emerald-200
            bg-emerald-50
            text-emerald-700
            dark:border-emerald-900
            dark:bg-emerald-950/40
            dark:text-emerald-300
          `,
          dot: "bg-emerald-500",
        };

      case "FINALIZADO":
        return {
          label: "Finalizado",
          className: `
            border-amber-200
            bg-amber-50
            text-amber-700
            dark:border-amber-900
            dark:bg-amber-950/40
            dark:text-amber-300
          `,
          dot: "bg-amber-500",
        };

      case "CANCELADO":
        return {
          label: "Cancelado",
          className: `
            border-red-200
            bg-red-50
            text-red-700
            dark:border-red-900
            dark:bg-red-950/40
            dark:text-red-300
          `,
          dot: "bg-red-500",
        };

      default:
        return {
          label:
            estado?.replaceAll("_", " ") ||
            "Sin estado",

          className: `
            border-stone-200
            bg-stone-50
            text-stone-600
            dark:border-stone-700
            dark:bg-stone-800
            dark:text-stone-300
          `,

          dot: "bg-stone-400",
        };
    }
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      },
    );
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(
      value,
    ).toLocaleDateString("es-AR");
  };

  const getPorcentaje = (credito) => {
    const porcentaje =
      Number(credito.porcentajeAvance) || 0;

    return Math.min(
      Math.max(porcentaje, 0),
      100,
    );
  };

  if (!creditos.length) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-stone-300
          bg-white
          px-6
          py-14
          text-center
          shadow-sm
          dark:border-stone-700
          dark:bg-stone-900
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-stone-100
            text-stone-400
            dark:bg-stone-800
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-7 w-7"
          >
            <path d="M3 6h18" />
            <path d="M5 6v14h14V6" />
            <path d="M8 3h8" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
          </svg>
        </div>

        <h3
          className="
            mt-4
            font-semibold
            text-stone-800
            dark:text-stone-100
          "
        >
          No encontramos créditos
        </h3>

        <p
          className="
            mx-auto
            mt-1
            max-w-sm
            text-sm
            text-stone-500
            dark:text-stone-400
          "
        >
          Probá cambiando el término de
          búsqueda o revisá los datos ingresados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ================================= */}
      {/* MOBILE */}
      {/* ================================= */}

      <div className="space-y-3 lg:hidden">
        {creditos.map((credito) => {
          const estado =
            getEstadoConfig(
              credito.estado,
            );

          const porcentaje =
            getPorcentaje(credito);

          return (
            <article
              key={credito.id}
              onClick={() =>
                navigate(
                  `/creditos/${credito.id}`,
                )
              }
              className="
                cursor-pointer
                rounded-2xl
                border
                border-stone-200
                bg-white
                p-4
                shadow-sm
                transition
                active:scale-[0.99]
                dark:border-stone-700
                dark:bg-stone-900
              "
            >
              {/* HEADER CARD */}
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-wide
                      text-stone-400
                    "
                  >
                    Crédito
                  </p>

                  <p
                    className="
                      mt-0.5
                      font-mono
                      text-base
                      font-bold
                      text-stone-900
                      dark:text-white
                    "
                  >
                    {formatCreditoNumber(
                      credito.numeroCredito,
                    )}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-stone-400
                    "
                  >
                    {formatDate(
                      credito.fechaOtorgamiento,
                    )}
                  </p>
                </div>

                <EstadoBadge
                  estado={estado}
                />
              </div>

              {/* CLIENTE */}
              <div
                className="
                  mt-4
                  rounded-xl
                  bg-stone-50
                  p-3
                  dark:bg-stone-800/70
                "
              >
                <p
                  className="
                    text-xs
                    text-stone-400
                  "
                >
                  Cliente
                </p>

                <p
                  className="
                    truncate
                    font-semibold
                    text-stone-800
                    dark:text-stone-100
                  "
                >
                  {credito.cliente?.apellido}{" "}
                  {credito.cliente?.nombre}
                </p>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-1
                    text-xs
                    text-stone-500
                    dark:text-stone-400
                  "
                >
                  <span>
                    Cobrador:{" "}
                    {credito.cobrador?.apellido}{" "}
                    {credito.cobrador?.nombre}
                  </span>

                  {credito.tipoPlan?.descripcion && (
                    <span>
                      Plan:{" "}
                      {
                        credito.tipoPlan
                          .descripcion
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* MONTOS */}
              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-2
                "
              >
                <MobileAmount
                  label="Prestado"
                  value={formatMoney(
                    credito.montoCredito,
                  )}
                />

                <MobileAmount
                  label="Total"
                  value={formatMoney(
                    credito.montoFinal,
                  )}
                />
              </div>

              <div
                className="
                  mt-2
                  grid
                  grid-cols-2
                  gap-2
                "
              >
                <MobileAmount
                  label="Cobrado"
                  value={formatMoney(
                    credito.montoCobrado,
                  )}
                  valueClass="
                    text-emerald-600
                    dark:text-emerald-400
                  "
                />

                <MobileAmount
                  label="Saldo"
                  value={formatMoney(
                    credito.saldoPendiente,
                  )}
                  valueClass={
                    Number(
                      credito.saldoPendiente,
                    ) > 0
                      ? `
                        text-red-500
                        dark:text-red-400
                      `
                      : `
                        text-emerald-600
                        dark:text-emerald-400
                      `
                  }
                />
              </div>

              {/* AVANCE */}
              <div className="mt-5">
                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                    gap-3
                    text-xs
                  "
                >
                  <span
                    className="
                      font-medium
                      text-stone-500
                      dark:text-stone-400
                    "
                  >
                    {
                      credito.cantidadPagadas ||
                      0
                    }
                    /
                    {
                      credito.cantidadCuotas ||
                      0
                    }{" "}
                    cuotas
                  </span>

                  <span
                    className="
                      font-bold
                      text-stone-700
                      dark:text-stone-200
                    "
                  >
                    {porcentaje}%
                  </span>
                </div>

                <ProgressBar
                  porcentaje={porcentaje}
                  finalizado={
                    credito.estado ===
                    "FINALIZADO"
                  }
                />
              </div>

              {/* FOOTER */}
              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-end
                  border-t
                  border-stone-100
                  pt-3
                  dark:border-stone-800
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-sm
                    font-semibold
                    text-amber-700
                    dark:text-amber-400
                  "
                >
                  Ver detalle

                  <span aria-hidden="true">
                    →
                  </span>
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* ================================= */}
      {/* DESKTOP */}
      {/* ================================= */}

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
        {/* TABLE HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-stone-200
            px-5
            py-4
            dark:border-stone-700
          "
        >
          <div>
            <h2
              className="
                font-semibold
                text-stone-800
                dark:text-stone-100
              "
            >
              Listado de créditos
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              {creditos.length}{" "}
              {creditos.length === 1
                ? "registro"
                : "registros"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className="
              w-full
              min-w-[1200px]
              border-collapse
            "
          >
            <thead>
              <tr
                className="
                  border-b
                  border-stone-200
                  bg-stone-50/80
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-stone-500
                  dark:border-stone-700
                  dark:bg-stone-800/60
                  dark:text-stone-400
                "
              >
                <th className="px-5 py-3 text-left">
                  Crédito
                </th>

                <th className="px-4 py-3 text-left">
                  Cliente
                </th>

                <th className="px-4 py-3 text-left">
                  Plan
                </th>

                <th className="px-4 py-3 text-right">
                  Prestado
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3 text-right">
                  Cobrado
                </th>

                <th className="px-4 py-3 text-right">
                  Saldo
                </th>

                <th className="px-4 py-3 text-center">
                  Avance
                </th>

                <th className="px-4 py-3 text-center">
                  Estado
                </th>

                <th className="px-5 py-3 text-right">
                  Acción
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
              {creditos.map((credito) => {
                const estado =
                  getEstadoConfig(
                    credito.estado,
                  );

                const porcentaje =
                  getPorcentaje(credito);

                return (
                  <tr
                    key={credito.id}
                    onClick={() =>
                      navigate(
                        `/creditos/${credito.id}`,
                      )
                    }
                    className="
                      group
                      cursor-pointer
                      transition
                      duration-150
                      hover:bg-amber-50/40
                      dark:hover:bg-stone-800/60
                    "
                  >
                    {/* CRÉDITO */}
                    <td className="px-5 py-4">
                      <div
                        className="
                          font-mono
                          text-sm
                          font-bold
                          text-stone-800
                          dark:text-stone-100
                        "
                      >
                        {formatCreditoNumber(
                          credito.numeroCredito,
                        )}
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-stone-400
                        "
                      >
                        {formatDate(
                          credito.fechaOtorgamiento,
                        )}
                      </div>
                    </td>

                    {/* CLIENTE */}
                    <td className="px-4 py-4">
                      <div
                        className="
                          max-w-[190px]
                          truncate
                          text-sm
                          font-semibold
                          text-stone-800
                          dark:text-stone-100
                        "
                      >
                        {credito.cliente?.apellido}{" "}
                        {credito.cliente?.nombre}
                      </div>

                      <div
                        className="
                          mt-1
                          max-w-[190px]
                          truncate
                          text-xs
                          text-stone-400
                        "
                      >
                        Cobrador:{" "}
                        {
                          credito.cobrador
                            ?.apellido
                        }{" "}
                        {
                          credito.cobrador
                            ?.nombre
                        }
                      </div>
                    </td>

                    {/* PLAN */}
                    <td
                      className="
                        px-4
                        py-4
                        text-sm
                        text-stone-600
                        dark:text-stone-300
                      "
                    >
                      {credito.tipoPlan
                        ?.descripcion || "-"}
                    </td>

                    {/* PRESTADO */}
                    <td
                      className="
                        whitespace-nowrap
                        px-4
                        py-4
                        text-right
                        text-sm
                        text-stone-600
                        dark:text-stone-300
                      "
                    >
                      {formatMoney(
                        credito.montoCredito,
                      )}
                    </td>

                    {/* TOTAL */}
                    <td
                      className="
                        whitespace-nowrap
                        px-4
                        py-4
                        text-right
                        text-sm
                        font-semibold
                        text-stone-800
                        dark:text-stone-100
                      "
                    >
                      {formatMoney(
                        credito.montoFinal,
                      )}
                    </td>

                    {/* COBRADO */}
                    <td
                      className="
                        whitespace-nowrap
                        px-4
                        py-4
                        text-right
                        text-sm
                        font-semibold
                        text-emerald-600
                        dark:text-emerald-400
                      "
                    >
                      {formatMoney(
                        credito.montoCobrado,
                      )}
                    </td>

                    {/* SALDO */}
                    <td
                      className={`
                        whitespace-nowrap
                        px-4
                        py-4
                        text-right
                        text-sm
                        font-bold
                        ${
                          Number(
                            credito.saldoPendiente,
                          ) > 0
                            ? `
                              text-red-500
                              dark:text-red-400
                            `
                            : `
                              text-emerald-600
                              dark:text-emerald-400
                            `
                        }
                      `}
                    >
                      {formatMoney(
                        credito.saldoPendiente,
                      )}
                    </td>

                    {/* AVANCE */}
                    <td className="px-4 py-4">
                      <div
                        className="
                          mx-auto
                          w-32
                        "
                      >
                        <div
                          className="
                            mb-1.5
                            flex
                            justify-between
                            text-[11px]
                          "
                        >
                          <span
                            className="
                              text-stone-400
                            "
                          >
                            {
                              credito.cantidadPagadas ||
                              0
                            }
                            /
                            {
                              credito.cantidadCuotas ||
                              0
                            }
                          </span>

                          <span
                            className="
                              font-bold
                              text-stone-600
                              dark:text-stone-300
                            "
                          >
                            {porcentaje}%
                          </span>
                        </div>

                        <ProgressBar
                          porcentaje={
                            porcentaje
                          }
                          finalizado={
                            credito.estado ===
                            "FINALIZADO"
                          }
                        />
                      </div>
                    </td>

                    {/* ESTADO */}
                    <td className="px-4 py-4 text-center">
                      <EstadoBadge
                        estado={estado}
                      />
                    </td>

                    {/* ACCIÓN */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `/creditos/${credito.id}`,
                          );
                        }}
                        className="
                          inline-flex
                          h-9
                          items-center
                          justify-center
                          gap-1
                          rounded-lg
                          border
                          border-stone-200
                          bg-white
                          px-3
                          text-xs
                          font-semibold
                          text-stone-700
                          shadow-sm
                          transition
                          hover:border-amber-300
                          hover:bg-amber-50
                          hover:text-amber-800
                          dark:border-stone-700
                          dark:bg-stone-800
                          dark:text-stone-200
                          dark:hover:border-amber-700
                          dark:hover:bg-amber-950/30
                          dark:hover:text-amber-300
                        "
                      >
                        Ver

                        <span
                          className="
                            transition-transform
                            group-hover:translate-x-0.5
                          "
                        >
                          →
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EstadoBadge({ estado }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        whitespace-nowrap
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-semibold
        ${estado.className}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${estado.dot}
        `}
      />

      {estado.label}
    </span>
  );
}

function ProgressBar({
  porcentaje,
  finalizado,
}) {
  return (
    <div
      className="
        h-1.5
        w-full
        overflow-hidden
        rounded-full
        bg-stone-100
        dark:bg-stone-700
      "
    >
      <div
        className={`
          h-full
          rounded-full
          transition-all
          duration-500
          ${
            finalizado
              ? "bg-amber-500"
              : "bg-emerald-500"
          }
        `}
        style={{
          width: `${porcentaje}%`,
        }}
      />
    </div>
  );
}

function MobileAmount({
  label,
  value,
  valueClass = `
    text-stone-800
    dark:text-stone-100
  `,
}) {
  return (
    <div className="min-w-0">
      <p
        className="
          text-[11px]
          text-stone-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-0.5
          truncate
          text-sm
          font-bold
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
}