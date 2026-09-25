import api from '../api/axios'

/*
El backend guarda la URL de la foto como ruta relativa
(/uploads/...). Para mostrarla hay que anteponerle el origen del
API (sin el /api final).
*/
const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:4000/api'
).replace(/\/api\/?$/, '')

export const fotoUrl = (url) =>
  !url || url.startsWith('http')
    ? url
    : `${API_ORIGIN}${url}`

export const clientService = {
  list: async (page = 1, limit = 10, ownerId = null, zoneIds = []) => {
    const params = { page, limit }
    if (ownerId) params.ownerId = ownerId
    if (zoneIds.length) params.zoneIds = zoneIds.join(',')
    const response = await api.get('/clients', { params })
    return response.data.data
  },

  listConResumenCredito: async (page = 1, limit = 100, ownerId = null) => {
    const params = { page, limit, soloConCreditoActivo: true }
    if (ownerId) params.ownerId = ownerId
    const response = await api.get('/clients', { params })
    return response.data.data
  },

  /*
   * Trae TODOS los clientes del owner (tengan o no crédito),
   * con el resumen de crédito calculado, recorriendo todas
   * las páginas del endpoint (que tiene tope de 100 por página).
   * Pensado para el mapa de clientes.
   */
  listTodosConResumenCredito: async (ownerId = null) => {
    const limit = 100
    let page = 1
    let clients = []
    let total = Infinity

    while (clients.length < total) {
      const data = await clientService.listConResumenCredito(
        page,
        limit,
        ownerId,
      )

      clients = clients.concat(data.clients || [])
      total = data.total || 0
      page += 1

      if (!data.clients || data.clients.length === 0) break
    }

    return { clients, total }
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`)
    return response.data.data
  },

  create: async (client) => {
    const response = await api.post('/clients', client)
    return response.data.data
  },

  update: async (id, client) => {
    const response = await api.put(`/clients/${id}`, client)
    return response.data.data
  },

  deactivate: async (id) => {
    const response = await api.delete(`/clients/${id}`)
    return response.data
  },

  geolocalizar: async (data) => {

  const response =
    await api.post(
      '/clients/geolocalizar',
      data
    )

  return response.data.data

},

  listFotos: async (clientId) => {
    const response = await api.get(
      `/clients/${clientId}/fotos`,
    )
    return response.data.data
  },

  /*
   * Sube una o varias fotos (File[]) de un cliente. Se manda como
   * multipart bajo el campo 'fotos'. Se fuerza Content-Type a
   * undefined para que el browser ponga el boundary correcto.
   */
  uploadFotos: async (clientId, files) => {
    const form = new FormData()
    files.forEach((file) => form.append('fotos', file))

    const response = await api.post(
      `/clients/${clientId}/fotos`,
      form,
      { headers: { 'Content-Type': undefined } },
    )
    return response.data.data
  },

  deleteFoto: async (clientId, fotoId) => {
    const response = await api.delete(
      `/clients/${clientId}/fotos/${fotoId}`,
    )
    return response.data
  },
}
