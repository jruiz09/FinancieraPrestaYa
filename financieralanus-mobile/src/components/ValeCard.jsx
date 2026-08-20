import {
  Clock3,
  CheckCircle2,
  XCircle
} from 'lucide-react'

import Money from './Money'

const TIPO_LABEL = {

  ADELANTO: 'Adelanto',

  COMBUSTIBLE: 'Combustible',

  GASTOS: 'Gastos',

  OTROS: 'Otros'

}

export default function ValeCard({

  vale

}) {

  const color = {

    PENDIENTE: 'text-yellow-400',

    RENDIDO: 'text-green-400',

    ANULADO: 'text-red-400'

  }

  const icono = {

    PENDIENTE: <Clock3 size={18} />,

    RENDIDO: <CheckCircle2 size={18} />,

    ANULADO: <XCircle size={18} />

  }

  return (

    <div className="bg-slate-900 rounded-3xl p-5">

      <div className="flex justify-between">

        <div>

          <h2 className="font-bold">

            Vale #{vale.numero}

          </h2>

          <p className="text-slate-400 text-sm mt-1">

            {
              TIPO_LABEL[vale.tipo] ||
              vale.tipo
            }

            {' · '}

            {vale.fecha}

          </p>

        </div>

        <div className={`flex gap-2 items-center ${color[vale.estado]}`}>

          {icono[vale.estado]}

          {vale.estado}

        </div>

      </div>

      <div className="mt-5">

        <Money

          value={vale.monto}

          className="text-3xl font-bold"

        />

      </div>

      {

        vale.observaciones &&

        <div className="mt-4 bg-slate-800 rounded-xl p-3 text-sm">

          {vale.observaciones}

        </div>

      }

    </div>

  )

}
