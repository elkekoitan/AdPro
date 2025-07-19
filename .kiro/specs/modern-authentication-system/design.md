# Modern Authentication System - Design Document

## Overview

The Modern Authentication System provides a comprehensive, secure, and user-friendly authentication solution for the AdVantage platform. This system incorporates modern design trends, advanced security features, multiple authentication methods, and seamless user experience while maintaining enterprise-grade security standards.

### Design Principles
- **Security-First**: Enterprise-grade security without compromising user experience
- **Modern UX**: Contemporary design with smooth animations and micro-interactions
- **Multi-Modal Authentication**: Support for various authentication methods and preferences
- **Accessibility-First**: Comprehensive accessibility support for all users
- **Progressive Enhancement**: Graceful degradation and progressive feature enhancement

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Auth UI       │  │   Biometric     │  │  Social     │ │
│  │   Components    │  │   Auth          │  │  Login      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Auth          │  │   Session       │  │  Security   │ │
│  │   Manager       │  │   Manager       │  │  Monitor    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Security Services Layer                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   2FA           │  │   Device        │  │  Fraud      │ │
│  │   Service       │  │   Management    │  │  Detection  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Auth Backend                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   User          │  │   OAuth         │  │  Security   │ │
│  │   Management    │  │   Providers     │  │  Policies   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core Authentication System

```typescript
interface AuthenticationManager {
  signIn(credentials: AuthCredentials): Promise<AuthResult>;
  signUp(userData: SignUpData): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshSession(): Promise<AuthResult>;
  resetPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<AuthResult>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(updates: ProfileUpdates): Promise<User>;
}

interface AuthCredentials {
  type: AuthType;
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
  biometricData?: BiometricData;
  socialToken?: SocialAuthToken;
}

type AuthType = 
  | 'email_password'
  | 'phone_otp'
  | 'biometric'
  | 'google'
  | 'apple'
  | 'facebook'
  | 'microsoft';

interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: AuthError;
  requiresVerification?: boolean;
  requires2FA?: boolean;
  nextStep?: AuthStep;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  metadata?: SignUpMetadata;
}

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  lastSignInAt: Date;
  authMethods: AuthMethod[];
  securitySettings: UserSecuritySettings;
  preferences: UserPreferences;
}

interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  device: DeviceInfo;
  location?: LocationInfo;
  isActive: boolean;
  createdAt: Date;
  lastActivityAt: Date;
}
```

### Multi-Factor Authentication

```typescript
interface TwoFactorAuthService {
  setupTwoFactor(userId: string, method: TwoFactorMethod): Promise<TwoFactorSetup>;
  verifyTwoFactor(userId: string, code: string, method: TwoFactorMethod): Promise<VerificationResult>;
  generateBackupCodes(userId: string): Promise<BackupCode[]>;
  disableTwoFactor(userId: string, verification: TwoFactorVerification): Promise<void>;
  getTwoFactorStatus(userId: string): Promise<TwoFactorStatus>;
}

type TwoFactorMethod = 'sms' | 'email' | 'totp' | 'hardware_key';

interface TwoFactorSetup {
  method: TwoFactorMethod;
  secret?: string;
  qrCode?: string;
  backupCodes: BackupCode[];
  verificationRequired: boolean;
}

interface TwoFactorStatus {
  enabled: boolean;
  methods: EnabledTwoFactorMethod[];
  backupCodesRemaining: number;
  lastUsed?: Date;
}

interface EnabledTwoFactorMethod {
  method: TwoFactorMethod;
  enabledAt: Date;
  lastUsed?: Date;
  isDefault: boolean;
}

interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

interface VerificationResult {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
  lockoutUntil?: Date;
}
```

### Biometric Authentication

