import { useEffect, useState } from 'react'

import {
  LogOut,
  DollarSign,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wallet,
  ChevronRight
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/useAuthStore'
import { mobileService } from '../../services/mobileService'
import Money from '../../components/Money'

export default function PerfilPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const response = await mobileService.perfil()
      setData(response)
    } finally {
      setLoading(false)
    }
  }

  const cerrarSesion = () => {
    logout()
    window.location.href = '/login'
  }

  const nombreRol = {
    COBRADOR: 'Cobrador',
    SUPERVISOR: 'Supervisor',
    ADMIN: 'Administrador'
  }

  if (loading) {
    return (
      <div className="text-center py-20">Cargando...</div>
    )
  }

  const iniciales = data.nombre
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 rounded-3xl p-6 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-cyan-600 flex items-center justify-center text-3xl font-bold">
          {iniciales}
        </div>

        <h2 className="mt-4 text-2xl font-bold">{data.nombre}</h2>

        <p className="text-cyan-400">
          {nombreRol[data?.rol?.name || data?.rol] || data?.rol}
        </p>
      </div>

      <div className="bg-cyan-600 rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <DollarSign />
          <span>Cobrado hoy</span>
        </div>

        <Money value={data.cobradoHoy} className="mt-4 text-4xl font-bold" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-400" />
            <span>Cuotas cobradas</span>
          </div>

          <h3 className="mt-3 text-3xl font-bold">{data.cuotasCobradas}</h3>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Clock3 className="text-yellow-400" />
            <span>Pendientes</span>
          </div>

          <h3 className="mt-3 text-3xl font-bold">{data.cuotasPendientes}</h3>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" />
            <span>Vencidas</span>
          </div>

          <h3 className="mt-3 text-3xl font-bold">{data.cuotasVencidas}</h3>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-cyan-400" />
            <span>Efectividad</span>
          </div>

          <h3 className="mt-3 text-3xl font-bold">{data.efectividad}%</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5">
        <p className="text-sm text-slate-400">Pendiente de cobrar</p>
        <Money value={data.pendienteCobro} className="mt-3 text-3xl font-bold" />
      </div>

      <button
        onClick={() => navigate('/vales')}
        className="w-full bg-slate-900 rounded-2xl p-5 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <Wallet className="text-cyan-400" />
          <span className="font-semibold">Mis Vales</span>
        </div>
        <ChevronRight className="text-slate-500" />
      </button>

      <button
        onClick={cerrarSesion}
        className="w-full bg-red-600 rounded-2xl py-4 font-semibold flex justify-center items-center gap-2"
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </div>
  )
}
