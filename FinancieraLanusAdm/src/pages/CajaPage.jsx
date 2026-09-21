import React, {
  useEffect,
  useState
} from 'react'

import toast from 'react-hot-toast'

import {
  Wallet,
  Plus,
  X,
  Banknote,
  Landmark,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react'

import ZonaMultiSelect
  from '../components/ZonaMultiSelect'

import ErrorAlert
  from '../components/ErrorAlert'

import {
  cajaService
} from '../services/cajaService'

import {
  zoneService
} from '../services/zoneService'

const hoyString = () => {

  const hoy = new Date()

  const anio = hoy.getFullYear()

  const mes =
    String(hoy.getMonth() + 1)
      .padStart(2, '0')

  const dia =
    String(hoy.getDate())
      .padStart(2, '0')

  return `${anio}-${mes}-${dia}`

}

const money = value =>
  `$ ${Number(value || 0).toLocaleString('es-AR')}`

const FORM_VACIO = {
  zoneId: '',
  tipo: 'INGRESO',
  medioPago: 'EFECTIVO',
  monto: '',
  concepto: '',
  fecha: hoyString()
}


export default function CajaPage() {

  const [zonas, setZonas] =
    useState([])

  const [selectedZoneIds, setSelectedZoneIds] =
    useState([])

  const [fechaDesde, setFechaDesde] =
    useState(hoyString())

  const [fechaHasta, setFechaHasta] =
    useState(hoyString())

  const [resumen, setResumen] =
    useState([])

  const [movimientos, setMovimientos] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [formData, setFormData] =
    useState(FORM_VACIO)

  const [guardando, setGuardando] =
    useState(false)


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

        const [resumenData, movimientosData] =
          await Promise.all([
            cajaService.resumen(fechaDesde, fechaHasta),
            cajaService.listMovimientos(
              selectedZoneIds,
              fechaDesde,
              fechaHasta
            )
          ])

        const zonasResumen =
          selectedZoneIds.length
            ? resumenData.zonas.filter(z =>
                selectedZoneIds.includes(z.zoneId)
              )
            : resumenData.zonas

        setResumen(zonasResumen)
        setMovimientos(movimientosData || [])

      } catch (error) {

        console.error(error)

        setError(
          error?.response?.data?.message ||
          'No se pudo cargar la información de caja'
        )

      } finally {

        setLoading(false)

      }

    }


  useEffect(() => {

    cargarDatos()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZoneIds, fechaDesde, fechaHasta])


  const abrirModal =
    () => {

      setFormData({
        ...FORM_VACIO,
        zoneId: selectedZoneIds[0] || ''
      })

      setShowModal(true)

    }


  const guardarMovimiento =
    async (event) => {

      event.preventDefault()

      if (!formData.zoneId) {

        toast.error('Elegí una zona')
        return
      }

      if (!Number(formData.monto) || Number(formData.monto) <= 0) {

        toast.error('El monto debe ser mayor a cero')
        return
      }

      if (!formData.concepto.trim()) {

        toast.error('Ingresá un concepto')
        return
      }

      try {

        setGuardando(true)

        await cajaService.crearMovimiento({
          ...formData,
          monto: Number(formData.monto)
        })

        setShowModal(false)

        await cargarDatos()

        toast.success('Movimiento registrado')

      } catch (error) {

        toast.error(
          error?.response?.data?.message ||
          'No se pudo registrar el movimiento'
        )

      } finally {

        setGuardando(false)

      }

    }


  const anularMovimiento =
    async (movimiento) => {

      if (
        !window.confirm(
          '¿Anular este movimiento de caja?'
        )
      ) {
        return
      }

      try {

        await cajaService.anularMovimiento(movimiento.id)

        await cargarDatos()

        toast.success('Movimiento anulado')

      } catch (error) {

        toast.error(
          error?.response?.data?.message ||
          'No se pudo anular el movimiento'
        )

      }

    }


  const totales =
    resumen.reduce(
      (acc, zona) => ({
        recaudadoEfectivo: acc.recaudadoEfectivo + Number(zona.recaudadoEfectivo || 0),
        recaudadoTransferencia: acc.recaudadoTransferencia + Number(zona.recaudadoTransferencia || 0),
        ingresosManuales: acc.ingresosManuales + Number(zona.ingresosManuales || 0),
        egresosManuales: acc.egresosManuales + Number(zona.egresosManuales || 0),
        saldoCaja: acc.saldoCaja + Number(zona.saldoCaja || 0)
      }),
      {
        recaudadoEfectivo: 0,
        recaudadoTransferencia: 0,
        ingresosManuales: 0,
        egresosManuales: 0,
        saldoCaja: 0
      }
    )


  return (

    <div className="space-y-6 pb-10">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div className="flex items-center gap-3">

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
            <Wallet className="w-5 h-5" />
          </div>

          <div>

            <h1 className="
              text-2xl
              md:text-3xl
              font-bold
              tracking-tight
              text-stone-900
            ">
              Caja
            </h1>

            <p className="text-sm text-stone-500 mt-0.5">
              Ingresos y egresos por zona, efectivo y transferencia
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={abrirModal}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            h-11
            px-5
            rounded-xl
            bg-stone-900
            text-white
            text-sm
            font-semibold
            hover:bg-stone-800
            transition
          "
        >
          <Plus className="w-4 h-4" />
          Nuevo movimiento
        </button>

      </div>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
      />

      {/* FILTROS */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        p-4
        md:p-5
        flex
        flex-col
        lg:flex-row
        lg:items-end
        gap-4
      ">

        <div className="lg:w-64">

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
            onChange={setSelectedZoneIds}
          />

        </div>

        <div>

          <label className="
            mb-1
            block
            text-xs
            font-semibold
            text-stone-500
          ">
            Desde
          </label>

          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            className="
              h-11
              px-3
              border
              border-stone-200
              rounded-xl
              bg-stone-50
              text-sm
              outline-none
              focus:bg-white
              focus:border-amber-400
              focus:ring-2
              focus:ring-amber-100
              transition
            "
          />

        </div>

        <div>

          <label className="
            mb-1
            block
            text-xs
            font-semibold
            text-stone-500
          ">
            Hasta
          </label>

          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            className="
              h-11
              px-3
              border
              border-stone-200
              rounded-xl
              bg-stone-50
              text-sm
              outline-none
              focus:bg-white
              focus:border-amber-400
              focus:ring-2
              focus:ring-amber-100
              transition
            "
          />

        </div>

      </div>

      {/* RESUMEN POR ZONA */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-5
        gap-3
        md:gap-4
      ">

        <ResumenCard
          icon={Banknote}
          label="Recaudado efectivo"
          value={money(totales.recaudadoEfectivo)}
          variant="blue"
        />

        <ResumenCard
          icon={Landmark}
          label="Recaudado transferencia"
          value={money(totales.recaudadoTransferencia)}
          variant="blue"
        />

        <ResumenCard
          icon={ArrowUpCircle}
          label="Ingresos manuales"
          value={money(totales.ingresosManuales)}
          variant="green"
        />

        <ResumenCard
          icon={ArrowDownCircle}
          label="Egresos manuales"
          value={money(totales.egresosManuales)}
          variant="red"
        />

        <ResumenCard
          icon={Wallet}
          label="Saldo de caja"
          value={money(totales.saldoCaja)}
          variant="amber"
        />

      </div>

      {/* RESUMEN DETALLADO POR ZONA */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-stone-50/80 text-stone-500">

              <tr className="border-b border-stone-200 text-xs uppercase">
                <th className="px-5 py-3 text-left">Zona</th>
                <th className="px-4 py-3 text-right">Efectivo</th>
                <th className="px-4 py-3 text-right">Transferencia</th>
                <th className="px-4 py-3 text-right">Ingresos</th>
                <th className="px-4 py-3 text-right">Egresos</th>
                <th className="px-4 py-3 text-right">Saldo</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-stone-100">

              {resumen.map(zona => (

                <tr key={zona.zoneId}>
                  <td className="px-5 py-3 font-semibold text-stone-800">
                    {zona.zona}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-600">
                    {money(zona.recaudadoEfectivo)}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-600">
                    {money(zona.recaudadoTransferencia)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700">
                    {money(zona.ingresosManuales)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-700">
                    {money(zona.egresosManuales)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">
                    {money(zona.saldoCaja)}
                  </td>
                </tr>

              ))}

              {!loading && resumen.length === 0 && (

                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-stone-400">
                    No hay datos para el rango seleccionado.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MOVIMIENTOS MANUALES */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        overflow-hidden
      ">

        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="font-bold text-stone-800">
            Movimientos manuales
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Ingresos y egresos cargados a mano
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-stone-50/80 text-stone-500">

              <tr className="border-b border-stone-200 text-xs uppercase">
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Zona</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Medio</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-stone-100">

              {movimientos.map(movimiento => (

                <tr key={movimiento.id}>
                  <td className="px-5 py-3 text-stone-600">
                    {movimiento.fecha}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {movimiento.zone?.nombre || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${movimiento.tipo === 'INGRESO'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                      }
                    `}>
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {movimiento.medioPago}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {movimiento.concepto}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {movimiento.usuario?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-stone-800">
                    {money(movimiento.monto)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => anularMovimiento(movimiento)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Anular
                    </button>
                  </td>
                </tr>

              ))}

              {!loading && movimientos.length === 0 && (

                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-stone-400">
                    No hay movimientos manuales en este rango.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL NUEVO MOVIMIENTO */}

      {showModal && (

        <div className="
          fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
        ">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="
              flex items-center justify-between px-5 py-4 border-b border-stone-100
            ">
              <h2 className="font-bold text-stone-800">
                Nuevo movimiento de caja
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarMovimiento} className="p-5 space-y-4">

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Zona
                </label>
                <select
                  value={formData.zoneId}
                  onChange={e => setFormData(prev => ({ ...prev, zoneId: e.target.value }))}
                  className="w-full h-11 px-3 border border-stone-300 rounded-xl bg-white outline-none focus:border-amber-500"
                >
                  <option value="">Elegí una zona...</option>
                  {zonas.map(zona => (
                    <option key={zona.id} value={zona.id}>
                      {zona.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full h-11 px-3 border border-stone-300 rounded-xl bg-white outline-none focus:border-amber-500"
                  >
                    <option value="INGRESO">Ingreso</option>
                    <option value="EGRESO">Egreso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Medio de pago
                  </label>
                  <select
                    value={formData.medioPago}
                    onChange={e => setFormData(prev => ({ ...prev, medioPago: e.target.value }))}
                    className="w-full h-11 px-3 border border-stone-300 rounded-xl bg-white outline-none focus:border-amber-500"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monto}
                  onChange={e => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                  placeholder="0"
                  className="w-full h-11 px-3 border border-stone-300 rounded-xl bg-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Concepto
                </label>
                <input
                  type="text"
                  value={formData.concepto}
                  onChange={e => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
                  placeholder="Ej: Pago de alquiler, gasto de combustible..."
                  className="w-full h-11 px-3 border border-stone-300 rounded-xl bg-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full h-11 px-3 border border-stone-300 rounded-xl bg-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Registrar'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )

}


function ResumenCard({ icon: Icon, label, value, variant }) {

  const styles = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return (

    <div className={`
      rounded-2xl border p-4 shadow-sm ${styles[variant] || styles.blue}
    `}>

      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="text-xl font-bold text-stone-900">
        {value}
      </p>

    </div>

  )

}
