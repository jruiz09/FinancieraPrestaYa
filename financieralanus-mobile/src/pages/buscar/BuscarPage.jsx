import {
  useState,
  useEffect
} from 'react'

import SearchBar
  from '../../components/SearchBar'

import EmptyState
  from '../../components/EmptyState'

import ClienteAvatar
  from '../../components/ClienteAvatar'

import Money
  from '../../components/Money'

import {
  mobileService
} from '../../services/mobileService'

import {
  useNavigate
} from 'react-router-dom'

export default function BuscarPage() {

  const navigate =
    useNavigate()

  const [texto,
    setTexto] =
      useState('')

  const [creditos,
    setCreditos] =
      useState([])

  useEffect(() => {

    if (
      texto.length < 2
    ) {

      setCreditos([])

      return

    }

    const timer =
      setTimeout(
        buscar,
        300
      )

    return () =>
      clearTimeout(timer)

  }, [texto])

  const buscar =
    async () => {

      const data =
        await mobileService.buscar(texto)

      setCreditos(data)

    }

  return (

    <div
      className="
        space-y-5
      "
    >

      <SearchBar

        value={texto}

        onChange={setTexto}

        placeholder="
          Cliente, DNI o Crédito
        "

      />

      {

        texto.length >= 2 &&

        creditos.length === 0 && (

          <EmptyState

            emoji="🔍"

            title="Sin resultados"

            subtitle="
              No encontramos clientes.
            "

          />

        )

      }

      {

        creditos.map(

          credito => {

            const cliente =
              credito.cliente

          const saldo =
  Number(credito.saldo)

            return (

             <button
  key={credito.id}
  onClick={() =>
    navigate(`/credito/${credito.id}`)
  }
  className="
    w-full
    bg-slate-900
    rounded-2xl
    p-4
    flex
    items-center
    gap-4
    text-left
    active:scale-[0.98]
    transition
  "
>

  <ClienteAvatar
    cliente={cliente}
  />

  <div className="flex-1">

    <h3
      className="
        font-bold
        text-lg
      "
    >
      {cliente.nombre} {cliente.apellido}
    </h3>

    <p
      className="
        text-sm
        text-slate-400
      "
    >
      Crédito #{credito.numeroCredito}
    </p>

    <p
      className="
        text-xs
        text-slate-500
        mt-2
      "
    >
      Saldo pendiente
    </p>

    <Money
      value={saldo}
      className="
        text-cyan-400
        text-xl
        font-bold
      "
    />

  </div>

  <div
    className="
      text-slate-500
      text-2xl
    "
  >
    ›
  </div>

</button>

            )

          }

        )

      }

    </div>

  )

}