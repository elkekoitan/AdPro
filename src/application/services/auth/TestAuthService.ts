export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface TestAuthCredentials {
  email: string;
  password: string;
}

export class TestAuthService {
  private static instance: TestAuthService;
  private currentUser: TestUser | null = null;

  // Mock users for testing
  private mockUsers: TestUser[] = [
    {
      id: '1',
      email: 'demo@adpro.com',
      name: 'Demo User',
      role: 'user'
    },
    {
      id: '2',
      email: 'admin@adpro.com',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: '3',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  ];

  static getInstance(): TestAuthService {
    if (!TestAuthService.instance) {
      TestAuthService.instance = new TestAuthService();
    }
    return TestAuthService.instance;
  }

  async login(credentials: TestAuthCredentials): Promise<TestUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Simple password validation (in real app, this would be hashed)
    if (credentials.password !== 'password123') {
      throw new Error('Invalid password');
    }

    this.currentUser = user;
    return user;
  }

  async register(credentials: TestAuthCredentials & { name: string }): Promise<TestUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = this.mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: TestUser = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      role: 'user'
    };

    this.mockUsers.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
  }

  getCurrentUser(): TestUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async refreshToken(): Promise<string> {
    // Simulate token refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'mock-jwt-token-' + Date.now();
  }

  async resetPassword(email: string): Promise<void> {
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = this.mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    
    // In real app, this would send an email
    console.log(`Password reset email sent to ${email}`);
  }

  // Helper method for testing different scenarios
  setMockUser(user: TestUser | null): void {
    this.currentUser = user;
  }

  // Get all mock users (for testing purposes)
  getMockUsers(): TestUser[] {
    return [...this.mockUsers];
  }
}
