// ── Enums ────────────────────────────────────────────────────────────────────

export type FollowUpStatus =
  | 'prospect'
  | 'qualifie'
  | 'message_envoye'
  | 'reponse_recue'
  | 'appel_planifie'
  | 'deal_conclu'

export type MessageStatus = 'draft' | 'approved' | 'discarded'

export type MessageLanguage = 'fr' | 'en'

export type UserTone = 'friendly' | 'professional' | 'formal'

export type NotificationType =
  | 'inbox_reply'
  | 'agent_cycle'
  | 'brevo_sent'
  | 'lead_added'

export type ConversationSentiment = 'interested' | 'objection' | 'unsubscribe'

export type SenderType = 'user' | 'prospect'

export type ActorType = 'user' | 'agent'

export type Plan = 'alpha_free' | 'starter' | 'pro' | 'enterprise'

// ── Domain Types ─────────────────────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  workspace_id: string | null
  business_type: string | null
  preferred_languages: string[]
  tone: UserTone | null
  onboarding_completed: boolean
  tour_completed: boolean
  google_connected: boolean
  credits_count: number
  credits_limit: number
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  agent_config: Record<string, unknown>
  expo_push_token: string | null
  created_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  business_type: string | null
  offer: string | null
  icp: string | null
  angle: string | null
  angle_description: string | null
  call_to_action: string | null
  extra_instructions: string | null
  created_at: string
}

export interface Lead {
  id: string
  campaign_id: string
  name: string | null
  company: string | null
  website: string | null
  email: string | null
  notes: string | null
  role: string | null
  location: string | null
  linkedin_url: string | null
  phone: string | null
  personalization_score: number | null
  created_at: string
}

export interface Message {
  id: string
  lead_id: string
  language: MessageLanguage | null
  summary: string | null
  email_subject: string | null
  email_body: string | null
  linkedin_message: string | null
  personalization_score: number
  status: MessageStatus
  created_at: string
}

export interface FollowUp {
  id: string
  lead_id: string
  status: FollowUpStatus
  follow_up_date: string | null
  notes: string | null
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

export interface LeadCollection {
  id: string
  lead_id: string
  collection_id: string
  created_at: string
}

export interface Mailbox {
  id: string
  user_id: string
  email: string
  provider: string
  nylas_grant_id: string
  created_at: string
}

export interface InboxConversation {
  id: string
  lead_id: string
  mailbox_id: string
  nylas_thread_id: string
  sentiment: ConversationSentiment
  last_message_at: string | null
  created_at: string
}

export interface InboxMessage {
  id: string
  conversation_id: string
  nylas_message_id: string
  sender_type: SenderType
  body: string
  sent_at: string
  created_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  key_hash: string
  key_prefix: string
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  is_read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  actor_type: ActorType
  actor_name: string
  activity_type: string
  description: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface LeadComment {
  id: string
  lead_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

// ── Compound/View Types ───────────────────────────────────────────────────────

export interface LeadWithFollow extends Lead {
  follow_up?: FollowUp | null
  messages?: Message[]
  campaign?: Campaign | null
}

export interface ConversationWithMessages extends InboxConversation {
  messages: InboxMessage[]
  lead?: Lead | null
}

export interface CampaignWithStats extends Campaign {
  leads_count: number
  messages_count: number
  approved_count: number
}

// ── API Payloads ──────────────────────────────────────────────────────────────

export interface SourcingRequest {
  query: string
  campaign_id?: string
  max_results?: number
}

export interface GenerateMessageRequest {
  lead_id: string
  campaign_id: string
  language?: MessageLanguage
}

export interface ExpoNotificationPayload {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
}
