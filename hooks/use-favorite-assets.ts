"use client"

import { useState, useEffect } from "react"

export function useFavoriteAssets() {
  const [favorites, setFavorites] = useState<string[]>([])

  // Cargar favoritos al iniciar
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("favoriteAssets")
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } catch (error) {
      console.error("Error al cargar favoritos:", error)
      setFavorites([])
    }
  }, [])

  // Guardar favoritos cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem("favoriteAssets", JSON.stringify(favorites))
    } catch (error) {
      console.error("Error al guardar favoritos:", error)
    }
  }, [favorites])

  // Función para alternar un favorito
  const toggleFavorite = (ticker: string) => {
    setFavorites((prev) => {
      if (prev.includes(ticker)) {
        return prev.filter((t) => t !== ticker)
      } else {
        return [...prev, ticker]
      }
    })
  }

  // Función para verificar si un ticker es favorito
  const isFavorite = (ticker: string) => {
    return favorites.includes(ticker)
  }

  return { favorites, toggleFavorite, isFavorite }
}
