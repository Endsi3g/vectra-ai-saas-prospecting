'use client';

import React, { useState, useEffect } from 'react';
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
  Lock,
  X,
  RefreshCw,
  FolderClosed,
  Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { captureAnalyticsEvent } from '@/lib/analytics';
import { saveLead, deductCredits } from '@/lib/db-fallback';

interface Candidate {
  name: string;
  role: string;
  company: string;
  location: string;
  summary: string;
  website: string;
  saved: boolean;
  email?: string;
  match_score?: number;
}

export default function SourcingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Campaign selector
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);

  // User identity for avatar
  const [userInitials, setUserInitials] = useState('ME');

  // Search history from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeHistoryQuery, setActiveHistoryQuery] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Build initials from email
          const emailParts = (user.email || '').split('@')[0]?.split(/[._-]/) || [];
          const initials = emailParts
            .slice(0, 2)
            .map((p: string) => p[0]?.toUpperCase() || '')
            .join('') || user.email?.[0]?.toUpperCase() || 'U';
          setUserInitials(initials);

          // Load campaigns
          const { data: campData } = await supabase
            .from('campaigns')
            .select('id, name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (campData && campData.length > 0) {
            setCampaigns(campData);
            // Restore last used campaign from localStorage
            const lastCampaignId = localStorage.getItem('sourcing_campaign_id');
            const validId = lastCampaignId && campData.find(c => c.id === lastCampaignId)
              ? lastCampaignId
              : campData[0]!.id;
            setSelectedCampaignId(validId);
          }
        }
      } catch (err) {
        console.error('Error loading initial sourcing data:', err);
      }
    };

    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('sourcing_history') || '[]') as string[];
    setSearchHistory(history);

    loadInitialData();
  }, []);

  const toggleSelectCandidate = (key: string) => {
    setSelectedCandidates(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleBulkAction = async (action: 'shortlist' | 'hide') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Veuillez vous connecter pour qualifier ces prospects.');
        return;
      }

      let campaignId = selectedCampaignId;

      if (!campaignId) {
        const { data: campList } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (campList && campList.length > 0 && campList[0]) {
          campaignId = campList[0].id;
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

      if (!campaignId) return;

      const targets = selectedCandidates.map(key => {
        const parts = key.split('-');
        const mIdx = parseInt(parts[0] || '0', 10);
        const cIdx = parseInt(parts[1] || '0', 10);
        return { mIdx, cIdx, candidate: messages[mIdx]?.candidates?.[cIdx] };
      }).filter(t => t.candidate) as { mIdx: number; cIdx: number; candidate: Candidate }[];

      for (const t of targets) {
        const { data: savedLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            campaign_id: campaignId,
            name: t.candidate.name,
            company: t.candidate.company,
            website: `https://${t.candidate.website}`,
            email: t.candidate.email || `contact@${t.candidate.website}`,
            notes: t.candidate.summary
          })
          .select('id')
          .single();

        if (leadError) continue;

        if (savedLead) {
          await supabase
            .from('messages')
            .insert({
              lead_id: savedLead.id,
              email_subject: `Proposition de design pour ${t.candidate.company}`,
              email_body: `Bonjour ${t.candidate.name.split(' ')[0]}, j'ai analysé votre site ${t.candidate.website}...`,
              linkedin_message: `Salut ${t.candidate.name.split(' ')[0]}, top votre SaaS...`,
              personalization_score: 95,
              status: action === 'shortlist' ? 'approved' : 'draft'
            });
        }
      }

      const totalCost = targets.length * 5;
      const updatedCredits = await deductCredits(totalCost);
      window.dispatchEvent(new CustomEvent('vectra-credits-updated', { detail: { credits: updatedCredits } }));
      
      // Force refresh of layout lists if needed
      window.dispatchEvent(new Event('vectra-collections-updated'));

      setMessages(prev => prev.map((m, mIdx) => {
        if (m.candidates) {
          const newCandidates = m.candidates.map((c: Candidate, cIdx: number) => {
            const isSelected = selectedCandidates.includes(`${mIdx}-${cIdx}`);
            if (isSelected) {
              return { ...c, saved: true };
            }
            return c;
          });
          return { ...m, candidates: newCandidates };
        }
        return m;
      }));

      setSelectedCandidates([]);
    } catch (err) {
      console.error('Error during bulk action:', err);
    }
  };

  const executeSearch = async (queryText: string, isLoadMore: boolean = false) => {
    if (!queryText.trim() || isSearching) return;

    setIsSearching(true);
    if (!isLoadMore) {
      setQuery('');
      setActiveHistoryQuery(queryText);
      // Persist to search history
      setSearchHistory(prev => {
        const updated = [queryText, ...prev.filter(h => h !== queryText)].slice(0, 10);
        localStorage.setItem('sourcing_history', JSON.stringify(updated));
        return updated;
      });
    }
    captureAnalyticsEvent(isLoadMore ? 'sourcing_load_more' : 'sourcing_query_run', { query: queryText });

    const userMsg = isLoadMore 
      ? { sender: 'user', text: `Recherche approfondie : ${queryText}` } 
      : { sender: 'user', text: queryText };
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
      const payload = isLoadMore ? { query: queryText, page: 2 } : { query: queryText };
      const response = await fetch('/api/sourcing/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify(payload)
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
                    email: l.email,
                    match_score: l.match_score || Math.floor(Math.random() * 20 + 75)
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleLoadMore = () => {
    // Find the last user query
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user' && !m.text.startsWith('Recherche approfondie :'));
    if (lastUserMsg) {
      executeSearch(lastUserMsg.text, true);
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

      // Use the user-selected campaign
      let campaignId = selectedCampaignId;

      if (!campaignId) {
        const { data: campList } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (campList && campList.length > 0 && campList[0]) {
          campaignId = campList[0].id;
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

      if (!campaignId) {
        throw new Error('Could not resolve campaign.');
      }

      // Save lead using our hybrid helper
      await saveLead({
        campaign_id: campaignId,
        name: candidate.name,
        company: candidate.company,
        website: `https://${candidate.website}`,
        email: candidate.email || `contact@${candidate.website}`,
        notes: candidate.summary,
        role: candidate.role,
        location: candidate.location
      });

      // Deduct 5 credits from profile
      const updatedCredits = await deductCredits(5);
      window.dispatchEvent(new CustomEvent('vectra-credits-updated', { detail: { credits: updatedCredits } }));
      
      // Sync sidebar
      window.dispatchEvent(new Event('vectra-collections-updated'));

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
            {activeHistoryQuery || 'Nouvelle recherche'}
          </span>
          {activeHistoryQuery && (
            <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
              Active
            </Badge>
          )}
        </div>

        {/* Campaign selector */}
        <div className="hidden lg:flex items-center gap-2 select-none">
          {campaigns.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowCampaignDropdown(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <FolderClosed className="h-3.5 w-3.5 text-zinc-500" />
                {campaigns.find(c => c.id === selectedCampaignId)?.name || 'Choisir une campagne'}
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>
              {showCampaignDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1">
                  {campaigns.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCampaignId(c.id);
                        localStorage.setItem('sourcing_campaign_id', c.id);
                        setShowCampaignDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 transition-colors truncate ${c.id === selectedCampaignId ? 'text-primary font-bold' : 'text-zinc-700'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50">
            <Settings className="h-3.5 w-3.5 text-zinc-500" />
            Préférences
          </Button>
        </div>

      </header>

      {/* Main chat window split view (History list on left / Chat feed on right) */}
      <div className="flex-1 flex overflow-hidden bg-zinc-50">
        
        {/* History / Past queries left column */}
        <div className="hidden md:flex w-64 border-r border-zinc-200 bg-white flex-col shrink-0">
          <div className="p-4 border-b border-zinc-100 flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <History className="h-4 w-4" />
            <span>Search History</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {searchHistory.length === 0 ? (
              <p className="text-[11px] text-zinc-400 px-2.5 py-4 text-center">Aucune recherche récente</p>
            ) : (
              searchHistory.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSearch(h)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all block truncate ${
                    h === activeHistoryQuery
                      ? 'font-bold bg-primary/10 text-primary border border-primary/10'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  {h}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Feed Panel */}
        <div className="flex-1 flex flex-col h-full bg-zinc-50 relative overflow-hidden">
          
          {/* Scrollable Conversation Stream */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 pb-28">
            {messages.length === 0 && !isSearching && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 select-none">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-base font-bold text-zinc-800 mb-2">Recherchez vos premiers prospects</h3>
                <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
                  Décrivez en langage naturel le profil que vous cherchez. L'agent Hermes s'occupe du reste.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['SaaS founders au Canada', 'Growth marketers à Paris', 'CTOs de startups Series A'].map(example => (
                    <button
                      key={example}
                      onClick={() => setQuery(example)}
                      className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-xs text-zinc-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                        {msg.candidates.map((c: Candidate, cIdx: number) => (
                          <div key={cIdx} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-200 transition-all">
                            
                            {/* Checkbox & Candidate Info */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {!c.saved && (
                                <input
                                  type="checkbox"
                                  checked={selectedCandidates.includes(`${mIdx}-${cIdx}`)}
                                  onChange={() => toggleSelectCandidate(`${mIdx}-${cIdx}`)}
                                  className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer mt-1 shrink-0"
                                />
                              )}
                              
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs text-zinc-800">{c.name}</span>
                                  {c.match_score !== undefined && (
                                    <div className="flex items-center gap-1.5 ml-1">
                                      <div className="relative h-5 w-5 flex items-center justify-center bg-zinc-50 rounded-full border border-zinc-100">
                                        <svg className="h-4 w-4 transform -rotate-90" viewBox="0 0 20 20">
                                          <circle className="text-zinc-200" strokeWidth="2" stroke="currentColor" fill="transparent" r="8" cx="10" cy="10" />
                                          <circle 
                                            className={`${c.match_score >= 90 ? 'text-emerald-500' : c.match_score >= 80 ? 'text-amber-500' : 'text-blue-500'}`} 
                                            strokeWidth="2" 
                                            strokeDasharray={`${(c.match_score / 100) * 50.2} 50.2`} 
                                            strokeLinecap="round" 
                                            stroke="currentColor" 
                                            fill="transparent" 
                                            r="8" 
                                            cx="10" 
                                            cy="10" 
                                          />
                                        </svg>
                                      </div>
                                      <span className={`text-[10px] font-bold ${c.match_score >= 90 ? 'text-emerald-600' : c.match_score >= 80 ? 'text-amber-600' : 'text-blue-600'}`}>
                                        {c.match_score}% Match
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="text-[9px] bg-zinc-200/50 text-zinc-600 border-none px-1.5 h-4 ml-auto sm:ml-0">
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
                    
                    {/* Load More Button (only on the last copilot message) */}
                    {msg.sender === 'copilot' && msg.candidates && msg.candidates.length > 0 && mIdx === messages.length - 1 && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-4 text-primary font-semibold text-xs border border-dashed border-zinc-200 hover:border-primary/50 hover:bg-zinc-50"
                        onClick={handleLoadMore}
                        disabled={isSearching}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
                        {isSearching ? 'Chargement...' : 'Charger plus de profils'}
                      </Button>
                    )}

                  </div>

                </div>

                {/* User avatar representation */}
                {msg.sender === 'user' && (
                  <div className="h-9 w-9 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
                    {userInitials}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Floating Action Bar */}
          {selectedCandidates.length > 0 && (
            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-950 text-white rounded-full px-5 py-3 shadow-2xl border border-zinc-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
              <span className="text-[11px] font-bold text-zinc-300 shrink-0">
                {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? 's' : ''} sélectionné{selectedCandidates.length > 1 ? 's' : ''}
              </span>
              <div className="h-4 w-px bg-zinc-800 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <Button 
                  size="sm" 
                  onClick={() => handleBulkAction('shortlist')}
                  className="h-7 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-1"
                >
                  <Check className="h-3 w-3" />
                  Shortlist
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleBulkAction('hide')}
                  className="h-7 text-[10px] font-extrabold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-800 gap-1"
                >
                  <X className="h-3 w-3" />
                  Masquer
                </Button>
                <button 
                  onClick={() => setSelectedCandidates([])}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white px-2 py-1"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Fixed bottom chat bar panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent p-6 pt-10 select-none pointer-events-none">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3 bg-white border border-zinc-200 rounded-full px-5 py-3 shadow-md pointer-events-auto">
              
              {/* Radar Source badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 text-emerald-800 text-[10px] font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Vectra's Profiles</span>
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
