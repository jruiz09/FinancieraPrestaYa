import api from '../api/axios'

export const permissionService = {

  list: async () => {

    const response =
      await api.get('/permissions')

    return response.data.data

  }

}