export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          ID: string | null
          "Tipo de cuenta": string | null
          Estado: string | null
          Denominación: string | null
          "Cuenta Especial (CNV RG5528/2024)": string | null
          Alias: string | null
          Titular: string | null
          "Tipo Titular": string | null
          Cartera: string | null
          Categoría: string | null
          Administrador: string | null
          Operador: string | null
          Sucursal: string | null
          "Clase de cuenta": string | null
          CUIT: string | null
          Ganancias: string | null
          IVA: string | null
          id: string
          nombre: string
          email: string | null
          telefono: string | null
          created_at: string
        }
        Insert: {
          ID?: string | null
          "Tipo de cuenta"?: string | null
          Estado?: string | null
          Denominación?: string | null
          "Cuenta Especial (CNV RG5528/2024)"?: string | null
          Alias?: string | null
          Titular?: string | null
          "Tipo Titular"?: string | null
          Cartera?: string | null
          Categoría?: string | null
          Administrador?: string | null
          Operador?: string | null
          Sucursal?: string | null
          "Clase de cuenta"?: string | null
          CUIT?: string | null
          Ganancias?: string | null
          IVA?: string | null
          id?: string
          nombre: string
          email?: string | null
          telefono?: string | null
          created_at?: string
        }
        Update: {
          ID?: string | null
          "Tipo de cuenta"?: string | null
          Estado?: string | null
          Denominación?: string | null
          "Cuenta Especial (CNV RG5528/2024)"?: string | null
          Alias?: string | null
          Titular?: string | null
          "Tipo Titular"?: string | null
          Cartera?: string | null
          Categoría?: string | null
          Administrador?: string | null
          Operador?: string | null
          Sucursal?: string | null
          "Clase de cuenta"?: string | null
          CUIT?: string | null
          Ganancias?: string | null
          IVA?: string | null
          id?: string
          nombre?: string
          email?: string | null
          telefono?: string | null
          created_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string | null
          rol: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre?: string | null
          rol?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          rol?: string
          created_at?: string
        }
      }
      ordenes: {
        Row: {
          id: string
          cliente_id: string
          trader_id: string | null
          estado: string
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          trader_id?: string | null
          estado?: string
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          trader_id?: string | null
          estado?: string
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activos: {
        Row: {
          id: string
          orden_id: string
          tipo: string
          descripcion: string | null
          valor: number | null
          created_at: string
        }
        Insert: {
          id?: string
          orden_id: string
          tipo: string
          descripcion?: string | null
          valor?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          orden_id?: string
          tipo?: string
          descripcion?: string | null
          valor?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
