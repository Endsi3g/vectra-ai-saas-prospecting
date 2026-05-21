import { supabase } from './supabase';

export interface Collection {
  id: string;
  name: string;
  description: string;
  count: number;
  created_at?: string;
}

export interface Lead {
  id: string;
  campaign_id?: string;
  name: string;
  company: string;
  website: string;
  email: string;
  notes: string;
  location?: string;
  role?: string;
  linkedin_url?: string;
  phone?: string;
  saved?: boolean;
  collections?: string[];
  created_at?: string;
}

export interface DbMessage {
  id: string;
  lead_id: string;
  email_subject: string;
  email_body: string;
  linkedin_message: string;
  personalization_score: number;
  status: 'draft' | 'approved' | 'discarded';
  created_at?: string;
}

export type FollowUpStatus = 'prospect' | 'qualifie' | 'message_envoye' | 'reponse_recue' | 'appel_planifie' | 'deal_conclu';

export interface FollowUpEntry {
  leadId: string;
  status: FollowUpStatus;
  followUpDate: string | null;
  notes: string;
  updatedAt?: string;
}


const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'seed-1',
    name: 'SaaS Founders - Canada',
    description: 'Founders and CEOs of SaaS companies in Canada under 20 employees',
    count: 3
  },
  {
    id: 'seed-2',
    name: 'AI Engineers in Montreal',
    description: 'AI/ML engineers and researchers based in Montreal',
    count: 0
  }
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead-seed-1',
    name: 'Marc-André Leclerc',
    role: 'CEO & Founder',
    company: 'LeadFlow AI',
    location: 'Montreal, QC',
    notes: 'B2B Sales Automation Platform. Équipe de 12 personnes. Récemment mentionné dans Techvibes.',
    website: 'https://leadflowai.com',
    email: 'marc@leadflowai.com',
    saved: true,
    collections: ['seed-1']
  },
  {
    id: 'lead-seed-2',
    name: 'Sarah Jenkins',
    role: 'Founder',
    company: 'TechRecruit',
    location: 'Toronto, ON',
    notes: 'Automated Hiring Workflows for Startups. Équipe de 8 personnes. Croissance mensuelle de 15%.',
    website: 'https://techrecruit.io',
    email: 'sarah@techrecruit.io',
    saved: true,
    collections: ['seed-1']
  },
  {
    id: 'lead-seed-3',
    name: 'Alexandre Dupont',
    role: 'Co-founder & CTO',
    company: 'DevPulse',
    location: 'Vancouver, BC',
    notes: 'Software engineering intelligence tool. Équipe de 15 personnes. Levée de fonds récente en Pre-Seed.',
    website: 'https://devpulse.co',
    email: 'alex@devpulse.co',
    saved: true,
    collections: ['seed-1']
  }
];

const DEFAULT_MESSAGES: DbMessage[] = [
  {
    id: 'msg-seed-1',
    lead_id: 'lead-seed-1',
    email_subject: 'Proposition de design pour LeadFlow AI',
    email_body: 'Bonjour Marc-André, j\'ai analysé votre site leadflowai.com...',
    linkedin_message: 'Salut Marc-André, top votre SaaS...',
    personalization_score: 95,
    status: 'approved'
  },
  {
    id: 'msg-seed-2',
    lead_id: 'lead-seed-2',
    email_subject: 'Proposition de design pour TechRecruit',
    email_body: 'Bonjour Sarah, j\'ai analysé votre site techrecruit.io...',
    linkedin_message: 'Salut Sarah, top votre SaaS...',
    personalization_score: 95,
    status: 'approved'
  },
  {
    id: 'msg-seed-3',
    lead_id: 'lead-seed-3',
    email_subject: 'Proposition de design pour DevPulse',
    email_body: 'Bonjour Alexandre, j\'ai analysé votre site devpulse.co...',
    linkedin_message: 'Salut Alexandre, top votre SaaS...',
    personalization_score: 95,
    status: 'approved'
  }
];

const DEFAULT_FOLLOW_UPS: FollowUpEntry[] = [
  {
    leadId: 'lead-seed-1',
    status: 'message_envoye',
    followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string, // 2 days ago
    notes: 'A relancer pour savoir s\'il a vu la proposition.'
  },
  {
    leadId: 'lead-seed-2',
    status: 'appel_planifie',
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string, // in 3 days
    notes: 'Appel de découverte de 20min.'
  },
  {
    leadId: 'lead-seed-3',
    status: 'prospect',
    followUpDate: null,
    notes: 'Profil intéressant, à contacter la semaine prochaine.'
  }
];

// Helper to determine if we are running in the browser
const isClient = typeof window !== 'undefined';

