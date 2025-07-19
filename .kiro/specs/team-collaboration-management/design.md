# Team Collaboration & Management - Design Document

## Overview

The Team Collaboration & Management module transforms AdVantage into an enterprise-ready platform with comprehensive team management, role-based access control, real-time collaboration, and client management capabilities. This module enables agencies and marketing teams to scale their operations while maintaining security, accountability, and efficiency.

### Design Principles
- **Multi-Tenant Architecture**: Secure isolation between teams and clients
- **Role-Based Security**: Granular permissions with enterprise-grade access control
- **Real-Time Collaboration**: Seamless team coordination and communication
- **Scalable Workflows**: Flexible approval and project management processes
- **Client-Centric Design**: White-label client portals and management
- **Integration-First**: Deep integration with popular team productivity tools

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Team          │  │   Client        │  │  Workflow   │ │
│  │   Dashboard     │  │   Portal        │  │  Management │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Collaboration API Gateway                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Team          │  │   Workflow      │  │  Client     │ │
│  │   Management    │  │   Engine        │  │  Management │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   RBAC          │  │   Real-Time     │  │  Project    │ │
│  │   Engine        │  │   Collaboration │  │  Management │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Team          │  │   Workflow      │  │  Real-Time  │ │
│  │   Database      │  │   Database      │  │  Cache      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
src/
├── presentation/
│   ├── screens/
│   │   ├── team/
│   │   │   ├── TeamDashboardScreen.tsx
│   │   │   ├── TeamMembersScreen.tsx
│   │   │   ├── RoleManagementScreen.tsx
│   │   │   ├── WorkspaceSettingsScreen.tsx
│   │   │   ├── TeamAnalyticsScreen.tsx
│   │   │   ├── InvitationManagementScreen.tsx
│   │   │   └── TeamOnboardingScreen.tsx
│   │   ├── collaboration/
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── CollaborativeEditorScreen.tsx
│   │   │   ├── FileShareScreen.tsx
│   │   │   ├── MentionsScreen.tsx
│   │   │   ├── ActivityFeedScreen.tsx
│   │   │   └── NotificationCenterScreen.tsx
│   │   ├── workflow/
│   │   │   ├── ApprovalDashboardScreen.tsx
│   │   │   ├── WorkflowBuilderScreen.tsx
│   │   │   ├── TaskManagementScreen.tsx
│   │   │   ├── ProjectOverviewScreen.tsx
│   │   │   ├── DeadlineTrackingScreen.tsx
│   │   │   └── WorkflowAnalyticsScreen.tsx
│   │   ├── client/
│   │   │   ├── ClientDashboardScreen.tsx
│   │   │   ├── ClientPortalScreen.tsx
│   │   │   ├── ClientOnboardingScreen.tsx
│   │   │   ├── ClientCommunicationScreen.tsx
│   │   │   ├── ClientBillingScreen.tsx
│   │   │   └── ClientFeedbackScreen.tsx
│   │   └── admin/
│   │       ├── AdminDashboardScreen.tsx
│   │       ├── SecuritySettingsScreen.tsx
│   │       ├── AuditLogScreen.tsx
│   │       ├── ComplianceScreen.tsx
│   │       └── SystemHealthScreen.tsx
│   ├── components/
│   │   ├── team/
│   │   │   ├── TeamMemberCard.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   ├── PermissionMatrix.tsx
│   │   │   ├── InvitationForm.tsx
│   │   │   ├── TeamMetrics.tsx
│   │   │   ├── WorkspaceSelector.tsx
│   │   │   └── OnboardingChecklist.tsx
│   │   ├── collaboration/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── MentionSuggestion.tsx
│   │   │   ├── ActivityItem.tsx
│   │   │   ├── PresenceIndicator.tsx
│   │   │   └── CollaborationCursor.tsx
│   │   ├── workflow/
│   │   │   ├── ApprovalCard.tsx
│   │   │   ├── WorkflowStage.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── ProjectTimeline.tsx
│   │   │   ├── DeadlineAlert.tsx
│   │   │   ├── WorkflowBuilder.tsx
│   │   │   └── ApprovalButton.tsx
│   │   ├── client/
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientMetrics.tsx
│   │   │   ├── PortalCustomizer.tsx
│   │   │   ├── ClientCommunication.tsx
│   │   │   ├── BillingWidget.tsx
│   │   │   └── FeedbackForm.tsx
│   │   └── common/
│   │       ├── PermissionGate.tsx
│   │       ├── AuditTrail.tsx
│   │       ├── SecurityBadge.tsx
│   │       ├── ComplianceIndicator.tsx
│   │       └── RealTimeStatus.tsx
├── application/
│   ├── usecases/
│   │   ├── team/
│   │   │   ├── CreateWorkspaceUseCase.ts
│   │   │   ├── InviteTeamMemberUseCase.ts
│   │   │   ├── AssignRoleUseCase.ts
│   │   │   ├── ManagePermissionsUseCase.ts
│   │   │   ├── GetTeamAnalyticsUseCase.ts
│   │   │   └── OnboardTeamMemberUseCase.ts
│   │   ├── collaboration/
│   │   │   ├── SendMessageUseCase.ts
│   │   │   ├── ShareFileUseCase.ts
│   │   │   ├── MentionUserUseCase.ts
│   │   │   ├── TrackActivityUseCase.ts
│   │   │   ├── SyncCollaborationUseCase.ts
│   │   │   └── ManagePresenceUseCase.ts
│   │   ├── workflow/
│   │   │   ├── CreateWorkflowUseCase.ts
│   │   │   ├── SubmitForApprovalUseCase.ts
│   │   │   ├── ProcessApprovalUseCase.ts
│   │   │   ├── AssignTaskUseCase.ts
│   │   │   ├── TrackProgressUseCase.ts
│   │   │   └── AnalyzeWorkflowUseCase.ts
│   │   ├── client/
│   │   │   ├── OnboardClientUseCase.ts
│   │   │   ├── CreateClientPortalUseCase.ts
│   │   │   ├── ManageClientAccessUseCase.ts
│   │   │   ├── TrackClientCommunicationUseCase.ts
│   │   │   ├── ProcessClientBillingUseCase.ts
│   │   │   └── CollectClientFeedbackUseCase.ts
│   │   └── security/
│   │       ├── AuthorizeActionUseCase.ts
│   │       ├── AuditActivityUseCase.ts
│   │       ├── MonitorSecurityUseCase.ts
│   │       ├── GenerateComplianceReportUseCase.ts
│   │       └── HandleSecurityIncidentUseCase.ts
│   ├── services/
│   │   ├── TeamManagementService.ts
│   │   ├── CollaborationService.ts
│   │   ├── WorkflowService.ts
│   │   ├── ClientManagementService.ts
│   │   ├── RBACService.ts
│   │   ├── AuditService.ts
│   │   ├── NotificationService.ts
│   │   ├── IntegrationService.ts
│   │   └── AnalyticsService.ts
│   └── stores/
│       ├── teamStore.ts
│       ├── collaborationStore.ts
│       ├── workflowStore.ts
│       ├── clientStore.ts
│       ├── permissionStore.ts
│       ├── auditStore.ts
│       └── presenceStore.ts
├── domain/
│   ├── entities/
│   │   ├── Workspace.ts
│   │   ├── TeamMember.ts
│   │   ├── Role.ts
│   │   ├── Permission.ts
│   │   ├── Workflow.ts
│   │   ├── Task.ts
│   │   ├── Project.ts
│   │   ├── Client.ts
│   │   ├── Message.ts
│   │   ├── File.ts
│   │   ├── Activity.ts
│   │   └── AuditLog.ts
│   ├── repositories/
│   │   ├── IWorkspaceRepository.ts
│   │   ├── ITeamMemberRepository.ts
│   │   ├── IRoleRepository.ts
│   │   ├── IWorkflowRepository.ts
│   │   ├── ITaskRepository.ts
│   │   ├── IClientRepository.ts
│   │   ├── IMessageRepository.ts
│   │   ├── IFileRepository.ts
│   │   └── IAuditLogRepository.ts
│   ├── services/
│   │   ├── PermissionService.ts
│   │   ├── WorkflowEngine.ts
│   │   ├── CollaborationEngine.ts
│   │   ├── NotificationEngine.ts
│   │   ├── SecurityService.ts
│   │   └── AnalyticsEngine.ts
│   └── value-objects/
│       ├── WorkspaceId.ts
│       ├── TeamMemberId.ts
│       ├── RoleType.ts
│       ├── PermissionType.ts
│       ├── WorkflowStatus.ts
│       ├── TaskStatus.ts
│       ├── ClientStatus.ts
│       ├── MessageType.ts
│       └── ActivityType.ts
└── infrastructure/
    ├── database/
    │   ├── WorkspaceRepository.ts
    │   ├── TeamMemberRepository.ts
    │   ├── RoleRepository.ts
    │   ├── WorkflowRepository.ts
    │   ├── TaskRepository.ts
    │   ├── ClientRepository.ts
    │   ├── MessageRepository.ts
    │   ├── FileRepository.ts
    │   └── AuditLogRepository.ts
    ├── realtime/
    │   ├── WebSocketService.ts
    │   ├── PresenceService.ts
    │   ├── CollaborationSync.ts
    │   └── NotificationBroadcast.ts
    ├── external/
    │   ├── SlackIntegration.ts
    │   ├── TeamsIntegration.ts
    │   ├── EmailService.ts
    │   ├── CalendarService.ts
    │   ├── VideoConferenceService.ts
    │   └── ProjectToolIntegration.ts
    ├── security/
    │   ├── AuthenticationService.ts
    │   ├── AuthorizationService.ts
    │   ├── EncryptionService.ts
    │   ├── AuditLogger.ts
    │   └── ComplianceService.ts
    └── storage/
        ├── FileStorageService.ts
        ├── CacheService.ts
        ├── BackupService.ts
        └── ArchiveService.ts
