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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          day_of_week: number
          description: string | null
          distance_km: number | null
          duration_min: number | null
          id: string
          intensity: number | null
          media_url: string | null
          order_index: number
          title: string
          week_id: string
        }
        Insert: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          day_of_week: number
          description?: string | null
          distance_km?: number | null
          duration_min?: number | null
          id?: string
          intensity?: number | null
          media_url?: string | null
          order_index?: number
          title: string
          week_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          day_of_week?: number
          description?: string | null
          distance_km?: number | null
          duration_min?: number | null
          id?: string
          intensity?: number | null
          media_url?: string | null
          order_index?: number
          title?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_id: string
          completed: boolean | null
          id: string
          logged_at: string | null
          logged_distance_km: number | null
          logged_duration_min: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          completed?: boolean | null
          id?: string
          logged_at?: string | null
          logged_distance_km?: number | null
          logged_duration_min?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          completed?: boolean | null
          id?: string
          logged_at?: string | null
          logged_distance_km?: number | null
          logged_duration_min?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marathon_results: {
        Row: {
          category: string | null
          created_at: string | null
          distance: string | null
          dorsal: string | null
          first_name: string | null
          id: string
          last_name: string | null
          nationality: string | null
          position: number | null
          race_date: string | null
          race_name: string | null
          time_gross: string | null
          time_net: string | null
          time_net_seconds: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          distance?: string | null
          dorsal?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          nationality?: string | null
          position?: number | null
          race_date?: string | null
          race_name?: string | null
          time_gross?: string | null
          time_net?: string | null
          time_net_seconds?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          distance?: string | null
          dorsal?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          nationality?: string | null
          position?: number | null
          race_date?: string | null
          race_name?: string | null
          time_gross?: string | null
          time_net?: string | null
          time_net_seconds?: number | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          user_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          user_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_notifications: {
        Row: {
          created_at: string | null
          difficulty: number | null
          id: string
          is_active: boolean | null
          media_url: string | null
          message_body: string
          message_title: string
          plan_distance: string | null
          trigger_type: string
          trigger_value: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_active?: boolean | null
          media_url?: string | null
          message_body: string
          message_title: string
          plan_distance?: string | null
          trigger_type: string
          trigger_value?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_active?: boolean | null
          media_url?: string | null
          message_body?: string
          message_title?: string
          plan_distance?: string | null
          trigger_type?: string
          trigger_value?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: number
          distance: string | null
          id: string
          name: string
          total_weeks: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: number
          distance?: string | null
          id?: string
          name: string
          total_weeks: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: number
          distance?: string | null
          id?: string
          name?: string
          total_weeks?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          current_plan_id: string | null
          current_week_id: string | null
          difficulty: number | null
          distance: string | null
          email: string | null
          full_name: string | null
          id: string
          last_activity_at: string | null
          start_date: string | null
          target_race_date: string | null
        }
        Insert: {
          created_at?: string | null
          current_plan_id?: string | null
          current_week_id?: string | null
          difficulty?: number | null
          distance?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_activity_at?: string | null
          start_date?: string | null
          target_race_date?: string | null
        }
        Update: {
          created_at?: string | null
          current_plan_id?: string | null
          current_week_id?: string | null
          difficulty?: number | null
          distance?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_activity_at?: string | null
          start_date?: string | null
          target_race_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_current_week_id_fkey"
            columns: ["current_week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          started_at: string | null
          user_id: string
          week_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          started_at?: string | null
          user_id: string
          week_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          started_at?: string | null
          user_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
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
      waiting_list: {
        Row: {
          created_at: string | null
          email: string
          id: string
          status: Database["public"]["Enums"]["waiting_status"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          status?: Database["public"]["Enums"]["waiting_status"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["waiting_status"] | null
        }
        Relationships: []
      }
      weeks: {
        Row: {
          created_at: string | null
          id: string
          plan_id: string
          tip_month: Json | null
          tip_week: Json | null
          week_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_id: string
          tip_month?: Json | null
          tip_week?: Json | null
          week_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_id?: string
          tip_month?: Json | null
          tip_week?: Json | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
    }
    Enums: {
      activity_type:
        | "run"
        | "walk"
        | "strength"
        | "rest"
        | "stretch"
        | "cross_training"
      app_role: "admin" | "user"
      content_type:
        | "video_embed"
        | "video_link"
        | "image"
        | "text_markdown"
        | "pdf"
      notification_status:
        | "sent"
        | "delivered"
        | "failed"
        | "opened"
        | "clicked"
      waiting_status: "pending" | "invited" | "joined"
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
      activity_type: [
        "run",
        "walk",
        "strength",
        "rest",
        "stretch",
        "cross_training",
      ],
      app_role: ["admin", "user"],
      content_type: [
        "video_embed",
        "video_link",
        "image",
        "text_markdown",
        "pdf",
      ],
      notification_status: ["sent", "delivered", "failed", "opened", "clicked"],
      waiting_status: ["pending", "invited", "joined"],
    },
  },
} as const
