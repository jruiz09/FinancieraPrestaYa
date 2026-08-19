import React from 'react'

import {
  CircleDollarSign
} from 'lucide-react'

import CreditoForm
  from '../components/CreditoForm'

export default function NuevoCreditoPage() {

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="
        flex
        items-center
        gap-4
      ">

        <div className="
          w-12
          h-12
          rounded-2xl
          bg-amber-100
          text-amber-700
          flex
          items-center
          justify-center
          shrink-0
        ">

          <CircleDollarSign
            className="w-6 h-6"
          />

        </div>

        <div>

          <h1 className="
            text-2xl
            md:text-3xl
            font-bold
            tracking-tight
            text-stone-900
          ">
            Nuevo Crédito
          </h1>

          <p className="
            text-sm
            md:text-base
            text-stone-500
            mt-1
          ">
            Completá los datos y revisá
            la simulación antes de confirmar.
          </p>

        </div>

      </div>

      <CreditoForm />

    </div>

  )

}