```typescript
interface BiometricAuthService {
  isAvailable(): Promise<BiometricAvailability>;
  enroll(userId: string): Promise<BiometricEnrollment>;
  authenticate(userId: string): Promise<BiometricAuthResult>;
  disable(userId: string): Promise<void>;
  getStatus(userId: string): Promise<BiometricStatus>;
}

interface BiometricAvailability {
  available: boolean;
  types: BiometricType[];
  error?: string;
}

type BiometricType = 'fingerprint' | 'face_id' | 'voice' | 'iris';

interface BiometricEnrollment {
  success: boolean;
  biometricId: string;
  types: BiometricType[];
  fallbackEnabled: boolean;
}

interface BiometricAuthResult {
  success: boolean;
  biometricId?: string;
  fallbackUsed?: boolean;
  error?: BiometricError;
}

interface BiometricStatus {
  enrolled: boolean;
  types: BiometricType[];
  lastUsed?: Date;
  fallbackEnabled: boolean;
}

interface BiometricError {
  code: BiometricErrorCode;
  message: string;
  recoverable: boolean;
}

type BiometricErrorCode = 
  | 'not_available'
  | 'not_enrolled'
  | 'authentication_failed'
  | 'user_cancelled'
  | 'system_cancelled'
  | 'lockout'
  | 'lockout_permanent';
```

### Social Authentication

```typescript
interface SocialAuthService {
  signInWithGoogle(): Promise<SocialAuthResult>;
  signInWithApple(): Promise<SocialAuthResult>;
  signInWithFacebook(): Promise<SocialAuthResult>;
  signInWithMicrosoft(): Promise<SocialAuthResult>;
  linkSocialAccount(userId: string, provider: SocialProvider, token: string): Promise<LinkResult>;
  unlinkSocialAccount(userId: string, provider: SocialProvider): Promise<void>;
  getSocialAccounts(userId: string): Promise<LinkedSocialAccount[]>;
}

type SocialProvider = 'google' | 'apple' | 'facebook' | 'microsoft';

interface SocialAuthResult {
  success: boolean;
  user?: SocialUser;
  token?: SocialAuthToken;
  isNewUser: boolean;
  error?: SocialAuthError;
}

interface SocialUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: SocialProvider;
  verified: boolean;
}

interface SocialAuthToken {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: Date;
  scope: string[];
}

interface LinkedSocialAccount {
  provider: SocialProvider;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  linkedAt: Date;
  lastUsed?: Date;
}
```

### Security and Device Management

```typescript
interface SecurityService {
  detectSuspiciousActivity(userId: string, activity: ActivityData): Promise<SecurityAssessment>;
  lockAccount(userId: string, reason: string): Promise<void>;
  unlockAccount(userId: string, verification: SecurityVerification): Promise<void>;
  getSecurityEvents(userId: string, timeRange: TimeRange): Promise<SecurityEvent[]>;
  updateSecuritySettings(userId: string, settings: SecuritySettings): Promise<void>;
}

interface DeviceManager {
  registerDevice(userId: string, device: DeviceRegistration): Promise<RegisteredDevice>;
  getDevices(userId: string): Promise<RegisteredDevice[]>;
  revokeDevice(userId: string, deviceId: string): Promise<void>;
  updateDeviceInfo(userId: string, deviceId: string, updates: DeviceUpdates): Promise<void>;
  isDeviceTrusted(userId: string, deviceFingerprint: string): Promise<boolean>;
}

interface SecurityAssessment {
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  recommendations: SecurityRecommendation[];
  requiresAction: boolean;
  actionType?: SecurityAction;
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskFactor {
  type: RiskFactorType;
  severity: number;
  description: string;
  evidence: string[];
}

type RiskFactorType = 
  | 'unusual_location'
  | 'new_device'
  | 'multiple_failed_attempts'
  | 'suspicious_timing'
  | 'compromised_credentials'
  | 'malware_detected';

interface RegisteredDevice {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  platform: Platform;
  fingerprint: string;
  isTrusted: boolean;
  lastUsed: Date;
  location?: LocationInfo;
  registeredAt: Date;
  metadata: DeviceMetadata;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'unknown';
type Platform = 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';

interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  metadata: SecurityEventMetadata;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'password_change'
  | 'email_change'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'suspicious_activity'
  | 'account_locked'
  | 'device_registered'
  | 'device_revoked';

type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical';
```

