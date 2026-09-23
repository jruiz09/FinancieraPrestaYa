import React, {
  useEffect,
  useState,
} from "react";

import {
  zoneService,
} from "../services/zoneService";

export default function OficinaModal({
  open,
  onClose,
  onSave,
  oficina,
  isLoading = false,
}) {
  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    zonasDisponibles,
    setZonasDisponibles,
  ] = useState([]);

  const [
    zoneIds,
    setZoneIds,
  ] = useState([]);

  const [
    errors,
    setErrors,
  ] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    zoneService
      .list()
      .then((data) =>
        setZonasDisponibles(
          data || [],
        ),
      )
      .catch((err) =>
        console.error(err),
      );
  }, [open]);

  useEffect(() => {
    if (oficina) {
      setNombre(
        oficina.nombre || "",
      );

      setZoneIds(
        (
          oficina.zonas || []
        ).map((z) => z.id),
      );
    } else {
      setNombre("");
      setZoneIds([]);
    }

    setErrors({});
  }, [
    oficina,
    open,
  ]);

  const toggleZona = (
    zoneId,
  ) => {
    setZoneIds((prev) =>
      prev.includes(zoneId)
        ? prev.filter(
            (id) =>
              id !== zoneId,
          )
        : [...prev, zoneId],
    );
  };

  const handleSubmit = (
    e,
  ) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setErrors({
        nombre:
          "Nombre requerido",
      });
      return;
    }

    onSave({
      nombre,
      zoneIds,
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
          sm:max-w-lg
          sm:rounded-3xl
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
              "
            >
              Oficinas
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                text-stone-900
                sm:text-xl
              "
            >
              {oficina
                ? "Editar oficina"
                : "Nueva oficina"}
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
            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-stone-700
                "
              >
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(
                    e.target.value,
                  );

                  if (
                    errors.nombre
                  ) {
                    setErrors({});
                  }
                }}
                disabled={
                  isLoading
                }
                placeholder="Ej: Oficina Norte"
                className={
                  inputClass
                }
              />

              {errors.nombre && (
                <p
                  className="
                    mt-1.5
                    text-xs
                    font-medium
                    text-red-500
                  "
                >
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <p
                className="
                  mb-1.5
                  text-sm
                  font-medium
                  text-stone-700
                "
              >
                Zonas asociadas
              </p>

              <p
                className="
                  mb-3
                  text-xs
                  text-stone-400
                "
              >
                Una misma zona puede
                estar en más de una
                oficina.
              </p>

              {zonasDisponibles.length ===
              0 ? (
                <p
                  className="
                    text-sm
                    text-stone-400
                  "
                >
                  No hay zonas
                  disponibles.
                </p>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-2
                    sm:grid-cols-2
                  "
                >
                  {zonasDisponibles.map(
                    (zona) => (
                      <label
                        key={
                          zona.id
                        }
                        className="
                          flex
                          cursor-pointer
                          items-center
                          gap-2.5
                          rounded-xl
                          border
                          border-stone-200
                          bg-stone-50/70
                          px-3.5
                          py-2.5
                          text-sm
                          text-stone-700
                          transition
                          hover:bg-stone-100
                        "
                      >
                        <input
                          type="checkbox"
                          checked={zoneIds.includes(
                            zona.id,
                          )}
                          disabled={
                            isLoading
                          }
                          onChange={() =>
                            toggleZona(
                              zona.id,
                            )
                          }
                          className="
                            h-4
                            w-4
                            rounded
                            accent-amber-500
                          "
                        />

                        {
                          zona.nombre
                        }
                      </label>
                    ),
                  )}
                </div>
              )}
            </div>
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
                "
              >
                {isLoading
                  ? "Guardando..."
                  : "Guardar oficina"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
