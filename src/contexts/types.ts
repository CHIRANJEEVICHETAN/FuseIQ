import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (email: string, password: string, userData: Record<string, unknown>) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: unknown }>;
  promoteToSuperAdmin: (email: string) => Promise<{ error: unknown }>;
} 