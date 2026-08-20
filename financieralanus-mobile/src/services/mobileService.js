import api from '../api/axios'

export const mobileService = {

  dashboard: async () => {

    const response =
      await api.get(
        '/mobile/dashboard'
      )

    return response.data.data

  },

  cuotasHoy: async () => {

    const response =
      await api.get(
        '/mobile/cuotas-hoy'
      )

    return response.data.data

  },

  cuotasAtrasadas: async () => {

    const response =
      await api.get(
        '/mobile/cuotas-atrasadas'
      )

    return response.data.data

  },

pagarCuota: async (
  cuotaId,
  data
) => {

  const response =
    await api.post(
      `/mobile/cuotas/${cuotaId}/pagar`,
      data
    )

  return response.data

}
,
buscar: async (q) => {

  const response =
    await api.get(
      '/mobile/buscar',
      {
        params: { q }
      }
    )

  return response.data.data

},

getCredito: async (id) => {

  const response =
    await api.get(
      `/mobile/credito/${id}`
    )

  return response.data.data

},

recorrido:  async () => {

  const response =
    await api.get(
      '/mobile/recorrido'
    )

  return response.data.data

}
,

perfil:
async () => {

  const response =
    await api.get(
      '/mobile/perfil'
    )

  return response.data.data

},


 ayudas :
  async () => {

    const {
      data
    } =
      await api.get(
        '/mobile/ayudas'
      )

    return data.data

  },

 crearAyuda :
  async payload => {

    const {
      data
    } =
      await api.post(

        '/mobile/ayudas',

        payload

      )

    return data.data

  },

  aceptarAyuda:
async id=>{

const {data}=

await api.put(

`/mobile/ayudas/${id}/aceptar`

)

return data.data

},

rechazarAyuda:
async (
id,
motivoRechazo=''
)=>{

const {data}=

await api.put(

`/mobile/ayudas/${id}/rechazar`,

{

motivoRechazo

}

)

return data.data

},

vales:
  async () => {

    const {
      data
    } =
      await api.get(
        '/mobile/vales'
      )

    return data.data

  }

}


