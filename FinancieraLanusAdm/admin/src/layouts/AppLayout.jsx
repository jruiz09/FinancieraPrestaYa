import React, {
  useState
} from 'react'

import {
  Outlet
} from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function AppLayout() {

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false)

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false)

  return (

    <div className="
      min-h-screen
      bg-stone-50
      text-stone-800
    ">

      {/* SIDEBAR */}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* CONTENIDO */}

      <div
        className={`
          min-h-screen
          flex
          flex-col
          transition-all
          duration-300

          ${sidebarCollapsed
            ? 'lg:ml-[76px]'
            : 'lg:ml-[260px]'
          }
        `}
      >

        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() =>
            setSidebarCollapsed(
              prev => !prev
            )
          }
          onOpenMobileSidebar={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="
          flex-1
          w-full
          p-4
          md:p-5
          xl:p-6
          2xl:p-8
        ">

          <Outlet />

        </main>

      </div>

    </div>

  )

}