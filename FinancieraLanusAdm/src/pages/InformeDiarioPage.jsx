import { useEffect, useState } from 'react'

import { Download } from 'lucide-react'

import ErrorAlert
  from '../components/ErrorAlert'

import CalculadoManualCell, { inputClass }
  from '../components/CalculadoManualCell'

import { informeDiarioService }
  from '../services/informeDiarioService'

const COLUMNAS_EXCEL = [
  { header: 'Zona', key: 'zona', width: 22 },
  { header: 'A Recaudar', key: 'aRecaudar', width: 14 },
  { header: '% Cobranza', key: 'porcentajeCobranza', width: 12 },
  { header: 'Recaudado', key: 'recaudado', width: 14 },
  { header: 'Entregas', key: 'entregas', width: 14 },
  { header: 'Ayuda', key: 'ayuda', width: 12 },
  { header: 'Ayuda A', key: 'ayudaA', width: 12 },
  { header: 'Vale', key: 'vale', width: 12 },
  { header: 'Vale Sup.', key: 'valeSup', width: 12 },
  { header: 'PR', key: 'pr', width: 10 },
  { header: 'MP', key: 'mp', width: 10 },
  { header: 'Deja', key: 'deja', width: 12 },
  { header: 'ECU', key: 'ecu', width: 12 },
  { header: 'Recaudación Día Sig.', key: 'recaudacionDiaSig', width: 20 }
]

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
  value == null
    ? '-'
    : `$ ${Number(value).toLocaleString('es-AR')}`