### Password Recovery and Management

```typescript
interface PasswordService {
  initiatePasswordReset(email: string): Promise<PasswordResetResult>;
  verifyResetToken(token: string): Promise<TokenVerificationResult>;
  resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<PasswordChangeResult>;
  validatePassword(password: string, requirements?: PasswordRequirements): Promise<PasswordValidation>;
  generateSecurePassword(requirements?: PasswordRequirements): Promise<string>;
}

interface PasswordResetResult {
  success: boolean;
  message: string;
  expiresAt?: Date;
  error?: PasswordError;
}

interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  score: number;
  feedback: PasswordFeedback[];
  requirements: RequirementCheck[];
}

type PasswordStrength = 'very_weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';

interface PasswordFeedback {
  type: FeedbackType;
  message: string;
  suggestion?: string;
}

type FeedbackType = 'error' | 'warning' | 'suggestion' | 'success';

interface RequirementCheck {
  requirement: string;
  met: boolean;
  description: string;
}

interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  forbidPersonalInfo: boolean;
}
```

## Database Schema

```sql
-- Extended User Profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  sign_in_count INTEGER DEFAULT 0
);

-- User Security Settings
CREATE TABLE public.user_security_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_methods JSONB DEFAULT '[]',
  backup_codes_remaining INTEGER DEFAULT 0,
  password_last_changed TIMESTAMP WITH TIME ZONE,
  security_questions JSONB DEFAULT '[]',
  login_notifications BOOLEAN DEFAULT TRUE,
  suspicious_activity_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Two-Factor Authentication
CREATE TABLE public.two_factor_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method VARCHAR(20) NOT NULL,
  secret TEXT, -- encrypted
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE
);

-- Backup Codes
CREATE TABLE public.backup_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registered Devices
CREATE TABLE public.registered_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  fingerprint VARCHAR(500) NOT NULL,
  is_trusted BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_info JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fingerprint)
);

-- User Sessions (extends Supabase sessions)
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id VARCHAR(500) NOT NULL,
  device_id UUID REFERENCES public.registered_devices(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  location_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Security Events
CREATE TABLE public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_id UUID REFERENCES public.registered_devices(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password Reset Tokens
CREATE TABLE public.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Auth Connections
CREATE TABLE public.social_auth_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider VARCHAR(20) NOT NULL,
  provider_user_id VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(200),
  avatar_url TEXT,
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, provider)
);

-- Biometric Authentication
CREATE TABLE public.biometric_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES public.registered_devices(id) ON DELETE CASCADE NOT NULL,
  biometric_type VARCHAR(20) NOT NULL,
  biometric_id VARCHAR(500) NOT NULL, -- encrypted
  is_active BOOLEAN DEFAULT TRUE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, device_id, biometric_type)
);

-- Login Attempts (for rate limiting and security)
CREATE TABLE public.login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255),
  ip_address INET NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(100),
  user_agent TEXT,
  device_fingerprint VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account Lockouts
CREATE TABLE public.account_lockouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  ip_address INET,
  reason VARCHAR(100) NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  unlocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for Performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(id);
CREATE INDEX idx_security_events_user_type ON public.security_events(user_id, event_type, created_at);
CREATE INDEX idx_registered_devices_user_trusted ON public.registered_devices(user_id, is_trusted);
CREATE INDEX idx_user_sessions_user_active ON public.user_sessions(user_id, is_active, last_activity_at);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, created_at);
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, created_at);
CREATE INDEX idx_password_reset_tokens_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX idx_social_auth_provider_user ON public.social_auth_connections(provider, provider_user_id);

-- Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_auth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_auth ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own security settings" ON public.user_security_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own 2FA" ON public.two_factor_auth FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own backup codes" ON public.backup_codes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own devices" ON public.registered_devices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own security events" ON public.security_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own social connections" ON public.social_auth_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own biometric auth" ON public.biometric_auth FOR ALL USING (auth.uid() = user_id);

-- Password reset tokens - special handling for unauthenticated users
CREATE POLICY "Password reset tokens are accessible by token" ON public.password_reset_tokens FOR SELECT USING (true);
CREATE POLICY "Password reset tokens can be updated by token" ON public.password_reset_tokens FOR UPDATE USING (true);
```

