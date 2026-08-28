// services/cuotaService.js

import api from '../api/axios'

export const cuotaService = {

  list: async (
    estado = 'TODAS',
    page = 1,
    limit = 20
  ) => {

    const response =
      await api.get(
        '/creditos/cuotas/list',
        {
          params: {
            estado,
            page,
            limit
          }
        }
      )

    return response.data.data
  }
}