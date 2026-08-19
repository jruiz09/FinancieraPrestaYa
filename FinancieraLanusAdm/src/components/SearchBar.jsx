import React from 'react'

export default function SearchBar({ placeholder = 'Buscar...', value, onChange }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  )
}
