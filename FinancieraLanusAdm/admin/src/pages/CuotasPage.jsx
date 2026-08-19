import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
  X
} from 'lucide-react'

import CuotasTable
  from '../components/CuotasTable'

import {
  cuotaService
} from '../services/cuotaService'


export default function CuotasPage() {

  const [
    cuotas,
    setCuotas
  ] = useState([])

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    estado,
    setEstado
  ] = useState('TODAS')

  const [
    search,
    setSearch
  ] = useState('')

  const [
    error,
    setError
  ] = useState('')


  /* ===================================================== */
  /* CARGA */
  /* ===================================================== */

  const cargarDatos =
    async () => {

      try {

        setLoading(true)
        setError('')

        const data =
          await cuotaService.list(
            estado
          )

        setCuotas(
          data.cuotas || []
        )

      } catch (error) {

        console.error(error)

        setError(
          error?.response
            ?.data
            ?.message ||
          'No se pudieron cargar las cuotas'
        )

      } finally {

        setLoading(false)

      }

    }


  useEffect(() => {

    cargarDatos()

  }, [estado])


  /* ===================================================== */
  /* FILTRO LOCAL */
  /* ===================================================== */

  const cuotasFiltradas =
    useMemo(() => {

      const busqueda =
        search
          .trim()
          .toLowerCase()

      if (!busqueda)
        return cuotas

      return cuotas.filter(
        cuota => {

          const numeroCredito =
            String(
              cuota.credito
                ?.numeroCredito ||
              ''
            )

          const nombre =
            cuota.credito
              ?.cliente
              ?.nombre ||
            ''

          const apellido =
            cuota.credito
              ?.cliente
              ?.apellido ||
            ''

          const dni =
            cuota.credito
              ?.cliente
              ?.dni ||
            ''

          const texto =
            `
              ${numeroCredito}
              ${nombre}
              ${apellido}
              ${dni}
            `.toLowerCase()

          return texto.includes(
            busqueda
          )

        }
      )

    }, [
      cuotas,
      search
    ])


  /* ===================================================== */
  /* CONTADORES */
  /* ===================================================== */

  const pendientes =
    cuotas.filter(
      cuota =>
        cuota.estado ===
        'PENDIENTE'
    ).length


  const parciales =
    cuotas.filter(
      cuota =>
        cuota.estado ===
        'PARCIAL'
    ).length


  const vencidas =
    cuotas.filter(
      cuota =>
        cuota.estado ===
        'VENCIDA'
    ).length


  const pagadas =
    cuotas.filter(
      cuota =>
        cuota.estado ===
        'PAGADA'
    ).length


  const filtros = [

    {
      value: 'TODAS',
      label: 'Todas'
    },

    {
      value: 'PENDIENTE',
      label: 'Pendientes'
    },

    {
      value: 'VENCIDA',
      label: 'Vencidas'
    },

    {
      value: 'PAGADA',
      label: 'Pagadas'
    }

  ]


  return (

    <div className="
      space-y-6
      pb-8
    ">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-end
        lg:justify-between
        gap-4
      ">

        <div>

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-11
              h-11
              rounded-2xl
              bg-amber-100
              text-amber-700
              flex
              items-center
              justify-center
            ">

              <WalletCards
                className="
                  w-5
                  h-5
                "
              />

            </div>

            <div>

              <h1 className="
                text-2xl
                md:text-3xl
                font-bold
                tracking-tight
                text-stone-900
              ">
                Cuotas
              </h1>

              <p className="
                text-sm
                text-stone-500
                mt-0.5
              ">
                Seguimiento y gestión
                de cobranzas
              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={
            cargarDatos
          }
          disabled={
            loading
          }
          className="
            h-10
            px-4
            self-start
            lg:self-auto
            inline-flex
            items-center
            justify-center
            gap-2
            bg-white
            border
            border-stone-200
            rounded-xl
            text-sm
            font-semibold
            text-stone-600
            hover:bg-stone-50
            hover:text-stone-900
            disabled:opacity-50
            transition
          "
        >

          <RefreshCw
            className={`
              w-4
              h-4

              ${
                loading
                  ? 'animate-spin'
                  : ''
              }
            `}
          />

          Actualizar

        </button>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="
          flex
          items-start
          gap-3
          bg-red-50
          border
          border-red-200
          rounded-xl
          px-4
          py-3
        ">

          <AlertTriangle
            className="
              w-5
              h-5
              text-red-600
              shrink-0
              mt-0.5
            "
          />

          <div>

            <p className="
              text-sm
              font-bold
              text-red-800
            ">
              No pudimos cargar las cuotas
            </p>

            <p className="
              text-sm
              text-red-600
              mt-0.5
            ">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ================================================= */}
      {/* INDICADORES */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-2
        xl:grid-cols-4
        gap-3
        md:gap-4
      ">

        <StatusCard
          icon={CreditCard}
          label="Pendientes"
          value={pendientes}
          description="Aún sin cobrar"
          variant="blue"
        />

        <StatusCard
          icon={Clock3}
          label="Parciales"
          value={parciales}
          description="Con pago parcial"
          variant="amber"
        />

        <StatusCard
          icon={AlertTriangle}
          label="Vencidas"
          value={vencidas}
          description="Requieren atención"
          variant="red"
        />

        <StatusCard
          icon={CheckCircle2}
          label="Pagadas"
          value={pagadas}
          description="Cobro completado"
          variant="green"
        />

      </div>


      {/* ================================================= */}
      {/* FILTROS */}
      {/* ================================================= */}

      <div className="
        bg-white
        border
        border-stone-200
        rounded-2xl
        shadow-sm
        p-4
        md:p-5
      ">

        <div className="
          flex
          flex-col
          xl:flex-row
          xl:items-center
          gap-4
        ">

          {/* BUSCADOR */}

          <div className="
            relative
            flex-1
          ">

            <Search
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                w-4
                h-4
                text-stone-400
              "
            />

            <input
              type="text"
              placeholder="Buscar por cliente, DNI o número de crédito..."
              value={search}
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
              className="
                w-full
                h-11
                pl-10
                pr-10
                border
                border-stone-200
                rounded-xl
                bg-stone-50
                text-sm
                text-stone-800
                placeholder:text-stone-400
                outline-none
                focus:bg-white
                focus:border-amber-400
                focus:ring-2
                focus:ring-amber-100
                transition
              "
            />

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch('')
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  w-7
                  h-7
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  text-stone-400
                  hover:bg-stone-200
                  hover:text-stone-700
                "
              >

                <X
                  className="
                    w-4
                    h-4
                  "
                />

              </button>

            )}

          </div>


          {/* ESTADOS */}

          <div className="
            flex
            gap-1
            p-1
            bg-stone-100
            rounded-xl
            overflow-x-auto
          ">

            {filtros.map(
              filtro => (

                <button
                  key={
                    filtro.value
                  }
                  type="button"
                  onClick={() =>
                    setEstado(
                      filtro.value
                    )
                  }
                  className={`
                    h-9
                    px-4
                    rounded-lg
                    whitespace-nowrap
                    text-sm
                    font-semibold
                    transition

                    ${
                      estado ===
                      filtro.value
                        ? `
                          bg-white
                          text-stone-900
                          shadow-sm
                        `
                        : `
                          text-stone-500
                          hover:text-stone-800
                        `
                    }
                  `}
                >

                  {filtro.label}

                </button>

              )
            )}

          </div>

        </div>


        {/* RESULTADO */}

        <div className="
          flex
          items-center
          justify-between
          gap-3
          mt-4
          pt-4
          border-t
          border-stone-100
        ">

          <p className="
            text-xs
            sm:text-sm
            text-stone-500
          ">

            Mostrando

            {' '}

            <span className="
              font-bold
              text-stone-800
            ">
              {cuotasFiltradas.length}
            </span>

            {' '}

            {cuotasFiltradas.length === 1
              ? 'cuota'
              : 'cuotas'
            }

            {search && (
              <>
                {' '}
                para
                {' '}
                <span className="
                  font-semibold
                  text-stone-700
                ">
                  "{search}"
                </span>
              </>
            )}

          </p>


          {estado !== 'TODAS' && (

            <button
              type="button"
              onClick={() =>
                setEstado('TODAS')
              }
              className="
                text-xs
                font-semibold
                text-amber-700
                hover:text-amber-800
              "
            >
              Limpiar filtro
            </button>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* TABLA */}
      {/* ================================================= */}

      <CuotasTable
        cuotas={
          cuotasFiltradas
        }
        loading={
          loading
        }
        onReload={
          cargarDatos
        }
      />

    </div>

  )

}


