import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, CheckCircle2, Clock3 } from 'lucide-react'
import { mobileService } from '../../services/mobileService'
import SectionTitle from '../../components/SectionTitle'
import Money from '../../components/Money'

export default function IndicadoresPage() {
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
      <div className="text-center py-20 text-slate-400">Cargando indicadores...</div>
    )
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="📊 Indicadores"
        subtitle="Métricas clave para tu equipo"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-3xl p-5">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <DollarSign size={18} />
            <span>Cobrado hoy</span>
          </div>
          <Money value={data?.cobradoHoy ?? 0} className="text-4xl font-bold" />
        </div>
        <div className="bg-slate-900 rounded-3xl p-5">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <Clock3 size={18} />
            <span>Clientes visitados hoy</span>
          </div>
          <h2 className="text-4xl font-bold">{data?.clientesVisitadosHoy ?? 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-3xl p-5">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <TrendingUp size={18} />
            <span>Efectividad</span>
          </div>
          <h2 className="text-4xl font-bold">{data?.efectividad ?? 0}%</h2>
        </div>
        <div className="bg-slate-900 rounded-3xl p-5">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <CheckCircle2 size={18} />
            <span>Cuotas cobradas</span>
          </div>
          <h2 className="text-4xl font-bold">{data?.cuotasCobradas ?? 0}</h2>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5">
        <p className="text-slate-400 text-sm">Pendiente de cobro</p>
        <Money value={data?.pendienteCobro ?? 0} className="text-4xl font-bold mt-3" />
      </div>
    </div>
  )
}
