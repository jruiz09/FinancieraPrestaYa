import { useState } from 'react'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle
} from 'lucide-react'

import ErrorAlert
  from '../components/ErrorAlert'

import CalculadoManualCell, { inputClass }
  from '../components/CalculadoManualCell'

import { informeDiarioService }
  from '../services/informeDiarioService'

const DIAS_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const money = value =>
  value == null
    ? '-'
    : `$ ${Number(value).toLocaleString('es-AR')}`

const parseFechaLocal = fecha => {

  const [anio, mes, dia] = fecha.split('-').map(Number)

  return new Date(anio, mes - 1, dia)
}

const formatFechaLocal = date => {

  const anio = date.getFullYear()

  const mes =
    String(date.getMonth() + 1)
      .padStart(2, '0')

  const dia =
    String(date.getDate())
      .padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

const sumarDias = (fecha, dias) => {

  const date = parseFechaLocal(fecha)

  date.setDate(date.getDate() + dias)

  return formatFechaLocal(date)
}

const lunesDeLaSemana = fecha => {

  const date = parseFechaLocal(fecha)

  const diaSemana = date.getDay()

  const offset =
    diaSemana === 0
      ? -6
      : 1 - diaSemana

  date.setDate(date.getDate() + offset)

  return formatFechaLocal(date)
}

const formatFechaCorta = fecha => {

  const [, mes, dia] = fecha.split('-')

  return `${dia}/${mes}`
}

export default function InformeSemanalPage() {

  const [lunes, setLunes] =
    useState(null)

  const [zonas, setZonas] =
    useState([])

  const [edits, setEdits] =
    useState({})

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [zonaAbierta, setZonaAbierta] =
    useState(null)

  const [guardandoZona, setGuardandoZona] =
    useState(null)

  const [resultadosGuardado, setResultadosGuardado] =
    useState({})

  const cargarSemana =
    async (nuevoLunes) => {

      try {

        setLoading(true)
        setError('')

        const data =
          await informeDiarioService.obtenerSemanal(nuevoLunes)

        setZonas(data.zonas || [])

        const nuevosEdits = {}

        for (const zona of data.zonas || []) {

          nuevosEdits[zona.zoneId] = {}

          for (const dia of zona.dias) {

            nuevosEdits[zona.zoneId][dia.fecha] = {
              entregas: dia.entregas,
              ecu: dia.ecu,
              pr: dia.pr,
              mp: dia.mp,
              deja: dia.deja
            }
          }
        }

        setEdits(nuevosEdits)

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Error cargando el informe semanal'
        )

      } finally {

        setLoading(false)

      }

    }

  const irASemana = (nuevoLunes) => {

    setLunes(nuevoLunes)
    setZonaAbierta(null)
    setResultadosGuardado({})
    cargarSemana(nuevoLunes)

  }

  const handleSeleccionarFecha = (e) => {

    if (!e.target.value) return

    irASemana(lunesDeLaSemana(e.target.value))

  }

  const semanaAnterior = () => {

    if (!lunes) return

    irASemana(sumarDias(lunes, -7))

  }

  const semanaSiguiente = () => {

    if (!lunes) return

    irASemana(sumarDias(lunes, 7))

  }

  const handleChangeDia = (zoneId, fecha, campo, valor) => {

    setEdits(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [fecha]: {
          ...prev[zoneId]?.[fecha],
          [campo]: valor
        }
      }
    }))

  }

  const toggleZona = (zoneId) => {

    setZonaAbierta(prev =>
      prev === zoneId
        ? null
        : zoneId
    )

  }

  const handleRevertirDia = async (zoneId, fecha, campoOverride) => {

    try {

      await informeDiarioService.guardar({
        zoneId,
        fecha,
        [campoOverride]: null
      })

      await cargarSemana(lunes)

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Error revirtiendo el valor calculado'
      )

    }

  }

  const handleGuardarSemana = async (zona) => {

    try {

      setGuardandoZona(zona.zoneId)

      const diasEditados = zona.dias

      const resultados = await Promise.allSettled(
        diasEditados.map(dia => {

          const valores = edits[zona.zoneId]?.[dia.fecha] || {}

          return informeDiarioService.guardar({
            zoneId: zona.zoneId,
            fecha: dia.fecha,
            pr: valores.pr,
            mp: valores.mp,
            deja: valores.deja,
            entregasOverride: valores.entregas,
            ecuOverride: valores.ecu
          })

        })
      )

      const detalle = diasEditados.map((dia, i) => ({
        fecha: dia.fecha,
        ok: resultados[i].status === 'fulfilled',
        mensaje:
          resultados[i].status === 'rejected'
            ? (
                resultados[i].reason?.response?.data?.message ||
                'Error desconocido'
              )
            : null
      }))

      setResultadosGuardado(prev => ({
        ...prev,
        [zona.zoneId]: detalle
      }))

      await cargarSemana(lunes)

    } finally {

      setGuardandoZona(null)

    }

  }

  return (

    <div className="space-y-6 pb-10">

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-stone-900
              md:text-3xl
            "
          >
            Informe semanal por zona
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-stone-500
            "
          >
            Agrupa el informe diario de Lunes a Viernes.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            type="button"
            onClick={semanaAnterior}
            disabled={!lunes || loading}
            title="Semana anterior"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-stone-200
              bg-white
              text-stone-600
              transition
              hover:bg-stone-50
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative">

            <Calendar
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-stone-400
              "
            />

            <input
              type="date"
              value={lunes || ''}
              onChange={handleSeleccionarFecha}
              className="
                rounded-xl
                border
                border-stone-200
                bg-white
                py-2.5
                pl-9
                pr-3.5
                text-sm
                text-stone-900
                outline-none
                transition
                focus:border-amber-400
                focus:ring-4
                focus:ring-amber-100
              "
            />

          </div>

          <button
            type="button"
            onClick={semanaSiguiente}
            disabled={!lunes || loading}
            title="Semana siguiente"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-stone-200
              bg-white
              text-stone-600
              transition
              hover:bg-stone-50
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>

      </div>

      <ErrorAlert
        message={error}
        onDismiss={() =>
          setError('')
        }
      />

      {!lunes && (

        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-stone-300
            bg-white
            px-6
            py-16
            text-center
            shadow-sm
          "
        >
          <h3
            className="
              font-semibold
              text-stone-800
            "
          >
            Elegí una semana para ver el informe
          </h3>

          <p
            className="
              mx-auto
              mt-1
              max-w-sm
              text-sm
              text-stone-500
            "
          >
            Seleccioná cualquier día con el calendario — se
            va a mostrar la semana completa de Lunes a Viernes
            que le corresponde.
          </p>
        </div>

      )}

      {lunes && loading && (

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-14
                  animate-pulse
                  rounded-xl
                  bg-stone-100
                "
              />
            ))}
          </div>
        </div>

      )}

      {lunes && !loading && (

        <div className="space-y-3">

          {zonas.map((zona) => {

            const abierta = zonaAbierta === zona.zoneId
            const resultados = resultadosGuardado[zona.zoneId]

            return (

              <div
                key={zona.zoneId}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-stone-200
                  bg-white
                  shadow-sm
                "
              >

                {/* FILA COMPACTA */}

                <button
                  type="button"
                  onClick={() =>
                    toggleZona(zona.zoneId)
                  }
                  className="
                    flex
                    w-full
                    flex-wrap
                    items-center
                    justify-between
                    gap-4
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-stone-50
                  "
                >

                  <div className="min-w-[140px]">
                    <p className="font-bold text-stone-800">
                      {zona.zona}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      flex-1
                      flex-wrap
                      items-center
                      justify-end
                      gap-x-6
                      gap-y-2
                      text-sm
                    "
                  >

                    <TotalCompacto
                      label="A Recaudar"
                      value={money(zona.aRecaudar)}
                    />

                    <TotalCompacto
                      label="% Cobranza"
                      value={
                        zona.porcentajeCobranza == null
                          ? '-'
                          : `${zona.porcentajeCobranza}%`
                      }
                    />

                    <TotalCompacto
                      label="Recaudado"
                      value={money(zona.recaudado)}
                    />

                    <TotalCompacto
                      label="Ayuda"
                      value={money(zona.ayuda)}
                    />

                    <TotalCompacto
                      label="Ayuda A"
                      value={money(zona.ayudaA)}
                    />

                    <TotalCompacto
                      label="Vale"
                      value={money(zona.vale)}
                    />

                    <TotalCompacto
                      label="Vale Sup."
                      value={money(zona.valeSup)}
                    />

                    <TotalCompacto
                      label="Recaudación sem. sig."
                      value={money(zona.aRecaudarSemanaSig)}
                    />

                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      whitespace-nowrap
                      text-sm
                      font-semibold
                      text-amber-700
                    "
                  >
                    Editar días

                    {abierta ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>

                </button>

                {/* PANEL EXPANDIBLE */}

                {abierta && (

                  <div
                    className="
                      border-t
                      border-stone-100
                      bg-stone-50/60
                      p-5
                    "
                  >

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[720px] text-sm">

                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-stone-500">
                            <th className="px-2 py-2 text-left">Campo</th>
                            {zona.dias.map((dia, i) => (
                              <th key={dia.fecha} className="px-2 py-2 text-right">
                                {DIAS_LABEL[i]}
                                <div className="font-normal normal-case text-stone-400">
                                  {formatFechaCorta(dia.fecha)}
                                </div>
                              </th>
                            ))}
                            <th className="px-2 py-2 text-right">Total semana</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-stone-100">

                          <FilaCalculadoManual
                            label="Entregas"
                            campo="entregas"
                            campoOverride="entregasOverride"
                            zona={zona}
                            edits={edits}
                            onChangeDia={handleChangeDia}
                            onRevertirDia={handleRevertirDia}
                            total={money(zona.entregasSemanaTotal)}
                          />

                          <FilaCalculadoManual
                            label="ECU"
                            campo="ecu"
                            campoOverride="ecuOverride"
                            zona={zona}
                            edits={edits}
                            onChangeDia={handleChangeDia}
                            onRevertirDia={handleRevertirDia}
                            total={money(zona.ecuSemanaTotal)}
                          />

                          <FilaManual
                            label="PR"
                            campo="pr"
                            zona={zona}
                            edits={edits}
                            onChangeDia={handleChangeDia}
                            total={money(zona.prSemanaTotal)}
                          />

                          <FilaManual
                            label="MP"
                            campo="mp"
                            zona={zona}
                            edits={edits}
                            onChangeDia={handleChangeDia}
                            total={money(zona.mpSemanaTotal)}
                          />

                          <FilaManual
                            label="Deja"
                            campo="deja"
                            zona={zona}
                            edits={edits}
                            onChangeDia={handleChangeDia}
                            total={money(zona.dejaSemanaTotal)}
                          />

                        </tbody>

                      </table>

                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-end
                        gap-3
                      "
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleGuardarSemana(zona)
                        }
                        disabled={
                          guardandoZona === zona.zoneId
                        }
                        className="
                          rounded-lg
                          bg-stone-900
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-stone-800
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {
                          guardandoZona === zona.zoneId
                            ? 'Guardando...'
                            : 'Guardar semana'
                        }
                      </button>

                    </div>

                    {resultados && (

                      <div
                        className="
                          mt-4
                          space-y-1.5
                          rounded-xl
                          border
                          border-stone-200
                          bg-white
                          p-3
                        "
                      >

                        {resultados.map((r, i) => (

                          <div
                            key={r.fecha}
                            className="
                              flex
                              items-center
                              gap-2
                              text-xs
                            "
                          >

                            {r.ok ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
                            )}

                            <span className="font-semibold text-stone-700">
                              {DIAS_LABEL[i]} {formatFechaCorta(r.fecha)}:
                            </span>

                            <span
                              className={
                                r.ok
                                  ? 'text-emerald-700'
                                  : 'text-red-700'
                              }
                            >
                              {r.ok ? 'guardado correctamente' : r.mensaje}
                            </span>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                )}

              </div>

            )

          })}

          {zonas.length === 0 && (

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
              "
            >
              <p className="text-sm text-stone-500">
                No hay zonas activas para mostrar.
              </p>
            </div>

          )}

        </div>

      )}

    </div>

  )

}

function TotalCompacto({ label, value }) {

  return (

    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wide text-stone-400">
        {label}
      </p>
      <p className="font-semibold text-stone-800">
        {value}
      </p>
    </div>

  )

}

function FilaCalculadoManual({
  label,
  campo,
  campoOverride,
  zona,
  edits,
  onChangeDia,
  onRevertirDia,
  total
}) {

  return (

    <tr>
      <td className="px-2 py-3 font-semibold text-stone-700">
        {label}
      </td>

      {zona.dias.map((dia) => {

        const valores = edits[zona.zoneId]?.[dia.fecha] || {}

        return (

          <td key={dia.fecha} className="px-2 py-3">
            <CalculadoManualCell
              value={valores[campo]}
              onChange={(valor) =>
                onChangeDia(zona.zoneId, dia.fecha, campo, valor)
              }
              esOverride={dia[`${campo}EsOverride`]}
              onRevertir={() =>
                onRevertirDia(zona.zoneId, dia.fecha, campoOverride)
              }
              disabled={false}
            />
          </td>

        )

      })}

      <td className="px-2 py-3 text-right font-bold text-stone-900">
        {total}
      </td>
    </tr>

  )

}

function FilaManual({
  label,
  campo,
  zona,
  edits,
  onChangeDia,
  total
}) {

  return (

    <tr>
      <td className="px-2 py-3 font-semibold text-stone-700">
        {label}
      </td>

      {zona.dias.map((dia) => {

        const valores = edits[zona.zoneId]?.[dia.fecha] || {}

        return (

          <td key={dia.fecha} className="px-2 py-3 text-right">
            <input
              type="number"
              value={valores[campo]}
              onChange={(e) =>
                onChangeDia(zona.zoneId, dia.fecha, campo, e.target.value)
              }
              className={inputClass}
            />
          </td>

        )

      })}

      <td className="px-2 py-3 text-right font-bold text-stone-900">
        {total}
      </td>
    </tr>

  )

}
