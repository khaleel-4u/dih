export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      symptom_logs: {
        Row: {
          id: string
          user_id: string
          symptom_text: string
          risk_level: string
          recommendation: string
          trigger_words: string[] | null
          session_start: string | null
          session_end: string | null
          duration_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symptom_text: string
          risk_level: string
          recommendation: string
          trigger_words?: string[] | null
          session_start?: string | null
          session_end?: string | null
          duration_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symptom_text?: string
          risk_level?: string
          recommendation?: string
          trigger_words?: string[] | null
          session_start?: string | null
          session_end?: string | null
          duration_minutes?: number | null
          created_at?: string
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
