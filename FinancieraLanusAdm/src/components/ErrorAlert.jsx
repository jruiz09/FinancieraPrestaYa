import React from 'react'

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded border border-red-300 dark:border-red-700 flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-sm font-semibold">✕</button>
      )}
    </div>
  )
}
