import clienteAxios
from '../api/axios'

export const ayudaService = {

  listar: async () => {

    const response =
      await clienteAxios.get(
        '/ayudas'
      )

    return response.data.data
  },

  crear: async (
    data
  ) => {

    const response =
      await clienteAxios.post(
        '/ayudas',
        data
      )

    return response.data.data
  },

  aceptar: async (
    id
  ) => {

    const response =
      await clienteAxios.put(
        `/ayudas/${id}/aceptar`
      )

    return response.data.data
  },

  rechazar: async (
    id,
    motivoRechazo
  ) => {

    const response =
      await clienteAxios.put(
        `/ayudas/${id}/rechazar`,
        {
          motivoRechazo
        }
      )

    return response.data.data
  },

  eliminar: async (
    id
  ) => {

    await clienteAxios.delete(
      `/ayudas/${id}`
    )
  }

}