## Error Handling

```typescript
export class AuthError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
}

export class AccountLockedError extends AuthError {
  constructor(unlockTime?: Date) {
    const message = unlockTime 
      ? `Account locked until ${unlockTime.toISOString()}`
      : 'Account is locked due to suspicious activity';
    super(message, 'ACCOUNT_LOCKED', 423);
  }
}

export class TwoFactorRequiredError extends AuthError {
  constructor(availableMethods: TwoFactorMethod[]) {
    super('Two-factor authentication required', 'TWO_FACTOR_REQUIRED', 200);
    this.availableMethods = availableMethods;
  }
  
  availableMethods: TwoFactorMethod[];
}

export class BiometricNotAvailableError extends AuthError {
  constructor(reason: string) {
    super(`Biometric authentication not available: ${reason}`, 'BIOMETRIC_NOT_AVAILABLE', 400);
  }
}

export class SocialAuthError extends AuthError {
  constructor(provider: SocialProvider, message: string) {
    super(`${provider} authentication failed: ${message}`, 'SOCIAL_AUTH_ERROR', 400);
    this.provider = provider;
  }
  
  provider: SocialProvider;
}
```

## Testing Strategy

```typescript
describe('AuthenticationManager', () => {
  let authManager: AuthenticationManager;
  let mockSupabase: jest.Mocked<SupabaseClient>;
  let mockBiometricService: jest.Mocked<BiometricAuthService>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockBiometricService = createMockBiometricService();
    authManager = new AuthenticationManager(mockSupabase, mockBiometricService);
  });

  describe('signIn', () => {
    it('should authenticate user with valid credentials', async () => {
      const credentials = {
        type: 'email_password' as AuthType,
        email: 'test@example.com',
        password: 'securePassword123'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: createMockUser(), session: createMockSession() },
        error: null
      });

      const result = await authManager.signIn(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should handle invalid credentials', async () => {
      const credentials = {
        type: 'email_password' as AuthType,
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      const result = await authManager.signIn(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    });

    it('should require 2FA when enabled', async () => {
      const credentials = {
        type: 'email_password' as AuthType,
        email: 'test@example.com',
        password: 'securePassword123'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: createMockUser({ twoFactorEnabled: true }), session: null },
        error: null
      });

      const result = await authManager.signIn(credentials);

      expect(result.success).toBe(false);
      expect(result.requires2FA).toBe(true);
      expect(result.nextStep).toBe('two_factor_verification');
    });
  });

  describe('biometric authentication', () => {
    it('should authenticate with biometrics when available', async () => {
      const credentials = {
        type: 'biometric' as AuthType,
        biometricData: { type: 'fingerprint', id: 'user-123' }
      };

      mockBiometricService.isAvailable.mockResolvedValue({
        available: true,
        types: ['fingerprint']
      });

      mockBiometricService.authenticate.mockResolvedValue({
        success: true,
        biometricId: 'user-123'
      });

      const result = await authManager.signIn(credentials);

      expect(result.success).toBe(true);
      expect(mockBiometricService.authenticate).toHaveBeenCalled();
    });
  });
});
```

This comprehensive design document provides the foundation for implementing the Modern Authentication System with enterprise-grade security, modern UX, and comprehensive authentication options.