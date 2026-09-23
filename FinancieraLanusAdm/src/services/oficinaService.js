import api from '../api/axios'

export const oficinaService = {

  list: async () => {

    const response =
      await api.get('/oficinas')

    return response.data.data

  },

  getById: async (id) => {

    const response =
      await api.get(`/oficinas/${id}`)

    return response.data.data

  },

  create: async (oficina) => {

    const response =
      await api.post(
        '/oficinas',
        oficina
      )

    return response.data.data

  },

  update: async (
    id,
    oficina
  ) => {

    const response =
      await api.put(
        `/oficinas/${id}`,
        oficina
      )

    return response.data.data

  },

  deactivate: async (id) => {

    const response =
      await api.delete(
        `/oficinas/${id}`
      )

    return response.data

  }

}
