import { User } from '@/lib/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (email: string, password: string, userData: Record<string, unknown>) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: unknown }>;
  promoteToSuperAdmin: (email: string) => Promise<{ error: unknown }>;
} 