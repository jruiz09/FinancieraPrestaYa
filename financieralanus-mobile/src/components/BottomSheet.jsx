import {
  X
} from 'lucide-react'

export default function BottomSheet({

  title,

  children,

  onClose,

  maxWidth = 'max-w-lg'

}) {

  return (

    <div

      onClick={onClose}

      className="
        fixed
        inset-0
        z-[9999]
        bg-black/70
        backdrop-blur-sm
        flex
        items-end
        justify-center
      "

    >

      <div

        onClick={e =>
          e.stopPropagation()
        }

        className={`
          w-full
          ${maxWidth}
          bg-slate-900
          rounded-t-3xl
          animate-slide-up
          shadow-2xl
          max-h-[92vh]
          overflow-y-auto
        `}

      >

        <div
          className="
            flex
            justify-center
            pt-3
          "
        >

          <div
            className="
              h-1.5
              w-14
              rounded-full
              bg-slate-600
            "
          />

        </div>

        <div
          className="
            flex
            justify-between
            items-center
            px-6
            py-5
            border-b
            border-slate-800
          "
        >

          <h2
            className="
              text-xl
              font-bold
            "
          >

            {title}

          </h2>

          <button

            onClick={onClose}

            className="
              h-10
              w-10
              rounded-full
              bg-slate-800
              hover:bg-slate-700
              transition
              flex
              items-center
              justify-center
            "

          >

            <X size={20} />

          </button>

        </div>

        <div
          className="
            p-6
          "
        >

          {children}

        </div>

      </div>

    </div>

  )

}