export default function InformeDiarioPage() {

  const [fecha, setFecha] =
    useState(hoyString())

  const [zonas, setZonas] =
    useState([])

  const [edits, setEdits] =
    useState({})

  const [loading, setLoading] =
    useState(true)

  const [guardandoZona, setGuardandoZona] =
    useState(null)

  const [error, setError] =
    useState('')

  const [exportando, setExportando] =
    useState(false)

  useEffect(() => {

    cargar()

  }, [fecha])

  const cargar =
    async () => {

      try {

        setLoading(true)

        const data =
          await informeDiarioService.obtener(fecha)

        setZonas(data.zonas || [])

        const nuevosEdits = {}

        for (const zona of data.zonas || []) {

          nuevosEdits[zona.zoneId] = {
            entregas: zona.entregas ?? 0,
            pr: zona.pr ?? 0,
            mp: zona.mp ?? 0,
            deja: zona.deja ?? 0,
            ecu: zona.ecu ?? 0,
            recaudacionDiaSig: zona.recaudacionDiaSig ?? ''
          }
        }

        setEdits(nuevosEdits)

      } catch {

        setError('Error cargando el informe diario')

      } finally {

        setLoading(false)

      }

    }

  const handleChange = (zoneId, campo, valor) => {

    setEdits(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [campo]: valor
      }
    }))

  }

  const handleGuardar =
    async (zona) => {

      try {

        setGuardandoZona(zona.zoneId)

        const valores = edits[zona.zoneId]

        const payload = {
          zoneId: zona.zoneId,
          fecha,
          pr: valores.pr,
          mp: valores.mp,
          deja: valores.deja,
          entregasOverride: valores.entregas,
          ecuOverride: valores.ecu,
          recaudacionDiaSigOverride:
            valores.recaudacionDiaSig === ''
              ? null
              : valores.recaudacionDiaSig
        }

        await informeDiarioService.guardar(payload)

        await cargar()

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Error guardando la zona'
        )

      } finally {

        setGuardandoZona(null)

      }

    }

  const handleRevertirOverride =
    async (zona, campoOverride) => {

      try {

        setGuardandoZona(zona.zoneId)

        await informeDiarioService.guardar({
          zoneId: zona.zoneId,
          fecha,
          [campoOverride]: null
        })

        await cargar()

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Error revirtiendo el valor calculado'
        )

      } finally {

        setGuardandoZona(null)

      }

    }

  const exportarExcel =
    async () => {

      try {

        setExportando(true)

        const { default: ExcelJS } = await import('exceljs')

        const workbook = new ExcelJS.Workbook()

        const sheet = workbook.addWorksheet('Informe diario')

        sheet.columns = COLUMNAS_EXCEL

        for (const zona of zonas) {

          sheet.addRow({
            zona: zona.zona,
            aRecaudar: zona.aRecaudar,
            porcentajeCobranza: zona.porcentajeCobranza,
            recaudado: zona.recaudado,
            entregas: zona.entregas,
            ayuda: zona.ayuda,
            ayudaA: zona.ayudaA,
            vale: zona.vale,
            valeSup: zona.valeSup,
            pr: zona.pr,
            mp: zona.mp,
            deja: zona.deja,
            ecu: zona.ecu,
            recaudacionDiaSig: zona.recaudacionDiaSig
          })
        }

        sheet.getRow(1).font = { bold: true }

        const buffer = await workbook.xlsx.writeBuffer()

        const blob = new Blob(
          [buffer],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        )

        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')

        link.href = url
        link.download = `informe-diario-${fecha}.xlsx`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

      } catch {

        setError('Error exportando el informe a Excel')

      } finally {

        setExportando(false)

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
            Informe diario por zona
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-stone-500
            "
          >
            Reemplaza el cierre de caja
            manual por zona.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            className="
              rounded-xl
              border
              border-stone-200
              bg-white
              px-3.5
              py-2.5
              text-sm
              text-stone-900
              outline-none
              transition
              focus:border-amber-400
              focus:ring-4
              focus:ring-amber-100
            "
          />

          <button
            type="button"
            onClick={exportarExcel}
            disabled={
              exportando ||
              loading ||
              !zonas.length
            }
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-stone-200
              bg-white
              px-3.5
              py-2.5
              text-sm
              font-semibold
              text-stone-700
              transition
              hover:bg-stone-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Download className="h-4 w-4" />
            {
              exportando
                ? 'Exportando...'
                : 'Exportar a Excel'
            }
          </button>

        </div>

      </div>

      <ErrorAlert
        message={error}
        onDismiss={() =>
          setError('')
        }
      />

      {loading ? (

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

      ) : (

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-stone-200
            bg-white
            shadow-sm
          "
        >

          <div className="overflow-x-auto">
          <table
            className="
              w-full
              text-sm
            "
          >

            <thead className="bg-stone-50/80">

              <tr
                className="
                  border-b
                  border-stone-200
                  text-xs
                  uppercase
                  tracking-wide
                  text-stone-500
                "
              >

                <th className="px-5 py-3 text-left">Zona</th>
                <th className="px-4 py-3 text-right">A Recaudar</th>
                <th className="px-4 py-3 text-right">% Cobranza</th>
                <th className="px-4 py-3 text-right">Recaudado</th>
                <th className="px-4 py-3 text-right">Entregas</th>
                <th className="px-4 py-3 text-right">Ayuda</th>
                <th className="px-4 py-3 text-right">Ayuda A</th>
                <th className="px-4 py-3 text-right">Vale</th>
                <th className="px-4 py-3 text-right">Vale Sup.</th>
                <th className="px-4 py-3 text-right">PR</th>
                <th className="px-4 py-3 text-right">MP</th>
                <th className="px-4 py-3 text-right">Deja</th>
                <th className="px-4 py-3 text-right">ECU</th>
                <th className="px-4 py-3 text-right">Recaudación Día Sig.</th>
                <th className="px-5 py-3 text-left">Acciones</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-stone-100">

              {zonas.map((zona) => {

                const valores = edits[zona.zoneId] || {}

                return (

                  <tr
                    key={zona.zoneId}
                    className="transition hover:bg-amber-50/40"
                  >

                    <td className="px-5 py-4 font-semibold text-stone-800">
                      {zona.zona}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {money(zona.aRecaudar)}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {
                        zona.porcentajeCobranza == null
                          ? '-'
                          : `${zona.porcentajeCobranza}%`
                      }
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {money(zona.recaudado)}
                    </td>

                    <td className="px-4 py-4">

                      <CalculadoManualCell
                        value={valores.entregas}
                        onChange={(valor) =>
                          handleChange(
                            zona.zoneId,
                            'entregas',
                            valor
                          )
                        }
                        esOverride={zona.entregasEsOverride}
                        onRevertir={() =>
                          handleRevertirOverride(
                            zona,
                            'entregasOverride'
                          )
                        }
                        disabled={
                          guardandoZona === zona.zoneId
                        }
                      />

                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {money(zona.ayuda)}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {money(zona.ayudaA)}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {money(zona.vale)}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">
                      {money(zona.valeSup)}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">

                      <input
                        type="number"
                        value={valores.pr}
                        onChange={(e) =>
                          handleChange(
                            zona.zoneId,
                            'pr',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">

                      <input
                        type="number"
                        value={valores.mp}
                        onChange={(e) =>
                          handleChange(
                            zona.zoneId,
                            'mp',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">

                      <input
                        type="number"
                        value={valores.deja}
                        onChange={(e) =>
                          handleChange(
                            zona.zoneId,
                            'deja',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </td>

                    <td className="px-4 py-4">

                      <CalculadoManualCell
                        value={valores.ecu}
                        onChange={(valor) =>
                          handleChange(
                            zona.zoneId,
                            'ecu',
                            valor
                          )
                        }
                        esOverride={zona.ecuEsOverride}
                        onRevertir={() =>
                          handleRevertirOverride(
                            zona,
                            'ecuOverride'
                          )
                        }
                        disabled={
                          guardandoZona === zona.zoneId
                        }
                      />

                    </td>

                    <td className="px-4 py-4">

                      <CalculadoManualCell
                        value={valores.recaudacionDiaSig}
                        onChange={(valor) =>
                          handleChange(
                            zona.zoneId,
                            'recaudacionDiaSig',
                            valor
                          )
                        }
                        esOverride={zona.recaudacionDiaSigEsOverride}
                        onRevertir={() =>
                          handleRevertirOverride(
                            zona,
                            'recaudacionDiaSigOverride'
                          )
                        }
                        disabled={
                          guardandoZona === zona.zoneId
                        }
                      />

                    </td>

                    <td className="px-5 py-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleGuardar(zona)
                        }
                        disabled={
                          guardandoZona === zona.zoneId
                        }
                        className="
                          rounded-lg
                          bg-stone-900
                          px-3
                          py-2
                          text-xs
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
                            : 'Guardar'
                        }
                      </button>

                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>
          </div>

        </div>

      )}

    </div>

  )

}
