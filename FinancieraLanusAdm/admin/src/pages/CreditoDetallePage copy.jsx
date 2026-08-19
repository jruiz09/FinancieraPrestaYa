import React,
{
  useEffect,
  useMemo,
  useState
}
from 'react'

import {
  useParams,
  useNavigate
}
from 'react-router-dom'

import toast from 'react-hot-toast'

import {
  creditoService
}
from '../services/creditoService'
import PagoCuotaModal from '../components/PagoCuotaModal'

export default function CreditoDetallePage() {

  const navigate =
    useNavigate()

  const { id } =
    useParams()

  const [credito,
    setCredito] =
      useState(null)

  const [loading,
    setLoading] =
      useState(true)

      const [
  cuotaSeleccionada,
  setCuotaSeleccionada
] = useState(null)

const [
  modalPagoOpen,
  setModalPagoOpen
] = useState(false)

const [
  loadingPago,
  setLoadingPago
] = useState(false)

  useEffect(() => {

    cargarCredito()

  }, [])

  const cargarCredito =
    async () => {

      try {

        const data =
          await creditoService.getById(id)

        setCredito(data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }
    }


    const formatDate = (fecha) => {

  if (!fecha)
    return '-'

  const [anio, mes, dia] =
    fecha.split('-')

  return `${dia}/${mes}/${anio}`
}


  const cuotasOrdenadas =
    useMemo(() => {

      if (!credito?.cuotas)
        return []

      return [...credito.cuotas]
        .sort(
          (a, b) =>
            a.numeroCuota -
            b.numeroCuota
        )

    }, [credito])

  const cuotasPagadas =
    cuotasOrdenadas.filter(
      c => c.estado === 'PAGADA'
    ).length

  const cuotasPendientes =
    cuotasOrdenadas.filter(
      c =>
        c.estado !== 'PAGADA'
    ).length

  const porcentaje =
    cuotasOrdenadas.length
      ? Math.round(
          (
            cuotasPagadas
            * 100
          ) /
          cuotasOrdenadas.length
        )
      : 0

  const montoCobrado =
    cuotasOrdenadas.reduce(
      (acc, cuota) =>
        acc +
        Number(
          cuota.montoPago || 0
        ),
      0
    )

  const saldoPendiente =
    Number(
      credito?.montoFinal || 0
    ) - montoCobrado

  const getEstadoClass =
    (estado) => {

      switch (estado) {

        case 'PAGADA':
          return 'bg-green-100 text-green-700'

        case 'PARCIAL':
          return 'bg-yellow-100 text-yellow-700'

        case 'VENCIDA':
          return 'bg-red-100 text-red-700'

        default:
          return 'bg-blue-100 text-blue-700'
      }
    }

    const registrarPago =
  async (data) => {

    try {

      setLoadingPago(true)

      await creditoService
        .registrarPago(
          cuotaSeleccionada.id,
          data
        )

      setModalPagoOpen(false)

      setCuotaSeleccionada(null)

      await cargarCredito()

    } catch (error) {

      console.error(error)

    } finally {

      setLoadingPago(false)

    }
  }

  if (loading) {

    return (
      <div>
        Cargando...
      </div>
    )
  }

  if (!credito) {

    return (
      <div>
        Crédito no encontrado
      </div>
    )
  }

  
const obtenerUrlPublica = () => {

  return import.meta.env.VITE_PUBLIC_CLIENT_URL ||
    window.location.origin

}
  const copiarLinkEstado =
  async () => {

    try {

      const url =
        `${window.location.origin}/consulta/${credito.tokenConsulta}`

      await navigator
        .clipboard
        .writeText(url)

      toast.success(
        'Link copiado al portapapeles'
      )

    } catch {

      toast.error(
        'No se pudo copiar el link'
      )

    }
  }
const normalizarTelefono = (
  telefono
) => {

  let numero =
    String(
      telefono || ''
    ).replace(
      /\D/g,
      ''
    )

  if (
    numero.startsWith('549')
  ) {
    return numero
  }

  if (
    numero.startsWith('54')
  ) {
    return `549${numero.slice(2)}`
  }

  if (
    numero.startsWith('11')
  ) {
    return `549${numero}`
  }

  return `549${numero}`
}


const compartirWhatsapp =
  () => {

    const telefono =
      normalizarTelefono(
        credito.cliente?.celular
      )
      console.log(
  normalizarTelefono(
    credito.cliente?.celular
  )
)

const url =
`${obtenerUrlPublica()}/consulta/${credito.tokenConsulta}`
    const mensaje =
`Hola ${credito.cliente?.nombre},

Podés consultar el estado de tu crédito aquí:

${url}`

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      '_blank'
    )
  }

const proximaCuota =
  cuotasOrdenadas.find(
    cuota =>
      cuota.estado !== 'PAGADA'
  )

const cobradorNombre =
  credito.cobrador
    ? `${credito.cobrador.apellido} ${credito.cobrador.nombre}`
    : '-'

  return (

    <div className="space-y-6">

      <div
  className="
    bg-gradient-to-r
    from-cyan-600
    to-blue-700
    rounded-xl
    shadow-lg
    p-6
    text-white
  "
>

  <div className="flex justify-between items-start">

    <div>

      <p className="text-cyan-100 text-sm">
        Crédito
      </p>

      <h1 className="text-4xl font-bold">

        CR-
        {String(
          credito.numeroCredito || 0
        ).padStart(6, '0')}

      </h1>

      <p className="mt-3 text-lg font-medium">

        {credito.cliente?.apellido}
        {' '}
        {credito.cliente?.nombre}

      </p>

      <p className="text-cyan-100 text-sm">

        Plan:
        {' '}
        {credito.tipoPlan?.descripcion}

      </p>

      <p className="text-cyan-100 text-sm">

        Fecha Otorgamiento:
        {' '}
        {formatDate(
          credito.fechaOtorgamiento
        )}

      </p>

    </div>

    <div className="text-right">

      <span
        className="
          bg-white/20
          px-4
          py-2
          rounded-full
          text-sm
          font-semibold
        "
      >
        {credito.estado}
      </span>

     <div className="mt-4 flex gap-2 justify-end">

  <button
    onClick={copiarLinkEstado}
    className="
      bg-green-500
      hover:bg-green-600
      text-white
      px-4
      py-2
      rounded
      font-semibold
    "
  >
    🔗 Copiar Link
  </button>

  <button
    onClick={compartirWhatsapp}
    className="
      bg-emerald-600
      hover:bg-emerald-700
      text-white
      px-4
      py-2
      rounded
      font-semibold
    "
  >
    📲 WhatsApp
  </button>

  <button
    onClick={() =>
      navigate('/creditos')
    }
    className="
      bg-white
      text-cyan-700
      px-4
      py-2
      rounded
      font-semibold
      hover:bg-gray-100
    "
  >
    ← Volver
  </button>

</div>

    </div>

  </div>

</div>
<div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

  <div className="xl:col-span-3 bg-white rounded-xl shadow p-6">

    <h3 className="font-semibold text-lg mb-5">
      Resumen Financiero
    </h3>

    <div className="grid md:grid-cols-4 gap-6">

      <div>

        <p className="text-gray-500 text-sm">
          Capital Total
        </p>

        <p className="text-3xl font-bold text-green-600">
          $
          {Number(
            credito.montoFinal
          ).toLocaleString('es-AR')}
        </p>

      </div>

      <div>

        <p className="text-gray-500 text-sm">
          Cobrado
        </p>

        <p className="text-3xl font-bold text-cyan-600">
          $
          {montoCobrado.toLocaleString(
            'es-AR'
          )}
        </p>

      </div>

      <div>

        <p className="text-gray-500 text-sm">
          Saldo
        </p>

        <p className="text-3xl font-bold text-red-500">
          $
          {saldoPendiente.toLocaleString(
            'es-AR'
          )}
        </p>

      </div>

      <div>

        <p className="text-gray-500 text-sm">
          Avance
        </p>

        <p className="text-3xl font-bold text-blue-600">
          {porcentaje}%
        </p>

      </div>

    </div>

  </div>

  <div className="bg-white rounded-xl shadow p-6">

    <h3 className="font-semibold mb-4">
      Próxima Cuota
    </h3>

    {cuotasOrdenadas.find(
      c => c.estado !== 'PAGADA'
    ) ? (

      (() => {

        const proxima =
          cuotasOrdenadas.find(
            c =>
              c.estado !==
              'PAGADA'
          )

        return (

          <>
            <p className="text-3xl font-bold text-cyan-600">
              #{proxima.numeroCuota}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Vencimiento
            </p>

            <p className="font-semibold">
              {formatDate(
                proxima.fechaVencimiento
              )}
            </p>

            <p className="mt-4 text-2xl font-bold text-green-600">
              $
              {Number(
                proxima.monto
              ).toLocaleString(
                'es-AR'
              )}
            </p>
          </>
        )

      })()

    ) : (

      <p className="text-green-600 font-semibold">
        Crédito Finalizado
      </p>

    )}

  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-5 gap-4">

  <div className="bg-white rounded shadow p-4">

    <p className="text-gray-500 text-sm">
      Cliente
    </p>

    <p className="font-semibold">
      {credito.cliente?.apellido}
      {' '}
      {credito.cliente?.nombre}
    </p>

    <p className="text-xs text-gray-500 mt-1">
      DNI:
      {' '}
      {credito.cliente?.dni}
    </p>

  </div>

  <div className="bg-white rounded shadow p-4">

    <p className="text-gray-500 text-sm">
      Cobrador
    </p>

    <p className="font-semibold">
      {credito.cobrador?.apellido}
      {' '}
      {credito.cobrador?.nombre}
    </p>

  </div>

  <div className="bg-white rounded shadow p-4">

    <p className="text-gray-500 text-sm">
      Cuotas
    </p>

    <p className="text-3xl font-bold">
      {cuotasOrdenadas.length}
    </p>

  </div>

  <div className="bg-white rounded shadow p-4">

    <p className="text-gray-500 text-sm">
      Pagadas
    </p>

    <p className="text-3xl font-bold text-green-600">
      {cuotasPagadas}
    </p>

  </div>

  <div className="bg-white rounded shadow p-4">

    <p className="text-gray-500 text-sm">
      Pendientes
    </p>

    <p className="text-3xl font-bold text-blue-600">
      {cuotasPendientes}
    </p>

  </div>

</div>

<div className="bg-white rounded-xl shadow p-5">

  <div className="flex justify-between items-center mb-3">

    <div>

      <h3 className="font-semibold">
        Avance del Crédito
      </h3>

      <p className="text-sm text-gray-500">
        {cuotasPagadas}
        {' de '}
        {cuotasOrdenadas.length}
        {' cuotas cobradas'}
      </p>

    </div>

    <div className="text-right">

      <div className="font-bold text-lg">
        {porcentaje}%
      </div>

    </div>

  </div>

  <div className="w-full bg-gray-200 rounded-full h-4">

    <div
      className="
        bg-green-500
        h-4
        rounded-full
        transition-all
      "
      style={{
        width: `${porcentaje}%`
      }}
    />

  </div>

</div>


      <div className="bg-white rounded shadow overflow-hidden">

        <table className="w-full">

          <thead>

            <tr>

              <th className="p-3 text-left">
                Cuota
              </th>

              <th className="p-3 text-left">
                Pago Esperado
              </th>

              <th className="p-3 text-left">
                Vencimiento
              </th>

              <th className="p-3 text-right">
                Monto
              </th>

              <th className="p-3 text-right">
                Pagado
              </th>

              <th className="p-3 text-right">
                Saldo
              </th>

              <th className="p-3 text-center">
                Estado
              </th>

              <th className="p-3 text-center">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {cuotasOrdenadas.map(
              (cuota) => {

                const saldo =
                  Number(
                    cuota.monto
                  ) -
                  Number(
                    cuota.montoPago || 0
                  )

                return (

                  <tr
                    key={cuota.id}
                    className="border-t"
                  >

                    <td className="p-3">
                      {cuota.numeroCuota}
                    </td>

                    <td className="p-3">
                      
                        {formatDate(cuota.fechaPagoEsperada)}
                      
                    </td>

                    <td className="p-3">
                     
                        {formatDate(cuota.fechaVencimiento)}
                  
                    </td>

                    <td className="p-3 text-right font-semibold">
                      $
                      {Number(
                        cuota.monto
                      ).toLocaleString(
                        'es-AR'
                      )}
                    </td>

                    <td className="p-3 text-right text-green-600 font-semibold">
                      $
                      {Number(
                        cuota.montoPago || 0
                      ).toLocaleString(
                        'es-AR'
                      )}
                    </td>

                    <td className="p-3 text-right text-red-600 font-semibold">
                      $
                      {saldo.toLocaleString(
                        'es-AR'
                      )}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`
                          px-2
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${getEstadoClass(
                            cuota.estado
                          )}
                        `}
                      >
                        {cuota.estado}
                      </span>

                    </td>

                    <td className="p-3 text-center">

                      <button
  onClick={() => {

    setCuotaSeleccionada(
      cuota
    )

    setModalPagoOpen(
      true
    )

  }}
  disabled={
    cuota.estado ===
    'PAGADA'
  }
  className="
    bg-green-500
    hover:bg-green-600
    disabled:bg-gray-400
    text-white
    px-3
    py-1
    rounded
    text-sm
  "
>
  {
    cuota.estado ===
    'PAGADA'
      ? 'Pagada'
      : cuota.estado ===
          'PARCIAL'
        ? 'Completar'
        : 'Cobrar'
  }
</button>

                    </td>

                  </tr>
                )
              }
            )}

          </tbody>

        </table>

      </div>
<PagoCuotaModal
  isOpen={modalPagoOpen}
  cuota={cuotaSeleccionada}
  onClose={() => {

    setModalPagoOpen(false)

    setCuotaSeleccionada(null)

  }}
  onConfirm={registrarPago}
  isLoading={loadingPago}
/>
    </div>
  )
}