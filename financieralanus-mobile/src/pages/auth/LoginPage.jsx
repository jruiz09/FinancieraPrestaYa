import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Lock,
  User,
  Landmark
} from 'lucide-react'

import { authService }
  from '../../services/authService'

import { useAuthStore }
  from '../../store/useAuthStore'

export default function LoginPage() {

  const navigate =
    useNavigate()

  const loginStore =
    useAuthStore(
      state => state.login
    )

  const [username,
    setUsername] =
      useState('')

  const [password,
    setPassword] =
      useState('')

  const [loading,
    setLoading] =
      useState(false)

  const [error,
    setError] =
      useState('')

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        setLoading(true)
        setError('')

        const data =
          await authService.login(
            username,
            password
          )

        loginStore(
          data.user,
          data.token
        )

        navigate('/')

      } catch (err) {

        setError(
          err?.response?.data?.message ||
          'Usuario o contraseña incorrectos'
        )

      } finally {

        setLoading(false)

      }

    }

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        flex
        items-center
        justify-center
        px-6
      "
    >

      <div
        className="
          w-full
          max-w-md
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            mb-8
          "
        >

          <div
            className="
              w-20
              h-20
              rounded-2xl
              bg-cyan-500
              flex
              items-center
              justify-center
              mb-4
            "
          >

            <Landmark
              size={40}
              className="text-white"
            />

          </div>

          <h1
            className="
              text-white
              text-3xl
              font-bold
            "
          >
            Financiera Lanús
          </h1>

          <p
            className="
              text-slate-400
              mt-2
            "
          >
            Sistema de cobranzas
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="
            bg-slate-900
            rounded-3xl
            p-6
            shadow-2xl
            border
            border-slate-800
          "
        >

          <div className="mb-4">

            <label
              className="
                text-slate-300
                text-sm
                block
                mb-2
              "
            >
              Usuario
            </label>

            <div
              className="
                flex
                items-center
                bg-slate-800
                rounded-xl
                px-3
              "
            >

              <User
                size={18}
                className="
                  text-slate-400
                "
              />

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="Ingrese usuario"
                className="
                  flex-1
                  bg-transparent
                  text-white
                  p-3
                  outline-none
                "
              />

            </div>

          </div>

          <div className="mb-5">

            <label
              className="
                text-slate-300
                text-sm
                block
                mb-2
              "
            >
              Contraseña
            </label>

            <div
              className="
                flex
                items-center
                bg-slate-800
                rounded-xl
                px-3
              "
            >

              <Lock
                size={18}
                className="
                  text-slate-400
                "
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Ingrese contraseña"
                className="
                  flex-1
                  bg-transparent
                  text-white
                  p-3
                  outline-none
                "
              />

            </div>

          </div>

          {error && (

            <div
              className="
                bg-red-500/10
                border
                border-red-500/20
                text-red-400
                rounded-xl
                p-3
                mb-4
                text-sm
              "
            >
              {error}
            </div>

          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-cyan-500
              hover:bg-cyan-600
              active:scale-[0.98]
              transition
              text-white
              font-semibold
              py-4
              rounded-xl
            "
          >
            {
              loading
                ? 'Ingresando...'
                : 'Ingresar'
            }
          </button>

        </form>

        <p
          className="
            text-center
            text-slate-500
            text-xs
            mt-6
          "
        >
          Financiera Lanús Mobile
        </p>

      </div>

    </div>

  )

}