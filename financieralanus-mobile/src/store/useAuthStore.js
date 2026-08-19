import { create } from 'zustand'

const STORAGE_KEY = 'auth_state'

const loadFromLocalStorage = () => {

  try {

    const stored =
      localStorage.getItem(
        STORAGE_KEY
      )

    return stored
      ? JSON.parse(stored)
      : null

  } catch {

    return null

  }

}

export const useAuthStore =
  create((set) => {

    const initialState =
      loadFromLocalStorage()

    return {

      user:
        initialState?.user ||
        null,

      token:
        initialState?.token ||
        null,

      ownerId:
        initialState?.ownerId ||
        null,

      role:
        initialState?.role ||
        null,

      isLoading: false,

      error: null,

      login: (
        user,
        token
      ) => {

        const newState = {

          user,

          token,

          ownerId:
            user?.ownerId ||
            null,

          role:
            user?.role ||
            null,

          isLoading: false,

          error: null

        }

        localStorage.setItem(

          STORAGE_KEY,

          JSON.stringify({

            user,

            token,

            ownerId:
              user?.ownerId,

            role:
              user?.role

          })

        )

        set(newState)

      },

      logout: () => {

        localStorage.removeItem(
          STORAGE_KEY
        )

        set({

          user: null,

          token: null,

          ownerId: null,

          role: null,

          error: null

        })

      },

      setLoading:
        (isLoading) =>
          set({ isLoading }),

      setError:
        (error) =>
          set({ error }),

      clearError:
        () =>
          set({
            error: null
          })

    }

  })