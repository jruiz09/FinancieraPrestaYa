import React from 'react'

export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Anterior
        </button>
        <span className="px-3 py-1 text-sm">Página {page} de {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
