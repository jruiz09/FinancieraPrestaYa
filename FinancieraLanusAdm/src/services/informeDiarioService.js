import api from '../api/axios'

export const informeDiarioService = {

  obtener: async (fecha) => {

    const response =
      await api.get(
        '/reportes/informe-diario',
        {
          params: { fecha }
        }
      )

    return response.data.data
  },

  guardar: async (datos) => {

    const response =
      await api.put(
        '/reportes/informe-diario',
        datos
      )

    return response.data.data
  }

}
