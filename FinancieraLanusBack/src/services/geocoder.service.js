import NodeGeocoder from 'node-geocoder'

const geocoder =
  NodeGeocoder({
    provider: 'openstreetmap'
  })

export const resolverUbicacion =
  async (texto) => {

    if (!texto) {
      return null
    }

    texto = texto.trim()

    // Coordenadas

    const match =
      texto.match(
        /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/
      )

    if (match) {

      return {

        latitud:
          parseFloat(match[1]),

        longitud:
          parseFloat(match[2]),

        direccion:
          null,

        mapsUrl:
          null

      }

    }

    // Link Maps

    if (
      texto.includes('maps.app.goo.gl') ||
      texto.includes('google.com/maps')
    ) {

      return {

        latitud: null,
        longitud: null,

        mapsUrl:
          texto,

        direccion:
          null

      }

    }

    // Dirección

    const direccionBusqueda =
      /argentina/i.test(texto)
        ? texto
        : `${texto}, Argentina`

    const resultados =
      await geocoder.geocode(
        direccionBusqueda
      )

    if (!resultados.length) {
      return null
    }

    return {

      latitud:
        resultados[0].latitude,

      longitud:
        resultados[0].longitude,

      direccion:
        resultados[0].formattedAddress,

      mapsUrl:
        null

    }

  }