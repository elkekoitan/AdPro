/**
 * Welcome Screen
 * Initial welcome screen with login/register options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { AuthStackScreenProps } from '@/presentation/navigation/types';
import { ErrorBoundary } from '@/presentation/components/error/ErrorBoundary';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC<AuthStackScreenProps<'Welcome'>> = ({ navigation }) => {
  // Navigate to login screen
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Navigate to register screen
  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>AdVantage</Text>
            <Text style={styles.tagline}>AI Destekli Pazarlama Platformu</Text>
          </View>

          <View style={styles.heroContainer}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Pazarlamanızı Dönüştürün</Text>
              <Text style={styles.heroText}>
                Yapay zeka destekli pazarlama asistanınızla işletmenizi büyütün.
                Tek platformda tüm sosyal medya kanallarınızı yönetin.
              </Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureTitle}>AI Asistan</Text>
              <Text style={styles.featureText}>
                Yapay zeka destekli pazarlama asistanınız sizin için içerik oluşturur.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureTitle}>Analitik</Text>
              <Text style={styles.featureText}>
                Detaylı raporlar ve analizlerle kampanyalarınızı optimize edin.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <Text style={styles.featureTitle}>Çoklu Platform</Text>
              <Text style={styles.featureText}>
                Tüm sosyal medya kanallarınızı tek yerden yönetin.
              </Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegister}
            >
              <Text style={styles.primaryButtonText}>Hemen Başla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 AdVantage. Tüm hakları saklıdır.</Text>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.05,
    marginBottom: height * 0.03,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
  },
  heroContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    marginBottom: 24,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#495057',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  footerText: {
    fontSize: 12,
    color: '#adb5bd',
  },
});

export default WelcomeScreen;