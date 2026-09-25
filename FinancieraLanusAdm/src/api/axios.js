import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: add JWT token + oficina activa (switch del Header)
api.interceptors.request.use(
  (config) => {
    const { token, selectedOficinaIds } = useAuthStore.getState()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    /*
    Oficina activa: se adjunta a TODOS los GET como ?oficinaIds=
    para que los listados se acoten a la/las oficina/s elegidas en
    el switch (vacío = todas las permitidas). El backend siempre
    intersecta contra las oficinas que el usuario tiene asignadas,
    así que esto nunca amplía lo que puede ver. Si el caller ya
    definió oficinaIds a mano (ej. zoneService), se respeta.
    */
    if (
      config.method === 'get' &&
      Array.isArray(selectedOficinaIds) &&
      selectedOficinaIds.length > 0
    ) {
      config.params = config.params || {}
      if (config.params.oficinaIds === undefined) {
        config.params.oficinaIds = selectedOficinaIds.join(',')
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

