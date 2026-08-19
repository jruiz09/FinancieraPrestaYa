import api from '../api/axios'

export const roleService = {

  list: async () => {

    const response =
      await api.get('/roles')

    return response.data.data

  },

  getById: async (id) => {

    const response =
      await api.get(`/roles/${id}`)

    return response.data.data

  },

  create: async (role) => {

    const response =
      await api.post(

        '/roles',

        role

      )

    return response.data.data

  },

  update: async (

    id,

    role

  ) => {

    const response =
      await api.put(

        `/roles/${id}`,

        role

      )

    return response.data.data

  },

  updatePermissions: async (

    id,

    permissions

  ) => {

    const response =
      await api.put(

        `/roles/${id}/permissions`,

        {

          permissions

        }

      )

    return response.data

  },

  delete: async (id) => {

    const response =
      await api.delete(

        `/roles/${id}`

      )

    return response.data

  }

}