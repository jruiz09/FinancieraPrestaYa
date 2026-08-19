import React from 'react'

export default function PermissionItem({

  permission,

  checked,

  onToggle

}) {

  const accion =
    permission.codigo
      .split('_')
      .pop()

      .replace('VIEW', 'Ver')
      .replace('CREATE', 'Crear')
      .replace('EDIT', 'Editar')
      .replace('DELETE', 'Eliminar')
      .replace('ASSIGN', 'Asignar')

  return (

    <label
      className="
        flex
        items-center
        justify-between
        py-2
        cursor-pointer
      "
    >

      <span>

        {accion}

      </span>

      <input

        type="checkbox"

        checked={checked}

        onChange={() =>

          onToggle(
            permission.codigo
          )

        }

        className="
          w-5
          h-5
          accent-cyan-500
        "

      />

    </label>

  )

}