```

## Components and Interfaces

### Team Management

```typescript
interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings: WorkspaceSettings;
  branding: WorkspaceBranding;
  members: TeamMember[];
  clients: Client[];
  projects: Project[];
  status: WorkspaceStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

interface WorkspaceSettings {
  timezone: string;
  language: string;
  currency: string;
  workingHours: WorkingHours;
  approvalWorkflows: WorkflowConfiguration[];
  securityPolicies: SecurityPolicy[];
  integrations: IntegrationConfig[];
  notifications: NotificationSettings;
  dataRetention: DataRetentionPolicy;
}

interface TeamMember {
  id: string;
  userId: string;
  workspaceId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  status: MemberStatus;
  lastActiveAt: Date;
  invitedAt: Date;
  joinedAt?: Date;
  onboardingStatus: OnboardingStatus;
  preferences: MemberPreferences;
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  permissions: Permission[];
  isCustom: boolean;
  workspaceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type RoleType = 
  | 'owner'
  | 'admin'
  | 'manager'
  | 'editor'
  | 'viewer'
  | 'client'
  | 'custom';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  conditions?: PermissionCondition[];
  scope: PermissionScope;
}

type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'publish'
  | 'invite'
  | 'manage'
  | 'export'
  | 'admin';

interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

type PermissionScope = 
  | 'workspace'
  | 'project'
  | 'campaign'
  | 'content'
  | 'client'
  | 'team'
  | 'system';

