import React from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react'

import {
  useAuthStore
} from '../store/useAuthStore'

export default function Header({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar
}) {

  const navigate =
    useNavigate()

  const user =
    useAuthStore(
      state => state.user
    )

  const logout =
    useAuthStore(
      state => state.logout
    )

  const handleLogout = () => {

    logout()

    navigate(
      '/login',
      {
        replace: true
      }
    )

  }

  const userName =
    user?.name ||
    user?.username ||
    'Usuario'

  const initial =
    userName
      .charAt(0)
      .toUpperCase()

  return (

    <header className="
      sticky
      top-0
      z-30
      h-16
      bg-white/95
      backdrop-blur
      border-b
      border-stone-200
      flex
      items-center
      justify-between
      px-4
      md:px-5
      xl:px-6
    ">

      {/* IZQUIERDA */}

      <div className="
        flex
        items-center
        gap-3
      ">

        {/* MOBILE */}

        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="
            lg:hidden
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-xl
            text-stone-600
            hover:bg-stone-100
            transition
          "
        >

          <Menu
            className="w-5 h-5"
          />

        </button>

        {/* DESKTOP */}

        <button
          type="button"
          onClick={onToggleSidebar}
          className="
            hidden
            lg:flex
            w-10
            h-10
            items-center
            justify-center
            rounded-xl
            text-stone-500
            hover:text-stone-800
            hover:bg-stone-100
            transition
          "
          title={
            sidebarCollapsed
              ? 'Expandir menú'
              : 'Contraer menú'
          }
        >

          {sidebarCollapsed ? (

            <PanelLeftOpen
              className="w-5 h-5"
            />

          ) : (

            <PanelLeftClose
              className="w-5 h-5"
            />

          )}

        </button>

        <div className="
          hidden
          sm:block
        ">

          <p className="
            text-sm
            font-semibold
            text-stone-800
          ">
            Panel Administrativo
          </p>

          <p className="
            text-xs
            text-stone-400
          ">
            Presta Ya!
          </p>

        </div>

      </div>

      {/* DERECHA */}

      <div className="
        flex
        items-center
        gap-2
        sm:gap-3
      ">

        {/* USUARIO */}

        <div className="
          flex
          items-center
          gap-3
          pl-2
          sm:pl-3
        ">

          <div className="
            w-9
            h-9
            rounded-full
            bg-amber-100
            text-amber-800
            flex
            items-center
            justify-center
            font-bold
            text-sm
          ">

            {initial}

          </div>

          <div className="
            hidden
            md:block
            leading-tight
          ">

            <p className="
              text-sm
              font-semibold
              text-stone-800
            ">
              {userName}
            </p>

            <p className="
              text-xs
              text-stone-400
            ">
              Sesión activa
            </p>

          </div>

        </div>

        {/* SEPARADOR */}

        <div className="
          hidden
          sm:block
          w-px
          h-7
          bg-stone-200
          mx-1
        " />

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            items-center
            justify-center
            gap-2
            h-10
            px-3
            rounded-xl
            text-stone-500
            hover:text-red-600
            hover:bg-red-50
            transition
          "
          title="Cerrar sesión"
        >

          <LogOut
            className="w-4 h-4"
          />

          <span className="
            hidden
            xl:inline
            text-sm
            font-medium
          ">
            Salir
          </span>

        </button>

      </div>

    </header>

  )

}