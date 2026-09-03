import api from '../api/axios'

export const dashboardService = {

  resumen: async () => {

    const response =
      await api.get(
        '/dashboard/resumen'
      )

    return response.data.data
  },

  zonasResumen: async (zoneIds = []) => {

    const response =
      await api.get(
        '/dashboard/zonas-resumen',
        {
          params: {
            zoneIds: zoneIds.length
              ? zoneIds.join(',')
              : undefined
          }
        }
      )

    return response.data.data
  }
}