// Safe localStorage methods
const localDB = {
  getItem: (key: string, defaultValue: any) => {
    if (!isClient) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  },
  setItem: (key: string, value: any) => {
    if (!isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  }
};

/**
 * 1. COLLECTIONS
 */
export async function getCollections(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase.from('collections').select('*');
    if (error) throw error;
    
    // Now, calculate count by joining with leads locally or checking database
    const collections = (data || []) as Collection[];
    
    // Calculate counts
    const leads = await getLeads();
    return collections.map(c => ({
      ...c,
      count: leads.filter(l => l.collections?.includes(c.id)).length
    }));
  } catch (err) {
    // FALLBACK TO LOCAL STORAGE
    const localCols = localDB.getItem('vectra_collections', []);
    if (localCols.length === 0) {
      // Seed default collections
      localDB.setItem('vectra_collections', DEFAULT_COLLECTIONS);
      return DEFAULT_COLLECTIONS;
    }
    
    // Recalculate counts dynamically
    const leads = await getLeads();
    return localCols.map((c: Collection) => ({
      ...c,
      count: leads.filter(l => l.collections?.includes(c.id)).length
    }));
  }
}

export async function createCollection(name: string, description: string): Promise<Collection> {
  const newCol: Omit<Collection, 'count'> = {
    id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    created_at: new Date().toISOString()
  };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name,
        description,
        user_id: user?.id
      })
      .select('*')
      .single();
    if (error) throw error;
    return { ...data, count: 0 };
  } catch (err) {
    // FALLBACK
    const cols = await getCollections();
    const created: Collection = { ...newCol, count: 0 };
    localDB.setItem('vectra_collections', [...cols, created]);
    return created;
  }
}

/**
 * 2. LEADS
 */
export async function getLeads(collectionId?: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) throw error;

    let leads = (data || []) as Lead[];
    
    // Fetch lead_collections mappings from database if table exists (silently fallback if not)
    let leadCollectionsMap: Record<string, string[]> = {};
    try {
      const { data: mappings } = await supabase.from('lead_collections').select('*');
      if (mappings) {
        mappings.forEach((m: any) => {
          const leadId = m.lead_id;
          const colId = m.collection_id;
          if (leadId && colId) {
            if (!leadCollectionsMap[leadId]) {
              leadCollectionsMap[leadId] = [];
            }
            const list = leadCollectionsMap[leadId];
            if (list) {
              list.push(colId);
            }
          }
        });
      }
    } catch {
      // Table doesn't exist, retrieve local mappings if any
      leadCollectionsMap = localDB.getItem('vectra_lead_collections_map', {});
    }

    leads = leads.map(l => ({
      ...l,
      collections: leadCollectionsMap[l.id] || []
    }));

    if (collectionId) {
      return leads.filter(l => l.collections?.includes(collectionId));
    }
    return leads;
  } catch (err) {
    // FALLBACK
    const localLeads = localDB.getItem('vectra_leads', []);
    if (localLeads.length === 0) {
      localDB.setItem('vectra_leads', DEFAULT_LEADS);
      return collectionId 
        ? DEFAULT_LEADS.filter(l => l.collections?.includes(collectionId))
        : DEFAULT_LEADS;
    }
    if (collectionId) {
      return localLeads.filter((l: Lead) => l.collections?.includes(collectionId));
    }
    return localLeads;
  }
}

