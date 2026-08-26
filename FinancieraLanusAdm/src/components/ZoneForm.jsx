import { useState, useEffect } from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle
} from 'react-leaflet'

import { clientService }
  from '../services/clientService'

export default function ZoneForm({
  initialData = {},
  onSubmit,
  isLoading
}) {

  const [formData,
    setFormData] = useState({

    nombre: '',
    descripcion: '',
    color: '#06b6d4',

    direccionCentro: '',

    latitudCentro: '',
    longitudCentro: '',

    radioMetros: 3000,

    ...initialData

  })

  const [ubicacion,
    setUbicacion] = useState(null)

  const [buscando,
    setBuscando] = useState(false)

  const [errorUbicacion,
    setErrorUbicacion] = useState(null)

  useEffect(() => {

    setFormData({

      nombre: '',
      descripcion: '',
      color: '#06b6d4',

      direccionCentro: '',

      latitudCentro: '',
      longitudCentro: '',

      radioMetros: 3000,

      ...initialData

    })

    if (
      initialData.latitudCentro &&
      initialData.longitudCentro
    ) {

      setUbicacion({

        latitud:
          initialData.latitudCentro,

        longitud:
          initialData.longitudCentro

      })

    }

  }, [initialData])

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    })

  }

  const buscarUbicacion =
    async () => {

      try {

        setBuscando(true)
        setErrorUbicacion(null)

        const data =
          await clientService.geolocalizar({

            direccion:
              formData.direccionCentro

          })

        if (
          data?.latitud == null ||
          data?.longitud == null
        ) {
          throw new Error(
            'No se encontraron coordenadas para esa dirección'
          )
        }

        setUbicacion(data)

        setFormData(prev => ({

          ...prev,

          latitudCentro:
            data.latitud,

          longitudCentro:
            data.longitud

        }))

      } catch (error) {

        console.error(error)

        setUbicacion(null)

        setErrorUbicacion(
          'No se encontraron coordenadas para esa dirección. Probá con otra dirección o cargá los datos manualmente.'
        )

      } finally {

        setBuscando(false)

      }

    }

  const handleSubmit = (e) => {

    e.preventDefault()

    onSubmit(formData)

  }

  const inputClass = `
    w-full
    rounded-xl
    border
    border-stone-200
    bg-stone-50
    px-3.5
    py-2.5
    text-sm
    text-stone-900
    outline-none
    transition
    placeholder:text-stone-400
    focus:border-amber-400
    focus:bg-white
    focus:ring-4
    focus:ring-amber-100
  `

  const labelClass =
    'mb-1.5 block text-sm font-medium text-stone-700'

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <div>
        <label className={labelClass}>
          Nombre
        </label>

        <input
          name="nombre"
          placeholder="Nombre de la zona"
          value={formData.nombre}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Descripción
        </label>

        <input
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>

        <label
          className={labelClass}
        >
          Color
        </label>

        <input
          type="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="
            h-12
            w-full
            cursor-pointer
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            p-1
          "
        />

      </div>

      <div>
        <label className={labelClass}>
          Dirección centro
        </label>

        <input
          name="direccionCentro"
          placeholder="Dirección centro"
          value={
            formData.direccionCentro
          }
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <button
        type="button"
        onClick={buscarUbicacion}
        disabled={buscando}
        className="
          inline-flex
          w-full
          min-h-[42px]
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-stone-200
          px-5
          py-2.5
          text-sm
          font-semibold
          text-stone-700
          transition
          hover:border-amber-300
          hover:bg-amber-50
          hover:text-amber-700
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {
          buscando
            ? 'Buscando...'
            : '📍 Buscar ubicación'
        }
      </button>

      {errorUbicacion && (
        <p className="text-xs font-medium text-red-500">
          {errorUbicacion}
        </p>
      )}

      <div>

        <label
          className={labelClass}
        >
          Radio (metros)
        </label>

        <input
          type="number"
          name="radioMetros"
          value={
            formData.radioMetros
          }
          onChange={handleChange}
          className={inputClass}
        />

      </div>

      {ubicacion && (

        <div
          className="
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            p-3
          "
        >

          <p className="text-sm text-stone-600">
            Latitud:
            {' '}
            {ubicacion.latitud}
          </p>

          <p className="text-sm text-stone-600">
            Longitud:
            {' '}
            {ubicacion.longitud}
          </p>

          <MapContainer
            center={[
              Number(
                ubicacion.latitud
              ),
              Number(
                ubicacion.longitud
              )
            ]}
            zoom={14}
            style={{
              height: '300px',
              width: '100%',
              marginTop: '15px',
              borderRadius: '0.75rem'
            }}
          >

            <TileLayer
              attribution="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[
                Number(
                  ubicacion.latitud
                ),
                Number(
                  ubicacion.longitud
                )
              ]}
            />

            <Circle
              center={[
                Number(
                  ubicacion.latitud
                ),
                Number(
                  ubicacion.longitud
                )
              ]}
              radius={
                Number(
                  formData.radioMetros
                )
              }
              pathOptions={{
                color:
                  formData.color
              }}
            />

          </MapContainer>

        </div>

      )}

      <button
        type="submit"
        disabled={isLoading}
        className="
          inline-flex
          w-full
          min-h-[42px]
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-stone-900
          px-6
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-stone-800
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {
          isLoading
            ? 'Guardando...'
            : 'Guardar'
        }
      </button>

    </form>

  )

}