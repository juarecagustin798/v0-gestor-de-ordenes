"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Client, Asset, OrderFormValues } from "@/lib/types"
import { ClientSelectionStep } from "./order-steps/client-selection-step"
import { AssetSelectionStep } from "./order-steps/asset-selection-step"
import { OrderDetailsStep } from "./order-steps/order-details-step"
import { OrderConfirmationStep } from "./order-steps/order-confirmation-step"
import { OrderSuccessStep } from "./order-steps/order-success-step"
import { Card } from "@/components/ui/card"
import { createOrder } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"

interface OrderCreationWizardProps {
  clients: Client[]
  assets: Asset[]
}

export function OrderCreationWizard({ clients, assets }: OrderCreationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState<OrderFormValues>({
    clientId: "",
    assetId: "",
    type: "Compra",
    quantity: 0,
    price: 0,
    notes: "",
  })

  // Datos adicionales para mostrar en la confirmación
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // Función para actualizar los datos del formulario
  const updateFormData = (data: Partial<OrderFormValues>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  // Función para retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Función para enviar el formulario
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const result = await createOrder(formData)

      if (result.success) {
        setOrderId(result.id)
        nextStep() // Avanzar al paso de éxito
        toast({
          title: "Orden creada",
          description: `La orden ${result.id} ha sido creada exitosamente.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Hubo un error al crear la orden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear la orden.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para ir al dashboard
  const goToDashboard = () => {
    router.push("/")
  }

  // Función para ver los detalles de la orden creada
  const viewOrderDetails = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`)
    }
  }

  // Renderizar el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ClientSelectionStep
            clients={clients}
            selectedClientId={formData.clientId}
            onClientSelect={(client) => {
              updateFormData({ clientId: client.id })
              setSelectedClient(client)
              nextStep()
            }}
          />
        )
      case 1:
        return (
          <AssetSelectionStep
            assets={assets}
            selectedAssetId={formData.assetId}
            onAssetSelect={(asset) => {
              updateFormData({
                assetId: asset.id,
                price: asset.lastPrice, // Pre-llenar con el último precio
              })
              setSelectedAsset(asset)
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 2:
        return (
          <OrderDetailsStep
            formData={formData}
            selectedAsset={selectedAsset}
            onChange={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <OrderConfirmationStep
            formData={formData}
            client={selectedClient}
            asset={selectedAsset}
            onConfirm={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )
      case 4:
        return (
          <OrderSuccessStep
            orderId={orderId || ""}
            onViewDetails={viewOrderDetails}
            onCreateAnother={() => {
              // Reiniciar el formulario
              setFormData({
                clientId: "",
                assetId: "",
                type: "Compra",
                quantity: 0,
                price: 0,
                notes: "",
              })
              setSelectedClient(null)
              setSelectedAsset(null)
              setCurrentStep(0)
            }}
            onGoToDashboard={goToDashboard}
          />
        )
      default:
        return null
    }
  }

  return <Card className="p-6">{renderStep()}</Card>
}
