import api from '../api/axios'

export const zoneService = {

  list: async () => {

    const response =
      await api.get('/zones')

    return response.data.data

  },

  getById: async (id) => {

    const response =
      await api.get(`/zones/${id}`)

    return response.data.data

  },

  create: async (zone) => {

    const response =
      await api.post(
        '/zones',
        zone
      )

    return response.data.data

  },

  update: async (
    id,
    zone
  ) => {

    const response =
      await api.put(
        `/zones/${id}`,
        zone
      )

    return response.data.data

  },

  deactivate: async (id) => {

    const response =
      await api.delete(
        `/zones/${id}`
      )

    return response.data

  }

}