import React from 'react'
import UserForm from './UserForm'

export default function UserModal({ isOpen, title, initialData, roles, onSubmit, onClose, isLoading }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md mx-4 my-8">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold disabled:opacity-50"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <UserForm initialData={initialData} roles={roles} onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
