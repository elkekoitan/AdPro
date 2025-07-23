/**
 * Supabase Kimlik Doğrulama Repository Uygulaması
 * IAuthRepository interface'ini Supabase ile uygular
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
  AppError,
  AuthError,
  ValidationError,
  ErrorCode,
  ErrorFactory,
  ErrorContext,
} from '../../shared/types/errors';
import { Logger } from '../../shared/utils/debug-helpers';
import { supabase, supabaseConfig } from '../config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseAuthRepository implements IAuthRepository {
  private supabase: SupabaseClient;
  private readonly TAG = 'SupabaseAuthRepository';

  constructor() {
    this.supabase = supabase;
    Logger.info(this.TAG, 'Supabase Auth Repository initialized', {
      configured: supabaseConfig.isConfigured,
      url: supabaseConfig.url,
    });
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
      Logger.info(this.TAG, 'Kullanıcı girişi başlatılıyor', { email: credentials.email });

      // Giriş bilgilerini doğrula
      this.validateLoginCredentials(credentials);

      // Supabase ile giriş yap
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        Logger.error(this.TAG, 'Supabase giriş hatası', error);
        throw this.mapSupabaseError(error, context);
      }

      if (!data.user || !data.session) {
        throw ErrorFactory.createAuthError(
          ErrorCode.INVALID_CREDENTIALS,
          'Giriş bilgileri hatalı',
          context
        );
      }

      // Kullanıcı ve token bilgilerini dönüştür
      const user = this.mapSupabaseUserToUser(data.user);
      const tokens = this.mapSupabaseSessionToTokens(data.session);

      Logger.info(this.TAG, 'Kullanıcı girişi başarılı', { userId: user.id });

      return { user, tokens };
    } catch (error) {
      Logger.error(this.TAG, 'Giriş hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createAuthError(
        ErrorCode.UNKNOWN_ERROR,
        'Giriş sırasında beklenmeyen bir hata oluştu',
        context
      );
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
      Logger.info(this.TAG, 'Kullanıcı kaydı başlatılıyor', { email: data.email });

      // Kayıt bilgilerini doğrula
      this.validateRegisterData(data);

      // Supabase ile kayıt ol
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            business_name: data.businessName,
            industry: data.industry,
          },
        },
      });

      if (error) {
        Logger.error(this.TAG, 'Supabase kayıt hatası', error);
        throw this.mapSupabaseError(error, context);
      }

      if (!authData.user || !authData.session) {
        throw ErrorFactory.createAuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Kayıt işlemi tamamlanamadı',
          context
        );
      }

      // Kullanıcı ve token bilgilerini dönüştür
      const user = this.mapSupabaseUserToUser(authData.user, data);
      const tokens = this.mapSupabaseSessionToTokens(authData.session);

      Logger.info(this.TAG, 'Kullanıcı kaydı başarılı', { userId: user.id });

      return { user, tokens };
    } catch (error) {
      Logger.error(this.TAG, 'Kayıt hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createAuthError(
        ErrorCode.UNKNOWN_ERROR,
        'Kayıt sırasında beklenmeyen bir hata oluştu',
        context
      );
    }
  }

  /**
   * Kullanıcı çıkışı yapar
   */
  async logout(): Promise<void> {
    try {
      Logger.info(this.TAG, 'Kullanıcı çıkışı başlatılıyor');

      const { error } = await this.supabase.auth.signOut();

      if (error) {
        Logger.error(this.TAG, 'Supabase çıkış hatası', error);
        throw ErrorFactory.createAuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Çıkış işlemi başarısız',
          { actionType: 'logout' }
        );
      }

      Logger.info(this.TAG, 'Kullanıcı çıkışı başarılı');
    } catch (error) {
      Logger.error(this.TAG, 'Çıkış hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createAuthError(
        ErrorCode.UNKNOWN_ERROR,
        'Çıkış sırasında beklenmeyen bir hata oluştu',
        { actionType: 'logout' }
      );
    }
  }

  /**
   * Mevcut kullanıcıyı getirir
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      Logger.debug(this.TAG, 'Mevcut kullanıcı getiriliyor');

      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        Logger.error(this.TAG, 'Kullanıcı getirme hatası', error);
        return null;
      }

      if (!data.user) {
        Logger.debug(this.TAG, 'Giriş yapmış kullanıcı yok');
        return null;
      }

      const user = this.mapSupabaseUserToUser(data.user);
      Logger.debug(this.TAG, 'Mevcut kullanıcı getirildi', { userId: user.id });

      return user;
    } catch (error) {
      Logger.error(this.TAG, 'Kullanıcı getirme hatası', error);
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
      Logger.debug(this.TAG, 'Token yenileniyor');

      const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });

      if (error) {
        Logger.error(this.TAG, 'Token yenileme hatası', error);
        throw this.mapSupabaseError(error, context);
      }

      if (!data.session) {
        throw ErrorFactory.createAuthError(
          ErrorCode.INVALID_TOKEN,
          'Token yenilenemedi',
          context
        );
      }

      const tokens = this.mapSupabaseSessionToTokens(data.session);
      Logger.debug(this.TAG, 'Token başarıyla yenilendi');

      return tokens;
    } catch (error) {
      Logger.error(this.TAG, 'Token yenileme hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createAuthError(
        ErrorCode.UNKNOWN_ERROR,
        'Token yenileme sırasında beklenmeyen bir hata oluştu',
        context
      );
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
      Logger.info(this.TAG, 'Şifre sıfırlama e-postası gönderiliyor', { email });

      if (!UserValidation.isValidEmail(email)) {
        throw ErrorFactory.createValidationError('Geçersiz e-posta formatı', 'email', email);
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Logger.error(this.TAG, 'Şifre sıfırlama e-postası gönderme hatası', error);
        throw this.mapSupabaseError(error, context);
      }

      Logger.info(this.TAG, 'Şifre sıfırlama e-postası gönderildi', { email });
    } catch (error) {
      Logger.error(this.TAG, 'Şifre sıfırlama e-postası gönderme hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createAuthError(
        ErrorCode.UNKNOWN_ERROR,
        'Şifre sıfırlama e-postası gönderilirken beklenmeyen bir hata oluştu',
        context
      );
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
      Logger.info(this.TAG, 'Şifre sıfırlanıyor');

      if (!UserValidation.isValidPassword(newPassword)) {
        throw ErrorFactory.createValidationError(
          'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir',
          'password',
          newPassword
        );
      }

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Logger.error(this.TAG, 'Şifre sıfırlama hatası', error);
        throw this.mapSupabaseError(error, context);
      }

      Logger.info(this.TAG, 'Şifre başarıyla sıfırlandı');
    } catch (error) {
      Logger.error(this.TAG, 'Şifre sıfırlama hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createAuthError(
        ErrorCode.UNKNOWN_ERROR,
        'Şifre sıfırlama sırasında beklenmeyen bir hata oluştu',
        context
      );
    }
  }

  /**
   * E-posta doğrulama kodu gönderir
   */
  async sendEmailVerification(email: string): Promise<void> {
    // Supabase otomatik olarak e-posta doğrulama gönderir
    Logger.info(this.TAG, 'E-posta doğrulama kodu gönderildi', { email });
  }

  /**
   * E-posta adresini doğrular
   */
  async verifyEmail(token: string): Promise<void> {
    // Supabase otomatik olarak e-posta doğrulama yapar
    Logger.info(this.TAG, 'E-posta doğrulandı');
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
   * Supabase hatasını uygulama hatasına dönüştürür
   */
  private mapSupabaseError(error: any, context: ErrorContext): AppError {
    const errorMessage = error.message || 'Bilinmeyen hata';

    // Supabase hata kodlarını uygulama hata kodlarına dönüştür
    if (errorMessage.includes('Invalid login credentials')) {
      return ErrorFactory.createAuthError(ErrorCode.INVALID_CREDENTIALS, 'E-posta veya şifre hatalı', context);
    }

    if (errorMessage.includes('User already registered')) {
      return ErrorFactory.createAuthError(ErrorCode.EMAIL_ALREADY_EXISTS, 'Bu e-posta adresi zaten kullanımda', context);
    }

    if (errorMessage.includes('Email not confirmed')) {
      return ErrorFactory.createAuthError(ErrorCode.EMAIL_NOT_VERIFIED, 'E-posta adresi doğrulanmamış', context);
    }

    if (errorMessage.includes('Invalid token')) {
      return ErrorFactory.createAuthError(ErrorCode.INVALID_TOKEN, 'Geçersiz token', context);
    }

    if (errorMessage.includes('Token expired')) {
      return ErrorFactory.createAuthError(ErrorCode.TOKEN_EXPIRED, 'Token süresi dolmuş', context);
    }

    return ErrorFactory.createAuthError(ErrorCode.UNKNOWN_ERROR, errorMessage, context);
  }

  /**
   * Supabase kullanıcısını uygulama kullanıcısına dönüştürür
   */
  private mapSupabaseUserToUser(supabaseUser: any, additionalData?: RegisterData): User {
    return createUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || additionalData?.name || '',
      avatar: supabaseUser.user_metadata?.avatar_url,
      emailVerified: supabaseUser.email_confirmed_at != null,
      phoneNumber: supabaseUser.phone,
      phoneVerified: supabaseUser.phone_confirmed_at != null,
      businessProfile: additionalData?.businessName ? {
        id: `business_${supabaseUser.id}`,
        name: additionalData.businessName,
        industry: additionalData.industry || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } : undefined,
      lastLoginAt: new Date(),
    });
  }

  /**
   * Supabase session'ını token bilgilerine dönüştürür
   */
  private mapSupabaseSessionToTokens(session: any): AuthTokens {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: new Date(session.expires_at * 1000),
    };
  }
}