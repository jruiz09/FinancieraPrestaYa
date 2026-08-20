import { useEffect, useState } from 'react'

import ErrorAlert
  from '../components/ErrorAlert'

import { informeDiarioService }
  from '../services/informeDiarioService'

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
          entregas: valores.entregas,
          pr: valores.pr,
          mp: valores.mp,
          ecu: valores.ecu,
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

  const handleRevertirRecaudacionDiaSig =
    async (zona) => {

      try {

        setGuardandoZona(zona.zoneId)

        await informeDiarioService.guardar({
          zoneId: zona.zoneId,
          fecha,
          recaudacionDiaSigOverride: null
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

  const inputClass = `
    w-24
    rounded-lg
    border
    border-stone-200
    bg-stone-50
    p-1.5
    text-right
    text-sm
    outline-none
    transition
    focus:border-amber-400
    focus:bg-white
    focus:ring-4
    focus:ring-amber-100
  `

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

                    <td className="px-4 py-4 text-right text-stone-600">

                      <input
                        type="number"
                        value={valores.entregas}
                        onChange={(e) =>
                          handleChange(
                            zona.zoneId,
                            'entregas',
                            e.target.value
                          )
                        }
                        className={inputClass}
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

                    <td
                      className="
                        px-4
                        py-4
                        text-right
                        font-bold
                        text-stone-900
                      "
                    >
                      {money(zona.deja)}
                    </td>

                    <td className="px-4 py-4 text-right text-stone-600">

                      <input
                        type="number"
                        value={valores.ecu}
                        onChange={(e) =>
                          handleChange(
                            zona.zoneId,
                            'ecu',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </td>

                    <td className="px-4 py-4">

                      <div
                        className="
                          flex
                          flex-col
                          items-end
                          gap-1
                        "
                      >

                        <input
                          type="number"
                          value={valores.recaudacionDiaSig}
                          onChange={(e) =>
                            handleChange(
                              zona.zoneId,
                              'recaudacionDiaSig',
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >

                          <span
                            className={`
                              text-[10px]
                              font-semibold
                              px-1.5
                              py-0.5
                              rounded
                              ${
                                zona.recaudacionDiaSigEsOverride
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-stone-100 text-stone-500'
                              }
                            `}
                          >
                            {
                              zona.recaudacionDiaSigEsOverride
                                ? 'Manual'
                                : 'Calculado'
                            }
                          </span>

                          {zona.recaudacionDiaSigEsOverride && (

                            <button
                              type="button"
                              title="Volver al valor calculado"
                              onClick={() =>
                                handleRevertirRecaudacionDiaSig(zona)
                              }
                              disabled={
                                guardandoZona === zona.zoneId
                              }
                              className="
                                text-[10px]
                                font-semibold
                                text-amber-700
                                hover:text-amber-800
                                underline
                              "
                            >
                              Revertir
                            </button>

                          )}

                        </div>

                      </div>

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
