import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ZonaMultiSelect from "./ZonaMultiSelect";
import { zoneService } from "../services/zoneService";
import { dashboardService } from "../services/dashboardService";

const money = (value) =>
  Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

function ChartCard({ title, subtitle, children }) {
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
      <h3
        className="
          text-sm
          font-semibold
          text-stone-800
          dark:text-stone-100
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-0.5
          text-xs
          text-stone-500
          dark:text-stone-400
        "
      >
        {subtitle}
      </p>

      <div className="mt-4 h-72 w-full">{children}</div>
    </div>
  );
}

export default function DashboardZonasSection() {
  const [zonas, setZonas] = useState([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    zoneService
      .list()
      .then((data) => setZonas(data || []))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        const data = await dashboardService.zonasResumen(
          selectedZoneIds,
        );

        setDatos(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [selectedZoneIds]);

  const datosMontos = useMemo(
    () =>
      datos.map((zona) => ({
        zona: zona.zona,
        Cobrado: zona.cobrado,
        Pendiente: zona.saldoPendiente,
      })),
    [datos],
  );

  const datosEstados = useMemo(
    () =>
      datos.map((zona) => ({
        zona: zona.zona,
        "En curso": zona.enCurso,
        Finalizados: zona.finalizados,
        Nuevos: zona.nuevos,
      })),
    [datos],
  );

  const datosCobranza = useMemo(
    () =>
      datos.map((zona) => ({
        zona: zona.zona,
        "% Cobranza": zona.porcentajeCobranza,
      })),
    [datos],
  );

  return (
    <section className="space-y-4">
      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-stone-200
          bg-white
          p-4
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-5
          dark:border-stone-700
          dark:bg-stone-900
        "
      >
        <div>
          <h2
            className="
              text-lg
              font-bold
              text-stone-900
              dark:text-white
            "
          >
            Gráficos por zona
          </h2>

          <p
            className="
              mt-0.5
              text-sm
              text-stone-500
              dark:text-stone-400
            "
          >
            Montos, créditos y % de cobranza segregados por zona.
          </p>
        </div>

        <div className="sm:w-64">
          <ZonaMultiSelect
            zonas={zonas}
            selectedZoneIds={selectedZoneIds}
            onChange={setSelectedZoneIds}
          />
        </div>
      </div>

      {!loading && datos.length === 0 ? (
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
          No hay zonas para mostrar.
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-4
            xl:grid-cols-3
          "
        >
          <ChartCard
            title="Cobrado vs. pendiente"
            subtitle="Montos por zona"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosMontos}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="zona" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => money(value)}
                />
                <Tooltip formatter={(value) => `$ ${money(value)}`} />
                <Legend />
                <Bar dataKey="Cobrado" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar
                  dataKey="Pendiente"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Créditos por estado"
            subtitle="Cantidad por zona"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosEstados}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="zona" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="En curso"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Finalizados"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="Nuevos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="% Cobranza"
            subtitle="Promedio ponderado por cliente, hoy"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosCobranza}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="zona" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) =>
                    value == null ? "Sin datos" : `${value}%`
                  }
                />
                <Bar
                  dataKey="% Cobranza"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </section>
  );
}
