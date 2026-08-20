import React from 'react'

export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-sm text-stone-500">
        Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Anterior
        </button>

        <span className="px-3 py-1.5 rounded-full bg-stone-100 text-sm font-bold text-stone-700">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
