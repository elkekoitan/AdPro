export interface ContentGenerationRequest {
  contentType: 'social_post' | 'blog_article' | 'email_campaign' | 'ad_copy' | 'product_description';
  industry: string;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'humorous' | 'urgent';
  targetAudience: string;
  keywords: string[];
  length: 'short' | 'medium' | 'long';
  platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  additionalContext?: string;
}

export interface GeneratedContent {
  id: string;
  content: string;
  title?: string;
  hashtags?: string[];
  callToAction?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadTime: number;
    seoScore: number;
  };
  suggestions: string[];
  createdAt: Date;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  contentType: ContentGenerationRequest['contentType'];
  prompt: string;
  variables: string[];
  industry: string[];
}

class OpenAIContentService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  private getContentTemplates(): ContentTemplate[] {
    return [
      {
        id: 'social_engagement',
        name: 'Social Media Engagement Post',
        description: 'Create engaging social media posts that drive interaction',
        contentType: 'social_post',
        prompt: `Create an engaging {platform} post for {industry} targeting {targetAudience}. 
        Tone: {tone}. Include relevant hashtags and a clear call-to-action. 
        Keywords to include: {keywords}. Context: {additionalContext}`,
        variables: ['platform', 'industry', 'targetAudience', 'tone', 'keywords', 'additionalContext'],
        industry: ['all']
      },
      {
        id: 'blog_seo',
        name: 'SEO-Optimized Blog Article',
        description: 'Generate comprehensive blog articles optimized for search engines',
        contentType: 'blog_article',
        prompt: `Write a comprehensive blog article about {keywords} for {industry}. 
        Target audience: {targetAudience}. Tone: {tone}. 
        Include: compelling title, introduction, main sections with subheadings, conclusion, and meta description.
        Length: {length}. Context: {additionalContext}`,
        variables: ['keywords', 'industry', 'targetAudience', 'tone', 'length', 'additionalContext'],
        industry: ['all']
      },
      {
        id: 'email_conversion',
        name: 'High-Converting Email Campaign',
        description: 'Create email campaigns designed to maximize conversions',
        contentType: 'email_campaign',
        prompt: `Create a high-converting email campaign for {industry} targeting {targetAudience}. 
        Tone: {tone}. Include: compelling subject line, personalized greeting, value proposition, 
        clear benefits, social proof, and strong call-to-action. Keywords: {keywords}. 
        Context: {additionalContext}`,
        variables: ['industry', 'targetAudience', 'tone', 'keywords', 'additionalContext'],
        industry: ['all']
      },
      {
        id: 'ad_copy_performance',
        name: 'Performance Ad Copy',
        description: 'Generate high-performing ad copy for paid campaigns',
        contentType: 'ad_copy',
        prompt: `Create high-performing ad copy for {platform} targeting {targetAudience} in {industry}. 
        Tone: {tone}. Include: attention-grabbing headline, compelling description, 
        clear value proposition, and strong call-to-action. Keywords: {keywords}. 
        Length: {length}. Context: {additionalContext}`,
        variables: ['platform', 'targetAudience', 'industry', 'tone', 'keywords', 'length', 'additionalContext'],
        industry: ['all']
      },
      {
        id: 'product_description',
        name: 'Compelling Product Description',
        description: 'Create product descriptions that convert browsers into buyers',
        contentType: 'product_description',
        prompt: `Write a compelling product description for {industry} targeting {targetAudience}. 
        Tone: {tone}. Include: key features, benefits, unique selling points, 
        and persuasive call-to-action. Keywords: {keywords}. Length: {length}. 
        Context: {additionalContext}`,
        variables: ['industry', 'targetAudience', 'tone', 'keywords', 'length', 'additionalContext'],
        industry: ['all']
      }
    ];
  }

  private buildPrompt(template: ContentTemplate, request: ContentGenerationRequest): string {
    let prompt = template.prompt;
    
    // Replace variables in template
    prompt = prompt.replace('{platform}', request.platform || 'social media');
    prompt = prompt.replace('{industry}', request.industry);
    prompt = prompt.replace('{targetAudience}', request.targetAudience);
    prompt = prompt.replace('{tone}', request.tone);
    prompt = prompt.replace('{keywords}', request.keywords.join(', '));
    prompt = prompt.replace('{length}', request.length);
    prompt = prompt.replace('{additionalContext}', request.additionalContext || '');

    // Add length specifications
    const lengthSpecs = {
      short: 'Keep it concise (50-150 words)',
      medium: 'Medium length (150-400 words)',
      long: 'Comprehensive and detailed (400+ words)'
    };

    prompt += `\n\nLength requirement: ${lengthSpecs[request.length]}`;
    
    return prompt;
  }

  private calculateSEOScore(content: string, keywords: string[]): number {
    let score = 0;
    const contentLower = content.toLowerCase();
    
    // Keyword density check
    keywords.forEach(keyword => {
      const keywordCount = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (keywordCount / content.split(' ').length) * 100;
      if (density >= 1 && density <= 3) score += 20;
    });

    // Content length check
    const wordCount = content.split(' ').length;
    if (wordCount >= 300) score += 20;
    if (wordCount >= 500) score += 10;

    // Structure check (headings, paragraphs)
    if (content.includes('\n\n')) score += 15;
    if (content.match(/#{1,6}\s/g)) score += 15;

    // Call-to-action check
    const ctaWords = ['click', 'buy', 'subscribe', 'download', 'learn more', 'get started'];
    if (ctaWords.some(word => contentLower.includes(word))) score += 20;

    return Math.min(score, 100);
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    return content.match(hashtagRegex) || [];
  }

  private extractCallToAction(content: string): string {
    const sentences = content.split(/[.!?]+/);
    const ctaWords = ['click', 'buy', 'subscribe', 'download', 'learn more', 'get started', 'contact', 'visit'];
    
    for (const sentence of sentences.reverse()) {
      if (ctaWords.some(word => sentence.toLowerCase().includes(word))) {
        return sentence.trim();
      }
    }
    
    return '';
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      // Get appropriate template
      const templates = this.getContentTemplates();
      const template = templates.find(t => t.contentType === request.contentType) || templates[0];
      
      // Build prompt
      const prompt = this.buildPrompt(template, request);

      // For demo purposes, we'll simulate API call with realistic content
      // In production, this would call OpenAI API
      const simulatedContent = await this.simulateOpenAIResponse(prompt, request);

      const wordCount = simulatedContent.split(' ').length;
      const characterCount = simulatedContent.length;
      const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

      return {
        id: `content_${Date.now()}`,
        content: simulatedContent,
        title: this.generateTitle(request),
        hashtags: this.extractHashtags(simulatedContent),
        callToAction: this.extractCallToAction(simulatedContent),
        metadata: {
          wordCount,
          characterCount,
          estimatedReadTime,
          seoScore: this.calculateSEOScore(simulatedContent, request.keywords)
        },
        suggestions: this.generateSuggestions(request),
        createdAt: new Date()
      };
    } catch (error) {
      throw new Error(`Content generation failed: ${error}`);
    }
  }

  private async simulateOpenAIResponse(prompt: string, request: ContentGenerationRequest): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic content based on request type
    const contentGenerators = {
      social_post: () => this.generateSocialPost(request),
      blog_article: () => this.generateBlogArticle(request),
      email_campaign: () => this.generateEmailCampaign(request),
      ad_copy: () => this.generateAdCopy(request),
      product_description: () => this.generateProductDescription(request)
    };

    return contentGenerators[request.contentType]();
  }

  private generateTitle(request: ContentGenerationRequest): string {
    const titleTemplates = {
      social_post: `${request.keywords[0]} - ${request.industry} Update`,
      blog_article: `The Ultimate Guide to ${request.keywords[0]} in ${request.industry}`,
      email_campaign: `Exclusive ${request.industry} Insights for ${request.targetAudience}`,
      ad_copy: `Transform Your ${request.industry} Business Today`,
      product_description: `Premium ${request.keywords[0]} for ${request.targetAudience}`
    };

    return titleTemplates[request.contentType] || `${request.keywords[0]} Content`;
  }

  private generateSuggestions(request: ContentGenerationRequest): string[] {
    return [
      `Try adding more specific keywords related to ${request.industry}`,
      `Consider A/B testing different call-to-action phrases`,
      `Add social proof or testimonials to increase credibility`,
      `Include relevant statistics or data points`,
      `Optimize for mobile viewing and readability`
    ];
  }

  private generateSocialPost(request: ContentGenerationRequest): string {
    const posts = {
      professional: `🚀 Exciting developments in ${request.industry}! 

Our latest insights show that ${request.keywords[0]} is transforming how ${request.targetAudience} approach their business goals.

Key benefits:
✅ Increased efficiency by 40%
✅ Better ROI on marketing spend
✅ Enhanced customer engagement

Ready to take your ${request.industry} strategy to the next level?

#${request.keywords[0].replace(/\s+/g, '')} #${request.industry.replace(/\s+/g, '')} #MarketingStrategy #BusinessGrowth

👆 Click the link in our bio to learn more!`,

      casual: `Hey ${request.targetAudience}! 👋

Just discovered something amazing about ${request.keywords[0]} in the ${request.industry} space...

This could be a total game-changer for your business! 🔥

Who else is excited about these new opportunities? Drop a comment below! 👇

#${request.keywords[0].replace(/\s+/g, '')} #${request.industry.replace(/\s+/g, '')}`,

      friendly: `Hi there, ${request.targetAudience}! 😊

We've been working on something special related to ${request.keywords[0]} and we can't wait to share it with you!

The ${request.industry} landscape is evolving, and we want to make sure you're ahead of the curve.

What challenges are you facing with ${request.keywords[0]}? Let's discuss in the comments! 💬

#${request.keywords[0].replace(/\s+/g, '')} #Community #${request.industry.replace(/\s+/g, '')}`
    };

    return posts[request.tone] || posts.professional;
  }

  private generateBlogArticle(request: ContentGenerationRequest): string {
    return `# ${this.generateTitle(request)}

## Introduction

In today's rapidly evolving ${request.industry} landscape, ${request.keywords[0]} has become a critical factor for ${request.targetAudience} looking to stay competitive. This comprehensive guide will explore the latest trends, best practices, and actionable strategies you can implement immediately.

## Understanding ${request.keywords[0]} in ${request.industry}

${request.keywords[0]} represents a significant opportunity for businesses in the ${request.industry} sector. Recent studies show that companies implementing effective ${request.keywords[0]} strategies see an average improvement of 35% in their key performance metrics.

### Key Benefits:
- Enhanced operational efficiency
- Improved customer satisfaction
- Increased revenue potential
- Better market positioning

## Best Practices for ${request.targetAudience}

### 1. Strategic Planning
Before implementing any ${request.keywords[0]} initiative, it's crucial to develop a comprehensive strategy that aligns with your business objectives.

### 2. Technology Integration
Modern ${request.industry} businesses require seamless integration of ${request.keywords[0]} technologies to maximize their potential.

### 3. Performance Monitoring
Regular monitoring and optimization ensure that your ${request.keywords[0]} efforts continue to deliver results.

## Implementation Roadmap

Getting started with ${request.keywords[0]} doesn't have to be overwhelming. Follow this step-by-step approach:

1. **Assessment Phase**: Evaluate your current capabilities
2. **Planning Phase**: Develop your ${request.keywords[0]} strategy
3. **Implementation Phase**: Execute your plan systematically
4. **Optimization Phase**: Continuously improve based on results

## Conclusion

${request.keywords[0]} is no longer optional for ${request.targetAudience} in the ${request.industry} space. By following the strategies outlined in this guide, you'll be well-positioned to leverage these opportunities for sustainable growth.

Ready to get started? Contact our team of experts to develop a customized ${request.keywords[0]} strategy for your business.`;
  }

  private generateEmailCampaign(request: ContentGenerationRequest): string {
    return `Subject: Exclusive ${request.industry} Insights - Don't Miss Out!

Hi [First Name],

I hope this email finds you well. As someone in the ${request.industry} space, I wanted to share some exciting developments that could significantly impact your business.

**Here's what's happening:**

Our recent analysis of ${request.keywords[0]} trends shows that ${request.targetAudience} who adopt these strategies early are seeing remarkable results:

• 40% increase in operational efficiency
• 25% improvement in customer satisfaction
• 30% boost in revenue growth

**Why this matters to you:**

The ${request.industry} landscape is evolving rapidly, and those who act now will have a significant competitive advantage. We've helped over 500 businesses like yours implement successful ${request.keywords[0]} strategies.

**What's next?**

I'd love to show you exactly how this applies to your specific situation. We're offering a complimentary strategy session where we'll:

✓ Analyze your current ${request.keywords[0]} approach
✓ Identify immediate opportunities for improvement
✓ Provide a customized action plan

This offer is limited to the first 50 responses, so don't wait.

[BOOK YOUR FREE STRATEGY SESSION]

Best regards,
[Your Name]

P.S. Even if you're not ready to implement changes right now, this session will give you valuable insights you can use immediately.`;
  }

  private generateAdCopy(request: ContentGenerationRequest): string {
    const adCopies = {
      short: `🚀 Transform Your ${request.industry} Business

Discover how ${request.keywords[0]} can boost your results by 40%

Perfect for ${request.targetAudience} ready to scale

✅ Proven strategies
✅ Expert guidance  
✅ Guaranteed results

Start Your Transformation Today →`,

      medium: `Attention ${request.targetAudience}!

Tired of struggling with ${request.keywords[0]} in your ${request.industry} business?

Our proven system has helped 1000+ businesses achieve:
• 40% increase in efficiency
• 25% cost reduction
• 50% faster growth

What makes us different?
✓ Industry-specific expertise
✓ Personalized approach
✓ 30-day money-back guarantee

Join successful ${request.industry} leaders who've already transformed their business.

Limited time offer - 50% off your first month!

Claim Your Spot Now →`,

      long: `The ${request.industry} Game-Changer ${request.targetAudience} Have Been Waiting For

If you're a ${request.targetAudience} struggling with ${request.keywords[0]}, this could be the most important message you read today.

Here's the reality: The ${request.industry} landscape has changed dramatically. Traditional approaches to ${request.keywords[0]} are no longer enough to stay competitive.

But here's the good news...

We've developed a revolutionary system that's helping ${request.industry} businesses achieve unprecedented results:

🎯 Sarah's consulting firm increased revenue by 150% in 6 months
🎯 Mike's agency reduced operational costs by 40% while doubling output  
🎯 Jennifer's startup secured $2M in funding using our strategies

What's their secret?

Our proprietary ${request.keywords[0]} methodology that combines:
• Advanced analytics and insights
• Proven implementation frameworks
• Ongoing optimization and support
• Industry-specific customization

This isn't theory - it's a battle-tested system that works.

Ready to join the ranks of successful ${request.industry} leaders?

We're accepting 25 new clients this month. Due to the personalized nature of our service, spots fill up quickly.

Don't let this opportunity pass you by.

Secure Your Transformation Today →

[30-day money-back guarantee]`
    };

    return adCopies[request.length] || adCopies.medium;
  }

  private generateProductDescription(request: ContentGenerationRequest): string {
    return `**Premium ${request.keywords[0]} Solution for ${request.targetAudience}**

Designed specifically for the ${request.industry} sector, this cutting-edge solution addresses the unique challenges faced by ${request.targetAudience}.

**Key Features:**
• Advanced ${request.keywords[0]} capabilities
• Seamless integration with existing systems
• Real-time analytics and reporting
• 24/7 customer support
• Mobile-optimized interface

**Why Choose Our Solution?**

✅ **Proven Results**: Over 1,000 satisfied customers in the ${request.industry} space
✅ **Easy Implementation**: Get up and running in less than 24 hours
✅ **Scalable**: Grows with your business needs
✅ **Secure**: Enterprise-grade security and compliance
✅ **Support**: Dedicated success manager included

**Perfect For:**
- ${request.targetAudience} looking to streamline operations
- Businesses wanting to improve ${request.keywords[0]} efficiency
- Organizations ready to scale their ${request.industry} operations

**What's Included:**
• Full platform access
• Onboarding and training
• Custom integrations
• Priority support
• Regular updates and improvements

**Special Launch Pricing:**
~~$299/month~~ **$199/month** (Limited time)

**30-day free trial** - No credit card required

Transform your ${request.industry} operations today. Join thousands of successful ${request.targetAudience} who've already made the switch.

[Start Your Free Trial] [Schedule Demo]

*"This solution transformed our ${request.industry} business. We saw results within the first week!" - Verified Customer*`;
  }

  getTemplates(): ContentTemplate[] {
    return this.getContentTemplates();
  }

  async getContentHistory(userId: string): Promise<GeneratedContent[]> {
    // In production, this would fetch from database
    return [];
  }
}

export const openAIContentService = new OpenAIContentService();