export async function saveLead(lead: Omit<Lead, 'id'> & { id?: string }): Promise<Lead> {
  const leadId = lead.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullLead: Lead = {
    id: leadId,
    name: lead.name,
    company: lead.company,
    website: lead.website,
    email: lead.email,
    notes: lead.notes,
    location: lead.location || 'N/A',
    role: lead.role || 'Prospect',
    saved: true,
    collections: lead.collections || [],
    created_at: new Date().toISOString()
  };

  try {
    // Resolve campaign
    const { data: { user } } = await supabase.auth.getUser();
    let campaignId = lead.campaign_id;
    if (!campaignId && user) {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (campaigns && campaigns.length > 0 && campaigns[0]) {
        campaignId = campaigns[0].id;
      } else {
        const { data: newCampaign } = await supabase
          .from('campaigns')
          .insert({
            user_id: user.id,
            name: 'Sourcing Campaign',
            business_type: 'SaaS',
            offer: 'Audit & Analysis'
          })
          .select('id')
          .single();
        if (newCampaign) campaignId = newCampaign.id;
      }
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        id: lead.id ? lead.id : undefined,
        campaign_id: campaignId,
        name: lead.name,
        company: lead.company,
        website: lead.website,
        email: lead.email,
        notes: lead.notes,
        location: lead.location,
        role: lead.role,
        linkedin_url: lead.linkedin_url,
        phone: lead.phone,
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Also save mappings to lead_collections if collections are provided
    if (lead.collections && lead.collections.length > 0) {
      for (const colId of lead.collections) {
        await supabase.from('lead_collections').insert({
          lead_id: data.id,
          collection_id: colId
        });
      }
    }

    return { ...data, collections: lead.collections || [] };
  } catch (err) {
    // FALLBACK
    const leads = await getLeads();
    const existingIndex = leads.findIndex(l => l.id === leadId);
    if (existingIndex >= 0) {
      leads[existingIndex] = fullLead;
    } else {
      leads.push(fullLead);
    }
    localDB.setItem('vectra_leads', leads);
    return fullLead;
  }
}

/**
 * 3. ASSIGN LEAD TO COLLECTIONS
 */
export async function assignLeadToCollections(leadId: string, collectionIds: string[]): Promise<void> {
  try {
    // Try to delete old mappings
    await supabase.from('lead_collections').delete().eq('lead_id', leadId);
    // Add new ones
    if (collectionIds.length > 0) {
      const inserts = collectionIds.map(colId => ({
        lead_id: leadId,
        collection_id: colId
      }));
      const { error } = await supabase.from('lead_collections').insert(inserts);
      if (error) throw error;
    }
  } catch (err) {
    // FALLBACK
    // 1. Update lead object directly
    const leads = await getLeads();
    const leadIndex = leads.findIndex(l => l.id === leadId);
    if (leadIndex >= 0 && leads[leadIndex]) {
      leads[leadIndex].collections = collectionIds;
      localDB.setItem('vectra_leads', leads);
    }

    // 2. Also keep a global map for cross-compatibility
    const map = localDB.getItem('vectra_lead_collections_map', {});
    map[leadId] = collectionIds;
    localDB.setItem('vectra_lead_collections_map', map);
  }
}

/**
 * 4. MESSAGES (Outreach Email / LinkedIn Templates)
 */
export async function getMessages(leadId: string): Promise<DbMessage | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .limit(1);
    if (error) throw error;
    return (data?.[0] || null) as DbMessage | null;
  } catch (err) {
    // FALLBACK
    const localMsgs = localDB.getItem('vectra_messages', DEFAULT_MESSAGES);
    return localMsgs.find((m: DbMessage) => m.lead_id === leadId) || null;
  }
}

export async function saveMessage(message: Omit<DbMessage, 'id'> & { id?: string }): Promise<DbMessage> {
  const msgId = message.id || `msg-${Date.now()}`;
  const fullMsg: DbMessage = {
    id: msgId,
    lead_id: message.lead_id,
    email_subject: message.email_subject,
    email_body: message.email_body,
    linkedin_message: message.linkedin_message,
    personalization_score: message.personalization_score || 95,
    status: message.status || 'draft',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('messages')
      .upsert({
        id: message.id ? message.id : undefined,
        lead_id: message.lead_id,
        email_subject: message.email_subject,
        email_body: message.email_body,
        linkedin_message: message.linkedin_message,
        personalization_score: message.personalization_score,
        status: message.status
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as DbMessage;
  } catch (err) {
    // FALLBACK
    const msgs = localDB.getItem('vectra_messages', DEFAULT_MESSAGES);
    const existingIndex = msgs.findIndex((m: DbMessage) => m.lead_id === message.lead_id);
    if (existingIndex >= 0) {
      msgs[existingIndex] = fullMsg;
    } else {
      msgs.push(fullMsg);
    }
    localDB.setItem('vectra_messages', msgs);
    return fullMsg;
  }
}

/**
 * 5. CREDITS AND COINS
 */
export async function getCredits(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_count')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      if (data && data.credits_count !== undefined && data.credits_count !== null) {
        return data.credits_count;
      }
    }
    return localDB.getItem('vectra_credits', 2000);
  } catch (err) {
    return localDB.getItem('vectra_credits', 2000);
  }
}

export async function deductCredits(amount: number): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_count')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        const newCount = Math.max(0, (profile.credits_count || 2000) - amount);
        const { error } = await supabase
          .from('profiles')
          .update({ credits_count: newCount })
          .eq('id', user.id);
        if (!error) return newCount;
      }
    }
    
    // FALLBACK
    const current = localDB.getItem('vectra_credits', 2000);
    const newVal = Math.max(0, current - amount);
    localDB.setItem('vectra_credits', newVal);
    return newVal;
  } catch (err) {
    const current = localDB.getItem('vectra_credits', 2000);
    const newVal = Math.max(0, current - amount);
    localDB.setItem('vectra_credits', newVal);
    return newVal;
  }
}

/**
 * 6. FOLLOW-UPS
 */
