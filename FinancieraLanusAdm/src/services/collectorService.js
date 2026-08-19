import api from '../api/axios'

export const collectorService = {
  list: async (page = 1, limit = 10, ownerId = null) => {
    const params = { page, limit }
    if (ownerId) params.ownerId = ownerId
    const response = await api.get('/collectors', { params })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/collectors/${id}`)
    return response.data.data
  },

  create: async (collector) => {
    const response = await api.post('/collectors', collector)
    return response.data.data
  },

  update: async (id, collector) => {
    const response = await api.put(`/collectors/${id}`, collector)
    return response.data.data
  },

  deactivate: async (id) => {
    const response = await api.delete(`/collectors/${id}`)
    return response.data
  },
}
