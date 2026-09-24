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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          available_date: string
          hour: number
          hourly_price: number
          is_open: boolean
          listing_id: string
        }
        Insert: {
          available_date: string
          hour: number
          hourly_price: number
          is_open?: boolean
          listing_id: string
        }
        Update: {
          available_date?: string
          hour?: number
          hourly_price?: number
          is_open?: boolean
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_slots: {
        Row: {
          booking_date: string
          booking_id: string
          hour: number
          listing_id: string
        }
        Insert: {
          booking_date: string
          booking_id: string
          hour: number
          listing_id: string
        }
        Update: {
          booking_date?: string
          booking_id?: string
          hour?: number
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          end_hour: number
          guest_count: number
          id: string
          listing_id: string
          renter_id: string
          service_fee: number
          start_hour: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          end_hour: number
          guest_count: number
          id?: string
          listing_id: string
          renter_id: string
          service_fee: number
          start_hour: number
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          end_hour?: number
          guest_count?: number
          id?: string
          listing_id?: string
          renter_id?: string
          service_fee?: number
          start_hour?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          activities: string[]
          amenities: string[]
          approximate_latitude: number | null
          approximate_longitude: number | null
          area: string
          city: string
          close_hour: number
          created_at: string
          description: string
          guest_limit: number
          host_display_name: string
          hourly_price: number
          id: string
          image_paths: string[]
          open_hour: number
          owner_id: string
          rules: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          activities?: string[]
          amenities?: string[]
          approximate_latitude?: number | null
          approximate_longitude?: number | null
          area: string
          city: string
          close_hour: number
          created_at?: string
          description?: string
          guest_limit: number
          host_display_name: string
          hourly_price: number
          id?: string
          image_paths?: string[]
          open_hour: number
          owner_id: string
          rules?: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          activities?: string[]
          amenities?: string[]
          approximate_latitude?: number | null
          approximate_longitude?: number | null
          area?: string
          city?: string
          close_hour?: number
          created_at?: string
          description?: string
          guest_limit?: number
          host_display_name?: string
          hourly_price?: number
          id?: string
          image_paths?: string[]
          open_hour?: number
          owner_id?: string
          rules?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string
          created_at?: string
          display_name: string
          id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_booking: { Args: { p_booking_id: string }; Returns: undefined }
      manage_listing_availability: {
        Args: {
          p_date: string
          p_hourly_price: number
          p_hours: number[]
          p_listing_id: string
          p_mode: string
        }
        Returns: undefined
      }
      request_booking: {
        Args: {
          p_date: string
          p_end_hour: number
          p_guest_count: number
          p_listing_id: string
          p_start_hour: number
        }
        Returns: string
      }
      respond_to_booking: {
        Args: { p_accept: boolean; p_booking_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
