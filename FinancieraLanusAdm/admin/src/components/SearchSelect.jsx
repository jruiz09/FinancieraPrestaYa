import Select from 'react-select'

export default function SearchSelect({

  items = [],

  value,

  onChange,

  valueField = 'id',

  labelField,

  placeholder = 'Buscar...',

  isDisabled = false

}) {

  const options =
    items.map(
      (item) => ({

        value:
          item[valueField],

        label:
          typeof labelField ===
          'function'
            ? labelField(item)
            : item[labelField]

      })
    )

  const selectedOption =
    options.find(
      option =>
        option.value === value
    ) || null

  return (

    <Select

      isClearable

      isSearchable

      placeholder={
        placeholder
      }

      options={
        options
      }

      value={
        selectedOption
      }

      isDisabled={
        isDisabled
      }

      onChange={(option) =>

        onChange(
          option
            ? option.value
            : ''
        )

      }

    />

  )
}