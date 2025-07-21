/**
 * Mock Kimlik Doğrulama Repository
 * Test ve geliştirme ortamı için sahte kimlik doğrulama uygulaması
 */

import {
  IAuthRepository,
  LoginCredentials,
  RegisterData,
  AuthResult,
  AuthTokens,
} from '../../domain/repositories/IAuthRepository';
import { User, createUser, UserValidation } from '../../domain/entities/User';
import {
  AuthError,
  ValidationError,
  ErrorCode,
  ErrorFactory,
  ErrorContext,
} from '../../shared/types/errors';
import { Logger } from '../../shared/utils/debug-helpers';

/**
 * Sahte kullanıcı veritabanı
 */
interface MockUserData {
  id: string;
  email: string;
  password: string;
  name: string;
  businessName?: string;
  industry?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export class MockAuthRepository implements IAuthRepository {
  private users: Map<string, MockUserData> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private readonly TAG = 'MockAuthRepository';

  constructor() {
    // Test kullanıcıları ekle
    this.seedTestUsers();
  }

  /**
   * Kullanıcı girişi yapar
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const context: ErrorContext = {
      actionType: 'login',
      additionalData: { email: credentials.email },
    };

    try {
      Logger.info(this.TAG, 'Mock kullanıcı girişi başlatılıyor', { email: credentials.email });

      // Giriş bilgilerini doğrula
      this.validateLoginCredentials(credentials);

      // Kullanıcıyı bul
      const userData = Array.from(this.users.values()).find(
        user => user.email === credentials.email
      );

      if (!userData) {
        throw ErrorFactory.createAuthError(
          ErrorCode.USER_NOT_FOUND,
          'Kullanıcı bulunamadı',
          context
        );
      }

      // Şifreyi kontrol et
      if (userData.password !== credentials.password) {
        throw ErrorFactory.createAuthError(
          ErrorCode.INVALID_CREDENTIALS,
          'E-posta veya şifre hatalı',
          context
        );
      }

      // E-posta doğrulamasını kontrol et
      if (!userData.emailVerified) {
        throw ErrorFactory.createAuthError(
          ErrorCode.EMAIL_NOT_VERIFIED,
          'E-posta adresi doğrulanmamış',
          context
        );
      }

      // Token oluştur
      const tokens = this.generateTokens(userData.id);
      
      // Session kaydet
      this.sessions.set(tokens.accessToken, {
        userId: userData.id,
        expiresAt: tokens.expiresAt,
      });

      // Kullanıcı nesnesini oluştur
      const user = this.mapMockUserToUser(userData);

      Logger.info(this.TAG, 'Mock kullanıcı girişi başarılı', { userId: user.id });

      return { user, tokens };
    } catch (error) {
      Logger.error(this.TAG, 'Mock giriş hatası', error);
      throw error;
    }
  }

  /**
   * Yeni kullanıcı kaydı oluşturur
   */
  async register(data: RegisterData): Promise<AuthResult> {
    const context: ErrorContext = {
      actionType: 'register',
      additionalData: { email: data.email, name: data.name },
    };

    try {
      Logger.info(this.TAG, 'Mock kullanıcı kaydı başlatılıyor', { email: data.email });

      // Kayıt bilgilerini doğrula
      this.validateRegisterData(data);

      // E-posta zaten var mı kontrol et
      const existingUser = Array.from(this.users.values()).find(
        user => user.email === data.email
      );

      if (existingUser) {
        throw ErrorFactory.createAuthError(
          ErrorCode.EMAIL_ALREADY_EXISTS,
          'Bu e-posta adresi zaten kullanımda',
          context
        );
      }

      // Yeni kullanıcı oluştur
      const userId = this.generateUserId();
      const userData: MockUserData = {
        id: userId,
        email: data.email,
        password: data.password,
        name: data.name,
        businessName: data.businessName,
        industry: data.industry,
        emailVerified: true, // Mock'ta otomatik doğrulanmış kabul et
        createdAt: new Date(),
      };

      // Kullanıcıyı kaydet
      this.users.set(userId, userData);

      // Token oluştur
      const tokens = this.generateTokens(userId);
      
      // Session kaydet
      this.sessions.set(tokens.accessToken, {
        userId: userId,
        expiresAt: tokens.expiresAt,
      });

      // Kullanıcı nesnesini oluştur
      const user = this.mapMockUserToUser(userData);

      Logger.info(this.TAG, 'Mock kullanıcı kaydı başarılı', { userId: user.id });

      return { user, tokens };
    } catch (error) {
      Logger.error(this.TAG, 'Mock kayıt hatası', error);
      throw error;
    }
  }

  /**
   * Kullanıcı çıkışı yapar
   */
  async logout(): Promise<void> {
    try {
      Logger.info(this.TAG, 'Mock kullanıcı çıkışı başlatılıyor');

      // Tüm session'ları temizle (gerçek uygulamada sadece mevcut session silinir)
      this.sessions.clear();

      Logger.info(this.TAG, 'Mock kullanıcı çıkışı başarılı');
    } catch (error) {
      Logger.error(this.TAG, 'Mock çıkış hatası', error);
      throw error;
    }
  }

  /**
   * Mevcut kullanıcıyı getirir
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      Logger.debug(this.TAG, 'Mock mevcut kullanıcı getiriliyor');

      // İlk aktif session'ı bul (gerçek uygulamada token ile yapılır)
      const activeSession = Array.from(this.sessions.entries()).find(
        ([_, session]) => session.expiresAt > new Date()
      );

      if (!activeSession) {
        Logger.debug(this.TAG, 'Mock aktif session yok');
        return null;
      }

      const [_, session] = activeSession;
      const userData = this.users.get(session.userId);

      if (!userData) {
        Logger.debug(this.TAG, 'Mock kullanıcı verisi bulunamadı');
        return null;
      }

      const user = this.mapMockUserToUser(userData);
      Logger.debug(this.TAG, 'Mock mevcut kullanıcı getirildi', { userId: user.id });

      return user;
    } catch (error) {
      Logger.error(this.TAG, 'Mock kullanıcı getirme hatası', error);
      return null;
    }
  }

  /**
   * Access token'ı yeniler
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const context: ErrorContext = {
      actionType: 'refreshToken',
    };

    try {
      Logger.debug(this.TAG, 'Mock token yenileniyor');

      // Mock'ta basit token yenileme
      const session = this.sessions.get(refreshToken);
      
      if (!session) {
        throw ErrorFactory.createAuthError(
          ErrorCode.INVALID_TOKEN,
          'Geçersiz refresh token',
          context
        );
      }

      // Yeni token oluştur
      const newTokens = this.generateTokens(session.userId);
      
      // Eski session'ı sil, yenisini ekle
      this.sessions.delete(refreshToken);
      this.sessions.set(newTokens.accessToken, {
        userId: session.userId,
        expiresAt: newTokens.expiresAt,
      });

      Logger.debug(this.TAG, 'Mock token başarıyla yenilendi');

      return newTokens;
    } catch (error) {
      Logger.error(this.TAG, 'Mock token yenileme hatası', error);
      throw error;
    }
  }

  /**
   * Şifre sıfırlama e-postası gönderir
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const context: ErrorContext = {
      actionType: 'sendPasswordResetEmail',
      additionalData: { email },
    };

    try {
      Logger.info(this.TAG, 'Mock şifre sıfırlama e-postası gönderiliyor', { email });

      if (!UserValidation.isValidEmail(email)) {
        throw ErrorFactory.createValidationError('Geçersiz e-posta formatı', 'email', email);
      }

      // Kullanıcının var olup olmadığını kontrol et
      const userData = Array.from(this.users.values()).find(
        user => user.email === email
      );

      if (!userData) {
        throw ErrorFactory.createAuthError(
          ErrorCode.USER_NOT_FOUND,
          'Bu e-posta adresine kayıtlı kullanıcı bulunamadı',
          context
        );
      }

      // Mock'ta e-posta gönderilmiş gibi davran
      Logger.info(this.TAG, 'Mock şifre sıfırlama e-postası gönderildi', { email });
    } catch (error) {
      Logger.error(this.TAG, 'Mock şifre sıfırlama e-postası gönderme hatası', error);
      throw error;
    }
  }

  /**
   * Şifreyi sıfırlar
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const context: ErrorContext = {
      actionType: 'resetPassword',
    };

    try {
      Logger.info(this.TAG, 'Mock şifre sıfırlanıyor');

      if (!UserValidation.isValidPassword(newPassword)) {
        throw ErrorFactory.createValidationError(
          'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir',
          'password',
          newPassword
        );
      }

      // Mock'ta token doğrulaması basit
      if (token !== 'valid-reset-token') {
        throw ErrorFactory.createAuthError(
          ErrorCode.INVALID_TOKEN,
          'Geçersiz sıfırlama token\'ı',
          context
        );
      }

      // İlk kullanıcının şifresini güncelle (demo amaçlı)
      const firstUser = Array.from(this.users.values())[0];
      if (firstUser) {
        firstUser.password = newPassword;
        this.users.set(firstUser.id, firstUser);
      }

      Logger.info(this.TAG, 'Mock şifre başarıyla sıfırlandı');
    } catch (error) {
      Logger.error(this.TAG, 'Mock şifre sıfırlama hatası', error);
      throw error;
    }
  }

  /**
   * E-posta doğrulama kodu gönderir
   */
  async sendEmailVerification(email: string): Promise<void> {
    Logger.info(this.TAG, 'Mock e-posta doğrulama kodu gönderildi', { email });
  }

  /**
   * E-posta adresini doğrular
   */
  async verifyEmail(token: string): Promise<void> {
    Logger.info(this.TAG, 'Mock e-posta doğrulandı');
  }

  /**
   * Test kullanıcılarını ekler
   */
  private seedTestUsers(): void {
    const testUsers: MockUserData[] = [
      {
        id: 'user_1',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Kullanıcısı',
        emailVerified: true,
        createdAt: new Date(),
      },
      {
        id: 'user_2',
        email: 'business@example.com',
        password: 'business123',
        name: 'İş Kullanıcısı',
        businessName: 'Test İşletmesi',
        industry: 'restaurant',
        emailVerified: true,
        createdAt: new Date(),
      },
      {
        id: 'user_3',
        email: 'unverified@example.com',
        password: 'unverified123',
        name: 'Doğrulanmamış Kullanıcı',
        emailVerified: false,
        createdAt: new Date(),
      },
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    Logger.info(this.TAG, `${testUsers.length} test kullanıcısı eklendi`);
  }

  /**
   * Giriş bilgilerini doğrular
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!UserValidation.isValidEmail(credentials.email)) {
      throw ErrorFactory.createValidationError(
        'Geçersiz e-posta formatı',
        'email',
        credentials.email
      );
    }

    if (!credentials.password || credentials.password.length < 6) {
      throw ErrorFactory.createValidationError(
        'Şifre en az 6 karakter olmalıdır',
        'password'
      );
    }
  }

  /**
   * Kayıt bilgilerini doğrular
   */
  private validateRegisterData(data: RegisterData): void {
    if (!UserValidation.isValidEmail(data.email)) {
      throw ErrorFactory.createValidationError(
        'Geçersiz e-posta formatı',
        'email',
        data.email
      );
    }

    if (!UserValidation.isValidPassword(data.password)) {
      throw ErrorFactory.createValidationError(
        'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir',
        'password'
      );
    }

    if (!UserValidation.isValidName(data.name)) {
      throw ErrorFactory.createValidationError(
        'İsim 2-50 karakter arasında olmalıdır',
        'name',
        data.name
      );
    }
  }

  /**
   * Kullanıcı ID'si oluşturur
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Token'lar oluşturur
   */
  private generateTokens(userId: string): AuthTokens {
    const accessToken = `access_${userId}_${Date.now()}`;
    const refreshToken = `refresh_${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Mock kullanıcısını uygulama kullanıcısına dönüştürür
   */
  private mapMockUserToUser(userData: MockUserData): User {
    return createUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      emailVerified: userData.emailVerified,
      businessProfile: userData.businessName ? {
        id: `business_${userData.id}`,
        name: userData.businessName,
        industry: userData.industry || '',
        createdAt: userData.createdAt,
        updatedAt: userData.createdAt,
      } : undefined,
      createdAt: userData.createdAt,
      lastLoginAt: new Date(),
    });
  }
}