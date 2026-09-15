import api from '../api/axios'

export const notificacionService = {

  list: async () => {

    const response =
      await api.get('/notificaciones')

    return response.data.data

  },

  marcarLeida: async (id) => {

    const response =
      await api.put(
        `/notificaciones/${id}/leer`
      )

    return response.data.data

  },

  marcarTodasLeidas: async () => {

    const response =
      await api.put(
        '/notificaciones/leer-todas'
      )

    return response.data

  }

}
