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

        const data =
          await clientService.geolocalizar({

            direccion:
              formData.direccionCentro

          })
          console.log(data)

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

      } finally {

        setBuscando(false)

      }

    }

  const handleSubmit = (e) => {

    e.preventDefault()

    onSubmit(formData)

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <input
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        className="
          w-full
          p-2
          border
          rounded
        "
      />

      <input
        name="descripcion"
        placeholder="Descripción"
        value={formData.descripcion}
        onChange={handleChange}
        className="
          w-full
          p-2
          border
          rounded
        "
      />

      <div>

        <label
          className="
            block
            text-sm
            mb-2
          "
        >
          Color
        </label>

        <input
          type="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="
            w-full
            h-12
          "
        />

      </div>

      <input
        name="direccionCentro"
        placeholder="Dirección centro"
        value={
          formData.direccionCentro
        }
        onChange={handleChange}
        className="
          w-full
          p-2
          border
          rounded
        "
      />

      <button
        type="button"
        onClick={buscarUbicacion}
        disabled={buscando}
        className="
          w-full
          bg-cyan-500
          hover:bg-cyan-600
          text-white
          rounded
          py-2
        "
      >
        {
          buscando
            ? 'Buscando...'
            : '📍 Buscar ubicación'
        }
      </button>

      <div>

        <label
          className="
            block
            text-sm
            mb-1
          "
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
          className="
            w-full
            p-2
            border
            rounded
          "
        />

      </div>

      {ubicacion && (

        <div
          className="
            border
            rounded
            p-3
            bg-gray-50
          "
        >

          <p>
            Latitud:
            {' '}
            {ubicacion.latitud}
          </p>

          <p>
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
              marginTop: '15px'
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
          w-full
          bg-cyan-500
          hover:bg-cyan-600
          text-white
          rounded
          py-2
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