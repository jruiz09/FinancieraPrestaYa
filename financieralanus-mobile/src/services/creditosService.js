import api from '../api/axios'

export const creditosService = {

  listarCuotas: async (
    estado = 'TODAS',
    page = 1,
    limit = 100
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

  },

  registrarPago: async (
    cuotaId,
    data
  ) => {

    const response =
      await api.post(
        `/creditos/cuotas/${cuotaId}/pago`,
        data
      )

    return response.data

  }

}