"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addObservation } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"

interface AddObservationFormProps {
  orderId: string
}

export function AddObservationForm({ orderId }: AddObservationFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    try {
      setIsSubmitting(true)
      const result = await addObservation(orderId, content)

      if (result.success) {
        toast({
          title: "Observación añadida",
          description: "La observación ha sido añadida exitosamente.",
        })
        setContent("")
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo añadir la observación.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al añadir la observación.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Añadir una observación..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? "Enviando..." : "Añadir Observación"}
        </Button>
      </div>
    </form>
  )
}

