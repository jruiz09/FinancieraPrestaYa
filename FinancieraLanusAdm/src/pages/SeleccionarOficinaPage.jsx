import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function SeleccionarOficinaPage() {

  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const setSelectedOficinaIds = useAuthStore(
    (state) => state.setSelectedOficinaIds,
  )
  const confirmarSeleccionOficina = useAuthStore(
    (state) => state.confirmarSeleccionOficina,
  )
  const logout = useAuthStore((state) => state.logout)

  const oficinas = user?.oficinas || []

  const [seleccionadas, setSeleccionadas] = useState(
    oficinas.map((oficina) => oficina.id),
  )
  const [error, setError] = useState('')

  const toggleOficina = (oficinaId) => {

    setError('')

    setSeleccionadas((actuales) =>
      actuales.includes(oficinaId)
        ? actuales.filter((id) => id !== oficinaId)
        : [...actuales, oficinaId],
    )
  }

  const handleConfirmar = () => {

    if (seleccionadas.length === 0) {
      setError('Elegí al menos una oficina para continuar.')
      return
    }

    const seleccionTodas = seleccionadas.length === oficinas.length

    setSelectedOficinaIds(seleccionTodas ? [] : seleccionadas)
    confirmarSeleccionOficina()

    navigate('/bienvenida', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">

      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-stone-50 p-8 shadow-2xl">

        <h1 className="text-2xl font-bold text-slate-800">
          ¿Con qué oficina vas a trabajar?
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Tenés más de una oficina asignada. Elegí con cuál o cuáles
          querés ver la información en esta sesión. Podés cambiarlo
          después desde el switch del encabezado.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">

          {oficinas.map((oficina) => (
            <label
              key={oficina.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-2.5
                rounded-xl
                border
                border-stone-200
                bg-white
                px-3.5
                py-2.5
                text-sm
                text-stone-700
                transition
                hover:bg-stone-100
              "
            >
              <input
                type="checkbox"
                checked={seleccionadas.includes(oficina.id)}
                onChange={() => toggleOficina(oficina.id)}
                className="h-4 w-4 rounded accent-amber-500"
              />

              {oficina.nombre}
            </label>
          ))}

        </div>

        <button
          type="button"
          onClick={handleConfirmar}
          className="mt-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-600 active:scale-95"
        >
          Continuar
        </button>

        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full text-center text-xs text-stone-400 hover:text-stone-600"
        >
          Cerrar sesión
        </button>

      </div>

    </div>
  )
}