export async function getFollowUps(): Promise<FollowUpEntry[]> {
  try {
    const { data, error } = await supabase.from('follow_ups').select('*');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      leadId: row.lead_id,
      status: row.status as FollowUpStatus,
      followUpDate: row.follow_up_date,
      notes: row.notes,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    return localDB.getItem('vectra_followups', DEFAULT_FOLLOW_UPS);
  }
}

export async function saveFollowUp(entry: FollowUpEntry): Promise<FollowUpEntry> {
  const fullEntry = {
    ...entry,
    updatedAt: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('follow_ups')
      .upsert({
        lead_id: entry.leadId,
        status: entry.status,
        follow_up_date: entry.followUpDate,
        notes: entry.notes,
        updated_at: fullEntry.updatedAt
      }, { onConflict: 'lead_id' });
    
    if (error) throw error;
    return fullEntry;
  } catch (err) {
    const followUps = localDB.getItem('vectra_followups', DEFAULT_FOLLOW_UPS);
    const existingIndex = followUps.findIndex((f: FollowUpEntry) => f.leadId === entry.leadId);
    if (existingIndex >= 0) {
      followUps[existingIndex] = fullEntry;
    } else {
      followUps.push(fullEntry);
    }
    localDB.setItem('vectra_followups', followUps);
    return fullEntry;
  }
}

// --- PHASE 3 ACTIVITY LOGS & COMMENTS ---

export interface ActivityLog {
  id: string;
  user_id?: string;
  actor_type: 'user' | 'agent';
  actor_name: string;
  activity_type: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export interface LeadComment {
  id: string;
  lead_id: string;
  user_id?: string;
  user_name: string;
  content: string;
  created_at: string;
}

const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    actor_type: 'agent',
    actor_name: 'Hermes Sourcing Agent',
    activity_type: 'lead_qualified',
    description: 'Lead qualifié : Marc-André Leclerc (LeadFlow AI) - score 95%',
    created_at: new Date(Date.now() - 3600 * 1000).toISOString() // 1 hour ago
  },
  {
    id: 'act-2',
    actor_type: 'agent',
    actor_name: 'Hermes Sourcing Agent',
    activity_type: 'email_drafted',
    description: 'Brouillon d\'e-mail généré pour Sarah Jenkins (TechRecruit)',
    created_at: new Date(Date.now() - 7200 * 1000).toISOString() // 2 hours ago
  }
];

const DEFAULT_LEAD_COMMENTS: Record<string, LeadComment[]> = {
  'lead-seed-1': [
    {
      id: 'com-1',
      lead_id: 'lead-seed-1',
      user_name: 'Kael',
      content: 'Ce lead a l\'air excellent. Marc-André est très actif sur LinkedIn.',
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    }
  ]
};

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []) as ActivityLog[];
  } catch (err) {
    const logs = localDB.getItem('vectra_activity_logs', DEFAULT_ACTIVITY_LOGS);
    return logs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function createActivityLog(
  actor_type: 'user' | 'agent',
  actor_name: string,
  activity_type: string,
  description: string,
  metadata: any = {}
): Promise<ActivityLog> {
  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    actor_type,
    actor_name,
    activity_type,
    description,
    metadata,
    created_at: new Date().toISOString()
  };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user?.id,
        actor_type,
        actor_name,
        activity_type,
        description,
        metadata
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as ActivityLog;
  } catch (err) {
    const logs = await getActivityLogs();
    const updated = [newLog, ...logs];
    localDB.setItem('vectra_activity_logs', updated);
    return newLog;
  }
}

export async function getLeadComments(leadId: string): Promise<LeadComment[]> {
  try {
    const { data, error } = await supabase
      .from('lead_comments')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as LeadComment[];
  } catch (err) {
    const allComments = localDB.getItem('vectra_lead_comments', DEFAULT_LEAD_COMMENTS);
    return allComments[leadId] || [];
  }
}

export async function createLeadComment(leadId: string, content: string): Promise<LeadComment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Resolve user_name from profile
    let userName = 'User';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      if (profile) {
        userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
      }
    }

    const newCommentPayload = {
      lead_id: leadId,
      user_id: user?.id,
      user_name: userName,
      content
    };

    const { data, error } = await supabase
      .from('lead_comments')
      .insert(newCommentPayload)
      .select('*')
      .single();
    if (error) throw error;
    return data as LeadComment;
  } catch (err) {
    // FALLBACK
    const allComments = localDB.getItem('vectra_lead_comments', DEFAULT_LEAD_COMMENTS);
    if (!allComments[leadId]) {
      allComments[leadId] = [];
    }
    const newComment: LeadComment = {
      id: `com-${Date.now()}`,
      lead_id: leadId,
      user_name: 'User',
      content,
      created_at: new Date().toISOString()
    };
    allComments[leadId].push(newComment);
    localDB.setItem('vectra_lead_comments', allComments);
    return newComment;
  }
}

