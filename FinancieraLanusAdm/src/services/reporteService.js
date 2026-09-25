import api from '../api/axios'

export const reporteService = {

  recaudacion: async ({
    fechaDesde,
    fechaHasta,
    cobradorId,
    oficinaIds = []
  }) => {

    const params = {
      fechaDesde,
      fechaHasta
    }

    if (cobradorId) {
      params.cobradorId =
        cobradorId
    }

    if (oficinaIds.length) {
      params.oficinaIds =
        oficinaIds.join(',')
    }

    const response =
      await api.get(
        '/reportes/recaudacion',
        {
          params
        }
      )

    return response.data.data
  }

}