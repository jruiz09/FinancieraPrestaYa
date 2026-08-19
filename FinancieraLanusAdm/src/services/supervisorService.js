import clienteAxios
from '../api/axios'

export const supervisorService = {

  listar: async (
    page = 1,
    limit = 20
  ) => {

    const response =
      await clienteAxios.get(
        '/supervisores',
        {
          params: {
            page,
            limit
          }
        }
      )

    return response.data.data
  },

  obtener: async (id) => {

    const response =
      await clienteAxios.get(
        `/supervisores/${id}`
      )

    return response.data.data
  },

  crear: async (data) => {

    const response =
      await clienteAxios.post(
        '/supervisores',
        data
      )

    return response.data.data
  },

  actualizar: async (
    id,
    data
  ) => {

    const response =
      await clienteAxios.put(
        `/supervisores/${id}`,
        data
      )

    return response.data.data
  },

  eliminar: async (
    id
  ) => {

    await clienteAxios.delete(
      `/supervisores/${id}`
    )
  }

}