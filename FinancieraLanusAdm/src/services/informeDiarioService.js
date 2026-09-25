import api from '../api/axios'

export const informeDiarioService = {

  obtener: async (fecha, oficinaIds = []) => {

    const response =
      await api.get(
        '/reportes/informe-diario',
        {
          params: {
            fecha,
            oficinaIds: oficinaIds.length
              ? oficinaIds.join(',')
              : undefined
          }
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
  },

  obtenerSemanal: async (lunes, oficinaIds = []) => {

    const response =
      await api.get(
        '/reportes/informe-semanal',
        {
          params: {
            lunes,
            oficinaIds: oficinaIds.length
              ? oficinaIds.join(',')
              : undefined
          }
        }
      )

    return response.data.data
  }

}
