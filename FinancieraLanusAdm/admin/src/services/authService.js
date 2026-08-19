import api from '../api/axios'

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data.data
  },

  register: async (name, username, email, password, ownerId) => {
    const response = await api.post('/auth/register', { name, username, email, password, ownerId })
    return response.data.data
  },
}
