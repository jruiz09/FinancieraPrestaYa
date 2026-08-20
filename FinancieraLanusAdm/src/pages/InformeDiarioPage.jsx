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
    border
    rounded
    p-1
    text-right
  `

  return (

    <div className="p-6">

      <div
        className="
          flex
          justify-between
          items-center
          mb-6
        "
      >

        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Informe diario por zona
        </h1>

        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(e.target.value)
          }
          className="
            border
            rounded
            p-2
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

        <div>
          Cargando...
        </div>

      ) : (

        <div
          className="
            bg-white
            rounded
            shadow
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              text-sm
            "
          >

            <thead
              className="
                bg-gray-100
              "
            >

              <tr>

                <th className="p-3 text-left">Zona</th>
                <th className="p-3 text-right">A Recaudar</th>
                <th className="p-3 text-right">% Cobranza</th>
                <th className="p-3 text-right">Recaudado</th>
                <th className="p-3 text-right">Entregas</th>
                <th className="p-3 text-right">Ayuda</th>
                <th className="p-3 text-right">Ayuda A</th>
                <th className="p-3 text-right">Vale</th>
                <th className="p-3 text-right">Vale Sup.</th>
                <th className="p-3 text-right">PR</th>
                <th className="p-3 text-right">MP</th>
                <th className="p-3 text-right">Deja</th>
                <th className="p-3 text-right">ECU</th>
                <th className="p-3 text-right">Recaudación Día Sig.</th>
                <th className="p-3 text-left">Acciones</th>

              </tr>

            </thead>

            <tbody>

              {zonas.map((zona) => {

                const valores = edits[zona.zoneId] || {}

                return (

                  <tr
                    key={zona.zoneId}
                    className="border-t"
                  >

                    <td className="p-3 font-medium">
                      {zona.zona}
                    </td>

                    <td className="p-3 text-right">
                      {money(zona.aRecaudar)}
                    </td>

                    <td className="p-3 text-right">
                      {
                        zona.porcentajeCobranza == null
                          ? '-'
                          : `${zona.porcentajeCobranza}%`
                      }
                    </td>

                    <td className="p-3 text-right">
                      {money(zona.recaudado)}
                    </td>

                    <td className="p-3 text-right">

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

                    <td className="p-3 text-right">
                      {money(zona.ayuda)}
                    </td>

                    <td className="p-3 text-right">
                      {money(zona.ayudaA)}
                    </td>

                    <td className="p-3 text-right">
                      {money(zona.vale)}
                    </td>

                    <td className="p-3 text-right">
                      {money(zona.valeSup)}
                    </td>

                    <td className="p-3 text-right">

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

                    <td className="p-3 text-right">

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
                        p-3
                        text-right
                        font-bold
                      "
                    >
                      {money(zona.deja)}
                    </td>

                    <td className="p-3 text-right">

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

                    <td className="p-3">

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
                                  : 'bg-gray-100 text-gray-500'
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
                                text-cyan-600
                                hover:text-cyan-800
                                underline
                              "
                            >
                              Revertir
                            </button>

                          )}

                        </div>

                      </div>

                    </td>

                    <td className="p-3">

                      <button
                        onClick={() =>
                          handleGuardar(zona)
                        }
                        disabled={
                          guardandoZona === zona.zoneId
                        }
                        className="
                          bg-cyan-500
                          hover:bg-cyan-600
                          disabled:bg-gray-300
                          text-white
                          px-3
                          py-1.5
                          rounded
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

      )}

    </div>

  )

}
