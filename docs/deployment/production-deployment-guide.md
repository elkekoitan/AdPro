# Production Deployment Guide

## Overview

This guide provides instructions for deploying the AdVantage application to production environments. It covers build optimization, deployment processes, and monitoring.

## Prerequisites

Before deploying to production, ensure you have the following:

- Expo EAS CLI installed: `npm install -g eas-cli`
- Expo account with access to the project
- Apple Developer account (for iOS deployment)
- Google Play Developer account (for Android deployment)
- AWS account (for backend services)
- Firebase account (for analytics and crash reporting)

## Environment Setup

### Environment Variables

Create a production environment file:

```bash
cp .env.example .env.production
```

Edit `.env.production` with the following values:

```
# API Configuration
API_URL=https://api.advantage-app.com
API_VERSION=v1

# Authentication
AUTH_DOMAIN=auth.advantage-app.com
AUTH_CLIENT_ID=your-auth-client-id
AUTH_AUDIENCE=your-auth-audience

# Analytics
ANALYTICS_KEY=your-analytics-key

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_MULTI_PLATFORM=true
ENABLE_ADVANCED_ANALYTICS=true

# Performance
ENABLE_PERFORMANCE_MONITORING=true
CACHE_TTL=86400
```

### App Configuration

Update `app.json` with production settings:

```json
{
  "expo": {
    "name": "AdVantage",
    "slug": "advantage-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.advantage",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.advantage",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "jsEngine": "hermes"
  }
}
```

## Build Optimization

### Bundle Size Optimization

1. Analyze the bundle size:
   ```bash
   npm run analyze:bundle
   ```

2. Implement recommended optimizations:
   - Use dynamic imports for non-critical components
   - Implement code splitting
   - Optimize images and assets
   - Use tree shaking to remove unused code
   - Use individual lodash imports instead of the entire library

### Performance Optimization

1. Enable Hermes JavaScript engine:
   ```json
   // app.json
   {
     "expo": {
       "jsEngine": "hermes"
     }
   }
   ```

2. Enable RAM bundles:
   ```javascript
   // metro.config.js
   module.exports = {
     bundleOutput: {
       enableRAMBundles: true,
     },
   };
   ```

3. Implement code optimization:
   - Use memoization for expensive computations
   - Implement virtualized lists for long lists
   - Use image caching
   - Optimize animations

### Security Optimization

1. Enable app transport security:
   ```json
   // app.json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "NSAppTransportSecurity": {
             "NSAllowsArbitraryLoads": false
           }
         }
       }
     }
   }
   ```

2. Implement certificate pinning:
   ```javascript
   // src/shared/utils/api-client.ts
   const certificates = [
     'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
     'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
   ];
   ```

3. Enable app obfuscation:
   ```json
   // eas.json
   {
     "build": {
       "production": {
         "android": {
           "gradleCommand": ":app:bundleRelease",
           "buildType": "app-bundle",
           "proguard": true
         }
       }
     }
   }
   ```

## Build Process

### iOS Build

1. Configure the iOS build:
   ```bash
   eas build:configure
   ```

2. Build for iOS:
   ```bash
   eas build --platform ios --profile production
   ```

### Android Build

1. Configure the Android build:
   ```bash
   eas build:configure
   ```

2. Build for Android:
   ```bash
   eas build --platform android --profile production
   ```

### Web Build

1. Build for web:
   ```bash
   expo build:web
   ```

## Deployment Process

### App Store Deployment

1. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

2. Complete App Store Connect setup:
   - Add screenshots
   - Complete app metadata
   - Set up in-app purchases
   - Configure app privacy
   - Submit for review

### Google Play Deployment

1. Submit to Google Play:
   ```bash
   eas submit --platform android
   ```

2. Complete Google Play Console setup:
   - Add screenshots
   - Complete app metadata
   - Set up in-app purchases
   - Configure app privacy
   - Submit for review

### OTA Updates

1. Configure OTA updates:
   ```json
   // app.json
   {
     "expo": {
       "updates": {
         "enabled": true,
         "fallbackToCacheTimeout": 0,
         "url": "https://u.expo.dev/your-project-id"
       }
     }
   }
   ```

2. Publish an update:
   ```bash
   eas update --branch production --message "Production update"
   ```

## Monitoring and Analytics

### Error Monitoring

1. Configure error monitoring:
   ```javascript
   // src/shared/utils/logging/index.ts
   initializeLogging({
     enableCrashReporting: true,
     crashReportingEndpoint: 'https://your-error-monitoring-service.com',
     apiKey: 'your-api-key',
   });
   ```

2. Set up alerts for critical errors.

### Performance Monitoring

1. Configure performance monitoring:
   ```javascript
   // src/shared/utils/performance-monitoring.ts
   initializePerformanceMonitoring({
     enablePerformanceMonitoring: true,
   });
   ```

2. Set up alerts for performance degradation.

### Analytics

1. Configure analytics:
   ```javascript
   // src/shared/utils/logging/analytics.ts
   getAnalytics().configure({
     enabled: true,
     endpoint: 'https://your-analytics-service.com',
     apiKey: 'your-api-key',
   });
   ```

2. Set up dashboards for key metrics.

## Rollback Procedure

In case of critical issues in production, follow these steps to rollback:

1. Rollback to a previous OTA update:
   ```bash
   eas update:rollback --channel production
   ```

2. If OTA rollback is not possible, submit a previous version to the app stores:
   ```bash
   eas build --profile production --auto-submit
   ```

## Production Checklist

Before deploying to production, ensure the following:

- [ ] All tests pass
- [ ] Code coverage meets targets
- [ ] Bundle size is optimized
- [ ] Performance meets targets
- [ ] Security measures are implemented
- [ ] Error monitoring is configured
- [ ] Analytics are configured
- [ ] Documentation is updated
- [ ] Release notes are prepared
- [ ] Rollback procedure is tested

## Post-Deployment Verification

After deploying to production, verify the following:

1. Install the app from the app stores
2. Verify all critical functionality
3. Check error monitoring for any issues
4. Check performance monitoring for any degradation
5. Check analytics for user engagement

## Maintenance

### Regular Updates

Schedule regular updates to:

- Fix bugs
- Improve performance
- Add new features
- Update dependencies

### Monitoring

Regularly monitor:

- Error rates
- Performance metrics
- User engagement
- App reviews

### Security

Regularly:

- Update dependencies
- Perform security audits
- Review access controls
- Test for vulnerabilities