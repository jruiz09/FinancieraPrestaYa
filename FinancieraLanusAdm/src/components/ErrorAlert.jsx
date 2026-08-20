import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <span className="flex-1 text-sm text-red-700">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-700 transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
