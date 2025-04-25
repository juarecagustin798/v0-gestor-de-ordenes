"use client"

// This file provides client-side debugging utilities

export function logFormData(formData: any) {
  console.log("Form data:", formData)

  // Check for common issues
  if (!formData.data?.clientId) {
    console.error("Missing client ID")
  }

  if (!formData.data?.ticker) {
    console.error("Missing ticker")
  }

  if (formData.data?.quantity <= 0) {
    console.error("Invalid quantity")
  }

  if (formData.data?.price <= 0 && !formData.data?.isMarketOrder) {
    console.error("Invalid price")
  }

  return formData
}

export function debugLocalStorage() {
  try {
    console.log("localStorage contents:")

    // Log all keys
    const keys = Object.keys(localStorage)
    console.log("All keys:", keys)

    // Log specific items
    console.log("mockOrders:", localStorage.getItem("mockOrders"))
    console.log("mockClients:", localStorage.getItem("mockClients"))
    console.log("mockAssets:", localStorage.getItem("mockAssets"))

    return true
  } catch (e) {
    console.error("Error accessing localStorage:", e)
    return false
  }
}

// Add a global debug function
if (typeof window !== "undefined") {
  ;(window as any).debugGestorOrdenes = {
    logFormData,
    debugLocalStorage,
    clearOrders: () => {
      localStorage.removeItem("mockOrders")
      console.log("Orders cleared from localStorage")
      return true
    },
    getMockOrders: () => {
      try {
        return JSON.parse(localStorage.getItem("mockOrders") || "[]")
      } catch (e) {
        console.error("Error parsing mockOrders:", e)
        return []
      }
    },
  }

  console.log("Debug utilities available at window.debugGestorOrdenes")
}
