export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export class SupabaseAuthService {
  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    // Mock implementation - replace with actual Supabase auth
    return {
      id: '1',
      email: credentials.email,
      name: credentials.name || 'New User'
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Mock implementation - replace with actual Supabase auth
    return {
      id: '1',
      email: credentials.email,
      name: 'Demo User'
    };
  }

  async logout(): Promise<void> {
    // Mock implementation - replace with actual Supabase auth
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Mock implementation - replace with actual Supabase auth
    return null;
  }
}
