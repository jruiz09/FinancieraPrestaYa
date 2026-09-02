import api from '../api/axios'

export const creditoService = {
  list: async (page = 1, limit = 10, zoneIds = []) => {
    const response = await api.get('/creditos', {
      params: {
        page,
        limit,
        zoneIds: zoneIds.length ? zoneIds.join(',') : undefined
      }
    })

    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/creditos/${id}`)
    return response.data.data
  },

  create: async (data) => {
    const response = await api.post('/creditos', data)
    return response.data
  },

  simular: async (data) => {
    const response = await api.post(
      '/creditos/simular',
      data
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
    );

  return response.data;
}
}