import React from 'react'
import RoleForm from './RoleForm'

export default function RoleModal({
  isOpen,
  title,
 initialData,
  permissions,
  onSubmit,
  onClose,
  isLoading
}) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">

      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-6xl mx-4 my-8">

        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">

          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-xl font-bold hover:text-red-500"
          >
            ✕
          </button>

        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">

          <RoleForm
            initialData={initialData}
            permissions={permissions}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />

        </div>

      </div>

    </div>
  )

}