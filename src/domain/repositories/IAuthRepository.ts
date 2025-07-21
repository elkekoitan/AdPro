/**
 * Kimlik Doğrulama Repository Interface'i
 * Domain katmanında kimlik doğrulama işlemleri için sözleşme tanımlar
 */

import { User } from '../entities/User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  businessName?: string;
  industry?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface IAuthRepository {
  /**
   * Kullanıcı girişi yapar
   * @param credentials - Giriş bilgileri (email, şifre)
   * @returns Promise<AuthResult> - Kullanıcı ve token bilgileri
   */
  login(credentials: LoginCredentials): Promise<AuthResult>;

  /**
   * Yeni kullanıcı kaydı oluşturur
   * @param data - Kayıt bilgileri
   * @returns Promise<AuthResult> - Kullanıcı ve token bilgileri
   */
  register(data: RegisterData): Promise<AuthResult>;

  /**
   * Kullanıcı çıkışı yapar
   * @returns Promise<void>
   */
  logout(): Promise<void>;

  /**
   * Mevcut kullanıcıyı getirir
   * @returns Promise<User | null> - Giriş yapmış kullanıcı veya null
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Access token'ı yeniler
   * @param refreshToken - Yenileme token'ı
   * @returns Promise<AuthTokens> - Yeni token bilgileri
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Şifre sıfırlama e-postası gönderir
   * @param email - E-posta adresi
   * @returns Promise<void>
   */
  sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Şifreyi sıfırlar
   * @param token - Sıfırlama token'ı
   * @param newPassword - Yeni şifre
   * @returns Promise<void>
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * E-posta doğrulama kodu gönderir
   * @param email - E-posta adresi
   * @returns Promise<void>
   */
  sendEmailVerification(email: string): Promise<void>;

  /**
   * E-posta adresini doğrular
   * @param token - Doğrulama token'ı
   * @returns Promise<void>
   */
  verifyEmail(token: string): Promise<void>;
}