export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_registration: {
        Row: {
          company_id: number
          document_name: string
          document_url: string
          file_size: number | null
          id: number
          is_verified: boolean
          uploaded_at: string
          verification_notes: string | null
          verified_at: string | null
        }
        Insert: {
          company_id: number
          document_name: string
          document_url: string
          file_size?: number | null
          id?: number
          is_verified?: boolean
          uploaded_at?: string
          verification_notes?: string | null
          verified_at?: string | null
        }
        Update: {
          company_id?: number
          document_name?: string
          document_url?: string
          file_size?: number | null
          id?: number
          is_verified?: boolean
          uploaded_at?: string
          verification_notes?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_registration_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_points: {
        Row: {
          carbon_saved: number | null
          date: string | null
          id: string
          points_earned: number | null
          user_id: string | null
        }
        Insert: {
          carbon_saved?: number | null
          date?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string | null
        }
        Update: {
          carbon_saved?: number | null
          date?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carbon_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clothes: {
        Row: {
          category: string | null
          condition: string | null
          created_at: string
          id: string
          last_worn: string | null
          memo: string | null
          photo_url: string | null
          user_id: string | null
          wear_count: number | null
        }
        Insert: {
          category?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          last_worn?: string | null
          memo?: string | null
          photo_url?: string | null
          user_id?: string | null
          wear_count?: number | null
        }
        Update: {
          category?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          last_worn?: string | null
          memo?: string | null
          photo_url?: string | null
          user_id?: string | null
          wear_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clothes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          approved_at: string | null
          approved_by: number | null
          awards: string[] | null
          business_number: string | null
          business_registration_name: string | null
          business_registration_url: string | null
          ceo_name: string
          certifications: string[] | null
          company_name: string
          company_name_en: string | null
          company_vision: string | null
          competitive_advantage: string | null
          created_at: string
          email: string
          employee_count: string | null
          founded_year: number | null
          founding_year: number | null
          headquarters_city: string | null
          headquarters_country: string
          id: number
          industry: string
          is_admin: boolean
          is_approved: boolean
          key_clients: string[] | null
          main_products: string | null
          manager_name: string
          manager_position: string
          password: string
          phone_number: string
          rejection_reason: string | null
          revenue_scale: string | null
          target_market: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: number | null
          awards?: string[] | null
          business_number?: string | null
          business_registration_name?: string | null
          business_registration_url?: string | null
          ceo_name: string
          certifications?: string[] | null
          company_name: string
          company_name_en?: string | null
          company_vision?: string | null
          competitive_advantage?: string | null
          created_at?: string
          email: string
          employee_count?: string | null
          founded_year?: number | null
          founding_year?: number | null
          headquarters_city?: string | null
          headquarters_country: string
          id?: number
          industry: string
          is_admin?: boolean
          is_approved?: boolean
          key_clients?: string[] | null
          main_products?: string | null
          manager_name: string
          manager_position: string
          password: string
          phone_number: string
          rejection_reason?: string | null
          revenue_scale?: string | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: number | null
          awards?: string[] | null
          business_number?: string | null
          business_registration_name?: string | null
          business_registration_url?: string | null
          ceo_name?: string
          certifications?: string[] | null
          company_name?: string
          company_name_en?: string | null
          company_vision?: string | null
          competitive_advantage?: string | null
          created_at?: string
          email?: string
          employee_count?: string | null
          founded_year?: number | null
          founding_year?: number | null
          headquarters_city?: string | null
          headquarters_country?: string
          id?: number
          industry?: string
          is_admin?: boolean
          is_approved?: boolean
          key_clients?: string[] | null
          main_products?: string | null
          manager_name?: string
          manager_position?: string
          password?: string
          phone_number?: string
          rejection_reason?: string | null
          revenue_scale?: string | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      excel_reference: {
        Row: {
          data_content: Json
          data_type: string
          file_name: string
          id: number
          is_active: boolean
          last_updated: string
          sheet_name: string
          version: number
        }
        Insert: {
          data_content: Json
          data_type: string
          file_name: string
          id?: number
          is_active?: boolean
          last_updated?: string
          sheet_name: string
          version?: number
        }
        Update: {
          data_content?: Json
          data_type?: string
          file_name?: string
          id?: number
          is_active?: boolean
          last_updated?: string
          sheet_name?: string
          version?: number
        }
        Relationships: []
      }
      gpt_analysis: {
        Row: {
          analysis_type: string
          created_at: string
          id: number
          matching_request_id: number
          processing_time: number | null
          prompt_used: string | null
          raw_response: string | null
          structured_data: Json | null
          tokens_used: number | null
          updated_at: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: number
          matching_request_id: number
          processing_time?: number | null
          prompt_used?: string | null
          raw_response?: string | null
          structured_data?: Json | null
          tokens_used?: number | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: number
          matching_request_id?: number
          processing_time?: number | null
          prompt_used?: string | null
          raw_response?: string | null
          structured_data?: Json | null
          tokens_used?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gpt_analysis_matching_request_id_fkey"
            columns: ["matching_request_id"]
            isOneToOne: false
            referencedRelation: "matching_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_log: {
        Row: {
          company_id: number | null
          content: string | null
          delivery_status: string
          email_type: string
          error_message: string | null
          id: number
          matching_request_id: number | null
          recipient_email: string
          sent_at: string
          subject: string
          template_used: string | null
        }
        Insert: {
          company_id?: number | null
          content?: string | null
          delivery_status?: string
          email_type: string
          error_message?: string | null
          id?: number
          matching_request_id?: number | null
          recipient_email: string
          sent_at?: string
          subject: string
          template_used?: string | null
        }
        Update: {
          company_id?: number | null
          content?: string | null
          delivery_status?: string
          email_type?: string
          error_message?: string | null
          id?: number
          matching_request_id?: number | null
          recipient_email?: string
          sent_at?: string
          subject?: string
          template_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mail_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_log_matching_request_id_fkey"
            columns: ["matching_request_id"]
            isOneToOne: false
            referencedRelation: "matching_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_requests: {
        Row: {
          additional_questions: string | null
          admin_comments: string | null
          ai_analysis: Json | null
          company_description: string | null
          company_id: number
          completed_at: string | null
          created_at: string
          document_name: string | null
          document_url: string | null
          final_report: Json | null
          id: number
          market_info: string | null
          market_research: Json | null
          product_info: string | null
          status: string
          target_countries: string[]
        }
        Insert: {
          additional_questions?: string | null
          admin_comments?: string | null
          ai_analysis?: Json | null
          company_description?: string | null
          company_id: number
          completed_at?: string | null
          created_at?: string
          document_name?: string | null
          document_url?: string | null
          final_report?: Json | null
          id?: number
          market_info?: string | null
          market_research?: Json | null
          product_info?: string | null
          status?: string
          target_countries: string[]
        }
        Update: {
          additional_questions?: string | null
          admin_comments?: string | null
          ai_analysis?: Json | null
          company_description?: string | null
          company_id?: number
          completed_at?: string | null
          created_at?: string
          document_name?: string | null
          document_url?: string | null
          final_report?: Json | null
          id?: number
          market_info?: string | null
          market_research?: Json | null
          product_info?: string | null
          status?: string
          target_countries?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "matching_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_records: {
        Row: {
          action_items: Json | null
          company_id: number
          created_at: string
          documents: string[] | null
          duration: number | null
          id: number
          insights: Json | null
          is_archived: boolean
          key_points: Json | null
          matching_request_id: number | null
          meeting_date: string
          meeting_type: string
          next_steps: string[] | null
          participants: string[]
          partner_name: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          company_id: number
          created_at?: string
          documents?: string[] | null
          duration?: number | null
          id?: number
          insights?: Json | null
          is_archived?: boolean
          key_points?: Json | null
          matching_request_id?: number | null
          meeting_date: string
          meeting_type: string
          next_steps?: string[] | null
          participants: string[]
          partner_name?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          company_id?: number
          created_at?: string
          documents?: string[] | null
          duration?: number | null
          id?: number
          insights?: Json | null
          is_archived?: boolean
          key_points?: Json | null
          matching_request_id?: number | null
          meeting_date?: string
          meeting_type?: string
          next_steps?: string[] | null
          participants?: string[]
          partner_name?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_records_matching_request_id_fkey"
            columns: ["matching_request_id"]
            isOneToOne: false
            referencedRelation: "matching_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_database: {
        Row: {
          contact_email: string | null
          country: string
          created_at: string
          description: string
          focus_areas: string[] | null
          id: number
          industry: string
          investment_range: string | null
          is_active: boolean
          name: string
          type: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          country: string
          created_at?: string
          description: string
          focus_areas?: string[] | null
          id?: number
          industry: string
          investment_range?: string | null
          is_active?: boolean
          name: string
          type: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          country?: string
          created_at?: string
          description?: string
          focus_areas?: string[] | null
          id?: number
          industry?: string
          investment_range?: string | null
          is_active?: boolean
          name?: string
          type?: string
          website?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          description: string | null
          focus_areas: string[] | null
          id: number
          investment_range: string | null
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          focus_areas?: string[] | null
          id?: number
          investment_range?: string | null
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          focus_areas?: string[] | null
          id?: number
          investment_range?: string | null
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_days: number | null
          age: number | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          name: string | null
          nickname: string | null
          profile_image_url: string | null
          total_points: number | null
        }
        Insert: {
          activity_days?: number | null
          age?: number | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id: string
          name?: string | null
          nickname?: string | null
          profile_image_url?: string | null
          total_points?: number | null
        }
        Update: {
          activity_days?: number | null
          age?: number | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          name?: string | null
          nickname?: string | null
          profile_image_url?: string | null
          total_points?: number | null
        }
        Relationships: []
      }
      session: {
        Row: {
          expire: string
          sess: Json
          sid: string
        }
        Insert: {
          expire: string
          sess: Json
          sid: string
        }
        Update: {
          expire?: string
          sess?: Json
          sid?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
