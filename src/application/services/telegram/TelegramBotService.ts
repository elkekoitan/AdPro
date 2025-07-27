export interface TelegramBot {
  id: string;
  username: string;
  token: string;
  status: 'active' | 'inactive';
  dailyLimit: number;
  currentUsage: number;
  createdAt: Date;
}

export interface TelegramGroup {
  id: string;
  name: string;
  chatId: string;
  memberCount: number;
  isActive: boolean;
  lastMessageAt?: Date;
}

export interface TelegramMessage {
  id: string;
  text: string;
  chatId: string;
  messageId: number;
  sentAt: Date;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface TelegramCampaign {
  id: string;
  name: string;
  message: string;
  targetGroups: string[];
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  sentCount: number;
  failedCount: number;
  createdAt: Date;
}

export interface SendMessageRequest {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  disableWebPagePreview?: boolean;
}

export interface BotStats {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  activeGroups: number;
  dailyUsage: number;
  dailyLimit: number;
}

class TelegramBotService {
  private baseURL = 'https://api.telegram.org/bot';
  private bots: TelegramBot[] = [];
  private groups: TelegramGroup[] = [];
  private campaigns: TelegramCampaign[] = [];
  private messages: TelegramMessage[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock bots
    this.bots = [
      {
        id: 'bot_1',
        username: 'adpro_marketing_bot',
        token: 'DEMO_TOKEN_123456789',
        status: 'active',
        dailyLimit: 1000,
        currentUsage: 245,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'bot_2',
        username: 'adpro_support_bot',
        token: 'DEMO_TOKEN_987654321',
        status: 'inactive',
        dailyLimit: 500,
        currentUsage: 0,
        createdAt: new Date('2024-02-01')
      }
    ];

    // Mock groups
    this.groups = [
      {
        id: 'group_1',
        name: 'Marketing Professionals',
        chatId: '-1001234567890',
        memberCount: 1250,
        isActive: true,
        lastMessageAt: new Date('2024-07-26')
      },
      {
        id: 'group_2',
        name: 'Tech Entrepreneurs',
        chatId: '-1001234567891',
        memberCount: 890,
        isActive: true,
        lastMessageAt: new Date('2024-07-25')
      },
      {
        id: 'group_3',
        name: 'Digital Marketing Hub',
        chatId: '-1001234567892',
        memberCount: 2100,
        isActive: false,
        lastMessageAt: new Date('2024-07-20')
      }
    ];

    // Mock campaigns
    this.campaigns = [
      {
        id: 'campaign_1',
        name: 'Product Launch Announcement',
        message: '🚀 Exciting news! Our new AI-powered marketing platform is now live!\n\n✨ Features:\n• AI Content Generation\n• Audience Discovery\n• Campaign Automation\n\nTry it free: https://adpro.com',
        targetGroups: ['group_1', 'group_2'],
        status: 'completed',
        sentCount: 2140,
        failedCount: 15,
        createdAt: new Date('2024-07-25')
      },
      {
        id: 'campaign_2',
        name: 'Weekly Newsletter',
        message: '📊 This week in marketing:\n\n• AI tools are changing the game\n• New social media trends\n• Best practices for 2024\n\nRead more: https://adpro.com/blog',
        targetGroups: ['group_1'],
        status: 'scheduled',
        sentCount: 0,
        failedCount: 0,
        scheduledAt: new Date('2024-07-28T10:00:00'),
        createdAt: new Date('2024-07-26')
      }
    ];
  }

  async getBots(): Promise<TelegramBot[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.bots];
  }

  async addBot(username: string, token: string): Promise<TelegramBot> {
    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation - in real app, this would call Telegram API
    if (!token.includes('DEMO_TOKEN')) {
      throw new Error('Invalid bot token. Please check your token and try again.');
    }

    const newBot: TelegramBot = {
      id: `bot_${Date.now()}`,
      username,
      token,
      status: 'active',
      dailyLimit: 1000,
      currentUsage: 0,
      createdAt: new Date()
    };

    this.bots.push(newBot);
    return newBot;
  }

  async getGroups(): Promise<TelegramGroup[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.groups];
  }

  async addGroup(name: string, chatId: string): Promise<TelegramGroup> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock validation
    if (!chatId.startsWith('-100')) {
      throw new Error('Invalid chat ID. Group chat IDs should start with -100');
    }

    const newGroup: TelegramGroup = {
      id: `group_${Date.now()}`,
      name,
      chatId,
      memberCount: Math.floor(Math.random() * 1000) + 100,
      isActive: true,
      lastMessageAt: new Date()
    };

    this.groups.push(newGroup);
    return newGroup;
  }

  async getCampaigns(): Promise<TelegramCampaign[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.campaigns];
  }

  async createCampaign(
    name: string,
    message: string,
    targetGroups: string[],
    scheduledAt?: Date
  ): Promise<TelegramCampaign> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const newCampaign: TelegramCampaign = {
      id: `campaign_${Date.now()}`,
      name,
      message,
      targetGroups,
      scheduledAt,
      status: scheduledAt ? 'scheduled' : 'draft',
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date()
    };

    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async sendMessage(request: SendMessageRequest): Promise<TelegramMessage> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock sending - simulate 95% success rate
    const isSuccess = Math.random() > 0.05;
    
    const message: TelegramMessage = {
      id: `msg_${Date.now()}`,
      text: request.text,
      chatId: request.chatId,
      messageId: Math.floor(Math.random() * 1000000),
      sentAt: new Date(),
      status: isSuccess ? 'sent' : 'failed',
      errorMessage: isSuccess ? undefined : 'Network timeout - message not delivered'
    };

    this.messages.push(message);
    
    // Update bot usage
    const activeBot = this.bots.find(bot => bot.status === 'active');
    if (activeBot) {
      activeBot.currentUsage += 1;
    }

    return message;
  }

  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'sending';
    
    // Simulate sending to all target groups
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const targetGroups = this.groups.filter(g => 
      campaign.targetGroups.includes(g.id) && g.isActive
    );

    let sentCount = 0;
    let failedCount = 0;

    for (const group of targetGroups) {
      try {
        await this.sendMessage({
          chatId: group.chatId,
          text: campaign.message
        });
        sentCount += group.memberCount;
      } catch (error) {
        failedCount += group.memberCount;
      }
    }

    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.status = failedCount === 0 ? 'completed' : 'failed';
  }

  async getBotStats(botId?: string): Promise<BotStats> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const activeBot = botId 
      ? this.bots.find(b => b.id === botId)
      : this.bots.find(b => b.status === 'active');

    const totalMessages = this.messages.length;
    const successfulMessages = this.messages.filter(m => m.status === 'sent').length;
    const failedMessages = this.messages.filter(m => m.status === 'failed').length;
    const activeGroups = this.groups.filter(g => g.isActive).length;

    return {
      totalMessages,
      successfulMessages,
      failedMessages,
      activeGroups,
      dailyUsage: activeBot?.currentUsage || 0,
      dailyLimit: activeBot?.dailyLimit || 1000
    };
  }

  async getRecentMessages(limit: number = 10): Promise<TelegramMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.messages
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.campaigns.findIndex(c => c.id === campaignId);
    if (index === -1) {
      throw new Error('Campaign not found');
    }

    this.campaigns.splice(index, 1);
  }

  async toggleGroupStatus(groupId: string): Promise<TelegramGroup> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    group.isActive = !group.isActive;
    return group;
  }
}

export const telegramBotService = new TelegramBotService();
