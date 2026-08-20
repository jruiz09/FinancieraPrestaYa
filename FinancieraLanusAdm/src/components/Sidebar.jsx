import React from 'react'

import {
  NavLink
} from 'react-router-dom'

import {
  LayoutDashboard,
  Users,
  MapPinned,
  UserRound,
  Map,
  CalendarDays,
  CreditCard,
  CirclePlus,
  ReceiptText,
  CircleHelp,
  ShieldCheck,
  X,
  Landmark,
  HandCoins,
  ChartNoAxesCombined,
  Wallet
} from 'lucide-react'

import {
  useAuthStore
} from '../store/useAuthStore'


/* ===================================================== */
/* LINK */
/* ===================================================== */

function SidebarLink({
  to,
  icon: Icon,
  children,
  collapsed,
  onClick
}) {

  return (

    <NavLink
      to={to}
      onClick={onClick}
      title={
        collapsed
          ? children
          : undefined
      }
      className={({
        isActive
      }) => `

        relative
        flex
        items-center
        gap-3
        h-11
        rounded-xl
        transition-all
        duration-200

        ${collapsed
          ? 'justify-center px-2'
          : 'px-3'
        }

        ${isActive

          ? `
            bg-amber-100
            text-amber-900
            font-semibold
          `

          : `
            text-stone-500
            hover:text-stone-900
            hover:bg-stone-100
          `
        }

      `}
    >

      {({
        isActive
      }) => (

        <>

          {isActive && (

            <span className="
              absolute
              left-0
              top-2
              bottom-2
              w-[3px]
              rounded-r-full
              bg-amber-600
            " />

          )}

          <Icon
            className="
              w-5
              h-5
              shrink-0
            "
          />

          {!collapsed && (

            <span className="
              text-sm
              truncate
            ">
              {children}
            </span>

          )}

        </>

      )}

    </NavLink>

  )

}


/* ===================================================== */
/* SECCION */
/* ===================================================== */

function SidebarSection({
  title,
  collapsed,
  children
}) {

  return (

    <div className="mt-6">

      {!collapsed && (

        <p className="
          px-3
          mb-2
          text-[11px]
          font-bold
          tracking-wider
          uppercase
          text-stone-400
        ">
          {title}
        </p>

      )}

      {collapsed && (

        <div className="
          mx-3
          mb-3
          border-t
          border-stone-200
        " />

      )}

      <div className="space-y-1">

        {children}

      </div>

    </div>

  )

}


/* ===================================================== */
/* SIDEBAR */
/* ===================================================== */

