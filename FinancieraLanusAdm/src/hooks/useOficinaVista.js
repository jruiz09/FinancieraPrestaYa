import { useMemo, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

/*
=====================================================
Vista por oficina para pantallas de reportes (dashboard,
informes, recaudación, cuotas, caja).

- oficinasActivas: las oficinas que el usuario está mirando
  ahora (según el switch del Header; si no seleccionó ninguna,
  son todas sus oficinas asignadas).
- oficinaVista: '' = "Todas" (combinado); o el id de una oficina
  puntual elegida en el selector de la pantalla.
- oficinaIdsFetch: qué oficinaIds mandar al backend para la
  vista principal. Vacío = que el interceptor use la selección
  global; con una oficina puntual, la fuerza.
- mostrarSubtotales: true cuando conviene mostrar el desglose por
  oficina (viendo "Todas" y hay más de una oficina activa).
=====================================================
*/
export function useOficinaVista() {

  const user =
    useAuthStore((s) => s.user)

  const selectedOficinaIds =
    useAuthStore((s) => s.selectedOficinaIds)

  const oficinasActivas = useMemo(() => {
    const todas = user?.oficinas || []

    if (!selectedOficinaIds?.length) {
      return todas
    }

    return todas.filter((o) =>
      selectedOficinaIds.includes(o.id)
    )
  }, [user, selectedOficinaIds])

  const [oficinaVista, setOficinaVista] =
    useState('')

  const oficinaIdsFetch = oficinaVista
    ? [oficinaVista]
    : (selectedOficinaIds || [])

  const mostrarSubtotales =
    !oficinaVista && oficinasActivas.length > 1

  return {
    oficinasActivas,
    oficinaVista,
    setOficinaVista,
    oficinaIdsFetch,
    mostrarSubtotales
  }
}
