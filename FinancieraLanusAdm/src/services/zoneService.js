import api from '../api/axios'

import { useAuthStore } from '../store/useAuthStore'

export const zoneService = {

  /*
  Si el usuario eligió mirar una o más oficinas puntuales con
  el switch del Header, se manda oficinaIds para que /zones
  devuelva solo las zonas de esas oficinas (además del scoping
  por permisos que ya aplica el backend siempre). Vacío = todas
  sus oficinas.
  */
  list: async () => {

    const selectedOficinaIds =
      useAuthStore.getState().selectedOficinaIds

    const response =
      await api.get('/zones', {
        params: {
          oficinaIds: selectedOficinaIds?.length
            ? selectedOficinaIds.join(',')
            : undefined
        }
      })

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