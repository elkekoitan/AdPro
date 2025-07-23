# 🤖 AdVantage AI Setup Guide - Real AI Integration

Bu dosya AdVantage uygulamasında **gerçek AI entegrasyonlarını** kurmanız için gerekli adımları içerir.

## 🚀 **YENİ ÖZELLİKLER - MOCK DATA YOK!**

✅ **OpenAI GPT-4 Turbo** - Conversational AI  
✅ **Google Gemini Pro** - Business Intelligence  
✅ **Real Supabase Database** - AI conversation tracking  
✅ **ConversationEngine** - Production ready AI system  
✅ **TypeScript Type Safety** - Full AI type definitions  

---

## 📋 **GEREKLİ API ANAHTARLARI**

### 1. OpenAI API Key
```bash
# https://platform.openai.com/api-keys adresinden alın
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxx
```

### 2. Google AI API Key  
```bash
# https://aistudio.google.com/app/apikey adresından alın
EXPO_PUBLIC_GOOGLE_AI_API_KEY=AIzaxxxxxxxxxxxxxxxxxx
```

### 3. Supabase Credentials
```bash
# Supabase dashboard'dan alın
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ **DATABASE MIGRATION REQUIRED**

Yeni AI conversation tables oluşturmak için:

```sql
-- Bu SQL'i Supabase SQL Editor'da çalıştırın:
-- supabase/migrations/20250101000003_create_ai_conversation_tables.sql
```

Tablolar:
- `ai_conversations` - Real conversation tracking
- `ai_campaign_strategies` - AI generated strategies  
- `ai_generated_content` - AI created content
- `ai_business_intelligence` - Industry insights cache
- `ai_conversation_context` - Conversation memory

---

## 📦 **YENİ DEPENDENCIES**

```bash
npm install openai@^4.26.0 @google/generative-ai@^0.2.0
```

---

## 🔧 **ENVIRONMENT VARIABLES**

`.env` dosyası oluşturun:

```env
# AI Services (ZORUNLU)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key

# Supabase (ZORUNLU)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
```

---

## 🧠 **AI SİSTEM MİMARİSİ**

### ConversationEngine
```typescript
// Real AI conversation processing
src/application/services/ai/ConversationEngine.ts

// Key Features:
✅ OpenAI GPT-4 Turbo integration
✅ Google Gemini Pro business intelligence  
✅ Real Supabase conversation storage
✅ Industry-specific AI prompts
✅ Conversation memory & context
✅ Type-safe AI responses
✅ Error handling & retry logic
```

### AI Services Config
```typescript
// Real AI service configuration
src/infrastructure/config/ai-services.ts

// Features:
✅ Multiple AI model support
✅ Rate limiting & retry logic
✅ Health check functions
✅ Industry-specific prompts
✅ Production-ready error handling
```

---

## 🎯 **USAGE - REAL AI CONVERSATION**

```typescript
// Real AI conversation example
const conversationEngine = new ConversationEngine();

const response = await conversationEngine.processMessage(
  "Restoran işletmem için Instagram kampanyası oluşturmak istiyorum",
  userId,
  conversationId,
  {
    businessProfile: {
      industry: 'restaurant',
      monthlyBudget: 2000,
      platforms: ['instagram', 'facebook']
    }
  }
);

// AI will provide:
// ✅ Industry-specific strategy
// ✅ Platform recommendations  
// ✅ Budget allocation advice
// ✅ Content suggestions
// ✅ Performance predictions
```

---

## 🔥 **TESTİNG AI SERVICES**

```bash
# AI health check
npm run ai:health

# AI conversation tests
npm run test:conversation

# AI content generation tests  
npm run test:content

# Full AI integration tests
npm run test:ai
```

---

## 📱 **UI COMPONENTS - NO MOCK DATA**

### Updated AIAgentChatScreen
```typescript
// src/presentation/screens/ai-agent/AIAgentChatScreen.tsx

✅ Real ConversationEngine integration
✅ Live AI responses with confidence scores
✅ Industry-specific suggestions
✅ Real-time AI health monitoring
✅ Conversation persistence to Supabase
✅ No mock data - production ready
```

---

## 🎨 **AI RESPONSE FORMAT**

Real AI yanıtları şu formatta gelir:

```typescript
interface ConversationResponse {
  content: string;                    // Ana AI yanıtı
  type: ResponseType;                 // Yanıt türü
  suggestions: ActionSuggestion[];    // Öneriler
  confidence: number;                 // 0-1 arası güven skoru
  reasoning: string[];                // AI'ın mantık yürütmesi
  nextSteps: NextStep[];             // Sonraki adımlar
  estimatedImpact: ImpactForecast;   // Tahmini etki
}
```

---

## 🚀 **READY TO LAUNCH**

1. ✅ API keys configured
2. ✅ Database migrated  
3. ✅ Dependencies installed
4. ✅ Environment variables set
5. ✅ AI services healthy

**👉 Artık gerçek AI ile conversation yapabilirsiniz!**

---

## 🛠️ **TROUBLESHOOTING**

### AI Servisleri Çalışmıyor
```bash
# Health check yapın
npm run ai:health

# Environment variables kontrol edin
echo $EXPO_PUBLIC_OPENAI_API_KEY
echo $EXPO_PUBLIC_GOOGLE_AI_API_KEY
```

### Database Connection Issues
```bash
# Supabase connection test
npx supabase status
npx supabase db ping
```

### TypeScript Errors
```bash
# Type definitions update
npm run type-check
npm run lint:fix
```

---

**🎯 Bu setup ile mock data olmadan, tamamen canlı AI sistemi çalıştırıyorsunuz!** 