import {
  Home,
  DollarSign,
  Search,
  Handshake,
  User,
  Users,
  BarChart3
} from 'lucide-react'

import {
  NavLink
} from 'react-router-dom'

import {
  useAuthStore
} from '../store/useAuthStore'

export default function BottomNav() {

  const user =
    useAuthStore(
      state => state.user
    )

  const role =
    user?.role?.name ||
    user?.role

  const items =
    role === 'SUPERVISOR'
      ? [
          {
            to: '/dashboard',
            icon: Home,
            label: 'Inicio'
          },
          {
            to: '/equipo',
            icon: Users,
            label: 'Equipo'
          },
          {
            to: '/indicadores',
            icon: BarChart3,
            label: 'Indicadores'
          },
          {
            to: '/perfil',
            icon: User,
            label: 'Perfil'
          }
        ]
      : [
          {
            to: '/',
            icon: Home,
            label: 'Inicio'
          },
          {
            to: '/cobros',
            icon: DollarSign,
            label: 'Cobros'
          },
          {
            to: '/buscar',
            icon: Search,
            label: 'Buscar'
          },
          {
            to: '/ayudas',
            icon: Handshake,
            label: 'Ayudas'
          },
          {
            to: '/perfil',
            icon: User,
            label: 'Perfil'
          }
        ]

  return (

    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        h-16
        bg-slate-900
        border-t
        border-slate-800
        flex
        justify-around
        items-center
        z-50
      "
    >

      {

        items.map(

          ({
            to,
            icon: Icon,
            label
          }) => (

            <NavLink

              key={to}

              to={to}

              className={

                ({ isActive }) =>

                  `

                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  text-xs
                  transition-all

                  ${
                    isActive

                      ? 'text-cyan-400'

                      : 'text-slate-500'

                  }

                `

              }

            >

              <Icon size={22} />

              <span>
                {label}
              </span>

            </NavLink>

          )

        )

      }

    </nav>

  )

}