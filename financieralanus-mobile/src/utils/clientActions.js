export const llamarCliente = (cliente) => {

  if (!cliente?.celular)
    return

  const numero =
    cliente.celular
      .replace(/\D/g, "")

  window.location.href =
    `tel:${numero}`

}

export const whatsappCliente = (cliente) => {

  if (!cliente?.celular)
    return

  let numero =
    cliente.celular
      .replace(/\D/g, "")

  if (
    numero.startsWith("0")
  ) {

    numero =
      numero.substring(1)

  }

  if (
    !numero.startsWith("54")
  ) {

    numero =
      `54${numero}`

  }

  window.open(

    `https://wa.me/${numero}`,

    "_blank"

  )

}

export const navegarCliente = (cliente) => {

  if (!cliente)
    return

  if (cliente.mapsUrl) {

    window.open(

      cliente.mapsUrl,

      "_blank"

    )

    return

  }

  if (

    cliente.latitud &&

    cliente.longitud

  ) {

    window.open(

      `https://www.google.com/maps/dir/?api=1&destination=${cliente.latitud},${cliente.longitud}`,

      "_blank"

    )

    return

  }

  if (cliente.direccion) {

    const direccion = encodeURIComponent(
      cliente.direccion
    )

    window.open(

      `https://www.google.com/maps/search/?api=1&query=${direccion}`,

      "_blank"

    )

  }

}