import { useEffect, useState } from 'react'
import { Users, Trophy, MapPin, CircleCheck } from 'lucide-react'
import { mobileService } from '../../services/mobileService'
import SectionTitle from '../../components/SectionTitle'

export default function EquipoPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const response = await mobileService.dashboard()
      setData(response)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400">
        Cargando equipo...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="👥 Equipo"
        subtitle="Visión rápida del desempeño de tus cobradores"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-3xl p-5">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <Users size={18} />
            <span>Cobradores activos</span>
          </div>
          <p className="text-4xl font-bold">{data?.cobradoresActivos ?? 0}</p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-5">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <Trophy size={18} />
            <span>Ranking de cobro</span>
          </div>
          <div className="space-y-2">
            {data?.ranking?.length > 0 ? (
              data.ranking.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-slate-500">{item.zona || 'Sin zona'}</p>
                  </div>
                  <span className="font-bold text-cyan-300">{item.cobradoHoy}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No hay datos de ranking aun.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5">
        <div className="flex items-center gap-3 text-slate-300 mb-4">
          <MapPin size={18} />
          <span>Estado de cobradores</span>
        </div>

        <div className="space-y-3">
          {data?.team?.length > 0 ? (
            data.team.map((collector) => (
              <div
                key={collector.id}
                className="rounded-3xl border border-slate-800 p-4 bg-slate-950/80"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{collector.nombre}</p>
                    <p className="text-slate-500 text-sm">Zona: {collector.zona || 'Sin zona'}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.1em] text-cyan-300">{collector.estado}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-slate-400">
                  <div className="rounded-2xl bg-slate-800 p-3">
                    <p>Cobrado hoy</p>
                    <p className="font-semibold text-white">{collector.cobradoHoy}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800 p-3">
                    <p>Clientes pendientes</p>
                    <p className="font-semibold text-white">{collector.clientesPendientes}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800 p-3">
                    <p>Vencidas</p>
                    <p className="font-semibold text-white">{collector.vencidas}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No hay cobradores asignados aún.</div>
          )}
        </div>
      </div>
    </div>
  )
}
