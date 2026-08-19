import {
  Search,
  X
} from 'lucide-react'

export default function SearchBar({

  value,

  onChange,

  placeholder = 'Buscar...'

}) {

  return (

    <div
      className="
        relative
      "
    >

      <Search

        size={18}

        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-slate-500
        "

      />

      <input

        value={value}

        onChange={(e)=>

          onChange(

            e.target.value

          )

        }

        placeholder={placeholder}

        className="
          w-full
          h-12
          rounded-2xl
          bg-slate-900
          border
          border-slate-800
          pl-11
          pr-11
          outline-none
          focus:border-cyan-500
          transition
        "

      />

      {

        value && (

          <button

            onClick={()=>

              onChange('')

            }

            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-slate-500
            "

          >

            <X size={18}/>

          </button>

        )

      }

    </div>

  )

}