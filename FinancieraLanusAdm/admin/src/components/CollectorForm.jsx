import React, {
  useEffect,
  useState,
} from "react";

import {
  supervisorService,
} from "../services/supervisorService";

import {
  zoneService,
} from "../services/zoneService";

import SearchSelect from "../components/SearchSelect";

export default function CollectorForm({
  initialData = {},
  onSubmit,
  onClose,
  isLoading,
}) {
  const emptyForm = {
    nombre: "",
    apellido: "",
    dni: "",
    celular: "",
    zoneId: "",
    supervisorId: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const [errors, setErrors] =
    useState({});

  const [
    crearUsuario,
    setCrearUsuario,
  ] = useState(false);

  const [usuario, setUsuario] =
    useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [
    usuarioEditado,
    setUsuarioEditado,
  ] = useState(false);

  const [
    supervisores,
    setSupervisores,
  ] = useState([]);

  const [zonas, setZonas] =
    useState([]);

  useEffect(() => {
    const cargarDatos =
      async () => {
        try {
          const [
            supervisoresData,
            zonasData,
          ] =
            await Promise.all([
              supervisorService.listar(
                1,
                100,
              ),

              zoneService.list(),
            ]);

          setSupervisores(
            supervisoresData
              ?.supervisores ||
              [],
          );

          setZonas(
            Array.isArray(
              zonasData,
            )
              ? zonasData
              : [],
          );
        } catch (error) {
          console.error(
            "Error cargando datos del formulario:",
            error,
          );
        }
      };

    cargarDatos();
  }, []);

  useEffect(() => {
    setFormData({
      ...emptyForm,
      ...initialData,

      zoneId:
        initialData.zoneId ||
        initialData.zone?.id ||
        "",

      supervisorId:
        initialData.supervisorId ||
        initialData.supervisor
          ?.id ||
        "",
    });

    setCrearUsuario(
      !!initialData.userId,
    );

    setUsuario({
      username:
        initialData.user
          ?.username ||
        "",

      email:
        initialData.user?.email ||
        "",

      password: "",

      confirmPassword: "",
    });

    setUsuarioEditado(false);

    setErrors({});
  }, [initialData]);

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

    if (!formData.zoneId) {
      newErrors.zoneId =
        "Seleccione una zona";
    }

    if (
      !formData.supervisorId
    ) {
      newErrors.supervisorId =
        "Seleccione un supervisor";
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

    if (crearUsuario) {
      if (
        !usuario.username?.trim()
      ) {
        newErrors.username =
          "Usuario requerido";
      }

      if (
        !usuario.email?.trim()
      ) {
        newErrors.email =
          "Email requerido";
      }

      if (
        !initialData.userId &&
        !usuario.password
      ) {
        newErrors.password =
          "Contraseña requerida";
      }

      if (
        !initialData.userId &&
        usuario.password !==
          usuario.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Las contraseñas no coinciden";
      }
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

    const nuevo = {
      ...formData,
      [name]: value,
    };

    setFormData(nuevo);

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (
      crearUsuario &&
      !usuarioEditado &&
      (
        name === "nombre" ||
        name === "apellido"
      )
    ) {
      generarUsuario(
        name === "nombre"
          ? value
          : nuevo.nombre,

        name === "apellido"
          ? value
          : nuevo.apellido,
      );
    }
  };

  const handleZoneChange = (
    id,
  ) => {
    setFormData((prev) => ({
      ...prev,
      zoneId: id,
    }));

    if (errors.zoneId) {
      setErrors((prev) => ({
        ...prev,
        zoneId: "",
      }));
    }
  };

  const handleSupervisorChange = (
    id,
  ) => {
    setFormData((prev) => ({
      ...prev,
      supervisorId: id,
    }));

    if (
      errors.supervisorId
    ) {
      setErrors((prev) => ({
        ...prev,
        supervisorId: "",
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
      ).length
    ) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      crearUsuario,
      usuario,
    });
  };

  const generarUsuario = (
    nombre,
    apellido,
  ) => {
    if (
      !nombre?.trim() ||
      !apellido?.trim()
    ) {
      return;
    }

    const limpiar = (
      texto,
    ) =>
      texto
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        )
        .toLowerCase()
        .trim();

    const nombreLimpio =
      limpiar(nombre)
        .split(/\s+/)[0];

    const apellidoLimpio =
      limpiar(apellido)
        .split(/\s+/)[0];

    if (
      !nombreLimpio ||
      !apellidoLimpio
    ) {
      return;
    }

    const username = `${
      nombreLimpio[0]
    }${apellidoLimpio}`;

    setUsuario((prev) => ({
      ...prev,

      username,

      email:
        `${username}@empresa.com`,
    }));
  };

  const handleCrearUsuario =
    (checked) => {
      setCrearUsuario(checked);

      if (
        checked &&
        !initialData.userId &&
        !usuarioEditado
      ) {
        generarUsuario(
          formData.nombre,
          formData.apellido,
        );
      }
    };

  const handleUsuarioChange = (
    field,
    value,
  ) => {
    setUsuario((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
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
          <SectionTitle
            title="Datos personales"
            description="Información principal del cobrador."
          />

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

        <Divider />

        {/* ASIGNACIÓN */}
        <section>
          <SectionTitle
            title="Asignación"
            description="Zona de trabajo y supervisor responsable."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            <Field
              label="Zona"
              error={
                errors.zoneId
              }
            >
              <SearchSelect
                items={zonas}
                value={
                  formData.zoneId
                }
                valueField="id"
                labelField="nombre"
                placeholder="Buscar zona..."
                isDisabled={
                  isLoading
                }
                onChange={
                  handleZoneChange
                }
              />
            </Field>

            <Field
              label="Supervisor"
              error={
                errors.supervisorId
              }
            >
              <SearchSelect
                items={
                  supervisores
                }
                value={
                  formData.supervisorId
                }
                valueField="id"
                labelField={(s) =>
                  `${s.apellido || ""}, ${s.nombre || ""}`
                }
                placeholder="Buscar supervisor..."
                isDisabled={
                  isLoading
                }
                onChange={
                  handleSupervisorChange
                }
              />
            </Field>
          </div>
        </section>

        <Divider />

        {/* ACCESO */}
        <section>
          <SectionTitle
            title="Acceso a la aplicación"
            description="Configurá las credenciales que utilizará el cobrador."
          />

          <div
            className="
              rounded-2xl
              border
              border-stone-200
              bg-stone-50/70
              p-4
              dark:border-stone-700
              dark:bg-stone-800/40
            "
          >
            <label
              className={`
                flex
                items-start
                gap-3
                ${
                  initialData.userId
                    ? "cursor-default"
                    : "cursor-pointer"
                }
              `}
            >
              <div
                className="
                  pt-0.5
                "
              >
                <input
                  type="checkbox"
                  checked={
                    crearUsuario
                  }
                  disabled={
                    !!initialData.userId ||
                    isLoading
                  }
                  onChange={(e) =>
                    handleCrearUsuario(
                      e.target
                        .checked,
                    )
                  }
                  className="
                    h-4
                    w-4
                    rounded
                    border-stone-300
                    accent-amber-500
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-stone-700
                    dark:text-stone-200
                  "
                >
                  Habilitar acceso a la
                  App
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-stone-400
                  "
                >
                  El cobrador podrá
                  iniciar sesión desde
                  la aplicación móvil.
                </p>
              </div>
            </label>

            {crearUsuario && (
              <div
                className="
                  mt-5
                  border-t
                  border-stone-200
                  pt-5
                  dark:border-stone-700
                "
              >
                {initialData.userId && (
                  <div
                    className="
                      mb-4
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-3
                      py-2.5
                      text-xs
                      font-medium
                      text-emerald-700
                      dark:border-emerald-900
                      dark:bg-emerald-950/30
                      dark:text-emerald-300
                    "
                  >
                    <span>✓</span>

                    Este cobrador ya
                    posee un usuario de
                    acceso.
                  </div>
                )}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >
                  <Field
                    label="Usuario"
                    error={
                      errors.username
                    }
                  >
                    <input
                      type="text"
                      value={
                        usuario.username
                      }
                      disabled={
                        !!initialData.userId ||
                        isLoading
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value;

                        setUsuarioEditado(
                          true,
                        );

                        setUsuario(
                          (prev) => ({
                            ...prev,

                            username:
                              value,

                            email:
                              `${value}@empresa.com`,
                          }),
                        );

                        if (
                          errors.username
                        ) {
                          setErrors(
                            (prev) => ({
                              ...prev,
                              username:
                                "",
                            }),
                          );
                        }
                      }}
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field
                    label="Email"
                    error={
                      errors.email
                    }
                  >
                    <input
                      type="email"
                      value={
                        usuario.email
                      }
                      disabled={
                        !!initialData.userId ||
                        isLoading
                      }
                      onChange={(e) =>
                        handleUsuarioChange(
                          "email",
                          e.target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  {!initialData.userId && (
                    <>
                      <Field
                        label="Contraseña"
                        error={
                          errors.password
                        }
                      >
                        <input
                          type="password"
                          value={
                            usuario.password
                          }
                          disabled={
                            isLoading
                          }
                          onChange={(e) =>
                            handleUsuarioChange(
                              "password",
                              e.target
                                .value,
                            )
                          }
                          placeholder="Contraseña"
                          className={
                            inputClass
                          }
                        />
                      </Field>

                      <Field
                        label="Confirmar contraseña"
                        error={
                          errors.confirmPassword
                        }
                      >
                        <input
                          type="password"
                          value={
                            usuario.confirmPassword
                          }
                          disabled={
                            isLoading
                          }
                          onChange={(e) =>
                            handleUsuarioChange(
                              "confirmPassword",
                              e.target
                                .value,
                            )
                          }
                          placeholder="Repetir contraseña"
                          className={
                            inputClass
                          }
                        />
                      </Field>
                    </>
                  )}
                </div>
              </div>
            )}
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
          disabled={isLoading}
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
              Guardar cobrador
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SectionTitle({
  title,
  description,
}) {
  return (
    <div className="mb-4">
      <h3
        className="
          font-semibold
          text-stone-800
          dark:text-stone-100
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-0.5
          text-xs
          text-stone-400
        "
      >
        {description}
      </p>
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

function Divider() {
  return (
    <div
      className="
        border-t
        border-stone-100
        dark:border-stone-800
      "
    />
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