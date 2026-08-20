import React, { useEffect } from 'react'
import TipoPlanForm from './TipoPlanForm'

export default function TipoPlanModal({
  isOpen,
  title,
  initialData,
  onSubmit,
  onClose,
  isLoading
}) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-stone-950/50
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose()
        }
      }}
    >
      <div
        className="
          flex
          max-h-[96dvh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-stone-200
          bg-white
          shadow-2xl
          sm:max-h-[92vh]
          sm:max-w-md
          sm:rounded-3xl
        "
      >
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            border-stone-200
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-amber-600
              "
            >
              Tipo de plan
            </p>

            <h2 className="mt-0.5 text-lg font-bold text-stone-900 sm:text-xl">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-stone-100
              text-xl
              text-stone-500
              transition
              hover:bg-stone-200
              hover:text-stone-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <TipoPlanForm
            initialData={initialData}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}