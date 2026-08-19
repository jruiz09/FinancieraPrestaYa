import api from '../api/axios'

export const clientService = {
  list: async (page = 1, limit = 10, ownerId = null) => {
    const params = { page, limit }
    if (ownerId) params.ownerId = ownerId
    const response = await api.get('/clients', { params })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`)
    return response.data.data
  },

  create: async (client) => {
    const response = await api.post('/clients', client)
    return response.data.data
  },

  update: async (id, client) => {
    const response = await api.put(`/clients/${id}`, client)
    return response.data.data
  },

  deactivate: async (id) => {
    const response = await api.delete(`/clients/${id}`)
    return response.data
  },

  geolocalizar: async (data) => {

  const response =
    await api.post(
      '/clients/geolocalizar',
      data
    )

  return response.data.data

},
}
