'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { 
  Sparkles, 
  Send, 
  History, 
  Settings, 
  User, 
  Check, 
  ArrowRight, 
  Compass, 
  BrainCircuit, 
  ExternalLink,
  ChevronDown,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Candidate {
  name: string;
  role: string;
  company: string;
  location: string;
  summary: string;
  website: string;
  saved: boolean;
  email?: string;
}

export default function SourcingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'Des saas founders au Canada avec des équipes de moins de 20 personnes.'
    },
    {
      sender: 'copilot',
      thinkingTime: '0.6s',
      thought: 'Searching LinkedIn database & Crunchbase for: Role: Founder/CEO/Co-founder, Industry: SaaS/Software, Location: Canada, Headcount: <20. Found 142 profiles.',
      text: 'J’ai identifié plusieurs profils de fondateurs de SaaS au Canada correspondant à vos critères. Voici les cibles les plus pertinentes prêtes pour l’outreach :',
      candidates: [
        {
          name: 'Marc-André Leclerc',
          role: 'CEO & Founder',
          company: 'LeadFlow AI',
          location: 'Montreal, QC',
          summary: 'B2B Sales Automation Platform. Équipe de 12 personnes. Récemment mentionné dans Techvibes.',
          website: 'leadflowai.com',
          saved: false,
          email: 'marc@leadflowai.com'
        },
        {
          name: 'Sarah Jenkins',
          role: 'Founder',
          company: 'TechRecruit',
          location: 'Toronto, ON',
          summary: 'Automated Hiring Workflows for Startups. Équipe de 8 personnes. Croissance mensuelle de 15%.',
          website: 'techrecruit.io',
          saved: true,
          email: 'sarah@techrecruit.io'
        },
        {
          name: 'Alexandre Dupont',
          role: 'Co-founder & CTO',
          company: 'DevPulse',
          location: 'Vancouver, BC',
          summary: 'Software engineering intelligence tool. Équipe de 15 personnes. Levée de fonds récente en Pre-Seed.',
          website: 'devpulse.co',
          saved: false,
          email: 'alex@devpulse.co'
        }
      ] as Candidate[]
    }
  ]);

  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    const queryText = query;
    setQuery('');
    setIsSearching(true);

    const userMsg = { sender: 'user', text: queryText };
    const copilotPlaceholder = {
      sender: 'copilot',
      thinkingTime: '0.0s',
      thought: 'Initializing Hermes-Agent reasoning loop...',
      text: 'Searching database and crawling directories...',
      candidates: [] as Candidate[]
    };

    setMessages(prev => [...prev, userMsg, copilotPlaceholder]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/sourcing/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ query: queryText })
      });

      if (!response.body) {
        setIsSearching(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let text = '';
      let thought = '';
      let candidatesList: Candidate[] = [];
      let thinkingTime = 0.0;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value);
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.type === 'thought') {
                  thought = (thought ? thought + '\n' : '') + data.message;
                  thinkingTime += data.duration || 0.2;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.sender === 'copilot') {
                      last.thought = thought;
                      last.thinkingTime = thinkingTime.toFixed(1) + 's';
                    }
                    return newMsgs;
                  });
                } else if (data.type === 'action') {
                  thought += `\nAction: ${data.message}`;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.sender === 'copilot') {
                      last.thought = thought;
                    }
                    return newMsgs;
                  });
                } else if (data.type === 'observation') {
                  thought += `\nObservation: ${data.message}`;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.sender === 'copilot') {
                      last.thought = thought;
                    }
                    return newMsgs;
                  });
                } else if (data.type === 'leads') {
                  text = data.message;
                  candidatesList = data.leads.map((l: any) => ({
                    name: l.name,
                    role: l.title,
                    company: l.company,
                    location: l.location,
                    summary: l.notes || '',
                    website: l.website.replace(/^https?:\/\//, ''),
                    saved: false,
                    email: l.email
                  }));
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.sender === 'copilot') {
                      last.text = text;
                      last.candidates = candidatesList;
                    }
                    return newMsgs;
                  });
                }
              } catch (e) {
                // Ignore partial JSON parsing issues
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse agent stream:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveCandidate = async (msgIdx: number, cIdx: number) => {
    setSavingIndex(cIdx);
    try {
      const msg = messages[msgIdx];
      if (!msg || !msg.candidates) return;
      const candidate = msg.candidates[cIdx];
      if (!candidate) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Veuillez vous connecter pour enregistrer ce prospect.');
        setSavingIndex(null);
        return;
      }

      // Resolve campaign id
      let campaignId = '';
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
        if (newCampaign) {
          campaignId = newCampaign.id;
        }
      }

      if (!campaignId) {
        throw new Error('Could not resolve campaign.');
      }

      // Save lead
      const { data: savedLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          campaign_id: campaignId,
          name: candidate.name,
          company: candidate.company,
          website: `https://${candidate.website}`,
          email: candidate.email || `contact@${candidate.website}`,
          notes: candidate.summary
        })
        .select('id')
        .single();

      if (leadError) throw leadError;

      // Deduct 5 credits from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_count')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        const newCount = Math.max(0, (profile.credits_count || 2000) - 5);
        await supabase
          .from('profiles')
          .update({ credits_count: newCount })
          .eq('id', user.id);
      }

      // Update UI state
      setMessages(prev => prev.map((m, mIdx2) => {
        if (mIdx2 === msgIdx && m.candidates) {
          const newCandidates = [...m.candidates];
          if (newCandidates[cIdx]) {
            newCandidates[cIdx] = { ...newCandidates[cIdx], saved: true };
          }
          return { ...m, candidates: newCandidates };
        }
        return m;
      }));

    } catch (err) {
      console.error('Error saving lead:', err);
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Sourcing</span>
          <span className="text-zinc-300 font-normal">/</span>
          <span className="font-semibold text-zinc-900 truncate max-w-[240px]">
            SaaS Founders - Canada
          </span>
          <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            Active
          </Badge>
        </div>

        {/* Center Process Indicators */}
        <div className="hidden lg:flex items-center gap-2 select-none text-xs font-semibold text-zinc-400">
          <span className="text-zinc-900 border-b-2 border-primary pb-0.5">Job Description</span>
          <span className="text-zinc-300">───</span>
          <span>Refine Search</span>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50">
            <Settings className="h-3.5 w-3.5 text-zinc-500" />
            Preferences
          </Button>
        </div>

      </header>

      {/* Main chat window split view (History list on left / Chat feed on right) */}
      <div className="flex-1 flex overflow-hidden bg-[#FAFAFA]">
        
        {/* History / Past queries left column */}
        <div className="hidden md:flex w-64 border-r border-zinc-200 bg-white flex-col shrink-0">
          <div className="p-4 border-b border-zinc-100 flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <History className="h-4 w-4" />
            <span>Search History</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button className="w-full text-left p-2.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/10 block truncate">
              SaaS Founders - Canada
            </button>
            <button className="w-full text-left p-2.5 rounded-lg text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all block truncate">
              AI Engineers in Montreal
            </button>
            <button className="w-full text-left p-2.5 rounded-lg text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all block truncate">
              Growth Marketers - US
            </button>
          </div>
        </div>

        {/* Chat Feed Panel */}
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden">
          
          {/* Scrollable Conversation Stream */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 pb-28">
            {messages.map((msg, mIdx) => (
              <div key={mIdx} className={`flex gap-4 max-w-4xl ${msg.sender === 'user' ? 'justify-end ml-auto' : ''}`}>
                
                {/* Copilot logo avatar */}
                {msg.sender === 'copilot' && (
                  <div className="h-9 w-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
                    W
                  </div>
                )}

                {/* Message Bubble wrapper */}
                <div className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                  
                  {/* Sender title */}
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                    {msg.sender === 'user' ? 'You' : 'Copilot Agent'}
                  </span>

                  {/* Bubble body card */}
                  <div className={`rounded-2xl border p-4 shadow-sm text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-900 border-zinc-900 text-white rounded-tr-none' 
                      : 'bg-white border-zinc-200 text-zinc-900 rounded-tl-none'
                  }`}>
                    
                    {/* Thinking Accordion (Copilot) */}
                    {msg.sender === 'copilot' && msg.thought && (
                      <div className="mb-3 border-l-2 border-primary/40 pl-3 py-0.5 bg-zinc-50/50 rounded-r-md">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase select-none">
                          <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                          <span>Thought for {msg.thinkingTime}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mt-1 leading-normal">{msg.thought}</p>
                      </div>
                    )}

                    {/* Main text content */}
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Candidate Suggestion Cards (Copilot response) */}
                    {msg.sender === 'copilot' && msg.candidates && msg.candidates.length > 0 && (
                      <div className="mt-4 grid gap-3">
                        {msg.candidates.map((c, cIdx) => (
                          <div key={cIdx} className="p-4 rounded-xl border border-zinc-100 bg-[#FAFAFA] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-200 transition-all">
                            
                            {/* Candidate Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-zinc-800">{c.name}</span>
                                <Badge variant="secondary" className="text-[9px] bg-zinc-200/50 text-zinc-600 border-none px-1.5 h-4">
                                  {c.location}
                                </Badge>
                              </div>
                              <span className="text-[11px] font-semibold text-zinc-500 block">
                                {c.role} @ <span className="text-zinc-700">{c.company}</span>
                              </span>
                              <p className="text-[11px] text-zinc-400 mt-1 max-w-[480px]">
                                {c.summary}
                              </p>
                              <a 
                                href={`https://${c.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-[10px] text-primary hover:underline gap-0.5 mt-1 select-none font-bold"
                              >
                                {c.website}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>

                            {/* Candidate Action */}
                            <div className="shrink-0">
                              <Button
                                size="sm"
                                variant={c.saved ? 'outline' : 'default'}
                                disabled={savingIndex === cIdx}
                                onClick={() => handleSaveCandidate(mIdx, cIdx)}
                                className={`h-8 text-xs font-bold ${
                                  c.saved 
                                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-50 hover:text-emerald-800' 
                                    : 'bg-primary hover:bg-primary/95 text-white'
                                }`}
                              >
                                {savingIndex === cIdx ? (
                                  <>Saving...</>
                                ) : c.saved ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Saved
                                  </>
                                ) : (
                                  <>Save to library</>
                                )}
                              </Button>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

                {/* User avatar representation */}
                {msg.sender === 'user' && (
                  <div className="h-9 w-9 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
                    KB
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Fixed bottom chat bar panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent p-6 pt-10 select-none pointer-events-none">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3 bg-white border border-zinc-200 rounded-full px-5 py-3 shadow-md pointer-events-auto">
              
              {/* Radar Source badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 text-emerald-800 text-[10px] font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Wrangle's Profiles</span>
              </div>

              {/* Chat Input */}
              <Input
                id="sourcing-chat-input"
                placeholder={isSearching ? "Hermes-Agent is thinking..." : "Find SaaS founders located in Canada..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
                className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-0 text-xs text-zinc-800 placeholder-zinc-400 h-8 disabled:opacity-50"
              />

              {/* Submit button */}
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/95 text-white"
                disabled={!query.trim() || isSearching}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
