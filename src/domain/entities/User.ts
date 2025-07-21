/**
 * Kullanıcı Domain Entity'si
 * İş mantığı kurallarını ve kullanıcı verilerini içerir
 */

export interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  description?: string;
  website?: string;
  logo?: string;
  targetAudience?: string[];
  socialMediaAccounts?: {
    platform: string;
    username: string;
    connected: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | undefined;
  emailVerified: boolean;
  phoneNumber?: string | undefined;
  phoneVerified: boolean;
  businessProfile?: BusinessProfile | undefined;
  preferences: UserPreferences;
  role: 'user' | 'admin' | 'business_owner';
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    expiresAt?: Date | undefined;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | undefined;
}

/**
 * Kullanıcı oluşturma için factory fonksiyonu
 */
export const createUser = (data: Partial<User> & { email: string; name: string }): User => {
  const now = new Date();

  return {
    id: data.id || generateUserId(),
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    emailVerified: data.emailVerified || false,
    phoneNumber: data.phoneNumber,
    phoneVerified: data.phoneVerified || false,
    businessProfile: data.businessProfile,
    preferences: data.preferences || {
      language: 'tr',
      timezone: 'Europe/Istanbul',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      theme: 'auto',
    },
    role: data.role || 'user',
    subscription: data.subscription || {
      plan: 'free',
      status: 'active',
    },
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    lastLoginAt: data.lastLoginAt,
  };
};

/**
 * Kullanıcı ID oluşturucu (gerçek uygulamada UUID kullanılmalı)
 */
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Kullanıcı doğrulama fonksiyonları
 */
export const UserValidation = {
  /**
   * E-posta formatını doğrular
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Şifre güçlülüğünü doğrular
   */
  isValidPassword: (password: string): boolean => {
    // En az 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Kullanıcı adının geçerliliğini kontrol eder
   */
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  },

  /**
   * Telefon numarası formatını doğrular
   */
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
};