/* ===================================================== */
/* STATUS CARD */
/* ===================================================== */

function StatusCard({
  icon: Icon,
  label,
  value,
  description,
  variant
}) {

  const styles = {

    blue: {
      border:
        'border-blue-200',
      icon:
        'bg-blue-100 text-blue-700',
      value:
        'text-blue-700'
    },

    amber: {
      border:
        'border-amber-200',
      icon:
        'bg-amber-100 text-amber-700',
      value:
        'text-amber-700'
    },

    red: {
      border:
        'border-red-200',
      icon:
        'bg-red-100 text-red-700',
      value:
        'text-red-700'
    },

    green: {
      border:
        'border-emerald-200',
      icon:
        'bg-emerald-100 text-emerald-700',
      value:
        'text-emerald-700'
    }

  }


  const current =
    styles[variant]


  return (

    <div className={`
      bg-white
      border
      rounded-2xl
      p-4
      md:p-5
      shadow-sm
      ${current.border}
    `}>

      <div className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div>

          <p className="
            text-xs
            md:text-sm
            font-semibold
            text-stone-500
          ">
            {label}
          </p>

          <p className={`
            text-2xl
            md:text-3xl
            font-bold
            mt-1
            ${current.value}
          `}>
            {value}
          </p>

        </div>


        <div className={`
          w-9
          h-9
          md:w-10
          md:h-10
          rounded-xl
          flex
          items-center
          justify-center
          shrink-0
          ${current.icon}
        `}>

          <Icon
            className="
              w-4
              h-4
              md:w-5
              md:h-5
            "
          />

        </div>

      </div>


      <p className="
        hidden
        sm:block
        text-xs
        text-stone-400
        mt-2
      ">
        {description}
      </p>

    </div>

  )

}