type MemberStatus = 
  | 'invited'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'removed';

interface OnboardingStatus {
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
}
```

### Workflow Management

```typescript
interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: WorkflowType;
  stages: WorkflowStage[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  settings: WorkflowSettings;
  analytics: WorkflowAnalytics;
  status: WorkflowStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type WorkflowType = 
  | 'approval'
  | 'review'
  | 'publishing'
  | 'onboarding'
  | 'project'
  | 'custom';

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  type: StageType;
  assignees: StageAssignee[];
  conditions: StageCondition[];
  actions: StageAction[];
  timeouts: StageTimeout[];
  order: number;
  isParallel: boolean;
}

type StageType = 
  | 'approval'
  | 'review'
  | 'task'
  | 'notification'
  | 'automation'
  | 'condition';

interface StageAssignee {
  type: 'user' | 'role' | 'group';
  id: string;
  isRequired: boolean;
  canDelegate: boolean;
}

interface Task {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description: string;
  assigneeId: string;
  createdBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependencies: TaskDependency[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  checklist: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'blocked'
  | 'completed'
  | 'cancelled';

interface TaskDependency {
  taskId: string;
  type: 'blocks' | 'blocked_by' | 'related';
}

interface Project {
  id: string;
  workspaceId: string;
  clientId?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  actualCost?: number;
  progress: number;
  milestones: Milestone[];
  tasks: Task[];
  team: ProjectTeamMember[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: MilestoneStatus;
  deliverables: string[];
  completedAt?: Date;
}
```

### Client Management

```typescript
interface Client {
  id: string;
  workspaceId: string;
  name: string;
  displayName: string;
  description?: string;
  industry: string;
  website?: string;
  logo?: string;
  contacts: ClientContact[];
  billing: ClientBilling;
  portal: ClientPortal;
  projects: Project[];
  contracts: ClientContract[];
  communication: ClientCommunication[];
  status: ClientStatus;
  onboardedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary: boolean;
  permissions: ClientPermission[];
  lastLoginAt?: Date;
}

interface ClientPortal {
  id: string;
  isEnabled: boolean;
  subdomain?: string;
  customDomain?: string;
  branding: PortalBranding;
  features: PortalFeature[];
  dashboards: PortalDashboard[];
  reports: PortalReport[];
  settings: PortalSettings;
}

interface PortalBranding {
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  customCSS?: string;
}

interface PortalFeature {
  name: string;
  enabled: boolean;
  permissions: string[];
  configuration: Record<string, any>;
}

interface ClientBilling {
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  invoices: Invoice[];
  contracts: Contract[];
  creditLimit?: number;
  currentBalance: number;
}

type ClientStatus = 
  | 'prospect'
  | 'active'
  | 'on_hold'
  | 'churned'
  | 'archived';
```

### Real-Time Collaboration

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  mentions: MessageMention[];
  reactions: MessageReaction[];
  threadId?: string;
  editHistory: MessageEdit[];
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type MessageType = 
  | 'text'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'link'
  | 'system'
  | 'notification';

interface Conversation {
  id: string;
  workspaceId: string;
  type: ConversationType;
  name?: string;
  description?: string;
  participants: ConversationParticipant[];
  messages: Message[];
  settings: ConversationSettings;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

type ConversationType = 
  | 'direct'
  | 'group'
  | 'channel'
  | 'project'
  | 'client'
  | 'system';

interface ConversationParticipant {
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  lastReadAt: Date;
  notificationSettings: ParticipantNotificationSettings;
  status: ParticipantStatus;
}

interface CollaborativeSession {
  id: string;
  resourceId: string;
  resourceType: string;
  participants: SessionParticipant[];
  cursors: CollaborationCursor[];
  selections: CollaborationSelection[];
  operations: CollaborationOperation[];
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date;
}

interface SessionParticipant {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
  joinedAt: Date;
  lastActiveAt: Date;
  permissions: CollaborationPermission[];
}

interface CollaborationCursor {
  userId: string;
  position: CursorPosition;
  selection?: SelectionRange;
  timestamp: Date;
}

interface CollaborationOperation {
  id: string;
  userId: string;
  type: OperationType;
  data: OperationData;
  timestamp: Date;
  applied: boolean;
}

type OperationType = 
  | 'insert'
  | 'delete'
  | 'format'
  | 'move'
  | 'replace'
  | 'comment';
```

## Data Models

### Database Schema

```sql
-- Workspaces
CREATE TABLE public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  branding JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Team Members
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar TEXT,
  status VARCHAR(20) DEFAULT 'invited',
  last_active_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  onboarding_status JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- Roles
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Member Roles (Many-to-Many)
CREATE TABLE public.team_member_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(team_member_id, role_id)
);

-- Workflows
CREATE TABLE public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]',
  triggers JSONB NOT NULL DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  analytics JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  tags JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Projects
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'planning',
  priority VARCHAR(20) DEFAULT 'medium',
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  progress INTEGER DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  team JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  website TEXT,
  logo TEXT,
  contacts JSONB DEFAULT '[]',
  billing JSONB DEFAULT '{}',
  portal JSONB DEFAULT '{}',
  contracts JSONB DEFAULT '[]',
  communication JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'prospect',
  onboarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(200),
  description TEXT,
  participants JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '[]',
  thread_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  edit_history JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Files
CREATE TABLE public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  access_permissions JSONB DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborative Sessions
CREATE TABLE public.collaborative_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]',
  cursors JSONB DEFAULT '[]',
  selections JSONB DEFAULT '[]',
  operations JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_members_workspace ON public.team_members(workspace_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_status ON public.team_members(status, workspace_id);
CREATE INDEX idx_roles_workspace ON public.roles(workspace_id, type);
CREATE INDEX idx_workflows_workspace ON public.workflows(workspace_id, status);
CREATE INDEX idx_tasks_workspace ON public.tasks(workspace_id, status);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id, status);
CREATE INDEX idx_tasks_project ON public.tasks(project_id, status);
CREATE INDEX idx_projects_workspace ON public.projects(workspace_id, status);
CREATE INDEX idx_projects_client ON public.projects(client_id, status);
CREATE INDEX idx_clients_workspace ON public.clients(workspace_id, status);
CREATE INDEX idx_conversations_workspace ON public.conversations(workspace_id, type);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_files_workspace ON public.files(workspace_id, created_at DESC);
CREATE INDEX idx_audit_logs_workspace ON public.audit_logs(workspace_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_collaborative_sessions_resource ON public.collaborative_sessions(resource_id, resource_type);

-- Row Level Security
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access workspaces they belong to" ON public.workspaces FOR SELECT USING (
  id IN (SELECT workspace_id FROM public.team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Team members can access their workspace data" ON public.team_members FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM public.team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access roles in their workspaces" ON public.roles FOR SELECT USING (
  workspace_id IN (SELECT workspace_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Additional policies for other tables following similar patterns...
```

## Error Handling

```typescript
export class TeamCollaborationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TeamCollaborationError';
  }
}

export class PermissionDeniedError extends TeamCollaborationError {
  constructor(action: string, resource: string) {
    super(`Permission denied for ${action} on ${resource}`, 'PERMISSION_DENIED');
  }
}

export class WorkflowError extends TeamCollaborationError {
  constructor(workflowId: string, message: string) {
    super(`Workflow error for ${workflowId}: ${message}`, 'WORKFLOW_ERROR');
  }
}

export class CollaborationConflictError extends TeamCollaborationError {
  constructor(resourceId: string, message: string) {
    super(`Collaboration conflict for ${resourceId}: ${message}`, 'COLLABORATION_CONFLICT');
  }
}
```

## Testing Strategy

```typescript
describe('TeamManagementService', () => {
  let service: TeamManagementService;
  let mockRepository: jest.Mocked<TeamMemberRepository>;
  let mockRBACService: jest.Mocked<RBACService>;

  beforeEach(() => {
    mockRepository = createMockTeamMemberRepository();
    mockRBACService = createMockRBACService();
    service = new TeamManagementService(mockRepository, mockRBACService);
  });

  describe('inviteTeamMember', () => {
    it('should invite team member with appropriate role', async () => {
      const workspaceId = 'workspace-123';
      const inviterUserId = 'user-123';
      const inviteData = {
        email: 'newmember@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roleIds: ['role-editor']
      };
      
      mockRBACService.hasPermission.mockResolvedValue(true);
      
      const result = await service.inviteTeamMember(workspaceId, inviterUserId, inviteData);
      
      expect(result.email).toBe(inviteData.email);
      expect(result.status).toBe('invited');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: inviteData.email,
          status: 'invited'
        })
      );
    });

    it('should throw permission error for unauthorized invite', async () => {
      const workspaceId = 'workspace-123';
      const inviterUserId = 'user-123';
      const inviteData = {
        email: 'newmember@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roleIds: ['role-admin']
      };
      
      mockRBACService.hasPermission.mockResolvedValue(false);
      
      await expect(service.inviteTeamMember(workspaceId, inviterUserId, inviteData))
        .rejects.toThrow(PermissionDeniedError);
    });
  });
});
```

This comprehensive design document provides the foundation for implementing the Team Collaboration & Management module with enterprise-grade security, scalable architecture, and comprehensive collaboration features.