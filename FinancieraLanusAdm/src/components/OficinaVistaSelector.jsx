import { Building2 } from 'lucide-react'

/*
Selector de oficina para las pantallas de reportes. Se muestra
solo si hay más de una oficina activa. "Todas" = vista combinada
(con subtotales por oficina); cada botón acota a una oficina.
*/
export default function OficinaVistaSelector({
  oficinas,
  value,
  onChange
}) {

  if (!oficinas || oficinas.length <= 1) {
    return null
  }

  const base =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition'

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-1.5
        rounded-xl
        border
        border-stone-200
        bg-white
        p-1.5
        dark:border-stone-700
        dark:bg-stone-900
      "
    >
      <span
        className="
          flex
          items-center
          gap-1
          px-2
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-stone-400
        "
      >
        <Building2 className="h-3.5 w-3.5" />
        Oficina
      </span>

      <button
        type="button"
        onClick={() => onChange('')}
        className={`${base} ${
          value === ''
            ? 'bg-amber-500 text-white'
            : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
        }`}
      >
        Todas
      </button>

      {oficinas.map((oficina) => (
        <button
          key={oficina.id}
          type="button"
          onClick={() => onChange(oficina.id)}
          className={`${base} ${
            value === oficina.id
              ? 'bg-amber-500 text-white'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
          }`}
        >
          {oficina.nombre}
        </button>
      ))}
    </div>
  )
}
