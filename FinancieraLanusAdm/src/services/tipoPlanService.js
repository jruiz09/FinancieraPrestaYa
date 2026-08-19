import api from '../api/axios'

export const tipoPlanService = {
  list: async (page = 1, limit = 10) => {
    const response = await api.get('/tipos-plan', {
      params: { page, limit }
    })
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/tipos-plan/${id}`)
    return response.data.data
  },

  create: async (tipoPlan) => {
    const response = await api.post('/tipos-plan', tipoPlan)
    return response.data.data
  },

  update: async (id, tipoPlan) => {
    const response = await api.put(`/tipos-plan/${id}`, tipoPlan)
    return response.data.data
  },

  deactivate: async (id) => {
    const response = await api.delete(`/tipos-plan/${id}`)
    return response.data
  }
}