import api from '../api/axios'

export const dashboardService = {

  resumen: async () => {

    const response =
      await api.get(
        '/dashboard/resumen'
      )

    return response.data.data
  }
}