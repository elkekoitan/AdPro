/**
 * Authentication Repository Tests
 * Unit tests for authentication repository implementations
 */

import { MockAuthRepository } from '@/infrastructure/repositories/MockAuthRepository';
import { IAuthRepository, LoginCredentials, RegisterData } from '@/domain/repositories/IAuthRepository';
import { User } from '@/domain/entities/User';
import { AuthError, ValidationError, ErrorCode } from '@/shared/types/errors';
import { createMockUser, mockApiResponse, mockApiError } from '@/shared/utils/test-helpers';

describe('MockAuthRepository', () => {
  let authRepository: IAuthRepository;

  beforeEach(() => {
    authRepository = new MockAuthRepository();
  });

  describe('login', () => {
    it('geçerli kimlik bilgileri ile başarılı giriş yapmalı', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = await authRepository.login(credentials);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('geçersiz e-posta formatı ile hata fırlatmalı', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow(ValidationError);
      await expect(authRepository.login(credentials)).rejects.toThrow('Geçersiz e-posta formatı');
    });

    it('kısa şifre ile hata fırlatmalı', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: '123',
      };

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow(ValidationError);
      await expect(authRepository.login(credentials)).rejects.toThrow('Şifre en az 6 karakter olmalıdır');
    });

    it('yanlış şifre ile hata fırlatmalı', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow(AuthError);
      await expect(authRepository.login(credentials)).rejects.toThrow('E-posta veya şifre hatalı');
    });

    it('var olmayan kullanıcı ile hata fırlatmalı', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow(AuthError);
      await expect(authRepository.login(credentials)).rejects.toThrow('Kullanıcı bulunamadı');
    });

    it('doğrulanmamış e-posta ile hata fırlatmalı', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'unverified@example.com',
        password: 'unverified123',
      };

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow(AuthError);
      await expect(authRepository.login(credentials)).rejects.toThrow('E-posta adresi doğrulanmamış');
    });
  });

  describe('register', () => {
    it('geçerli bilgiler ile başarılı kayıt yapmalı', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'NewPassword123',
        name: 'Yeni Kullanıcı',
      };

      // Act
      const result = await authRepository.register(registerData);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.name).toBe(registerData.name);
    });

    it('işletme bilgileri ile başarılı kayıt yapmalı', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newbusiness@example.com',
        password: 'BusinessPassword123',
        name: 'İşletme Sahibi',
        businessName: 'Yeni İşletme',
        industry: 'restaurant',
      };

      // Act
      const result = await authRepository.register(registerData);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.businessProfile).toBeDefined();
      expect(result.user.businessProfile?.name).toBe(registerData.businessName);
      expect(result.user.businessProfile?.industry).toBe(registerData.industry);
    });

    it('geçersiz e-posta formatı ile hata fırlatmalı', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'invalid-email',
        password: 'ValidPassword123',
        name: 'Test User',
      };

      // Act & Assert
      await expect(authRepository.register(registerData)).rejects.toThrow(ValidationError);
    });

    it('zayıf şifre ile hata fırlatmalı', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      };

      // Act & Assert
      await expect(authRepository.register(registerData)).rejects.toThrow(ValidationError);
    });

    it('geçersiz isim ile hata fırlatmalı', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'ValidPassword123',
        name: 'A', // Çok kısa
      };

      // Act & Assert
      await expect(authRepository.register(registerData)).rejects.toThrow(ValidationError);
    });

    it('mevcut e-posta ile hata fırlatmalı', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'test@example.com', // Zaten var olan e-posta
        password: 'ValidPassword123',
        name: 'Test User',
      };

      // Act & Assert
      await expect(authRepository.register(registerData)).rejects.toThrow(AuthError);
      await expect(authRepository.register(registerData)).rejects.toThrow('Bu e-posta adresi zaten kullanımda');
    });
  });

  describe('logout', () => {
    it('başarılı çıkış yapmalı', async () => {
      // Act & Assert
      await expect(authRepository.logout()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('giriş yapmış kullanıcıyı döndürmeli', async () => {
      // Arrange - Önce giriş yap
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      await authRepository.login(credentials);

      // Act
      const user = await authRepository.getCurrentUser();

      // Assert
      expect(user).toBeDefined();
      expect(user?.email).toBe(credentials.email);
    });

    it('giriş yapmamış durumda null döndürmeli', async () => {
      // Arrange - Çıkış yap
      await authRepository.logout();

      // Act
      const user = await authRepository.getCurrentUser();

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('geçerli refresh token ile yeni token döndürmeli', async () => {
      // Arrange - Önce giriş yap
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResult = await authRepository.login(credentials);

      // Act
      const newTokens = await authRepository.refreshToken(loginResult.tokens.refreshToken);

      // Assert
      expect(newTokens).toBeDefined();
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.expiresAt).toBeInstanceOf(Date);
    });

    it('geçersiz refresh token ile hata fırlatmalı', async () => {
      // Arrange
      const invalidToken = 'invalid-token';

      // Act & Assert
      await expect(authRepository.refreshToken(invalidToken)).rejects.toThrow(AuthError);
      await expect(authRepository.refreshToken(invalidToken)).rejects.toThrow('Geçersiz refresh token');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('geçerli e-posta ile şifre sıfırlama e-postası gönderebilmeli', async () => {
      // Arrange
      const email = 'test@example.com';

      // Act & Assert
      await expect(authRepository.sendPasswordResetEmail(email)).resolves.not.toThrow();
    });

    it('geçersiz e-posta formatı ile hata fırlatmalı', async () => {
      // Arrange
      const email = 'invalid-email';

      // Act & Assert
      await expect(authRepository.sendPasswordResetEmail(email)).rejects.toThrow(ValidationError);
    });

    it('var olmayan e-posta ile hata fırlatmalı', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Act & Assert
      await expect(authRepository.sendPasswordResetEmail(email)).rejects.toThrow(AuthError);
    });
  });

  describe('resetPassword', () => {
    it('geçerli token ve şifre ile şifre sıfırlamalı', async () => {
      // Arrange
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123';

      // Act & Assert
      await expect(authRepository.resetPassword(token, newPassword)).resolves.not.toThrow();
    });

    it('geçersiz token ile hata fırlatmalı', async () => {
      // Arrange
      const token = 'invalid-token';
      const newPassword = 'NewPassword123';

      // Act & Assert
      await expect(authRepository.resetPassword(token, newPassword)).rejects.toThrow(AuthError);
    });

    it('zayıf şifre ile hata fırlatmalı', async () => {
      // Arrange
      const token = 'valid-reset-token';
      const newPassword = 'weak';

      // Act & Assert
      await expect(authRepository.resetPassword(token, newPassword)).rejects.toThrow(ValidationError);
    });
  });
});

