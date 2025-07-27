export default {
  expo: {
    name: "AdPro",
    slug: "adpro",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true
          },
          ios: {
            flipper: false
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      
      // Supabase Configuration
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      
      // AI Configuration
      openaiApiKey: process.env.OPENAI_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      defaultAiModel: process.env.DEFAULT_AI_MODEL || "gpt-4",
      
      // Telegram Configuration
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramWebAppUrl: process.env.TELEGRAM_WEB_APP_URL,
      
      // Stripe Configuration (Environment variables only)
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      
      // App Configuration
      appEnvironment: process.env.NODE_ENV || "development",
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
      
      // Feature Flags
      enableAnalytics: process.env.ENABLE_ANALYTICS === "true",
      enablePushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === "true",
      enableBiometrics: process.env.ENABLE_BIOMETRICS === "true",
      
      // Enterprise Configuration
      enterpriseUserEmail: process.env.ENTERPRISE_USER_EMAIL,
      maxCampaignsPerUser: parseInt(process.env.MAX_CAMPAIGNS_PER_USER || "10"),
      maxGroupsPerCampaign: parseInt(process.env.MAX_GROUPS_PER_CAMPAIGN || "50"),
      
      // Rate Limiting
      apiRateLimit: parseInt(process.env.API_RATE_LIMIT || "100"),
      telegramRateLimit: parseInt(process.env.TELEGRAM_RATE_LIMIT || "30"),
      
      // Cache Configuration
      cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || "300000"), // 5 minutes
      offlineCacheSize: parseInt(process.env.OFFLINE_CACHE_SIZE || "50"),
      
      // Security Configuration
      jwtSecret: process.env.JWT_SECRET,
      encryptionKey: process.env.ENCRYPTION_KEY,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || "3600000"), // 1 hour
      
      // Monitoring
      sentryDsn: process.env.SENTRY_DSN,
      logLevel: process.env.LOG_LEVEL || "info",
      
      // Business Configuration
      defaultCommissionRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE || "0.15"),
      supportedBusinessTypes: [
        "forex_ib",
        "ecommerce", 
        "real_estate",
        "restaurants",
        "music",
        "crypto",
        "education",
        "technology"
      ]
    }
  }
};
