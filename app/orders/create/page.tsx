'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardShell } from '@/components/dashboard-shell'
import { OrderCreationForm } from '@/components/new-order-form/order-creation-form'
import { getClients, getAssets } from '@/lib/data'
import type { Client, Asset } from '@/lib/data'

export default function CreateOrderPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, assetsData] = await Promise.all([
          getClients(),
          getAssets()
        ])
        setClients(clientsData)
        setAssets(assetsData)
      } catch (error) {
        console.error('Error cargando datos en CreateOrderPage:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Crear Orden" text="Cargando datos…" />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Crear Orden"
        text="Crea una nueva orden para un cliente."
      />
      <div className="grid gap-8">
        <OrderCreationForm clients={clients} assets={assets} />
      </div>
    </DashboardShell>
  )
}
