export type Database = {
  public: {
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Views: Record<string, never>;
    Tables: {
      teachers: {
        Row: {
          id: string;
          email: string;
          name: string;
          school_name: string;
          avatar_url: string | null;
          created_at: string;
          classroom: string | null;
          role: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          school_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          classroom?: string | null;
          role?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          school_name?: string;
          avatar_url?: string | null;
          classroom?: string | null;
          role?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          game_type: string;
          config_json: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          shared: boolean;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          game_type: string;
          config_json: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          shared?: boolean;
        };
        Update: {
          title?: string;
          game_type?: string;
          config_json?: Record<string, unknown>;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_sessions: {
        Row: {
          id: string;
          activity_id: string;
          pin_code: string;
          status: "waiting" | "playing" | "finished";
          max_players: number;
          started_at: string;
          ended_at: string | null;
          current_question_index: number;
        };
        Insert: {
          id?: string;
          activity_id: string;
          pin_code: string;
          status?: "waiting" | "playing" | "finished";
          max_players?: number;
          started_at?: string;
          ended_at?: string | null;
          current_question_index?: number;
        };
        Update: {
          status?: "waiting" | "playing" | "finished";
          ended_at?: string | null;
          current_question_index?: number;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          name: string;
          avatar_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_id?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          avatar_id?: string;
        };
        Relationships: [];
      };
      session_participants: {
        Row: {
          session_id: string;
          student_id: string;
          joined_at: string;
        };
        Insert: {
          session_id: string;
          student_id: string;
          joined_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      game_scores: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          score: number;
          question_index: number;
          is_correct: boolean;
          time_taken_ms: number;
          answered_at: string;
          selected_index: number | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          score: number;
          question_index?: number;
          is_correct?: boolean;
          time_taken_ms?: number;
          answered_at?: string;
          selected_index?: number | null;
        };
        Update: never;
        Relationships: [];
      };
      leaderboard_entries: {
        Row: {
          session_id: string;
          student_id: string;
          total_score: number;
          rank: number;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          student_id: string;
          total_score?: number;
          rank?: number;
          updated_at?: string;
        };
        Update: {
          total_score?: number;
          rank?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_session_leaderboard: {
        Args: { p_session_id: string };
        Returns: Array<{
          student_id: string;
          student_name: string;
          avatar_id: string;
          total_score: number;
          rank: number;
        }>;
      };
    };
  };
};
