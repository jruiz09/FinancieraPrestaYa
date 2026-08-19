import React from 'react'
import CreditoForm from '../components/CreditoForm'

export default function NuevoCreditoPage() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Nuevo Crédito
        </h1>

        <p className="text-gray-500">
          Generación de créditos y cuotas
        </p>
      </div>

      <CreditoForm />

    </div>
  )
}