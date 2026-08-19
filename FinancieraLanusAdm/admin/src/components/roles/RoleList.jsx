export default function RoleList({

  roles,

  selectedRole,

  onSelect

}){

  return(

    <div
      className="
        bg-gray-800
        rounded-xl
        shadow
        overflow-hidden
      "
    >

      {

        roles.map(role=>

          <button

            key={role.id}

            onClick={()=>

              onSelect(role)

            }

            className={`

              w-full

              text-left

              px-5

              py-4

              transition

              border-b

              border-gray-700

              ${selectedRole?.id===role.id

                ?

                'bg-cyan-600 text-white'

                :

                'hover:bg-gray-700'

              }

            `}

          >

            {role.name}

          </button>

        )

      }

    </div>

  )

}