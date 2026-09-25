import api from '../api/axios'

export const cajaService = {

  listMovimientos: async (zoneIds = [], fechaDesde = '', fechaHasta = '', oficinaIds = []) => {

    const response =
      await api.get(
        '/caja/movimientos',
        {
          params: {
            zoneIds: zoneIds.length
              ? zoneIds.join(',')
              : undefined,
            fechaDesde: fechaDesde || undefined,
            fechaHasta: fechaHasta || undefined,
            oficinaIds: oficinaIds.length
              ? oficinaIds.join(',')
              : undefined
          }
        }
      )

    return response.data.data
  },

  crearMovimiento: async (data) => {

    const response =
      await api.post(
        '/caja/movimientos',
        data
      )

    return response.data.data
  },

  anularMovimiento: async (id) => {

    const response =
      await api.put(
        `/caja/movimientos/${id}/anular`
      )

    return response.data.data
  },

  resumen: async (fechaDesde = '', fechaHasta = '', oficinaIds = []) => {

    const response =
      await api.get(
        '/caja/resumen',
        {
          params: {
            fechaDesde: fechaDesde || undefined,
            fechaHasta: fechaHasta || undefined,
            oficinaIds: oficinaIds.length
              ? oficinaIds.join(',')
              : undefined
          }
        }
      )

    return response.data.data
  },

  listMovimientosAutomaticos: async (zoneIds = [], fechaDesde = '', fechaHasta = '', oficinaIds = []) => {

    const response =
      await api.get(
        '/caja/movimientos-automaticos',
        {
          params: {
            zoneIds: zoneIds.length
              ? zoneIds.join(',')
              : undefined,
            fechaDesde: fechaDesde || undefined,
            fechaHasta: fechaHasta || undefined,
            oficinaIds: oficinaIds.length
              ? oficinaIds.join(',')
              : undefined
          }
        }
      )

    return response.data.data
  }

}
