"\"use client"

import { openDB } from "idb"

const DB_NAME = "gestor-ordenes-db"
const DB_VERSION = 1
export const CLIENTS_STORE = "clients"

export const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CLIENTS_STORE)) {
          const clientsStore = db.createObjectStore(CLIENTS_STORE, { keyPath: "id" })
          clientsStore.createIndex("denominacion", "denominacion", { unique: false })
          clientsStore.createIndex("cuit", "cuit", { unique: false })
          clientsStore.createIndex("idCliente", "idCliente", { unique: false })
        }
      },
    })
    return db
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
