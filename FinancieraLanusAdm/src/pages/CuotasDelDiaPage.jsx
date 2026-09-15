import React, {
  useEffect,
  useState
} from 'react'

import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  WalletCards
} from 'lucide-react'

import CuotasTable
  from '../components/CuotasTable'

import ZonaMultiSelect
  from '../components/ZonaMultiSelect'

import {
  cuotaService
} from '../services/cuotaService'

import {
  zoneService
} from '../services/zoneService'

const CUOTAS_POR_PAGINA = 50

const ZONA_FILTRO_STORAGE_KEY = 'cuotas_del_dia_zona_filtro'

const cargarZonaIdsGuardadas = () => {
  try {
    const stored = localStorage.getItem(
      ZONA_FILTRO_STORAGE_KEY
    )

    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

const obtenerFechaHoy = () => {

  const hoy = new Date()

  const yyyy = hoy.getFullYear()

  const mm = String(
    hoy.getMonth() + 1
  ).padStart(2, '0')

  const dd = String(
    hoy.getDate()
  ).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`

}

const formatMoneda = (valor) =>
  Number(valor || 0).toLocaleString(
    'es-AR',
    {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }
  )


export default function CuotasDelDiaPage() {

  const hoy = obtenerFechaHoy()

  const [
    cuotas,
    setCuotas
  ] = useState([])

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    error,
    setError
  ] = useState('')

  const [
    total,
    setTotal
  ] = useState(0)

  const [
    counts,
    setCounts
  ] = useState({})

  const [
    totales,
    setTotales
  ] = useState({ monto: 0, montoPago: 0, saldo: 0 })

  const [
    zonas,
    setZonas
  ] = useState([])

  const [
    selectedZoneIds,
    setSelectedZoneIds
  ] = useState(cargarZonaIdsGuardadas)


  useEffect(() => {

    zoneService
      .list()
      .then(data => setZonas(data || []))
      .catch(error => console.error(error))

  }, [])


  const cargarDatos =
    async () => {

      try {

        setLoading(true)
        setError('')

        const data =
          await cuotaService.list(
            'TODAS',
            1,
            CUOTAS_POR_PAGINA,
            selectedZoneIds,
            hoy,
            hoy
          )

        setCuotas(
          data.cuotas || []
        )

        setTotal(
          data.total || 0
        )

        setCounts(
          data.counts || {}
        )

        setTotales(
          data.totales || {
            monto: 0,
            montoPago: 0,
            saldo: 0
          }
        )

      } catch (error) {

        console.error(error)

        setError(
          error?.response
            ?.data
            ?.message ||
          'No se pudieron cargar las cuotas del día'
        )

      } finally {

        setLoading(false)

      }

    }


  useEffect(() => {

    cargarDatos()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZoneIds])


  const handleZoneChange =
    (zoneIds) => {

      setSelectedZoneIds(zoneIds)

      localStorage.setItem(
        ZONA_FILTRO_STORAGE_KEY,
        JSON.stringify(zoneIds)
      )

    }


  const pendientes =
    (counts.PENDIENTE || 0) +
    (counts.PARCIAL || 0) +
    (counts.VENCIDA || 0)

  const pagadas =
    counts.PAGADA || 0


  return (

    <div className="
      space-y-6
      pb-8
    ">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-end
        lg:justify-between
        gap-4
      ">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            w-11
            h-11
            rounded-2xl
            bg-amber-100
            text-amber-700
            flex
            items-center
            justify-center
          ">

            <CalendarCheck2
              className="
                w-5
                h-5
              "
            />

          </div>

          <div>

            <h1 className="
              text-2xl
              md:text-3xl
              font-bold
              tracking-tight
              text-stone-900
            ">
              Cuotas del día
            </h1>

            <p className="
              text-sm
              text-stone-500
              mt-0.5
            ">
              Cuotas que vencen hoy
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={
            cargarDatos
          }
          disabled={
            loading
          }
          className="
            h-10
            px-4
            self-start
            lg:self-auto
            inline-flex
            items-center
            justify-center
            gap-2
            bg-white
            border
            border-stone-200
            rounded-xl
            text-sm
            font-semibold
            text-stone-600
            hover:bg-stone-50
            hover:text-stone-900
            disabled:opacity-50
            transition
          "
        >

          <RefreshCw
            className={`
              w-4
              h-4

              ${
                loading
                  ? 'animate-spin'
                  : ''
              }
            `}
          />

          Actualizar

        </button>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="
          flex
          items-start
          gap-3
          bg-red-50
          border
          border-red-200
          rounded-xl
          px-4
          py-3
        ">

          <AlertTriangle
            className="
              w-5
              h-5
              text-red-600
              shrink-0
              mt-0.5
            "
          />

          <div>

            <p className="
              text-sm
              font-bold
              text-red-800
            ">
              No pudimos cargar las cuotas del día
            </p>

            <p className="
              text-sm
              text-red-600
              mt-0.5
            ">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ================================================= */}
      {/* METRICAS */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-2
        xl:grid-cols-4
        gap-3
        md:gap-4
      ">

        <StatusCard
          icon={WalletCards}
          label="Cuotas de hoy"
          value={total}
          description="Vencen en la fecha"
          variant="amber"
        />

        <StatusCard
          icon={CreditCard}
          label="Por cobrar"
          value={formatMoneda(totales.saldo)}
          description="Saldo pendiente de hoy"
          variant="blue"
        />

        <StatusCard
          icon={Clock3}
          label="Sin cobrar"
          value={pendientes}
          description="Pendientes, parciales o vencidas"
          variant="red"
        />

        <StatusCard
          icon={CheckCircle2}
          label="Cobradas"
          value={pagadas}
          description="Ya saldadas hoy"
          variant="green"
        />

      </div>


      {/* ================================================= */}
      {/* FILTRO DE ZONA */}
      {/* ================================================= */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        p-4
        md:p-5
      ">

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          gap-4
        ">

          <div className="sm:w-64">

            <label className="
              mb-1
              block
              text-xs
              font-semibold
              text-stone-500
            ">
              Zona
            </label>

            <ZonaMultiSelect
              zonas={zonas}
              selectedZoneIds={selectedZoneIds}
              onChange={handleZoneChange}
            />

          </div>

          <p className="
            text-xs
            sm:text-sm
            text-stone-500
          ">

            Mostrando

            {' '}

            <span className="
              font-bold
              text-stone-800
            ">
              {cuotas.length}
            </span>

            {' '}

            {cuotas.length === 1
              ? 'cuota'
              : 'cuotas'
            }

            {' '}
            que vencen hoy

          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* TABLA */}
      {/* ================================================= */}

      <CuotasTable
        cuotas={
          cuotas
        }
        loading={
          loading
        }
        onReload={
          cargarDatos
        }
      />

    </div>

  )

}


/* ===================================================== */
/* STATUS CARD */
/* ===================================================== */

function StatusCard({
  icon: Icon,
  label,
  value,
  description,
  variant
}) {

  const styles = {

    blue: {
      border:
        'border-blue-200',
      icon:
        'bg-blue-100 text-blue-700',
      value:
        'text-blue-700'
    },

    amber: {
      border:
        'border-amber-200',
      icon:
        'bg-amber-100 text-amber-700',
      value:
        'text-amber-700'
    },

    red: {
      border:
        'border-red-200',
      icon:
        'bg-red-100 text-red-700',
      value:
        'text-red-700'
    },

    green: {
      border:
        'border-emerald-200',
      icon:
        'bg-emerald-100 text-emerald-700',
      value:
        'text-emerald-700'
    }

  }


  const current =
    styles[variant]


  return (

    <div className={`
      bg-white
      border
      rounded-2xl
      p-4
      md:p-5
      shadow-sm
      ${current.border}
    `}>

      <div className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div>

          <p className="
            text-xs
            md:text-sm
            font-semibold
            text-stone-500
          ">
            {label}
          </p>

          <p className={`
            text-xl
            md:text-2xl
            font-bold
            mt-1
            ${current.value}
          `}>
            {value}
          </p>

        </div>


        <div className={`
          w-9
          h-9
          md:w-10
          md:h-10
          rounded-xl
          flex
          items-center
          justify-center
          shrink-0
          ${current.icon}
        `}>

          <Icon
            className="
              w-4
              h-4
              md:w-5
              md:h-5
            "
          />

        </div>

      </div>


      <p className="
        hidden
        sm:block
        text-xs
        text-stone-400
        mt-2
      ">
        {description}
      </p>

    </div>

  )

}
