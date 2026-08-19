import PermissionItem from './PermissionItem'

export default function PermissionGroup({

  title,

  permissions,

  selectedPermissions,

  onToggle

}) {

  return (

    <div
      className="
        bg-gray-800
        rounded-xl
        p-5
        shadow
      "
    >

      <h3
        className="
          text-lg
          font-semibold
          mb-4
          border-b
          border-gray-700
          pb-2
        "
      >

        {title}

      </h3>

      <div
        className="
          space-y-2
        "
      >

        {

          permissions.map(permission=>

            <PermissionItem

              key={permission.codigo}

              permission={permission}

              checked={
                selectedPermissions.includes(
                  permission.codigo
                )
              }

              onToggle={onToggle}

            />

          )

        }

      </div>

    </div>

  )

}