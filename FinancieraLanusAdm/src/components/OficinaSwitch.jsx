import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Building2 } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";

/*
=====================================================
Switch de oficina(s), visible arriba de todo (Header) para
que el usuario elija de entrada qué oficina(s) está mirando y
evitar confusión sobre qué datos está viendo. Solo se muestra
si el usuario tiene más de una oficina asignada (con 0 o 1 no
hay nada que elegir). Es un filtro de conveniencia: la
restricción real de qué puede ver ya la aplica el backend
según sus oficinas asignadas.
=====================================================
*/
export default function OficinaSwitch() {
  const user = useAuthStore((state) => state.user);

  const selectedOficinaIds = useAuthStore(
    (state) => state.selectedOficinaIds,
  );

  const setSelectedOficinaIds = useAuthStore(
    (state) => state.setSelectedOficinaIds,
  );

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const oficinas = user?.oficinas || [];

  if (oficinas.length <= 1) {
    return null;
  }

  const toggleOficina = (oficinaId) => {
    if (selectedOficinaIds.includes(oficinaId)) {
      setSelectedOficinaIds(
        selectedOficinaIds.filter(
          (id) => id !== oficinaId,
        ),
      );
    } else {
      setSelectedOficinaIds([
        ...selectedOficinaIds,
        oficinaId,
      ]);
    }
  };

  const label =
    selectedOficinaIds.length === 0
      ? "Todas mis oficinas"
      : selectedOficinaIds.length === 1
      ? oficinas.find(
          (o) => o.id === selectedOficinaIds[0],
        )?.nombre || "1 oficina"
      : `${selectedOficinaIds.length} oficinas`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          px-3
          py-2
          text-sm
          font-semibold
          text-amber-800
          outline-none
          transition
          hover:bg-amber-100
          focus:ring-4
          focus:ring-amber-100
        "
      >
        <Building2 className="h-4 w-4 shrink-0" />

        <span className="hidden max-w-[140px] truncate sm:inline">
          {label}
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-3.5 w-3.5 shrink-0 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="
            absolute
            left-0
            z-30
            mt-2
            max-h-72
            w-64
            overflow-auto
            rounded-xl
            border
            border-stone-200
            bg-white
            p-2
            shadow-lg
          "
        >
          <button
            type="button"
            onClick={() => setSelectedOficinaIds([])}
            className="
              mb-1
              w-full
              rounded-lg
              px-3
              py-2
              text-left
              text-sm
              font-semibold
              text-amber-700
              transition
              hover:bg-amber-50
            "
          >
            Todas mis oficinas
          </button>

          {oficinas.map((oficina) => (
            <label
              key={oficina.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-2
                rounded-lg
                px-3
                py-2
                text-sm
                text-stone-700
                transition
                hover:bg-stone-50
              "
            >
              <input
                type="checkbox"
                checked={selectedOficinaIds.includes(
                  oficina.id,
                )}
                onChange={() => toggleOficina(oficina.id)}
                className="
                  h-4
                  w-4
                  rounded
                  border-stone-300
                  text-amber-500
                  focus:ring-amber-400
                "
              />

              {oficina.nombre}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
