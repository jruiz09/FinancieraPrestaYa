import ZoneForm
  from './ZoneForm'

export default function ZoneModal({
  isOpen,
  title,
  initialData,
  onSubmit,
  onClose,
  isLoading
}) {

  if (!isOpen)
    return null

  return (

    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
      "
    >

      <div
        className="
          bg-white
          rounded
          shadow
          w-full
          max-w-lg
        "
      >

        <div
          className="
            p-4
            border-b
            flex
            justify-between
          "
        >

          <h2>
            {title}
          </h2>

          <button
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="p-4">

          <ZoneForm
            initialData={initialData}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />

        </div>

      </div>

    </div>

  )

}