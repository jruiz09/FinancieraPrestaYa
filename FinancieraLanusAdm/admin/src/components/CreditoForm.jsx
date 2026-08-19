import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  UserRound,
  Wallet,
  Percent,
  CalendarDays,
  Clock3,
  Banknote,
  FileText,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  CalendarCheck,
  ArrowRight,
  X,
  Loader2,
  Landmark,
  Hash,
  Phone,
  UserCheck
} from 'lucide-react'

import {
  useNavigate
} from 'react-router-dom'

import {
  clientService
} from '../services/clientService'

import {
  tipoPlanService
} from '../services/tipoPlanService'

import {
  creditoService
} from '../services/creditoService'

import SearchSelect
  from '../components/SearchSelect'


export default function CreditoForm() {

  const navigate =
    useNavigate()

  const [clientes, setClientes] =
    useState([])

  const [planes, setPlanes] =
    useState([])

  const [simulacion, setSimulacion] =
    useState(null)

  const [
    loadingSimulacion,
    setLoadingSimulacion
  ] = useState(false)

  const [
    mensajeError,
    setMensajeError
  ] = useState('')

  const [
    loadingGuardar,
    setLoadingGuardar
  ] = useState(false)

  const [
    showConfirmModal,
    setShowConfirmModal
  ] = useState(false)

  const [
    creditoCreado,
    setCreditoCreado
  ] = useState(null)

  const [
    showSuccessModal,
    setShowSuccessModal
  ] = useState(false)

  const [formData, setFormData] =
    useState({

      clienteId: '',
      tipoPlanId: '',
      montoCredito: '',
      interes: '',
      cantidadCuotas: '',
      diasGracia: 0,
      tipoTransaccion: 'EFECTIVO',

      fechaOtorgamiento:
        new Date()
          .toISOString()
          .split('T')[0],

      observaciones: ''

    })


  /* ===================================================== */
  /* DATOS SELECCIONADOS */
  /* ===================================================== */

  const clienteSeleccionado =
    useMemo(
      () =>
        clientes.find(
          cliente =>
            cliente.id ===
            formData.clienteId
        ),
      [
        clientes,
        formData.clienteId
      ]
    )

  const planSeleccionado =
    useMemo(
      () =>
        planes.find(
          plan =>
            plan.id ===
            formData.tipoPlanId
        ),
      [
        planes,
        formData.tipoPlanId
      ]
    )


  /* ===================================================== */
  /* CARGA */
  /* ===================================================== */

  useEffect(() => {

    cargarDatos()

  }, [])


  useEffect(() => {

    const timer =
      setTimeout(
        () => {
          simularCredito()
        },
        500
      )

    return () =>
      clearTimeout(timer)

  }, [
    formData.tipoPlanId,
    formData.montoCredito,
    formData.interes,
    formData.cantidadCuotas,
    formData.diasGracia,
    formData.fechaOtorgamiento
  ])


  const cargarDatos =
    async () => {

      try {

        const clientesData =
          await clientService.list(
            1,
            100
          )

        const planesData =
          await tipoPlanService.list(
            1,
            100
          )

        setClientes(
          clientesData.clients || []
        )

        setPlanes(
          planesData.tiposPlan || []
        )

      } catch (error) {

        console.error(error)

      }

    }


  /* ===================================================== */
  /* HELPERS */
  /* ===================================================== */

  const money = value =>
    Number(
      value || 0
    ).toLocaleString(
      'es-AR'
    )

  const handleChange =
    event => {

      const {
        name,
        value
      } = event.target

      setFormData(
        prev => ({
          ...prev,
          [name]: value
        })
      )

    }


  /* ===================================================== */
  /* SIMULACION */
  /* ===================================================== */

  const simularCredito =
    async () => {

      setMensajeError('')

      if (
        !formData.tipoPlanId ||
        !formData.montoCredito ||
        !formData.cantidadCuotas
      ) {

        setSimulacion(null)

        return

      }

      try {

        setLoadingSimulacion(true)

        const data =
          await creditoService.simular({

            tipoPlanId:
              formData.tipoPlanId,

            cantidadCuotas:
              Number(
                formData.cantidadCuotas
              ),

            montoCredito:
              Number(
                formData.montoCredito
              ),

            interes:
              Number(
                formData.interes
              ),

            diasGracia:
              Number(
                formData.diasGracia
              ),

            fechaOtorgamiento:
              formData.fechaOtorgamiento

          })

        setSimulacion(data)

      } catch (error) {

        console.error(error)

        setSimulacion(null)

        setMensajeError(
          error?.response
            ?.data
            ?.message ||
          'Error al simular crédito'
        )

      } finally {

        setLoadingSimulacion(false)

      }

    }


  /* ===================================================== */
  /* RESUMEN LOCAL */
  /* ===================================================== */

  const resumen =
    useMemo(
      () => {

        const monto =
          Number(
            formData.montoCredito
          ) || 0

        const interes =
          Number(
            formData.interes
          ) || 0

        const cuotas =
          Number(
            formData.cantidadCuotas
          ) || 1

        const montoFinal =
          monto +
          (
            monto *
            interes
          ) / 100

        const valorCuota =
          Math.ceil(
            montoFinal /
            cuotas /
            50
          ) * 50

        return {
          montoFinal,
          valorCuota
        }

      },
      [
        formData.montoCredito,
        formData.interes,
        formData.cantidadCuotas
      ]
    )


  /* ===================================================== */
  /* CREAR */
  /* ===================================================== */

  const handleCrearCredito =
    async () => {

      try {

        setMensajeError('')

        setLoadingGuardar(true)

        const response =
          await creditoService.create({

            ...formData,

            montoCredito:
              Number(
                formData.montoCredito
              ),

            interes:
              Number(
                formData.interes
              ),

            cantidadCuotas:
              Number(
                formData.cantidadCuotas
              ),

            diasGracia:
              Number(
                formData.diasGracia
              )

          })

        setCreditoCreado(
          response.data
        )

        setShowConfirmModal(false)
        setShowSuccessModal(true)

      } catch (error) {

        console.error(error)

        setMensajeError(
          error?.response
            ?.data
            ?.message ||
          'Error al generar crédito'
        )

        setShowConfirmModal(false)

      } finally {

        setLoadingGuardar(false)

      }

    }


  return (

    <>

      {/* ================================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-[minmax(0,1fr)_360px]
        gap-5
        xl:gap-6
        items-start
      ">

        {/* ================================================= */}
        {/* FORMULARIO */}
        {/* ================================================= */}

        <div className="
          bg-white
          border
          border-stone-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          {/* HEADER FORM */}

          <div className="
            px-5
            md:px-6
            py-5
            border-b
            border-stone-100
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-amber-100
                text-amber-700
                flex
                items-center
                justify-center
              ">

                <CreditCard
                  className="w-5 h-5"
                />

              </div>

              <div>

                <h2 className="
                  font-bold
                  text-lg
                  text-stone-900
                ">
                  Datos del crédito
                </h2>

                <p className="
                  text-sm
                  text-stone-500
                ">
                  Información principal de la operación
                </p>

              </div>

            </div>

          </div>


          <div className="
            p-5
            md:p-6
            space-y-7
          ">

            {/* ERROR */}

            {mensajeError && (

              <div className="
                flex
                items-start
                gap-3
                bg-red-50
                border
                border-red-200
                text-red-700
                rounded-xl
                p-4
              ">

                <AlertTriangle
                  className="
                    w-5
                    h-5
                    shrink-0
                    mt-0.5
                  "
                />

                <div>

                  <p className="
                    font-semibold
                    text-sm
                  ">
                    No se pudo completar la operación
                  </p>

                  <p className="
                    text-sm
                    mt-0.5
                  ">
                    {mensajeError}
                  </p>

                </div>

              </div>

            )}


            {/* ================================================= */}
            {/* CLIENTE */}
            {/* ================================================= */}

            <FormSection
              icon={UserRound}
              title="Cliente"
              description="Seleccioná quién recibirá el crédito"
            >

              <div>

                <Label>
                  Buscar cliente
                </Label>

                <SearchSelect
                  items={clientes}
                  value={
                    formData.clienteId
                  }
                  valueField="id"
                  labelField={
                    cliente =>
                      `${cliente.apellido}, ${cliente.nombre} - DNI ${cliente.dni}`
                  }
                  placeholder="Nombre, apellido o DNI..."
                  onChange={
                    id =>
                      setFormData(
                        prev => ({
                          ...prev,
                          clienteId: id
                        })
                      )
                  }
                />

              </div>


              {clienteSeleccionado && (

                <div className="
                  mt-4
                  bg-emerald-50/70
                  border
                  border-emerald-200
                  rounded-xl
                  p-4
                ">

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                    mb-4
                  ">

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      <div className="
                        w-10
                        h-10
                        rounded-full
                        bg-emerald-100
                        text-emerald-700
                        flex
                        items-center
                        justify-center
                      ">

                        <UserCheck
                          className="w-5 h-5"
                        />

                      </div>

                      <div>

                        <p className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-emerald-700
                        ">
                          Cliente seleccionado
                        </p>

                        <p className="
                          font-bold
                          text-stone-900
                        ">
                          {
                            clienteSeleccionado
                              .apellido
                          }
                          {' '}
                          {
                            clienteSeleccionado
                              .nombre
                          }
                        </p>

                      </div>

                    </div>

                    <CheckCircle2
                      className="
                        w-5
                        h-5
                        text-emerald-600
                      "
                    />

                  </div>

                  <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-3
                    gap-3
                  ">

                    <InfoItem
                      icon={Hash}
                      label="DNI"
                      value={
                        clienteSeleccionado
                          .dni || '-'
                      }
                    />

                    <InfoItem
                      icon={Phone}
                      label="Celular"
                      value={
                        clienteSeleccionado
                          .celular || '-'
                      }
                    />

                    <InfoItem
                      icon={UserRound}
                      label="Cobrador"
                      value={
                        `${clienteSeleccionado.collector?.apellido || ''} ${clienteSeleccionado.collector?.nombre || ''}`.trim() ||
                        '-'
                      }
                    />

                  </div>

                </div>

              )}

            </FormSection>


            {/* ================================================= */}
            {/* IMPORTE */}
            {/* ================================================= */}

            <FormSection
              icon={Wallet}
              title="Importe y financiación"
              description="Definí el monto y las condiciones financieras"
            >

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              ">

                <div>

                  <Label>
                    Monto del crédito
                  </Label>

                  <div className="relative">

                    <span className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-stone-500
                      font-semibold
                    ">
                      $
                    </span>

                    <input
                      type="number"
                      name="montoCredito"
                      value={
                        formData.montoCredito
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      min="0"
                      className="
                        w-full
                        h-11
                        pl-8
                        pr-4
                        border
                        border-stone-300
                        rounded-xl
                        bg-white
                        outline-none
                        transition
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-500/20
                      "
                    />

                  </div>

                </div>


                <div>

                  <Label>
                    Interés
                  </Label>

                  <div className="relative">

                    <input
                      type="number"
                      name="interes"
                      value={
                        formData.interes
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      min="0"
                      className="
                        w-full
                        h-11
                        px-4
                        pr-10
                        border
                        border-stone-300
                        rounded-xl
                        bg-white
                        outline-none
                        transition
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-500/20
                      "
                    />

                    <Percent
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        w-4
                        h-4
                        text-stone-400
                      "
                    />

                  </div>

                </div>

              </div>

            </FormSection>


            {/* ================================================= */}
            {/* PLAN */}
            {/* ================================================= */}

            <FormSection
              icon={CalendarDays}
              title="Plan de cuotas"
              description="Configurá la frecuencia y cantidad de pagos"
            >

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              ">

                <div>

                  <Label>
                    Tipo de plan
                  </Label>

                  <SearchSelect
                    items={planes}
                    value={
                      formData.tipoPlanId
                    }
                    valueField="id"
                    labelField={
                      plan =>
                        `${plan.descripcion} (${plan.dias} días)`
                    }
                    placeholder="Seleccionar plan..."
                    onChange={
                      id =>
                        setFormData(
                          prev => ({
                            ...prev,
                            tipoPlanId: id
                          })
                        )
                    }
                  />

                </div>


                <div>

                  <Label>
                    Cantidad de cuotas
                  </Label>

                  <input
                    type="number"
                    name="cantidadCuotas"
                    value={
                      formData.cantidadCuotas
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ej: 20"
                    min="1"
                    className="
                      w-full
                      h-11
                      px-4
                      border
                      border-stone-300
                      rounded-xl
                      bg-white
                      outline-none
                      transition
                      focus:border-amber-500
                      focus:ring-2
                      focus:ring-amber-500/20
                    "
                  />

                </div>


                <div>

                  <Label>
                    Días de gracia
                  </Label>

                  <div className="relative">

                    <Clock3
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        w-4
                        h-4
                        text-stone-400
                      "
                    />

                    <input
                      type="number"
                      name="diasGracia"
                      value={
                        formData.diasGracia
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      className="
                        w-full
                        h-11
                        pl-11
                        pr-4
                        border
                        border-stone-300
                        rounded-xl
                        bg-white
                        outline-none
                        transition
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-500/20
                      "
                    />

                  </div>

                </div>


                <div>

                  <Label>
                    Fecha de otorgamiento
                  </Label>

                  <input
                    type="date"
                    name="fechaOtorgamiento"
                    value={
                      formData.fechaOtorgamiento
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      h-11
                      px-4
                      border
                      border-stone-300
                      rounded-xl
                      bg-white
                      outline-none
                      transition
                      focus:border-amber-500
                      focus:ring-2
                      focus:ring-amber-500/20
                    "
                  />

                </div>

              </div>

            </FormSection>


            {/* ================================================= */}
            {/* ENTREGA */}
            {/* ================================================= */}

            <FormSection
              icon={Banknote}
              title="Entrega"
              description="Indicá cómo se entrega el dinero"
            >

              <div>

                <Label>
                  Tipo de transacción
                </Label>

                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                ">

                  <TransactionButton
                    active={
                      formData
                        .tipoTransaccion ===
                      'EFECTIVO'
                    }
                    icon={Banknote}
                    title="Efectivo"
                    description="Entrega en mano"
                    onClick={
                      () =>
                        setFormData(
                          prev => ({
                            ...prev,
                            tipoTransaccion:
                              'EFECTIVO'
                          })
                        )
                    }
                  />

                  <TransactionButton
                    active={
                      formData
                        .tipoTransaccion ===
                      'TRANSFERENCIA'
                    }
                    icon={Landmark}
                    title="Transferencia"
                    description="Transferencia bancaria"
                    onClick={
                      () =>
                        setFormData(
                          prev => ({
                            ...prev,
                            tipoTransaccion:
                              'TRANSFERENCIA'
                          })
                        )
                    }
                  />

                </div>

              </div>

            </FormSection>


            {/* ================================================= */}
            {/* OBSERVACIONES */}
            {/* ================================================= */}

            <FormSection
              icon={FileText}
              title="Observaciones"
              description="Información adicional de la operación"
            >

              <textarea
                rows="3"
                name="observaciones"
                value={
                  formData.observaciones
                }
                onChange={
                  handleChange
                }
                placeholder="Agregar una observación opcional..."
                className="
                  w-full
                  p-4
                  border
                  border-stone-300
                  rounded-xl
                  bg-white
                  outline-none
                  resize-none
                  transition
                  focus:border-amber-500
                  focus:ring-2
                  focus:ring-amber-500/20
                "
              />

            </FormSection>

          </div>

        </div>


        {/* ================================================= */}
        {/* RESUMEN */}
        {/* ================================================= */}

        <div className="
          xl:sticky
          xl:top-20
          space-y-4
        ">

          <div className="
            bg-white
            border
            border-stone-200
            rounded-2xl
            shadow-sm
            overflow-hidden
          ">

            <div className="
              px-5
              py-4
              bg-stone-50
              border-b
              border-stone-200
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-9
                  h-9
                  rounded-xl
                  bg-blue-100
                  text-blue-700
                  flex
                  items-center
                  justify-center
                ">

                  <Calculator
                    className="w-5 h-5"
                  />

                </div>

                <div>

                  <h3 className="
                    font-bold
                    text-stone-900
                  ">
                    Resumen
                  </h3>

                  <p className="
                    text-xs
                    text-stone-500
                  ">
                    Simulación del crédito
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5">

              {/* RECALCULANDO */}

              {loadingSimulacion && (

                <div className="
                  flex
                  items-center
                  gap-2
                  bg-blue-50
                  text-blue-700
                  rounded-lg
                  px-3
                  py-2
                  mb-4
                  text-sm
                ">

                  <Loader2
                    className="
                      w-4
                      h-4
                      animate-spin
                    "
                  />

                  Recalculando...

                </div>

              )}


              {/* MONTO SOLICITADO */}

              <div className="
                pb-4
                border-b
                border-stone-100
              ">

                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  font-semibold
                  text-stone-400
                ">
                  Monto solicitado
                </p>

                <p className="
                  text-xl
                  font-bold
                  text-stone-800
                  mt-1
                ">
                  $ {money(
                    formData.montoCredito
                  )}
                </p>

              </div>


              {/* MONTO FINAL */}

              <div className="
                py-4
                border-b
                border-stone-100
              ">

                <p className="
                  text-sm
                  text-stone-500
                ">
                  Total a devolver
                </p>

                <p className="
                  text-3xl
                  font-bold
                  text-emerald-600
                  tracking-tight
                  mt-1
                ">
                  $ {money(
                    simulacion
                      ? simulacion.montoFinal
                      : resumen.montoFinal
                  )}
                </p>

                {formData.interes && (

                  <p className="
                    text-xs
                    text-stone-400
                    mt-1
                  ">
                    Incluye {formData.interes}%
                    de interés
                  </p>

                )}

              </div>


              {/* CUOTA */}

              <div className="
                py-4
                border-b
                border-stone-100
              ">

                <div className="
                  flex
                  justify-between
                  items-end
                  gap-4
                ">

                  <div>

                    <p className="
                      text-sm
                      text-stone-500
                    ">
                      Valor por cuota
                    </p>

                    <p className="
                      text-2xl
                      font-bold
                      text-blue-700
                      mt-1
                    ">
                      $ {money(
                        simulacion
                          ? simulacion.valorCuota
                          : resumen.valorCuota
                      )}
                    </p>

                  </div>

                  {formData.cantidadCuotas && (

                    <div className="
                      text-right
                    ">

                      <p className="
                        text-2xl
                        font-bold
                        text-stone-800
                      ">
                        {
                          formData
                            .cantidadCuotas
                        }
                      </p>

                      <p className="
                        text-xs
                        text-stone-400
                      ">
                        cuotas
                      </p>

                    </div>

                  )}

                </div>

              </div>


              {/* DETALLES */}

              <div className="
                py-4
                space-y-3
              ">

                {planSeleccionado && (

                  <SummaryRow
                    label="Frecuencia"
                    value={
                      `Cada ${planSeleccionado.dias} día(s)`
                    }
                  />

                )}

                <SummaryRow
                  label="Días de gracia"
                  value={
                    `${formData.diasGracia || 0} días`
                  }
                />

                <SummaryRow
                  label="Entrega"
                  value={
                    formData.tipoTransaccion ===
                    'EFECTIVO'
                      ? 'Efectivo'
                      : 'Transferencia'
                  }
                />

                {simulacion && (

                  <SummaryRow
                    label="Cuotas generadas"
                    value={
                      simulacion
                        .cuotas
                        .length
                    }
                  />

                )}

              </div>


              {/* BOTON */}

              <button
                type="button"
                onClick={
                  () =>
                    setShowConfirmModal(
                      true
                    )
                }
                disabled={
                  loadingGuardar ||
                  !simulacion ||
                  !formData.clienteId
                }
                className={`
                  w-full
                  h-12
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  gap-2
                  font-bold
                  transition

                  ${
                    !simulacion ||
                    !formData.clienteId

                      ? `
                        bg-stone-200
                        text-stone-400
                        cursor-not-allowed
                      `

                      : `
                        bg-amber-600
                        hover:bg-amber-700
                        text-white
                        shadow-sm
                      `
                  }
                `}
              >

                Generar crédito

                <ArrowRight
                  className="w-4 h-4"
                />

              </button>


              {!formData.clienteId && (

                <p className="
                  text-xs
                  text-center
                  text-stone-400
                  mt-2
                ">
                  Seleccioná un cliente para continuar
                </p>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* TABLA SIMULACION */}
      {/* ================================================= */}

      {simulacion && (

        <div className="
          mt-6
          bg-white
          border
          border-stone-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            justify-between
            gap-3
            px-5
            md:px-6
            py-5
            border-b
            border-stone-100
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-blue-50
                text-blue-700
                flex
                items-center
                justify-center
              ">

                <CalendarCheck
                  className="w-5 h-5"
                />

              </div>

              <div>

                <h3 className="
                  font-bold
                  text-stone-900
                ">
                  Cronograma de cuotas
                </h3>

                <p className="
                  text-sm
                  text-stone-500
                ">
                  Fechas previstas de cobro
                </p>

              </div>

            </div>

            <span className="
              self-start
              sm:self-auto
              bg-blue-50
              text-blue-700
              px-3
              py-1.5
              rounded-full
              text-xs
              font-bold
            ">
              {
                simulacion
                  .cuotas
                  .length
              } cuotas
            </span>

          </div>


          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              text-sm
            ">

              <thead className="
                bg-stone-50
                text-stone-500
              ">

                <tr>

                  <th className="
                    text-left
                    font-semibold
                    px-6
                    py-3
                  ">
                    Cuota
                  </th>

                  <th className="
                    text-left
                    font-semibold
                    px-6
                    py-3
                  ">
                    Fecha de pago
                  </th>

                  <th className="
                    text-left
                    font-semibold
                    px-6
                    py-3
                  ">
                    Vencimiento
                  </th>

                  <th className="
                    text-right
                    font-semibold
                    px-6
                    py-3
                  ">
                    Monto
                  </th>

                </tr>

              </thead>

              <tbody className="
                divide-y
                divide-stone-100
              ">

                {simulacion.cuotas.map(
                  cuota => (

                    <tr
                      key={
                        cuota.numeroCuota
                      }
                      className="
                        hover:bg-stone-50
                        transition
                      "
                    >

                      <td className="
                        px-6
                        py-3
                      ">

                        <span className="
                          inline-flex
                          items-center
                          justify-center
                          min-w-8
                          h-8
                          px-2
                          rounded-lg
                          bg-stone-100
                          font-bold
                          text-stone-700
                        ">
                          {
                            cuota
                              .numeroCuota
                          }
                        </span>

                      </td>

                      <td className="
                        px-6
                        py-3
                        text-stone-700
                      ">
                        {
                          new Date(
                            cuota.fechaPagoEsperada
                          )
                            .toLocaleDateString(
                              'es-AR'
                            )
                        }
                      </td>

                      <td className="
                        px-6
                        py-3
                        text-stone-700
                      ">
                        {
                          new Date(
                            cuota.fechaVencimiento
                          )
                            .toLocaleDateString(
                              'es-AR'
                            )
                        }
                      </td>

                      <td className="
                        px-6
                        py-3
                        text-right
                        font-bold
                        text-emerald-600
                      ">
                        $ {money(
                          cuota.monto
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ================================================= */}
      {/* CONFIRMACION */}
      {/* ================================================= */}

      {showConfirmModal && (

        <ModalOverlay>

          <div className="
            bg-white
            rounded-2xl
            shadow-2xl
            w-full
            max-w-md
            overflow-hidden
          ">

            <div className="
              flex
              items-center
              justify-between
              px-6
              py-5
              border-b
              border-stone-100
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-amber-100
                  text-amber-700
                  flex
                  items-center
                  justify-center
                ">

                  <AlertTriangle
                    className="w-5 h-5"
                  />

                </div>

                <div>

                  <h3 className="
                    font-bold
                    text-lg
                    text-stone-900
                  ">
                    Confirmar crédito
                  </h3>

                  <p className="
                    text-xs
                    text-stone-500
                  ">
                    Revisá los datos antes de continuar
                  </p>

                </div>

              </div>

              <button
                onClick={
                  () =>
                    setShowConfirmModal(
                      false
                    )
                }
                className="
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  hover:bg-stone-100
                  text-stone-400
                "
              >

                <X
                  className="w-5 h-5"
                />

              </button>

            </div>


            <div className="p-6">

              <div className="
                bg-stone-50
                rounded-xl
                p-4
                space-y-3
              ">

                <SummaryRow
                  label="Cliente"
                  value={
                    `${clienteSeleccionado?.apellido || ''} ${clienteSeleccionado?.nombre || ''}`
                  }
                />

                <SummaryRow
                  label="Monto solicitado"
                  value={
                    `$ ${money(formData.montoCredito)}`
                  }
                />

                <SummaryRow
                  label="Total a devolver"
                  value={
                    `$ ${money(simulacion?.montoFinal)}`
                  }
                  strong
                />

                <SummaryRow
                  label="Cantidad de cuotas"
                  value={
                    formData.cantidadCuotas
                  }
                />

                <SummaryRow
                  label="Valor por cuota"
                  value={
                    `$ ${money(simulacion?.valorCuota)}`
                  }
                  strong
                />

              </div>


              <div className="
                flex
                gap-3
                mt-6
              ">

                <button
                  onClick={
                    () =>
                      setShowConfirmModal(
                        false
                      )
                  }
                  className="
                    flex-1
                    h-11
                    border
                    border-stone-300
                    rounded-xl
                    font-semibold
                    text-stone-700
                    hover:bg-stone-50
                    transition
                  "
                >
                  Cancelar
                </button>

                <button
                  onClick={
                    handleCrearCredito
                  }
                  disabled={
                    loadingGuardar
                  }
                  className="
                    flex-1
                    h-11
                    bg-amber-600
                    hover:bg-amber-700
                    disabled:opacity-60
                    text-white
                    rounded-xl
                    font-bold
                    transition
                  "
                >
                  Confirmar
                </button>

              </div>

            </div>

          </div>

        </ModalOverlay>

      )}


      {/* ================================================= */}
      {/* LOADING GUARDAR */}
      {/* ================================================= */}

      {loadingGuardar && (

        <ModalOverlay>

          <div className="
            bg-white
            rounded-2xl
            p-8
            shadow-2xl
            text-center
            w-full
            max-w-sm
          ">

            <Loader2
              className="
                w-10
                h-10
                text-amber-600
                animate-spin
                mx-auto
                mb-4
              "
            />

            <p className="
              font-bold
              text-stone-900
            ">
              Generando crédito
            </p>

            <p className="
              text-sm
              text-stone-500
              mt-2
            ">
              Estamos creando el crédito
              y su cronograma de cuotas...
            </p>

          </div>

        </ModalOverlay>

      )}


      {/* ================================================= */}
      {/* EXITO */}
      {/* ================================================= */}

      {showSuccessModal && (

        <ModalOverlay>

          <div className="
            bg-white
            rounded-2xl
            shadow-2xl
            w-full
            max-w-lg
            overflow-hidden
          ">

            <div className="
              px-6
              pt-8
              pb-5
              text-center
            ">

              <div className="
                w-16
                h-16
                mx-auto
                rounded-full
                bg-emerald-100
                text-emerald-600
                flex
                items-center
                justify-center
                mb-4
              ">

                <CheckCircle2
                  className="w-8 h-8"
                />

              </div>

              <h3 className="
                text-2xl
                font-bold
                text-stone-900
              ">
                Crédito generado
              </h3>

              <p className="
                text-stone-500
                mt-2
              ">
                La operación fue creada
                correctamente.
              </p>

            </div>


            <div className="
              px-6
              pb-6
            ">

              <div className="
                bg-emerald-50/60
                border
                border-emerald-100
                rounded-xl
                p-4
                space-y-3
              ">

                <SummaryRow
                  label="Cliente"
                  value={
                    `${clienteSeleccionado?.apellido || ''} ${clienteSeleccionado?.nombre || ''}`
                  }
                />

                <SummaryRow
                  label="Monto final"
                  value={
                    `$ ${money(creditoCreado?.montoFinal)}`
                  }
                  strong
                />

                <SummaryRow
                  label="Cuotas"
                  value={
                    creditoCreado
                      ?.cantidadCuotas
                  }
                />

              </div>


              <div className="
                grid
                grid-cols-2
                gap-3
                mt-6
              ">

                <button
                  onClick={
                    () =>
                      navigate(
                        '/creditos'
                      )
                  }
                  className="
                    h-11
                    border
                    border-stone-300
                    rounded-xl
                    font-semibold
                    text-stone-700
                    hover:bg-stone-50
                    transition
                  "
                >
                  Ir al listado
                </button>

                <button
                  onClick={
                    () =>
                      navigate(
                        `/creditos/${creditoCreado.id}`
                      )
                  }
                  className="
                    h-11
                    bg-emerald-600
                    hover:bg-emerald-700
                    text-white
                    rounded-xl
                    font-bold
                    transition
                  "
                >
                  Ver crédito
                </button>

              </div>

            </div>

          </div>

        </ModalOverlay>

      )}

    </>

  )

}


/* ===================================================== */
/* COMPONENTES VISUALES */
/* ===================================================== */

function FormSection({
  icon: Icon,
  title,
  description,
  children
}) {

  return (

    <section>

      <div className="
        flex
        items-center
        gap-3
        mb-4
      ">

        <div className="
          w-8
          h-8
          rounded-lg
          bg-stone-100
          text-stone-600
          flex
          items-center
          justify-center
        ">

          <Icon
            className="w-4 h-4"
          />

        </div>

        <div>

          <h3 className="
            text-sm
            font-bold
            text-stone-800
          ">
            {title}
          </h3>

          <p className="
            text-xs
            text-stone-400
          ">
            {description}
          </p>

        </div>

      </div>

      <div className="
        pl-0
        md:pl-11
      ">
        {children}
      </div>

    </section>

  )

}


function Label({
  children
}) {

  return (

    <label className="
      block
      mb-2
      text-sm
      font-semibold
      text-stone-700
    ">
      {children}
    </label>

  )

}


function InfoItem({
  icon: Icon,
  label,
  value
}) {

  return (

    <div>

      <div className="
        flex
        items-center
        gap-1.5
        text-emerald-700
        mb-1
      ">

        <Icon
          className="w-3.5 h-3.5"
        />

        <span className="
          text-[11px]
          font-semibold
          uppercase
        ">
          {label}
        </span>

      </div>

      <p className="
        text-sm
        font-semibold
        text-stone-800
      ">
        {value}
      </p>

    </div>

  )

}


function TransactionButton({
  active,
  icon: Icon,
  title,
  description,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        gap-3
        text-left
        p-4
        border
        rounded-xl
        transition

        ${
          active

            ? `
              border-amber-500
              bg-amber-50
              ring-1
              ring-amber-500
            `

            : `
              border-stone-200
              hover:border-stone-300
              hover:bg-stone-50
            `
        }
      `}
    >

      <div className={`
        w-9
        h-9
        rounded-lg
        flex
        items-center
        justify-center

        ${
          active
            ? `
              bg-amber-100
              text-amber-700
            `
            : `
              bg-stone-100
              text-stone-500
            `
        }
      `}>

        <Icon
          className="w-4 h-4"
        />

      </div>

      <div className="flex-1">

        <p className="
          text-sm
          font-bold
          text-stone-800
        ">
          {title}
        </p>

        <p className="
          text-xs
          text-stone-400
        ">
          {description}
        </p>

      </div>

      {active && (

        <CheckCircle2
          className="
            w-5
            h-5
            text-amber-600
          "
        />

      )}

    </button>

  )

}


function SummaryRow({
  label,
  value,
  strong = false
}) {

  return (

    <div className="
      flex
      items-center
      justify-between
      gap-4
    ">

      <span className="
        text-sm
        text-stone-500
      ">
        {label}
      </span>

      <span className={`
        text-sm
        text-right

        ${
          strong
            ? `
              font-bold
              text-emerald-600
            `
            : `
              font-semibold
              text-stone-800
            `
        }
      `}>
        {value}
      </span>

    </div>

  )

}


function ModalOverlay({
  children
}) {

  return (

    <div className="
      fixed
      inset-0
      z-[100]
      bg-stone-900/50
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
    ">
      {children}
    </div>

  )

}