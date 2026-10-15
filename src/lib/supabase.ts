import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

export type Plan = 'free' | 'regular' | 'pro';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  plan: Plan;
  created_at: string;
};

export type PaymentRequest = {
  id: string;
  user_id: string;
  plan: Exclude<Plan, 'free'>;
  amount_bob: number;
  status: PaymentStatus;
  created_at: string;
  reviewed_at: string | null;
};

type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          display_name: string;
          plan?: Plan;
          created_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      payment_requests: {
        Row: PaymentRequest;
        Insert: {
          id?: string;
          user_id: string;
          plan: Exclude<Plan, 'free'>;
          amount_bob: number;
          status?: PaymentStatus;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: Partial<PaymentRequest>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      request_payment: {
        Args: { requested_plan: string };
        Returns: string;
      };
      approve_payment_request: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Adaptador de almacenamiento seguro para SSR / Web
const CustomAsyncStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return null;
    }
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    return await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    return await AsyncStorage.removeItem(key);
  },
};

const isPlaceholderValue = (value?: string) => {
  if (!value) return true;

  const normalized = value.trim();
  return (
    normalized.length === 0 ||
    normalized.includes('your-project') ||
    normalized.includes('your-supabase') ||
    normalized.includes('replace-me') ||
    normalized.includes('example.com')
  );
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigError =
  !supabaseUrl ||
  !supabaseKey ||
  isPlaceholderValue(supabaseUrl) ||
  isPlaceholderValue(supabaseKey)
    ? 'Falta la configuración válida de Supabase. Copia .env.example a .env y completa EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY con los valores públicos de tu proyecto.'
    : null;

export const supabaseConfigured = !supabaseConfigError;
export const supabase = supabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseKey!, {
      auth: {
        storage: CustomAsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;