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
  UserRoundX,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Phone,
  Home,
  User,
  Building2,
  Navigation
} from 'lucide-react'

import { clientService, fotoUrl } from '../services/clientService'
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

  const [oficinaId, setOficinaId] =
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
        await clientService.listTodosConResumenCredito(
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

  /*
  Oficinas presentes entre los clientes cargados, para ofrecer el
  filtro de oficina en el mapa (no mezclar oficinas en la vista).
  */
  const oficinasDisponibles =
    Array.from(
      new Map(
        clientes
          .filter((c) => c.oficina)
          .map((c) => [c.oficina.id, c.oficina])
      ).values()
    ).sort((a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '')
    )

  const clientesFiltrados =
    clientes.filter((cliente) => {

      if (
        oficinaId &&
        cliente.oficinaId !== oficinaId
      ) {
        return false
      }

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

  const clientesSinCredito =
    clientesConCoordenadas.filter(
      c => !c.resumenCredito?.tieneCreditoActivo
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
              Todos los clientes, tengan o no
              crédito activo, por zona y cobrador.
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

            {oficinasDisponibles.length > 1 && (
              <select
                value={oficinaId}
                onChange={(e) =>
                  setOficinaId(
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
                  Todas las oficinas
                </option>

                {oficinasDisponibles.map(
                  (oficina) => (
                    <option
                      key={oficina.id}
                      value={oficina.id}
                    >
                      {oficina.nombre}
                    </option>
                  )
                )}
              </select>
            )}

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
          xl:grid-cols-5
        "
      >

        <MetricCard
          icon={MapPin}
          title="Clientes en el mapa"
          value={
            clientesConCoordenadas.length
          }
          description="Todos, tengan o no crédito activo"
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
          icon={UserRoundX}
          title="Sin crédito activo"
          value={clientesSinCredito}
          description="Clientes cargados sin ningún crédito vigente"
          variant="green"
        />

        <MetricCard
          icon={MapPinOff}
          title="Sin geolocalizar"
          value={sinGeolocalizar}
          description="Clientes sin lat/long cargada"
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
                opacity={
                  resumen.tieneCreditoActivo
                    ? 1
                    : 0.5
                }
              >

                <Popup
                  className="cliente-popup"
                  maxWidth={360}
                  minWidth={320}
                >
                  <ClientePopup
                    cliente={cliente}
                    resumen={resumen}
                    zonaCliente={zonaCliente}
                  />
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
/* POPUP DE CLIENTE (tarjeta con carrusel de fotos)      */
/* ===================================================== */

function ClientePopup({
  cliente,
  resumen,
  zonaCliente
}) {

  const fotos = cliente.fotos || []

  const [fotoIndex, setFotoIndex] =
    useState(0)

  const indiceSeguro =
    Math.min(fotoIndex, Math.max(fotos.length - 1, 0))

  const irAnterior = () =>
    setFotoIndex(
      (prev) =>
        (prev - 1 + fotos.length) % fotos.length
    )

  const irSiguiente = () =>
    setFotoIndex(
      (prev) => (prev + 1) % fotos.length
    )

  const estado =
    !resumen.tieneCreditoActivo
      ? {
          label: 'Sin crédito',
          badge: 'bg-white/25 text-white',
          header: 'from-stone-500 to-stone-600'
        }
      : resumen.tieneMora
        ? {
            label: 'En mora',
            badge: 'bg-white/25 text-white',
            header: 'from-rose-500 to-red-600'
          }
        : {
            label: 'Al día',
            badge: 'bg-white/25 text-white',
            header: 'from-emerald-500 to-teal-600'
          }

  return (

    <div className="w-[320px] overflow-hidden rounded-2xl bg-white">

      {/* CARRUSEL */}
      {fotos.length > 0 && (

        <div className="relative mb-3 h-56 bg-stone-800">

          <a
            href={fotoUrl(fotos[indiceSeguro].url)}
            target="_blank"
            rel="noreferrer"
            className="block h-full w-full"
          >
            <img
              src={fotoUrl(fotos[indiceSeguro].url)}
              alt="Foto del cliente"
              className="h-full w-full object-contain"
            />
          </a>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={irAnterior}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={irSiguiente}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {fotos.map((foto, i) => (
                  <button
                    key={foto.id}
                    type="button"
                    onClick={() => setFotoIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === indiceSeguro
                        ? 'w-5 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white">
            {indiceSeguro + 1}/{fotos.length}
          </span>

        </div>
      )}

      {/* ENCABEZADO */}
      <div className={`mb-3 bg-gradient-to-r ${estado.header} px-4 py-3`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-extrabold leading-tight text-white">
            {cliente.apellido}, {cliente.nombre}
          </h3>

          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur ${estado.badge}`}>
            {estado.label}
          </span>
        </div>
      </div>

      {/* DATOS */}
      <div className="space-y-2 px-3 pb-3">

        <div className="grid grid-cols-1 gap-1.5 text-sm">
          <DatoPopup icon={User} label="DNI" value={cliente.dni} />
          <DatoPopup icon={Phone} label="Tel" value={cliente.celular || '-'} />
          <DatoPopup icon={Home} label="Dirección" value={cliente.direccion || '-'} />
          <DatoPopup
            icon={User}
            label="Cobrador"
            value={`${cliente.collector?.apellido || ''} ${cliente.collector?.nombre || ''}`.trim() || '-'}
          />
          <DatoPopup
            icon={MapPin}
            label="Zona"
            value={zonaCliente?.nombre || '-'}
          />
          <DatoPopup
            icon={Building2}
            label="Oficina"
            value={cliente.oficina?.nombre || '-'}
            destacado
          />
        </div>

        {/* RESUMEN CRÉDITO */}
        {resumen.tieneCreditoActivo ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-2.5">
            <FilaResumen label="Plan" value={resumen.credito?.tipoPlan || '-'} />
            <FilaResumen label="Monto crédito" value={`$${money(resumen.credito?.montoCredito)}`} />
            <FilaResumen label="Saldo pendiente" value={`$${money(resumen.saldoPendiente)}`} fuerte />
            <FilaResumen
              label="Próxima cuota"
              value={
                resumen.proximaCuota
                  ? `#${resumen.proximaCuota.numeroCuota} · ${formatDate(resumen.proximaCuota.fechaVencimiento)}`
                  : 'Sin cuotas pendientes'
              }
            />
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-sm text-stone-500">
            Este cliente no tiene ningún crédito vigente.
          </div>
        )}

        <a
          href={`https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold !text-stone-700 no-underline transition hover:border-amber-300 hover:bg-amber-50 hover:!text-amber-700"
        >
          <Navigation className="h-4 w-4" />
          Abrir en Google Maps
        </a>

      </div>

    </div>
  )
}

function DatoPopup({
  icon: Icon,
  label,
  value,
  destacado
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${destacado ? 'text-amber-600' : 'text-stone-400'}`} />
      <span className="text-stone-400">{label}:</span>
      <span className={`truncate font-semibold ${destacado ? 'text-amber-700' : 'text-stone-800'}`}>
        {value}
      </span>
    </div>
  )
}

function FilaResumen({
  label,
  value,
  fuerte
}) {
  return (
    <p className="flex justify-between gap-2 py-0.5 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`text-right ${fuerte ? 'font-bold text-stone-900' : 'font-semibold text-stone-800'}`}>
        {value}
      </span>
    </p>
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
