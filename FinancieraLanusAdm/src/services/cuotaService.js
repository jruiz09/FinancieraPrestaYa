// services/cuotaService.js

import api from '../api/axios'

export const cuotaService = {

  list: async (
    estado = 'TODAS',
    page = 1,
    limit = 20,
    zoneIds = [],
    fechaDesde = '',
    fechaHasta = '',
    oficinaIds = []
  ) => {

    const response =
      await api.get(
        '/creditos/cuotas/list',
        {
          params: {
            estado,
            page,
            limit,
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