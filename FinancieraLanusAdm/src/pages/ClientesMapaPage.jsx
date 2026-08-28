import { useEffect, useMemo, useState } from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
} from 'react-leaflet'

import L from 'leaflet'

import {
  AlertTriangle,
  MapPin,
  MapPinOff,
  Wallet
} from 'lucide-react'

import { clientService } from '../services/clientService'
import { collectorService } from '../services/collectorService'
import { useAuthStore } from '../store/useAuthStore'
import { zoneService } from '../services/zoneService'


const money =
  value =>
    Number(
      value || 0
    ).toLocaleString(
      'es-AR'
    )


const formatDate =
  fecha => {

    if (!fecha)
      return '-'

    const fechaLimpia =
      String(fecha)
        .split('T')[0]

    const [
      anio,
      mes,
      dia
    ] = fechaLimpia
      .split('-')

    if (
      !anio ||
      !mes ||
      !dia
    ) {
      return fecha
    }

    return `${dia}/${mes}/${anio}`

  }


const COLOR_SIN_ZONA = '#78716c'

const crearIconoZona =
  (color) =>
    new L.DivIcon({

      className: '',

      html: `
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        "></div>
      `,

      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -28]

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

  const [zonaId, setZonaId] =
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
        zonasData || []
      )

      const clientesData =
        await clientService.listConCreditoActivo(
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

  const iconosPorZona =
    useMemo(() => {

      const mapa = {}

      zonas.forEach((zona) => {
        mapa[zona.id] =
          crearIconoZona(zona.color)
      })

      mapa.sinZona =
        crearIconoZona(COLOR_SIN_ZONA)

      return mapa

    }, [zonas])

  const clientesFiltrados =
    clientes.filter((cliente) => {

      if (
        cobradorId &&
        cliente.cobradorId !== cobradorId
      ) {
        return false
      }

      if (
        zonaId &&
        cliente.collector?.zoneId !== zonaId
      ) {
        return false
      }

      return true

    })

  const clientesConCoordenadas =
    clientesFiltrados.filter(
      c =>
        c.latitud &&
        c.longitud
    )

  const sinGeolocalizar =
    clientesFiltrados.length -
    clientesConCoordenadas.length

  const clientesEnMora =
    clientesConCoordenadas.filter(
      c => c.resumenCredito?.tieneMora
    ).length

  const saldoPendienteTotal =
    clientesConCoordenadas.reduce(
      (total, c) =>
        total +
        Number(
          c.resumenCredito
            ?.saldoPendiente || 0
        ),
      0
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
    )

  }

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-stone-200
          bg-gradient-to-br
          from-stone-50
          via-white
          to-amber-50
          px-5
          py-6
          shadow-sm
          sm:px-7
          sm:py-7
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-48
            w-48
            rounded-full
            bg-amber-200/30
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                mb-2
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-200
                bg-amber-50
                px-3
                py-1
                text-xs
                font-semibold
                text-amber-700
              "
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Territorio
            </div>

            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-stone-900
                sm:text-3xl
              "
            >
              Mapa de clientes
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-stone-500
                sm:text-base
              "
            >
              Clientes con créditos activos,
              por zona y cobrador.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
            "
          >

            <select
              value={zonaId}
              onChange={(e) =>
                setZonaId(
                  e.target.value
                )
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
            >
              <option value="">
                Todas las zonas
              </option>

              {zonas.map(
                (zona) => (
                  <option
                    key={zona.id}
                    value={zona.id}
                  >
                    {zona.nombre}
                  </option>
                )
              )}
            </select>

            <select
              value={cobradorId}
              onChange={(e) =>
                setCobradorId(
                  e.target.value
                )
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
        </div>
      </section>


      {/* RESUMEN */}
      <div
        className="
          grid
          grid-cols-2
          gap-3
          md:gap-4
          xl:grid-cols-4
        "
      >

        <MetricCard
          icon={MapPin}
          title="Clientes en el mapa"
          value={
            clientesConCoordenadas.length
          }
          description="Con crédito activo y ubicación cargada"
          variant="blue"
        />

        <MetricCard
          icon={AlertTriangle}
          title="En mora"
          value={clientesEnMora}
          description="Con al menos una cuota vencida"
          variant="red"
        />

        <MetricCard
          icon={Wallet}
          title="Saldo pendiente"
          value={
            `$${money(saldoPendienteTotal)}`
          }
          description="Suma de saldos de los créditos activos"
          variant="amber"
        />

        <MetricCard
          icon={MapPinOff}
          title="Sin geolocalizar"
          value={sinGeolocalizar}
          description="Clientes activos sin lat/long cargada"
          variant="green"
        />

      </div>


      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-stone-200
          shadow-sm
        "
      >

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
          (cliente) => {

            const zonaCliente =
              zonas.find(
                zona =>
                  zona.id ===
                  cliente.collector?.zoneId
              )

            const resumen =
              cliente.resumenCredito ||
              {}

            return (

              <Marker
                key={cliente.id}
                position={[
                  Number(cliente.latitud),
                  Number(cliente.longitud)
                ]}
                icon={
                  iconosPorZona[
                    cliente.collector?.zoneId
                  ] ||
                  iconosPorZona.sinZona
                }
              >

                <Popup>

                  <div
                    className="
                      min-w-[250px]
                      space-y-2
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-2
                      "
                    >

                      <h3
                        className="
                          font-bold
                          text-base
                          leading-tight
                        "
                      >
                        {cliente.apellido}
                        {', '}
                        {cliente.nombre}
                      </h3>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2
                          py-0.5
                          text-[11px]
                          font-bold

                          ${
                            resumen.tieneMora
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }
                        `}
                      >
                        {
                          resumen.tieneMora
                            ? 'En mora'
                            : 'Al día'
                        }
                      </span>

                    </div>

                    <div
                      className="
                        space-y-0.5
                        text-sm
                        text-stone-700
                      "
                    >

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

                      <p>
                        Zona:
                        {' '}
                        {zonaCliente?.nombre || '-'}
                      </p>

                    </div>

                    <div
                      className="
                        rounded-lg
                        bg-stone-50
                        p-2
                        text-sm
                      "
                    >

                      <p
                        className="
                          flex
                          justify-between
                        "
                      >
                        <span className="text-stone-500">
                          Saldo pendiente
                        </span>

                        <span className="font-bold text-stone-800">
                          ${money(resumen.saldoPendiente)}
                        </span>
                      </p>

                      <p
                        className="
                          flex
                          justify-between
                        "
                      >
                        <span className="text-stone-500">
                          Próxima cuota
                        </span>

                        <span className="font-semibold text-stone-800">
                          {
                            resumen.proximaCuota
                              ? `#${resumen.proximaCuota.numeroCuota} · ${formatDate(resumen.proximaCuota.fechaVencimiento)}`
                              : 'Sin cuotas pendientes'
                          }
                        </span>
                      </p>

                    </div>

                    <a
                      href={`https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-block
                        text-amber-700
                        font-medium
                        text-sm
                      "
                    >
                      Abrir en Google Maps
                    </a>

                  </div>

                </Popup>

              </Marker>

            )

          }
        )}

      </MapContainer>

      </div>

    </div>
  )

}


/* ===================================================== */
/* METRIC CARD */
/* ===================================================== */

function MetricCard({
  icon: Icon,
  title,
  value,
  description,
  variant
}) {

  const styles = {

    blue: {
      card: 'border-blue-200 bg-gradient-to-br from-white to-blue-50/60',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-blue-700'
    },

    green: {
      card: 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60',
      icon: 'bg-emerald-100 text-emerald-700',
      value: 'text-emerald-700'
    },

    amber: {
      card: 'border-amber-200 bg-gradient-to-br from-white to-amber-50/60',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-700'
    },

    red: {
      card: 'border-red-200 bg-gradient-to-br from-white to-red-50/70',
      icon: 'bg-red-100 text-red-700',
      value: 'text-red-700'
    }

  }

  const current =
    styles[variant] ||
    styles.blue

  return (

    <div className={`
      relative
      overflow-hidden
      border
      rounded-2xl
      p-4
      md:p-5
      shadow-sm
      transition
      hover:shadow-md
      ${current.card}
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
            text-stone-600
          ">
            {title}
          </p>

          <p className={`
            text-xl
            md:text-2xl
            font-bold
            tracking-tight
            mt-2
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

          <Icon className="w-4 h-4 md:w-5 md:h-5" />

        </div>

      </div>

      <p className="
        hidden
        sm:block
        text-xs
        text-stone-500
        mt-2
      ">
        {description}
      </p>

    </div>

  )

}
