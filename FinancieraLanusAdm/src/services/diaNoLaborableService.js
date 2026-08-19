import clienteAxios from '../api/axios'

export const diaNoLaborableService = {

  listar: async (
    page = 1,
    limit = 100
  ) => {

    const response =
      await clienteAxios.get(
        `/dias-no-laborables?page=${page}&limit=${limit}`
      )

    return response.data.data
  },

  obtener: async (id) => {

    const response =
      await clienteAxios.get(
        `/dias-no-laborables/${id}`
      )

    return response.data.data
  },

  crear: async (data) => {

    const response =
      await clienteAxios.post(
        '/dias-no-laborables',
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
        `/dias-no-laborables/${id}`,
        data
      )

    return response.data.data
  },

  eliminar: async (id) => {

    const response =
      await clienteAxios.delete(
        `/dias-no-laborables/${id}`
      )

    return response.data
  }

}