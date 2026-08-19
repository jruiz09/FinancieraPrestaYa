export default function LoadingCard() {

  return (

    <div
      className="
        bg-slate-900
        rounded-3xl
        p-5
        animate-pulse
      "
    >

      <div
        className="
          h-5
          bg-slate-800
          rounded
          w-2/3
        "
      />

      <div
        className="
          h-10
          bg-slate-800
          rounded
          w-1/2
          mt-4
        "
      />

      <div
        className="
          h-4
          bg-slate-800
          rounded
          mt-5
        "
      />

      <div
        className="
          h-12
          bg-slate-800
          rounded-2xl
          mt-5
        "
      />

    </div>

  )

}