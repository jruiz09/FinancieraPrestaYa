import React, {
  useEffect,
  useState,
} from "react";

export default function SupervisorModal({
  open,
  onClose,
  onSave,
  supervisor,
  isLoading = false,
}) {
  const emptyForm = {
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
  };

  const [
    form,
    setForm,
  ] = useState(emptyForm);

  const [
    crearUsuario,
    setCrearUsuario,
  ] = useState(false);

  const [
    usuario,
    setUsuario,
  ] = useState({
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
    errors,
    setErrors,
  ] = useState({});

  useEffect(() => {
    if (supervisor) {
      setForm({
        nombre:
          supervisor.nombre || "",

        apellido:
          supervisor.apellido || "",

        celular:
          supervisor.celular || "",

        email:
          supervisor.email || "",
      });

      setCrearUsuario(
        !!supervisor.userId,
      );

      setUsuario({
        username:
          supervisor.user
            ?.username ||
          "",

        email:
          supervisor.user
            ?.email ||
          supervisor.email ||
          "",

        password: "",

        confirmPassword: "",
      });
    } else {
      setForm(emptyForm);

      setCrearUsuario(false);

      setUsuario({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }

    setUsuarioEditado(false);
    setErrors({});
  }, [
    supervisor,
    open,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event,
    ) => {
      if (
        event.key === "Escape" &&
        !isLoading
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, [
    open,
    isLoading,
    onClose,
  ]);

  const limpiarTexto = (
    texto,
  ) => {
    return texto
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .trim();
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

    const nombreLimpio =
      limpiarTexto(nombre)
        .split(/\s+/)[0];

    const apellidoLimpio =
      limpiarTexto(apellido)
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

  const handleChange = (
    e,
  ) => {
    const {
      name,
      value,
    } = e.target;

    const nuevo = {
      ...form,
      [name]: value,
    };

    setForm(nuevo);

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

  const handleCrearUsuario = (
    checked,
  ) => {
    setCrearUsuario(checked);

    if (
      checked &&
      !supervisor?.userId &&
      !usuarioEditado
    ) {
      generarUsuario(
        form.nombre,
        form.apellido,
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

  const validate = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre =
        "Nombre requerido";
    }

    if (!form.apellido.trim()) {
      newErrors.apellido =
        "Apellido requerido";
    }

    if (
      form.celular &&
      !/^\d{7,}$/.test(
        form.celular.replace(
          /\D/g,
          "",
        ),
      )
    ) {
      newErrors.celular =
        "Celular inválido";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email,
      )
    ) {
      newErrors.email =
        "Email inválido";
    }

    if (crearUsuario) {
      if (
        !usuario.username.trim()
      ) {
        newErrors.username =
          "Usuario requerido";
      }

      if (
        !usuario.email.trim()
      ) {
        newErrors.usuarioEmail =
          "Email de acceso requerido";
      }

      if (
        !supervisor?.userId &&
        !usuario.password
      ) {
        newErrors.password =
          "Contraseña requerida";
      }

      if (
        !supervisor?.userId &&
        usuario.password !==
          usuario.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Las contraseñas no coinciden";
      }
    }

    return newErrors;
  };

  const handleSubmit = (
    e,
  ) => {
    e.preventDefault();

    const newErrors =
      validate();

    if (
      Object.keys(
        newErrors,
      ).length
    ) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...form,

      crearUsuario,

      usuario: {
        username:
          usuario.username,

        email:
          usuario.email,

        password:
          usuario.password,

        confirmPassword:
          usuario.confirmPassword,

        /*
         * El rol lo dejamos explícito
         * en el payload, pero el backend
         * igualmente debe forzarlo a
         * SUPERVISOR.
         */
        rol: "SUPERVISOR",
      },
    });
  };

  if (!open) {
    return null;
  }

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
    dark:focus:ring-amber-900/30
  `;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-stone-950/50
        p-0
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
      onMouseDown={(e) => {
        if (
          e.target ===
            e.currentTarget &&
          !isLoading
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[96dvh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-stone-200
          bg-white
          shadow-2xl
          sm:max-h-[92vh]
          sm:max-w-3xl
          sm:rounded-3xl
          dark:border-stone-700
          dark:bg-stone-900
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            border-stone-200
            px-5
            py-4
            sm:px-6
            dark:border-stone-700
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-amber-600
                dark:text-amber-400
              "
            >
              Equipo de supervisión
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                text-stone-900
                sm:text-xl
                dark:text-white
              "
            >
              {supervisor
                ? "Editar supervisor"
                : "Nuevo supervisor"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-stone-100
              text-xl
              text-stone-500
              transition
              hover:bg-stone-200
              hover:text-stone-800
              disabled:opacity-50
              dark:bg-stone-800
              dark:text-stone-400
            "
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={
            handleSubmit
          }
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className="
              min-h-0
              flex-1
              space-y-6
              overflow-y-auto
              p-5
              sm:p-6
            "
          >
            {/* DATOS */}
            <section>
              <SectionTitle
                title="Datos personales"
                description="Información principal del supervisor."
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
                      form.nombre
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
                      form.apellido
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
                  label="Celular"
                  error={
                    errors.celular
                  }
                >
                  <input
                    type="tel"
                    name="celular"
                    value={
                      form.celular
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

                <Field
                  label="Email"
                  error={
                    errors.email
                  }
                >
                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isLoading
                    }
                    placeholder="supervisor@email.com"
                    className={
                      inputClass
                    }
                  />
                </Field>
              </div>
            </section>

            <Divider />

            {/* ACCESO APP */}
            <section>
              <SectionTitle
                title="Acceso a la aplicación"
                description="Configurá las credenciales del supervisor."
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
                      supervisor?.userId
                        ? "cursor-default"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={
                        crearUsuario
                      }
                      disabled={
                        !!supervisor?.userId ||
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
                      Habilitar acceso
                      a la App
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-stone-400
                      "
                    >
                      Se creará un
                      usuario con rol
                      SUPERVISOR.
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
                    {supervisor?.userId && (
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

                        Este supervisor
                        ya posee un
                        usuario de
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
                            !!supervisor?.userId ||
                            isLoading
                          }
                          onChange={(e) => {
                            const value =
                              e.target
                                .value;

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
                        label="Email de acceso"
                        error={
                          errors.usuarioEmail
                        }
                      >
                        <input
                          type="email"
                          value={
                            usuario.email
                          }
                          disabled={
                            !!supervisor?.userId ||
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

                      {!supervisor?.userId && (
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
              shrink-0
              border-t
              border-stone-200
              bg-white
              px-5
              py-4
              sm:px-6
              dark:border-stone-700
              dark:bg-stone-900
            "
          >
            <div
              className="
                flex
                flex-col-reverse
                gap-2
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={onClose}
                disabled={
                  isLoading
                }
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
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  isLoading
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
                    Guardar supervisor
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
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