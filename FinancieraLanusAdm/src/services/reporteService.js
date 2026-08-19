import api from '../api/axios'

export const reporteService = {

  recaudacion: async ({
    fechaDesde,
    fechaHasta,
    cobradorId
  }) => {

    const params = {
      fechaDesde,
      fechaHasta
    }

    if (cobradorId) {
      params.cobradorId =
        cobradorId
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