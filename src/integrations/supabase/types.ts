export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          customer_id: string
          departure_date: string | null
          from_location: string | null
          id: string
          is_paid: boolean | null
          program_name: string
          remaining_amount: number | null
          to_location: string | null
          total_amount: number | null
          travel_direction:
            | Database["public"]["Enums"]["travel_direction"]
            | null
          updated_at: string | null
          user_id: string
          visa_deposit: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          departure_date?: string | null
          from_location?: string | null
          id?: string
          is_paid?: boolean | null
          program_name: string
          remaining_amount?: number | null
          to_location?: string | null
          total_amount?: number | null
          travel_direction?:
            | Database["public"]["Enums"]["travel_direction"]
            | null
          updated_at?: string | null
          user_id: string
          visa_deposit?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          departure_date?: string | null
          from_location?: string | null
          id?: string
          is_paid?: boolean | null
          program_name?: string
          remaining_amount?: number | null
          to_location?: string | null
          total_amount?: number | null
          travel_direction?:
            | Database["public"]["Enums"]["travel_direction"]
            | null
          updated_at?: string | null
          user_id?: string
          visa_deposit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          full_name: string
          id: string
          national_id: string
          notes: string | null
          phone_number: string
          umrah_program: string | null
          updated_at: string | null
          user_id: string
          visa_status: Database["public"]["Enums"]["visa_status"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          national_id: string
          notes?: string | null
          phone_number: string
          umrah_program?: string | null
          updated_at?: string | null
          user_id: string
          visa_status?: Database["public"]["Enums"]["visa_status"] | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          national_id?: string
          notes?: string | null
          phone_number?: string
          umrah_program?: string | null
          updated_at?: string | null
          user_id?: string
          visa_status?: Database["public"]["Enums"]["visa_status"] | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          is_paid: boolean | null
          person_name: string
          type: Database["public"]["Enums"]["debt_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          person_name: string
          type: Database["public"]["Enums"]["debt_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          person_name?: string
          type?: Database["public"]["Enums"]["debt_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          category: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visas: {
        Row: {
          booking_date: string | null
          created_at: string | null
          customer_id: string
          departure_date: string | null
          expiry_date: string | null
          from_location: string | null
          id: string
          issue_date: string | null
          status: Database["public"]["Enums"]["visa_status"] | null
          to_location: string | null
          travel_direction:
            | Database["public"]["Enums"]["travel_direction"]
            | null
          updated_at: string | null
          user_id: string
          visa_number: string | null
        }
        Insert: {
          booking_date?: string | null
          created_at?: string | null
          customer_id: string
          departure_date?: string | null
          expiry_date?: string | null
          from_location?: string | null
          id?: string
          issue_date?: string | null
          status?: Database["public"]["Enums"]["visa_status"] | null
          to_location?: string | null
          travel_direction?:
            | Database["public"]["Enums"]["travel_direction"]
            | null
          updated_at?: string | null
          user_id: string
          visa_number?: string | null
        }
        Update: {
          booking_date?: string | null
          created_at?: string | null
          customer_id?: string
          departure_date?: string | null
          expiry_date?: string | null
          from_location?: string | null
          id?: string
          issue_date?: string | null
          status?: Database["public"]["Enums"]["visa_status"] | null
          to_location?: string | null
          travel_direction?:
            | Database["public"]["Enums"]["travel_direction"]
            | null
          updated_at?: string | null
          user_id?: string
          visa_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visas_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      debt_type: "receivable" | "payable"
      travel_direction: "egypt-to-saudi" | "saudi-to-egypt"
      visa_status:
        | "pending"
        | "processing"
        | "approved"
        | "rejected"
        | "issued"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      debt_type: ["receivable", "payable"],
      travel_direction: ["egypt-to-saudi", "saudi-to-egypt"],
      visa_status: [
        "pending",
        "processing",
        "approved",
        "rejected",
        "issued",
        "expired",
      ],
    },
  },
} as const
