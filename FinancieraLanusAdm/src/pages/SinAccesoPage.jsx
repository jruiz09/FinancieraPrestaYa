import React from 'react'
import { ShieldAlert } from 'lucide-react'

import { useAuthStore } from '../store/useAuthStore'

export default function SinAccesoPage() {

  const logout =
    useAuthStore(
      state => state.logout
    )

  return (

    <div className="
      flex
      min-h-[60vh]
      flex-col
      items-center
      justify-center
      gap-4
      text-center
      px-4
    ">

      <div className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-amber-100
        text-amber-700
      ">

        <ShieldAlert className="h-8 w-8" />

      </div>

      <div>

        <h1 className="
          text-xl
          font-bold
          text-stone-900
        ">
          Sin acceso a ningún módulo
        </h1>

        <p className="
          mt-1
          max-w-sm
          text-sm
          text-stone-500
        ">
          Tu usuario no tiene permisos habilitados
          para ninguna pantalla del panel. Contactá
          a un administrador para que revise tu rol.
        </p>

      </div>

      <button
        type="button"
        onClick={logout}
        className="
          mt-2
          rounded-xl
          border
          border-stone-200
          bg-white
          px-4
          py-2.5
          text-sm
          font-semibold
          text-stone-600
          hover:bg-stone-50
          hover:text-stone-900
        "
      >
        Cerrar sesión
      </button>

    </div>

  )

}
