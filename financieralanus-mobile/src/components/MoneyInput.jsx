import {
  useEffect,
  useState
} from 'react'

export default function MoneyInput({

  value,

  onChange,

  autoFocus = false

}) {

  const [display,
    setDisplay] =
      useState('')

  useEffect(() => {

    setDisplay(

      Number(value || 0)
        .toLocaleString(
          'es-AR'
        )

    )

  }, [value])

  const handleChange =
    e => {

      const onlyNumbers =
        e.target.value.replace(
          /\D/g,
          ''
        )

      const number =
        Number(
          onlyNumbers || 0
        )

      setDisplay(

        number.toLocaleString(
          'es-AR'
        )

      )

      onChange(number)

    }

  return (

    <input

      autoFocus={autoFocus}

      inputMode="numeric"

      value={display}

      onChange={handleChange}

      className="
        w-full
        rounded-2xl
        bg-slate-800
        border
        border-slate-700
        p-4
        text-center
        text-4xl
        font-bold
        outline-none
        focus:border-cyan-500
      "

    />

  )

}