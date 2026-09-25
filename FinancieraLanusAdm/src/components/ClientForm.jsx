import React, {
  useEffect,
  useState,
} from "react";

import SearchSelect from "./SearchSelect";

import {
  clientService,
  fotoUrl,
} from "../services/clientService";

export default function ClientForm({
  initialData = {},
  collectors = [],
  onSubmit,
  onClose,
  isLoading,
}) {
  const emptyForm = {
    nombre: "",
    apellido: "",
    dni: "",
    celular: "",
    direccion: "",
    cobradorId: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const [ubicacion, setUbicacion] =
    useState(null);

  const [
    loadingUbicacion,
    setLoadingUbicacion,
  ] = useState(false);

  const [errors, setErrors] =
    useState({});

  /*
  Filtro de oficina para no mezclar cobradores de oficinas
  distintas al cargar un cliente. Las opciones salen de las
  oficinas presentes entre los cobradores disponibles.
  */
  const [oficinaFiltro, setOficinaFiltro] =
    useState("");

  /*
  Fotos del cliente: las ya guardadas (edición), las que se
  marcan para eliminar, y las nuevas seleccionadas (aún sin
  subir; se suben al guardar).
  */
  const [
    fotosExistentes,
    setFotosExistentes,
  ] = useState([]);

  const [
    fotosAEliminar,
    setFotosAEliminar,
  ] = useState([]);

  const [nuevasFotos, setNuevasFotos] =
    useState([]);

  const cobradorSeleccionado =
    collectors.find(
      (c) => c.id === formData.cobradorId,
    );

  const oficinasDeCobradores =
    Array.from(
      new Map(
        collectors
          .filter((c) => c.oficina)
          .map((c) => [
            c.oficina.id,
            c.oficina,
          ]),
      ).values(),
    );

  /*
  Oficina efectiva: la elegida a mano, o la del cobrador ya
  seleccionado (edición), o la única disponible.
  */
  const oficinaFiltroEfectivo =
    oficinaFiltro ||
    cobradorSeleccionado?.oficina?.id ||
    (oficinasDeCobradores.length === 1
      ? oficinasDeCobradores[0].id
      : "");

  const cobradoresFiltrados =
    oficinaFiltroEfectivo
      ? collectors.filter(
          (c) =>
            c.oficina?.id ===
            oficinaFiltroEfectivo,
        )
      : collectors;

  const handleOficinaFiltroChange = (
    id,
  ) => {
    setOficinaFiltro(id || "");

    /*
    Si el cobrador elegido no es de la nueva oficina, se limpia.
    */
    if (
      formData.cobradorId &&
      !collectors.some(
        (c) =>
          c.id === formData.cobradorId &&
          c.oficina?.id === id,
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        cobradorId: "",
      }));
    }
  };

  useEffect(() => {
    setFormData({
      ...emptyForm,
      ...initialData,

      cobradorId:
        initialData.cobradorId ||
        initialData.cobrador?.id ||
        "",
    });

    if (
      initialData.latitud != null &&
      initialData.longitud != null
    ) {
      setUbicacion({
        latitud:
          initialData.latitud,

        longitud:
          initialData.longitud,

        direccion:
          initialData.direccion ||
          "",
      });
    } else {
      setUbicacion(null);
    }

    setErrors({});

    setFotosExistentes(
      initialData.fotos || [],
    );
    setFotosAEliminar([]);
    setNuevasFotos([]);
    setOficinaFiltro("");
  }, [initialData]);

  const handleAgregarFotos = (e) => {
    const files = Array.from(
      e.target.files || [],
    );
    if (files.length) {
      setNuevasFotos((prev) => [
        ...prev,
        ...files,
      ]);
    }
    // Permite volver a elegir el mismo archivo.
    e.target.value = "";
  };

  const quitarNuevaFoto = (index) => {
    setNuevasFotos((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const marcarFotoAEliminar = (fotoId) => {
    setFotosAEliminar((prev) => [
      ...prev,
      fotoId,
    ]);
    setFotosExistentes((prev) =>
      prev.filter((f) => f.id !== fotoId),
    );
  };

  const buscarUbicacion =
    async () => {
      if (
        !formData.direccion?.trim()
      ) {
        setErrors((prev) => ({
          ...prev,
          direccion:
            "Ingresá una dirección antes de validarla",
        }));

        return;
      }

      try {
        setLoadingUbicacion(true);

        const data =
          await clientService.geolocalizar(
            {
              direccion:
                formData.direccion.trim(),
            },
          );

        if (
          data?.latitud == null ||
          data?.longitud == null
        ) {
          throw new Error(
            "Ubicación sin coordenadas",
          );
        }

        setUbicacion({
          latitud:
            data.latitud,

          longitud:
            data.longitud,

          direccion:
            data.direccion ||
            formData.direccion,
        });

        setErrors((prev) => ({
          ...prev,
          direccion: "",
        }));
      } catch (error) {
        console.error(error);

        setUbicacion(null);

        setErrors((prev) => ({
          ...prev,

          direccion:
            "No se pudo localizar la dirección. Revisala e intentá nuevamente.",
        }));
      } finally {
        setLoadingUbicacion(
          false,
        );
      }
    };

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.nombre?.trim()
    ) {
      newErrors.nombre =
        "Nombre es requerido";
    }

    if (
      !formData.apellido?.trim()
    ) {
      newErrors.apellido =
        "Apellido es requerido";
    }

    if (!formData.dni?.trim()) {
      newErrors.dni =
        "DNI es requerido";
    }

    if (
      !formData.cobradorId
    ) {
      newErrors.cobradorId =
        "Cobrador es requerido";
    }

    if (
      formData.celular &&
      !/^\d{7,}$/.test(
        formData.celular.replace(
          /\D/g,
          "",
        ),
      )
    ) {
      newErrors.celular =
        "Celular inválido";
    }

    if (
      !formData.direccion?.trim()
    ) {
      newErrors.direccion =
        "Dirección requerida";
    }

    return newErrors;
  };

  const handleChange = (
    e,
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    /*
     * IMPORTANTE:
     * si cambia la dirección,
     * la ubicación anterior deja
     * de ser válida.
     */
    if (name === "direccion") {
      setUbicacion(null);
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCollectorChange = (
    id,
  ) => {
    setFormData((prev) => ({
      ...prev,
      cobradorId: id,
    }));

    if (errors.cobradorId) {
      setErrors((prev) => ({
        ...prev,
        cobradorId: "",
      }));
    }
  };

  const handleSubmit = (
    e,
  ) => {
    e.preventDefault();

    const newErrors =
      validateForm();

    if (
      Object.keys(
        newErrors,
      ).length > 0
    ) {
      setErrors(newErrors);
      return;
    }

    /*
     * ACÁ ESTABA EL BUG.
     *
     * Antes se enviaba:
     *
     * onSubmit({
     *   ...formData
     * })
     *
     * pero "ubicacion" estaba
     * completamente afuera.
     */

    onSubmit({
      ...formData,

      latitud:
        ubicacion?.latitud ??
        null,

      longitud:
        ubicacion?.longitud ??
        null,

      nuevasFotos,
      fotosAEliminar,
    });
  };

  const inputClass = `
    w-full
    rounded-xl
    border
    border-stone-200
    bg-stone-50
    px-3.5
    py-2.5
    text-sm
    text-stone-900
    outline-none
    transition
    placeholder:text-stone-400
    focus:border-amber-400
    focus:bg-white
    focus:ring-4
    focus:ring-amber-100
    disabled:cursor-not-allowed
    disabled:opacity-60
    dark:border-stone-700
    dark:bg-stone-800
    dark:text-white
    dark:focus:border-amber-600
    dark:focus:bg-stone-800
    dark:focus:ring-amber-900/30
  `;

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >
      <div
        className="
          space-y-6
          p-5
          sm:p-6
        "
      >
        {/* DATOS PERSONALES */}
        <section>
          <div className="mb-4">
            <h3
              className="
                font-semibold
                text-stone-800
                dark:text-stone-100
              "
            >
              Datos personales
            </h3>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              Información principal
              del cliente.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            <Field
              label="Nombre"
              error={
                errors.nombre
              }
            >
              <input
                type="text"
                name="nombre"
                value={
                  formData.nombre
                }
                onChange={
                  handleChange
                }
                disabled={
                  isLoading
                }
                placeholder="Nombre"
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="Apellido"
              error={
                errors.apellido
              }
            >
              <input
                type="text"
                name="apellido"
                value={
                  formData.apellido
                }
                onChange={
                  handleChange
                }
                disabled={
                  isLoading
                }
                placeholder="Apellido"
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="DNI"
              error={errors.dni}
            >
              <input
                type="text"
                inputMode="numeric"
                name="dni"
                value={
                  formData.dni
                }
                onChange={
                  handleChange
                }
                disabled={
                  isLoading
                }
                placeholder="Ej: 30123456"
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="Celular"
              error={
                errors.celular
              }
            >
              <input
                type="tel"
                name="celular"
                value={
                  formData.celular
                }
                onChange={
                  handleChange
                }
                disabled={
                  isLoading
                }
                placeholder="Ej: 1123456789"
                className={
                  inputClass
                }
              />
            </Field>
          </div>
        </section>

        <div
          className="
            border-t
            border-stone-100
            dark:border-stone-800
          "
        />

        {/* COBRADOR */}
        <section>
          <div className="mb-4">
            <h3
              className="
                font-semibold
                text-stone-800
                dark:text-stone-100
              "
            >
              Asignación
            </h3>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              Seleccioná el cobrador
              responsable.
            </p>
          </div>

          {oficinasDeCobradores.length >
            1 && (
            <Field label="Oficina">
              <SearchSelect
                items={
                  oficinasDeCobradores
                }
                value={
                  oficinaFiltroEfectivo
                }
                valueField="id"
                labelField="nombre"
                placeholder="Elegí la oficina..."
                onChange={
                  handleOficinaFiltroChange
                }
              />
            </Field>
          )}

          <Field
            label="Cobrador"
            error={
              errors.cobradorId
            }
          >
            <SearchSelect
              items={
                cobradoresFiltrados
              }
              value={
                formData.cobradorId
              }
              valueField="id"
              labelField={(c) =>
                `${c.apellido}, ${c.nombre} — ${c.zone?.nombre || "Sin zona"}`
              }
              placeholder={
                oficinasDeCobradores.length >
                  1 &&
                !oficinaFiltroEfectivo
                  ? "Elegí una oficina primero"
                  : "Buscar cobrador..."
              }
              isDisabled={
                oficinasDeCobradores.length >
                  1 &&
                !oficinaFiltroEfectivo
              }
              onChange={
                handleCollectorChange
              }
            />
          </Field>

          {cobradorSeleccionado && (
            <p
              className="
                mt-2
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-amber-50
                px-3
                py-1.5
                text-xs
                font-semibold
                text-amber-700
                dark:bg-amber-950/40
                dark:text-amber-300
              "
            >
              📍 Zona:{" "}
              {cobradorSeleccionado.zone
                ?.nombre ||
                "Sin zona asignada"}
            </p>
          )}
        </section>

        <div
          className="
            border-t
            border-stone-100
            dark:border-stone-800
          "
        />

        {/* UBICACIÓN */}
        <section>
          <div className="mb-4">
            <h3
              className="
                font-semibold
                text-stone-800
                dark:text-stone-100
              "
            >
              Ubicación
            </h3>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              Ingresá la dirección y
              validá su posición en el
              mapa.
            </p>
          </div>

          <Field
            label="Dirección o coordenadas"
            error={
              errors.direccion
            }
          >
            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
              "
            >
              <input
                type="text"
                name="direccion"
                value={
                  formData.direccion
                }
                onChange={
                  handleChange
                }
                disabled={
                  isLoading
                }
                placeholder="Ej: Av. Hipólito Yrigoyen 1234, Lanús"
                className={`
                  ${inputClass}
                  flex-1
                `}
              />

              <button
                type="button"
                onClick={
                  buscarUbicacion
                }
                disabled={
                  loadingUbicacion ||
                  isLoading
                }
                className="
                  inline-flex
                  min-h-[42px]
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-amber-200
                  bg-amber-50
                  px-4
                  text-sm
                  font-semibold
                  text-amber-700
                  transition
                  hover:border-amber-300
                  hover:bg-amber-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-amber-800
                  dark:bg-amber-950/30
                  dark:text-amber-300
                "
              >
                {loadingUbicacion ? (
                  <>
                    <Spinner />
                    Buscando
                  </>
                ) : (
                  <>
                    📍
                    Validar
                  </>
                )}
              </button>
            </div>
          </Field>

          {ubicacion && (
            <div
              className="
                mt-4
                overflow-hidden
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50/50
                dark:border-emerald-900
                dark:bg-emerald-950/20
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                  p-4
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-100
                    text-emerald-600
                    dark:bg-emerald-900/50
                    dark:text-emerald-400
                  "
                >
                  ✓
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-emerald-800
                      dark:text-emerald-300
                    "
                  >
                    Ubicación validada
                  </p>

                  {ubicacion.direccion && (
                    <p
                      className="
                        mt-1
                        text-xs
                        text-stone-600
                        dark:text-stone-400
                      "
                    >
                      {
                        ubicacion.direccion
                      }
                    </p>
                  )}

                  <p
                    className="
                      mt-1
                      font-mono
                      text-[11px]
                      text-stone-400
                    "
                  >
                    {
                      ubicacion.latitud
                    }
                    ,{" "}
                    {
                      ubicacion.longitud
                    }
                  </p>
                </div>
              </div>

              <iframe
                title="Ubicación del cliente"
                width="100%"
                height="180"
                loading="lazy"
                className="
                  block
                  w-full
                  border-0
                "
                src={`https://maps.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}&z=16&output=embed`}
              />
            </div>
          )}

          {!ubicacion &&
            formData.direccion && (
              <div
                className="
                  mt-3
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-stone-50
                  px-3
                  py-2
                  text-xs
                  text-stone-500
                  dark:bg-stone-800
                  dark:text-stone-400
                "
              >
                <span>📍</span>

                Validá la dirección para
                guardar sus coordenadas.
              </div>
            )}
        </section>

        {/* FOTOS */}
        <section>
          <div className="mb-4">
            <h3
              className="
                font-semibold
                text-stone-800
                dark:text-stone-100
              "
            >
              Fotos
            </h3>

            <p
              className="
                mt-0.5
                text-xs
                text-stone-400
              "
            >
              Podés cargar una o varias fotos del cliente.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-3
              sm:grid-cols-4
            "
          >
            {fotosExistentes.map((foto) => (
              <FotoThumb
                key={foto.id}
                src={fotoUrl(foto.url)}
                onRemove={() =>
                  marcarFotoAEliminar(foto.id)
                }
                disabled={isLoading}
              />
            ))}

            {nuevasFotos.map((file, index) => (
              <FotoThumb
                key={`nueva-${index}`}
                src={URL.createObjectURL(file)}
                nueva
                onRemove={() =>
                  quitarNuevaFoto(index)
                }
                disabled={isLoading}
              />
            ))}

            <label
              className="
                flex
                aspect-square
                cursor-pointer
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                border-2
                border-dashed
                border-stone-300
                bg-stone-50
                text-stone-400
                transition
                hover:border-amber-400
                hover:text-amber-600
                dark:border-stone-600
                dark:bg-stone-800
              "
            >
              <span className="text-2xl">+</span>
              <span className="text-[11px] font-medium">
                Agregar
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isLoading}
                onChange={handleAgregarFotos}
                className="hidden"
              />
            </label>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div
        className="
          sticky
          bottom-0
          z-10
          flex
          flex-col-reverse
          gap-2
          border-t
          border-stone-200
          bg-white
          px-5
          py-4
          sm:flex-row
          sm:justify-end
          sm:px-6
          dark:border-stone-700
          dark:bg-stone-900
        "
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="
            min-h-[42px]
            rounded-xl
            border
            border-stone-200
            px-5
            py-2.5
            text-sm
            font-semibold
            text-stone-600
            transition
            hover:bg-stone-50
            disabled:opacity-50
            dark:border-stone-700
            dark:text-stone-300
            dark:hover:bg-stone-800
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            isLoading ||
            loadingUbicacion
          }
          className="
            inline-flex
            min-h-[42px]
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-stone-900
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-stone-800
            disabled:cursor-not-allowed
            disabled:opacity-50
            dark:bg-amber-500
            dark:text-stone-950
            dark:hover:bg-amber-400
          "
        >
          {isLoading ? (
            <>
              <Spinner />
              Guardando...
            </>
          ) : (
            <>
              ✓
              Guardar cliente
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function FotoThumb({
  src,
  nueva,
  onRemove,
  disabled,
}) {
  return (
    <div
      className="
        group
        relative
        aspect-square
        overflow-hidden
        rounded-xl
        border
        border-stone-200
        bg-stone-100
        dark:border-stone-700
        dark:bg-stone-800
      "
    >
      <img
        src={src}
        alt="Foto del cliente"
        className="h-full w-full object-cover"
      />

      {nueva && (
        <span
          className="
            absolute
            left-1
            top-1
            rounded
            bg-amber-500
            px-1.5
            py-0.5
            text-[10px]
            font-bold
            text-white
          "
        >
          Nueva
        </span>
      )}

      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="
            absolute
            right-1
            top-1
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-black/60
            text-sm
            font-bold
            text-white
            transition
            hover:bg-red-600
          "
          title="Quitar"
        >
          ×
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}) {
  return (
    <div>
      <label
        className="
          mb-1.5
          block
          text-sm
          font-medium
          text-stone-700
          dark:text-stone-300
        "
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          className="
            mt-1.5
            text-xs
            font-medium
            text-red-500
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-current
        border-t-transparent
      "
    />
  );
}