export default function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose
}) {

  const permissions =
    useAuthStore(
      state =>
        state.user?.permissions || []
    )

  return (

    <>

      {/* ========================================= */}
      {/* OVERLAY MOBILE */}
      {/* ========================================= */}

      {mobileOpen && (

        <div
          onClick={onMobileClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            backdrop-blur-[1px]
            lg:hidden
          "
        />

      )}

      {/* ========================================= */}
      {/* SIDEBAR */}
      {/* ========================================= */}

      <aside
        className={`
          fixed
          top-0
          bottom-0
          left-0
          z-50

          bg-white
          border-r
          border-stone-200

          flex
          flex-col

          transition-all
          duration-300

          ${collapsed
            ? 'lg:w-[76px]'
            : 'lg:w-[260px]'
          }

          w-[280px]

          ${mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
          }

          lg:translate-x-0
        `}
      >

        {/* ========================================= */}
        {/* LOGO */}
        {/* ========================================= */}

        <div className="
          h-16
          flex
          items-center
          border-b
          border-stone-100
          px-4
          shrink-0
        ">

          <div className="
            flex
            items-center
            gap-3
            min-w-0
            flex-1
          ">

            <div className="
              w-10
              h-10
              rounded-xl
              bg-gradient-to-br
              from-amber-500
              to-orange-600
              text-white
              flex
              items-center
              justify-center
              shrink-0
              shadow-sm
            ">

              <Landmark
                className="w-5 h-5"
              />

            </div>

            {!collapsed && (

              <div className="
                min-w-0
              ">

                <p className="
                  font-bold
                  text-stone-900
                  leading-tight
                  truncate
                ">
                  Presta Ya
                </p>

         

              </div>

            )}

          </div>

          {/* CERRAR MOBILE */}

          <button
            type="button"
            onClick={onMobileClose}
            className="
              lg:hidden
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-lg
              text-stone-500
              hover:bg-stone-100
            "
          >

            <X
              className="w-5 h-5"
            />

          </button>

        </div>

        {/* ========================================= */}
        {/* NAVEGACION */}
        {/* ========================================= */}

        <nav className="
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-3
          pb-6
        ">

          {/* PRINCIPAL */}

          <SidebarSection
            title="Principal"
            collapsed={collapsed}
          >

            <SidebarLink
              to="/dashboard"
              icon={LayoutDashboard}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Dashboard
            </SidebarLink>

          </SidebarSection>


         {/* OPERACION */}

<SidebarSection
  title="Operación"
  collapsed={collapsed}
>

  <SidebarLink
    to="/clients"
    icon={Users}
    collapsed={collapsed}
    onClick={onMobileClose}
  >
    Clientes
  </SidebarLink>

  <SidebarLink
    to="/creditos"
    icon={CreditCard}
    collapsed={collapsed}
    onClick={onMobileClose}
  >
    Créditos
  </SidebarLink>

  <SidebarLink
    to="/nuevocredito"
    icon={CirclePlus}
    collapsed={collapsed}
    onClick={onMobileClose}
  >
    Nuevo crédito
  </SidebarLink>

  <SidebarLink
    to="/cuotas"
    icon={HandCoins}
    collapsed={collapsed}
    onClick={onMobileClose}
  >
    Cuotas
  </SidebarLink>

  <SidebarLink
    to="/recaudacion"
    icon={ChartNoAxesCombined}
    collapsed={collapsed}
    onClick={onMobileClose}
  >
    Recaudación
  </SidebarLink>

</SidebarSection>


          {/* GESTION */}

          <SidebarSection
            title="Gestión"
            collapsed={collapsed}
          >

            <SidebarLink
              to="/supervisores"
              icon={UserRound}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Supervisores
            </SidebarLink>

            <SidebarLink
              to="/collectors"
              icon={ReceiptText}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Cobradores
            </SidebarLink>

            <SidebarLink
              to="/zonas"
              icon={MapPinned}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Zonas
            </SidebarLink>

            <SidebarLink
              to="/clientes-mapa"
              icon={Map}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Clientes en el mapa
            </SidebarLink>

                       <SidebarLink
              to="/ayudas"
              icon={CircleHelp}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Ayudas
            </SidebarLink>

            <SidebarLink
              to="/vales"
              icon={Wallet}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Vales
            </SidebarLink>

          </SidebarSection>


          {/* CONFIGURACION */}

          <SidebarSection
            title="Configuración"
            collapsed={collapsed}
          >

            <SidebarLink
              to="/tipoplan"
              icon={ReceiptText}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Planes
            </SidebarLink>

            <SidebarLink
              to="/dias-no-laborables"
              icon={CalendarDays}
              collapsed={collapsed}
              onClick={onMobileClose}
            >
              Días no laborables
            </SidebarLink>

 

          </SidebarSection>


          {/* ADMINISTRACION */}

          {permissions.includes(
            'USERS_VIEW'
          ) && (

            <SidebarSection
              title="Administración"
              collapsed={collapsed}
            >

              <SidebarLink
                to="/users"
                icon={Users}
                collapsed={collapsed}
                onClick={onMobileClose}
              >
                Usuarios
              </SidebarLink>

              <SidebarLink
                to="/roles"
                icon={ShieldCheck}
                collapsed={collapsed}
                onClick={onMobileClose}
              >
                Roles
              </SidebarLink>

            </SidebarSection>

          )}

        </nav>

      </aside>

    </>

  )

}