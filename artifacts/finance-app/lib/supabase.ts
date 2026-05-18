import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Note: env vars were provided swapped — correcting here
const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "").startsWith("http")
  ? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  : process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").startsWith("sb_")
  ? process.env.EXPO_PUBLIC_SUPABASE_URL!
  : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "wallet" | "bank" | "savings";
          balance: number;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["accounts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      credit_cards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          limit: number;
          balance: number;
          closing_day: number;
          due_day: number;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["credit_cards"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["credit_cards"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          type: "expense" | "income";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "expense" | "income" | "card_expense" | "transfer";
          amount: number;
          description: string;
          date: string;
          category_id: string | null;
          account_id: string | null;
          card_id: string | null;
          to_account_id: string | null;
          status: "paid" | "pending";
          recurrence_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      recurrences: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          type: "expense" | "income" | "card_expense";
          category_id: string | null;
          account_id: string | null;
          card_id: string | null;
          day_of_month: number;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["recurrences"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["recurrences"]["Insert"]>;
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["budgets"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["budgets"]["Insert"]>;
      };
    };
  };
};
