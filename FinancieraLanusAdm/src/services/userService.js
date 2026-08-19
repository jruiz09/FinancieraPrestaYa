import api from '../api/axios'

export const userService = {
  list: async (page = 1, limit = 10) => {
    const params = { page, limit }
    const response = await api.get('/users', { params })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  create: async (user) => {
    const response = await api.post('/users', user)
    return response.data.data
  },

  update: async (id, user) => {
    const response = await api.put(`/users/${id}`, user)
    return response.data.data
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}
