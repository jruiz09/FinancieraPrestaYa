import {
  Calendar,
  Wallet,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation
} from "lucide-react";

import BadgeEstado from "./BadgeEstado";
import Money from "./Money";
import ClienteAvatar from "./ClienteAvatar";

import {
  llamarCliente,
  whatsappCliente,
  navegarCliente
} from "../utils/clientActions";

export default function CuotaCard({

  cuota,

  detalle,

  onCobrar

}) {

  const saldo =
    Number(cuota.monto) -
    Number(cuota.montoPago);

  const cliente =
    cuota.credito?.cliente;

  const tieneTelefono =
    !!cliente?.celular;

  const tieneUbicacion =
    !!(
      cliente?.mapsUrl ||
      (cliente?.latitud &&
        cliente?.longitud) ||
      cliente?.direccion
    );

  return (

    <div
      className={`
        bg-slate-900
        rounded-3xl
        border-l-4
        ${
          cuota.estado === "PENDIENTE"
            ? "border-cyan-500"
            : cuota.estado === "PARCIAL"
            ? "border-yellow-500"
            : cuota.estado === "VENCIDA"
            ? "border-red-500"
            : "border-green-500"
        }
        p-5
        shadow-lg
      `}
    >

      <div
        className="
          flex
          justify-between
          items-start
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {!detalle &&
            <ClienteAvatar
              cliente={cliente}
            />
          }

          <div>

            {!detalle && (

              <>

                <h3
                  className="
                    text-lg
                    font-bold
                  "
                >

                  {cliente?.nombre}{" "}
                  {cliente?.apellido}

                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >

                  Crédito #

                  {
                    cuota.credito
                      ?.numeroCredito
                  }

                  {" · "}

                  Cuota

                  {" "}

                  {
                    cuota.numeroCuota
                  }

                  /

                  {
                    cuota.credito
                      ?.cantidadCuotas
                  }

                </p>

              </>

            )}

            {detalle && (

              <>

                <h3
                  className="
                    text-xl
                    font-bold
                  "
                >

                  Cuota

                  {" "}

                  {
                    cuota.numeroCuota
                  }

                </h3>

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >

                  de

                  {" "}

                  {
                    cuota.credito
                      ?.cantidadCuotas
                  }

                  {" "}
                  cuotas

                </p>

              </>

            )}

          </div>

        </div>

        <BadgeEstado
          estado={
            cuota.estado
          }
        />

      </div>

      <div
        className="
          mt-6
          grid
          grid-cols-2
          gap-4
        "
      >

        <div>

          <p
            className="
              text-xs
              uppercase
              text-slate-500
            "
          >

            Saldo

          </p>

          <Money
            value={saldo}
            className="
              text-3xl
              font-bold
            "
          />

        </div>

        <div
          className="
            text-right
          "
        >

          <p
            className="
              text-xs
              uppercase
              text-slate-500
            "
          >

            Cuota

          </p>

          <Money
            value={cuota.monto}
            className="
              text-xl
              font-semibold
            "
          />

        </div>

      </div>

      {detalle && (

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-4
          "
        >

          <div>

            <p
              className="
                text-slate-500
                text-sm
              "
            >

              Pagado

            </p>

            <Money
              value={
                cuota.montoPago
              }
              className="
                font-semibold
                text-green-400
              "
            />

          </div>

          <div>

            <p
              className="
                text-slate-500
                text-sm
              "
            >

              Restante

            </p>

            <Money
              value={saldo}
              className="
                font-semibold
                text-cyan-400
              "
            />

          </div>

        </div>

      )}

      <div
        className="
          mt-5
          flex
          items-center
          gap-2
          bg-slate-800
          rounded-xl
          px-3
          py-2
          text-sm
        "
      >

        <Calendar
          size={16}
        />

        {

          cuota.estado ===
          "PAGADA"

            ? "Pagada"

            : cuota.estado ===
              "VENCIDA"

            ? "Venció"

            : "Vence"

        }

        <strong>

          {

            new Date(

              cuota.estado ===
              "PAGADA"

                ? cuota.fechaPago

                : cuota.fechaVencimiento

            )
            .toLocaleDateString(
              "es-AR"
            )

          }

        </strong>

      </div>

      {!detalle && (

        <div
          className="
            mt-5
            grid
            grid-cols-3
            gap-3
          "
        >

          <button

            type="button"

            disabled={
              !tieneTelefono
            }

            onClick={() =>
              llamarCliente(
                cliente
              )
            }

            className="
              rounded-2xl
              bg-slate-800
              py-3
              flex
              flex-col
              items-center
              gap-2
              disabled:opacity-40
            "

          >

            <Phone
              size={22}
            />

            <span
              className="
                text-xs
              "
            >

              Llamar

            </span>

          </button>

          <button

            type="button"

            disabled={
              !tieneTelefono
            }

            onClick={() =>
              whatsappCliente(
                cliente
              )
            }

            className="
              rounded-2xl
              bg-green-700
              py-3
              flex
              flex-col
              items-center
              gap-2
              disabled:opacity-40
            "

          >

            <MessageCircle
              size={22}
            />

            <span
              className="
                text-xs
              "
            >

              WhatsApp

            </span>

          </button>

          <button

            type="button"

            disabled={
              !tieneUbicacion
            }

            onClick={() =>
              navegarCliente(
                cliente
              )
            }

            className="
              rounded-2xl
              bg-blue-700
              py-3
              flex
              flex-col
              items-center
              gap-2
              disabled:opacity-40
            "

          >

            <Navigation
              size={22}
            />

            <span
              className="
                text-xs
              "
            >

              Ir

            </span>

          </button>

        </div>

      )}

      {

        cuota.estado ===
        "PAGADA"

          ?

          <div
            className="
              mt-5
              rounded-2xl
              bg-green-700/20
              border
              border-green-700
              py-3
              flex
              justify-center
              items-center
              gap-2
              text-green-400
              font-semibold
            "
          >

            <CheckCircle2
              size={20}
            />

            Cuota Pagada

          </div>

          :

          <button

            onClick={() =>

              onCobrar({

                ...cuota,

                saldo

              })

            }

            className="
              mt-5
              w-full
              rounded-2xl
              bg-cyan-600
              hover:bg-cyan-500
              py-3.5
              flex
              justify-center
              items-center
              gap-2
              font-semibold
              text-lg
            "

          >

            <Wallet
              size={20}
            />

            Registrar Cobro

          </button>

      }

    </div>

  );

}