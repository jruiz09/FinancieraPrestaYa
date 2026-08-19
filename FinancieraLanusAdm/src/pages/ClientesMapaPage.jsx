import { useEffect, useState } from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
} from 'react-leaflet'

import L from 'leaflet'

import { clientService } from '../services/clientService'
import { collectorService } from '../services/collectorService'
import { useAuthStore } from '../store/useAuthStore'
import { zoneService } from '../services/zoneService'


const colores = [
  'blue',
  'green',
  'red',
  'orange',
  'violet'
]

const iconos = {}

colores.forEach((color) => {

  iconos[color] = new L.Icon({

    iconUrl:
      `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,

    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]

  })

})
export default function ClientesMapaPage() {

  const ownerId =
    useAuthStore(
      (state) => state.ownerId
    )

    const [zonas, setZonas] =
  useState([])

  const [clientes, setClientes] =
    useState([])

  const [cobradores, setCobradores] =
    useState([])

  const [cobradorId, setCobradorId] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    cargarDatos()

  }, [])

  const cargarDatos = async () => {

    try {

      setLoading(true)


      const zonasData =
  await zoneService.list()

setZonas(
  zonasData.zones || []
)

      const clientesData =
        await clientService.list(
          1,
          100,
          ownerId
        )

      const cobradoresData =
        await collectorService.list(
          1,
          100,
          ownerId
        )

      setClientes(
        clientesData.clients || []
      )

      setCobradores(
        cobradoresData.collectors || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  const colorPorCobrador = {}

cobradores.forEach((c, index) => {

  colorPorCobrador[c.id] =
    colores[index % colores.length]

})

  const clientesFiltrados =
    cobradorId
      ? clientes.filter(
          c =>
            c.cobradorId === cobradorId
        )
      : clientes

  const clientesConCoordenadas =
    clientesFiltrados.filter(
      c =>
        c.latitud &&
        c.longitud
    )

const distanciaMetros =
  (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {

    const R = 6371000

    const dLat =
      (lat2 - lat1) *
      Math.PI /
      180

    const dLon =
      (lon2 - lon1) *
      Math.PI /
      180

    const a =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos(
        lat1 *
        Math.PI /
        180
      ) *
      Math.cos(
        lat2 *
        Math.PI /
        180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )

    return R * c

  }

  const centroMapa =
    clientesConCoordenadas.length
      ? [
          Number(
            clientesConCoordenadas[0].latitud
          ),
          Number(
            clientesConCoordenadas[0].longitud
          )
        ]
      : [-34.6037, -58.3816]

  if (loading) {

    return (
      <div className="p-6">
        Cargando mapa...
      </div>
    )

  }

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">

        <h1 className="text-2xl font-bold">
          Mapa de Clientes
        </h1>

        <select
          value={cobradorId}
          onChange={(e) =>
            setCobradorId(
              e.target.value
            )
          }
          className="
            border
            rounded
            px-3
            py-2
          "
        >
          <option value="">
            Todos los cobradores
          </option>

          {cobradores.map(
            (cobrador) => (
              <option
                key={cobrador.id}
                value={cobrador.id}
              >
                {cobrador.apellido}
                {', '}
                {cobrador.nombre}
              </option>
            )
          )}
        </select>

      </div>

      <div className="mb-4">

        <span
          className="
            bg-cyan-100
            text-cyan-700
            px-3
            py-1
            rounded-full
            text-sm
          "
        >
          {clientesConCoordenadas.length}
          {' '}
          clientes ubicados
        </span>

      </div>

      <MapContainer
        center={centroMapa}
        zoom={12}
        style={{
          height: '75vh',
          width: '100%'
        }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
      {
  zonas.map((zona) => {

    const clientesZona =
      clientesConCoordenadas.filter((cliente) => {

        const distancia =
          distanciaMetros(

            Number(zona.latitudCentro),
            Number(zona.longitudCentro),

            Number(cliente.latitud),
            Number(cliente.longitud)

          )

        return (
          distancia <= zona.radioMetros
        )

      })

    return (

      <Circle
        key={zona.id}
        center={[
          Number(zona.latitudCentro),
          Number(zona.longitudCentro)
        ]}
        radius={zona.radioMetros}
        pathOptions={{
          color: zona.color,
          fillColor: zona.color,
          fillOpacity: 0.15
        }}
      >

        <Popup>

          <div>

            <h3 className="font-bold text-lg">
              {zona.nombre}
            </h3>

            <p>
              {zona.descripcion}
            </p>

            <p>
              Radio: {zona.radioMetros} mts
            </p>

            <p>
              Clientes: {clientesZona.length}
            </p>

          </div>

        </Popup>

      </Circle>

    )

  })
}
        {clientesConCoordenadas.map(
          (cliente) => (

            <Marker
             key={cliente.id}
  position={[
    Number(cliente.latitud),
    Number(cliente.longitud)
  ]}
  icon={
    iconos[
      colorPorCobrador[
        cliente.cobradorId
      ]
    ]
  }
            >

              <Popup>

                <div
                  className="
                    min-w-[220px]
                  "
                >

                  <h3
                    className="
                      font-bold
                      text-lg
                    "
                  >
                    {cliente.apellido}
                    {', '}
                    {cliente.nombre}
                  </h3>

                  <p>
                    DNI:
                    {' '}
                    {cliente.dni}
                  </p>

                  <p>
                    Tel:
                    {' '}
                    {cliente.celular || '-'}
                  </p>

                  <p>
                    Dirección:
                    {' '}
                    {cliente.direccion || '-'}
                  </p>

                  <p>
                    Cobrador:
                    {' '}
                    {cliente.collector?.apellido}
                    {' '}
                    {cliente.collector?.nombre}
                  </p>

                  <a
                    href={`https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      text-cyan-600
                      font-medium
                    "
                  >
                    Abrir en Google Maps
                  </a>

                </div>

              </Popup>

            </Marker>

          )
        )}

      </MapContainer>

    </div>
  )

}