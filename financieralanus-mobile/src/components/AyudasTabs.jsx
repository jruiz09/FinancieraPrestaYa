export default function AyudasTabs({

  tab,

  setTab,

  recibidas,

  enviadas

}) {

  return (

    <div className="flex bg-slate-900 rounded-2xl p-1">

      <button

        onClick={()=>

          setTab('RECIBIDAS')

        }

        className={`

          flex-1

          py-3

          rounded-xl

          ${

            tab === 'RECIBIDAS'

              ? 'bg-cyan-600'

              : ''

          }

        `}

      >

        Recibidas ({recibidas})

      </button>

      <button

        onClick={()=>

          setTab('ENVIADAS')

        }

        className={`

          flex-1

          py-3

          rounded-xl

          ${

            tab === 'ENVIADAS'

              ? 'bg-cyan-600'

              : ''

          }

        `}

      >

        Enviadas ({enviadas})

      </button>

    </div>

  )

}