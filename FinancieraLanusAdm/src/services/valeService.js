import clienteAxios
  from '../api/axios'

export const valeService = {

  listar: async () => {

    const response =
      await clienteAxios.get(
        '/vales'
      )

    return response.data.data
  },

  crear: async (
    data
  ) => {

    const response =
      await clienteAxios.post(
        '/vales',
        data
      )

    return response.data.data
  },

  anular: async (
    id
  ) => {

    const response =
      await clienteAxios.put(
        `/vales/${id}/anular`
      )

    return response.data.data
  }

}
