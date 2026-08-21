export const inputClass = `
  w-24
  rounded-lg
  border
  border-stone-200
  bg-stone-50
  p-1.5
  text-right
  text-sm
  outline-none
  transition
  focus:border-amber-400
  focus:bg-white
  focus:ring-4
  focus:ring-amber-100
`

export default function CalculadoManualCell({
  value,
  onChange,
  esOverride,
  onRevertir,
  disabled
}) {

  return (

    <div
      className="
        flex
        flex-col
        items-end
        gap-1
      "
    >

      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={inputClass}
      />

      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >

        <span
          className={`
            text-[10px]
            font-semibold
            px-1.5
            py-0.5
            rounded
            ${
              esOverride
                ? 'bg-amber-100 text-amber-700'
                : 'bg-stone-100 text-stone-500'
            }
          `}
        >
          {
            esOverride
              ? 'Manual'
              : 'Calculado'
          }
        </span>

        {esOverride && (

          <button
            type="button"
            title="Volver al valor calculado"
            onClick={onRevertir}
            disabled={disabled}
            className="
              text-[10px]
              font-semibold
              text-amber-700
              hover:text-amber-800
              underline
            "
          >
            Revertir
          </button>

        )}

      </div>

    </div>

  )

}
