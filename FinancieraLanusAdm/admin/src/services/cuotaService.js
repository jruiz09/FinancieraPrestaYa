// services/cuotaService.js

import api from '../api/axios'

export const cuotaService = {

  list: async (
    estado = 'TODAS'
  ) => {

    const response =
      await api.get(
        '/creditos/cuotas/list',
        {
          params: {
            estado
          }
        }
      )

    return response.data.data
  }
}