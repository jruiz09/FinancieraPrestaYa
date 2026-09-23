import { create } from 'zustand'

const STORAGE_KEY = 'auth_state'

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const saveToLocalStorage = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      token: state.token,
      ownerId: state.ownerId,
      selectedOficinaIds: state.selectedOficinaIds
    })
  )
}

export const useAuthStore = create((set) => {

  const initialState =
    loadFromLocalStorage()

  return {

    user:
      initialState?.user || null,

    token:
      initialState?.token || null,

    ownerId:
      initialState?.ownerId || null,

    /*
    Oficinas que el usuario eligió mirar en este momento (vacío
    = todas las suyas). Es solo un filtro de conveniencia en el
    frontend: la restricción real de qué puede ver ya la aplica
    el backend según las oficinas que tenga asignadas.
    */
    selectedOficinaIds:
      initialState?.selectedOficinaIds || [],

    isLoading: false,

    error: null,

    setSelectedOficinaIds: (oficinaIds) =>
      set((state) => {

        const newState = {

          ...state,

          selectedOficinaIds:
            oficinaIds || []

        }

        saveToLocalStorage(
          newState
        )

        return newState

      }),

    setUser: (user) =>
      set((state) => {

        const newState = {

          ...state,

          user,

          ownerId:
            user?.ownerId || null

        }

        saveToLocalStorage(
          newState
        )

        return newState

      }),

    setToken: (token) =>
      set((state) => {

        const newState = {

          ...state,

          token

        }

        saveToLocalStorage(
          newState
        )

        return newState

      }),

    setLoading: (isLoading) =>

      set({

        isLoading

      }),

    setError: (error) =>

      set({

        error

      }),

    login: (user, token) =>
      set(() => {

        const newState = {

          user,

          token,

          ownerId:
            user?.ownerId || null,

          selectedOficinaIds: [],

          isLoading: false,

          error: null

        }

        saveToLocalStorage(
          newState
        )

        return newState

      }),

    logout: () => {

      localStorage.removeItem(
        STORAGE_KEY
      )

      return set({

        user: null,

        token: null,

        ownerId: null,

        selectedOficinaIds: [],

        isLoading: false,

        error: null

      })

    },

    clearError: () =>

      set({

        error: null

      }),

    hasPermission: (permission) => {

      const state =
        useAuthStore.getState()

      return (
        state.user?.permissions || []
      ).includes(permission)

    },

    hasAnyPermission: (permissions) => {

      const state =
        useAuthStore.getState()

      return permissions.some(permission =>

        (
          state.user?.permissions || []
        ).includes(permission)

      )

    },

    hasAllPermissions: (permissions) => {

      const state =
        useAuthStore.getState()

      return permissions.every(permission =>

        (
          state.user?.permissions || []
        ).includes(permission)

      )

    }

  }

})