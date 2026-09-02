import React, {
  useEffect,
  useRef,
  useState,
} from "react";

export default function ZonaMultiSelect({
  zonas,
  selectedZoneIds,
  onChange,
}) {
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

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const toggleZona = (zonaId) => {
    if (selectedZoneIds.includes(zonaId)) {
      onChange(
        selectedZoneIds.filter(
          (id) => id !== zonaId,
        ),
      );
    } else {
      onChange([...selectedZoneIds, zonaId]);
    }
  };

  const label =
    selectedZoneIds.length === 0
      ? "Todas las zonas"
      : selectedZoneIds.length === 1
      ? zonas.find(
          (zona) =>
            zona.id === selectedZoneIds[0],
        )?.nombre || "1 zona"
      : `${selectedZoneIds.length} zonas seleccionadas`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex
          w-full
          min-w-[190px]
          items-center
          justify-between
          gap-2
          rounded-xl
          border
          border-stone-200
          bg-white
          px-3.5
          py-2.5
          text-left
          text-sm
          text-stone-900
          outline-none
          transition
          focus:border-amber-400
          focus:ring-4
          focus:ring-amber-100
          dark:border-stone-700
          dark:bg-stone-800
          dark:text-white
        "
      >
        <span className="truncate">{label}</span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-4 w-4 shrink-0 text-stone-400 transition ${
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
            z-20
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
            dark:border-stone-700
            dark:bg-stone-900
          "
        >
          <button
            type="button"
            onClick={() => onChange([])}
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
              dark:text-amber-300
              dark:hover:bg-amber-950/40
            "
          >
            Todas las zonas
          </button>

          {zonas.map((zona) => (
            <label
              key={zona.id}
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
                dark:text-stone-200
                dark:hover:bg-stone-800
              "
            >
              <input
                type="checkbox"
                checked={selectedZoneIds.includes(
                  zona.id,
                )}
                onChange={() =>
                  toggleZona(zona.id)
                }
                className="
                  h-4
                  w-4
                  rounded
                  border-stone-300
                  text-amber-500
                  focus:ring-amber-400
                "
              />

              {zona.nombre}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
