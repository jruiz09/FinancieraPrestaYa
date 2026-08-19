import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import Logo from '../components/Logo'
import BottomNav from '../components/BottomNav'

import {
  useAuthStore
} from '../store/useAuthStore'

export default function MobileLayout() {

  const user =
    useAuthStore(
      state => state.user
    )

  const logout =
    useAuthStore(
      state => state.logout
    )

  const handleLogout =
    () => {

      logout()

      window.location.href =
        '/login'

    }

  const nombreRol = {

    COBRADOR:
      'Cobrador',

    SUPERVISOR:
      'Supervisor',

    ADMIN:
      'Administrador'

  }

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
        pb-20
      "
    >

      <header
        className="
          sticky
          top-0
          z-40
          bg-slate-950/95
          backdrop-blur
          border-b
          border-slate-800
        "
      >

        <div
          className="
            h-[68px]
            px-4
            flex
            items-center
            justify-between
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <Logo
              size={44}
            />

            <div>

              <h1
                className="
                  text-lg
                  font-bold
                  leading-none
                  text-white
                "
              >
                Presta Ya
              </h1>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  mt-1
                  px-2
                  py-1
                  rounded-full
                  bg-teal-500/15
                  text-teal-300
                  text-[11px]
                  font-medium
                "
              >

                ●

                {
                  nombreRol[
                    user?.role
                  ] ||
                  user?.role
                }

              </span>

            </div>

          </div>

          <button

            onClick={
              handleLogout
            }

            className="
              h-10
              w-10
              rounded-full
              bg-slate-900
              border
              border-slate-700
              flex
              items-center
              justify-center
              active:scale-95
              transition
            "

          >

            <LogOut
              size={18}
            />

          </button>

        </div>

      </header>

      <main
        className="
          px-4
          py-5
        "
      >

        <Outlet />

      </main>

      <BottomNav />

    </div>

  )

}