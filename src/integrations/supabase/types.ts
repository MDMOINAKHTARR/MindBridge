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
      assessment_results: {
        Row: {
          assessment_type: string
          completed_at: string
          id: string
          responses: Json | null
          risk_level: string
          score: number
          user_id: string | null
        }
        Insert: {
          assessment_type: string
          completed_at?: string
          id?: string
          responses?: Json | null
          risk_level: string
          score: number
          user_id?: string | null
        }
        Update: {
          assessment_type?: string
          completed_at?: string
          id?: string
          responses?: Json | null
          risk_level?: string
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      chat_interactions: {
        Row: {
          created_at: string
          crisis_keywords_detected: boolean | null
          id: string
          message_count: number | null
          satisfaction_rating: number | null
          session_duration_minutes: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          crisis_keywords_detected?: boolean | null
          id?: string
          message_count?: number | null
          satisfaction_rating?: number | null
          session_duration_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          crisis_keywords_detected?: boolean | null
          id?: string
          message_count?: number | null
          satisfaction_rating?: number | null
          session_duration_minutes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_hi: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_hi: string
          slug: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_hi: string
          slug: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_hi?: string
          slug?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_moderated: boolean | null
          post_id: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_moderated?: boolean | null
          post_id: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_moderated?: boolean | null
          post_id?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_locked: boolean | null
          is_moderated: boolean | null
          is_pinned: boolean | null
          moderation_notes: string | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_locked?: boolean | null
          is_moderated?: boolean | null
          is_pinned?: boolean | null
          moderation_notes?: string | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_locked?: boolean | null
          is_moderated?: boolean | null
          is_pinned?: boolean | null
          moderation_notes?: string | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_categories: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_hi: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en: string
          name_hi: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_hi?: string
          slug?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category_id: string | null
          content_en: string | null
          content_hi: string | null
          created_at: string
          description_en: string | null
          description_hi: string | null
          duration_minutes: number | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          thumbnail_url: string | null
          title_en: string
          title_hi: string
          type: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content_en?: string | null
          content_hi?: string | null
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          duration_minutes?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          thumbnail_url?: string | null
          title_en: string
          title_hi: string
          type: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content_en?: string | null
          content_hi?: string | null
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          duration_minutes?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          thumbnail_url?: string | null
          title_en?: string
          title_hi?: string
          type?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "resource_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          features_used: string[] | null
          id: string
          page_views: number | null
          session_end: string | null
          session_start: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          features_used?: string[] | null
          id?: string
          page_views?: number | null
          session_end?: string | null
          session_start?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          features_used?: string[] | null
          id?: string
          page_views?: number | null
          session_end?: string | null
          session_start?: string
          user_id?: string | null
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
