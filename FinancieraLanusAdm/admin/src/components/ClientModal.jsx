import React, {
  useEffect,
} from "react";

import ClientForm from "./ClientForm";

export default function ClientModal({
  isOpen,
  title,
  initialData,
  collectors,
  onSubmit,
  onClose,
  isLoading,
}) {
  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
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

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    isLoading,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

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
            bg-white
            px-5
            py-4
            sm:px-6
            dark:border-stone-700
            dark:bg-stone-900
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
              Cliente
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
              {title}
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
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-stone-100
              text-xl
              text-stone-500
              transition
              hover:bg-stone-200
              hover:text-stone-800
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:bg-stone-800
              dark:text-stone-400
              dark:hover:bg-stone-700
              dark:hover:text-white
            "
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
          "
        >
          <ClientForm
            initialData={
              initialData
            }
            collectors={
              collectors
            }
            onSubmit={
              onSubmit
            }
            onClose={
              onClose
            }
            isLoading={
              isLoading
            }
          />
        </div>
      </div>
    </div>
  );
}