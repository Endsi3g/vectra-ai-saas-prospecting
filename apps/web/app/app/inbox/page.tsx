'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { 
  Sparkles, 
  Send, 
  Search, 
  Calendar, 
  DollarSign, 
  FileText, 
  Check, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
  CheckCircle,
  CornerDownLeft
} from 'lucide-react';
import { captureAnalyticsEvent } from '@/lib/analytics';

interface Message {
  sender: 'user' | 'prospect';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  prospectName: string;
  company: string;
  website: string;
  email: string;
  campaign: string;
  matchScore: number;
  sentiment: 'interested' | 'objection' | 'unsubscribe';
  lastMessage: string;
  time: string;
  messages: Message[];
}

export default function InboxPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'interested' | 'objection' | 'unsubscribe'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  
  // Custom replies generator state
  const [replyText, setReplyText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial mock conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      prospectName: 'Sarah Jenkins',
      company: 'TechRecruit',
      website: 'techrecruit.io',
      email: 'sarah@techrecruit.io',
      campaign: 'SaaS Founders - Canada',
      matchScore: 94,
      sentiment: 'interested',
      lastMessage: 'Ça m’intéresse de tester votre audit. Vous avez un créneau ce jeudi ?',
      time: '10:24',
      messages: [
        {
          sender: 'user',
          text: "Bonjour Sarah,\n\nJ'ai analysé techrecruit.io et j'ai adoré vos flux de recrutement automatique. Cependant, j'ai remarqué quelques frictions sur votre page de tarification qui pourraient vous faire perdre des conversions.\n\nJe vous ai préparé un audit vidéo rapide de 3 minutes avec 3 conseils concrets de design. Êtes-vous ouverte à ce que je vous l'envoie ?\n\nCordialement,\nKael",
          timestamp: 'Hier, 14:15'
        },
        {
          sender: 'prospect',
          text: 'Bonjour Kael, merci pour l’intérêt porté à TechRecruit ! Oui, ça m’intéresse carrément de tester votre audit pour améliorer nos conversions. Vous auriez un créneau ce jeudi après-midi pour en parler en direct ?',
          timestamp: 'Aujourd\'hui, 10:24'
        }
      ]
    },
    {
      id: 'conv-2',
      prospectName: 'Marc-André Leclerc',
      company: 'LeadFlow AI',
      website: 'leadflowai.com',
      email: 'marc@leadflowai.com',
      campaign: 'SaaS Founders - Canada',
      matchScore: 88,
      sentiment: 'objection',
      lastMessage: 'Merci pour les conseils, mais quelle est votre tarification exacte ?',
      time: 'Hier',
      messages: [
        {
          sender: 'user',
          text: "Bonjour Marc-André,\n\nFélicitations pour la croissance de LeadFlow AI. En parcourant votre site, j'ai vu que vos formulaires de contact n'étaient pas optimisés pour le mobile.\n\nJe me demandais si vous aviez 10 minutes pour que je vous montre comment capter 20% de leads qualifiés supplémentaires ?\n\nBonne semaine,\nKael",
          timestamp: 'Il y a 2 jours'
        },
        {
          sender: 'prospect',
          text: 'Hello Kael, merci pour les retours sur le mobile, c’est bien vu. Par contre on a un budget très serré ce trimestre. Quelle est votre tarification exacte pour ce genre d’optimisation ?',
          timestamp: 'Hier, 16:40'
        }
      ]
    },
    {
      id: 'conv-3',
      prospectName: 'Alexandre Dupont',
      company: 'DevPulse',
      website: 'devpulse.co',
      email: 'alex@devpulse.co',
      campaign: 'SaaS Founders - Canada',
      matchScore: 79,
      sentiment: 'unsubscribe',
      lastMessage: 'Veuillez me retirer de votre liste de diffusion, merci.',
      time: 'Il y a 3 jours',
      messages: [
        {
          sender: 'user',
          text: "Bonjour Alexandre,\n\nJ'ai vu votre récente levée de fonds en Pre-Seed pour DevPulse, bravo ! J'ai rédigé quelques recommandations de design pour moderniser votre tableau de bord.\n\nSeriez-vous curieux de les voir ?\n\nÀ bientôt,\nKael",
          timestamp: 'Il y a 4 jours'
        },
        {
          sender: 'prospect',
          text: 'Veuillez me retirer de votre liste de diffusion, merci.',
          timestamp: 'Il y a 3 jours'
        }
      ]
    }
  ]);

  const activeConv = (conversations.find(c => c.id === selectedConvId) || conversations[0]) as Conversation;

  // Helper to show temporary toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulated sending of a reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    captureAnalyticsEvent('inbox_reply_sent', {
      prospect: activeConv.prospectName,
      company: activeConv.company,
      sentiment: activeConv.sentiment
    });

    const newMsg: Message = {
      sender: 'user',
      text: replyText,
      timestamp: 'À l\'instant'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessage: replyText,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setReplyText('');
    triggerToast(`Réponse envoyée avec succès à ${activeConv.prospectName} !`);
  };

  // Magic Reply generator logic (Simulated AI)
  const generateMagicReply = (type: 'suggest_call' | 'handle_price' | 'send_case') => {
    setIsAiGenerating(true);
    captureAnalyticsEvent('inbox_magic_reply_clicked', { type, prospect: activeConv.prospectName });

    setTimeout(() => {
      let text = '';
      if (type === 'suggest_call') {
        text = `Bonjour ${activeConv.prospectName.split(' ')[0]},\n\nMerci pour votre retour ! C'est un plaisir d'échanger avec vous.\n\nCe jeudi après-midi me convient parfaitement. Je vous propose un appel rapide de 15 minutes pour vous partager mes recommandations en direct.\n\nVous pouvez choisir le créneau qui vous convient le mieux directement sur mon Calendly : https://calendly.com/kael-vectra/15min\n\nAu plaisir d'en discuter,\nKael`;
      } else if (type === 'handle_price') {
        text = `Bonjour ${activeConv.prospectName.split(' ')[0]},\n\nJe comprends tout à fait la contrainte budgétaire, c'est tout à fait normal pour ce trimestre.\n\nPour clarifier, nos services d'optimisation commencent à partir de 199€ pour un Starter audit complet. Nous avons aussi des formules à la performance si cela s'aligne mieux avec vos objectifs actuels.\n\nSeriez-vous ouvert à un appel rapide de 10 minutes pour explorer comment nous pouvons maximiser votre retour sur investissement dans cette limite ?\n\nCordialement,\nKael`;
      } else if (type === 'send_case') {
        text = `Bonjour ${activeConv.prospectName.split(' ')[0]},\n\nJe comprends parfaitement votre situation.\n\nPour vous donner une idée concrète du retour sur investissement, nous avons récemment accompagné DevPulse sur leur tableau de bord. Cela leur a permis de réduire leur taux d'attrition de 14% dès le premier mois.\n\nVoici le lien vers notre étude de cas détaillée : https://vectra.ai/case-studies/devpulse\n\nN'hésitez pas à y jeter un œil quand vous aurez un moment. Seriez-vous ouvert à un échange de 10 minutes la semaine prochaine ?\n\nBien à vous,\nKael`;
      }

      setReplyText(text);
      setIsAiGenerating(false);
      triggerToast('Réponse Magic Reply générée par l\'IA avec succès !');
    }, 800);
  };

  // Filters search and status tabs
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.prospectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && c.sentiment === activeFilter;
  });

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'interested':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">Intéressé</Badge>;
      case 'objection':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">Objection</Badge>;
      case 'unsubscribe':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">Désinscription</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-zinc-900 text-white border border-zinc-800 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-in text-xs font-bold">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Inbox</span>
          <span className="text-zinc-300 font-normal">/</span>
          <span className="font-semibold text-zinc-900 truncate max-w-[240px]">
            Prospect Replies
          </span>
          <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            Sync Active
          </Badge>
        </div>
      </header>

      {/* Main Inbox Workspace (3 Panes Split view) */}
      <div className="flex-1 flex overflow-hidden bg-[#FAFAFA]">
        
        {/* Volet 1 : Conversations List (Left Pane) */}
        <div className="w-80 border-r border-zinc-200 bg-white flex flex-col shrink-0 h-full">
          {/* Search box */}
          <div className="p-4 border-b border-zinc-100 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Rechercher un prospect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs border-zinc-200 focus-visible:ring-primary h-9 bg-zinc-50/50"
              />
            </div>
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1">
              {(['all', 'interested', 'objection', 'unsubscribe'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize border transition-all ${
                    activeFilter === filter
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  {filter === 'all' ? 'Tous' : filter === 'interested' ? 'Intéressés' : filter === 'objection' ? 'Objections' : 'Désabonnés'}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations scrollable list */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-400 italic">
                Aucune conversation trouvée.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setReplyText('');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-zinc-100 border border-zinc-100 shadow-sm' 
                        : 'hover:bg-zinc-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs text-zinc-800 truncate max-w-[120px]">{conv.prospectName}</span>
                      <span className="text-[9px] text-zinc-400 font-medium shrink-0">{conv.time}</span>
                    </div>
                    
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="text-[10px] text-zinc-500 truncate block">{conv.company}</span>
                      {getSentimentBadge(conv.sentiment)}
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {conv.lastMessage}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Volet 2 : Chat history thread (Middle Pane) */}
        <div className="flex-1 flex flex-col bg-zinc-50 h-full border-r border-zinc-200">
          
          {/* Scrollable chat thread area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {activeConv.messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-3 max-w-3xl ${isUser ? 'justify-end ml-auto' : 'mr-auto'}`}>
                  
                  {/* Avatar */}
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-600 flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm mt-0.5">
                      {activeConv.prospectName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Timestamp / Sender identifier info */}
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                      {isUser ? 'Vous (Outbound Email)' : `${activeConv.prospectName} (${activeConv.company})`} &middot; {msg.timestamp}
                    </span>

                    {/* Chat bubble body card */}
                    <div className={`rounded-xl border p-4 shadow-sm text-xs leading-relaxed max-w-[500px] whitespace-pre-wrap ${
                      isUser 
                        ? 'bg-zinc-900 border-zinc-900 text-white rounded-tr-none' 
                        : 'bg-white border-zinc-200 text-zinc-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>

                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none mt-0.5">
                      KB
                    </div>
                  )}

                </div>
              );
            })}

          </div>

          {/* Fixed bottom chat reply input workspace */}
          <div className="p-4 bg-white border-t border-zinc-200 space-y-3 shrink-0">
            <form onSubmit={handleSendReply} className="space-y-3">
              <div className="relative">
                <Textarea
                  placeholder={`Répondre à ${activeConv.prospectName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full text-xs border-zinc-200 focus-visible:ring-primary resize-none placeholder-zinc-400 bg-[#FAFAFA] pr-12 pt-3 pb-3 rounded-xl leading-relaxed"
                />
                
                {/* Send Button overlay inside input */}
                <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 hidden sm:flex items-center gap-1 select-none">
                    <span>Ctrl</span>
                    <span>+</span>
                    <CornerDownLeft className="h-3 w-3" />
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim()}
                    className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Volet 3 : Prospect info & Magic Replies (Right Pane) */}
        <div className="w-80 bg-white flex flex-col shrink-0 p-6 space-y-6 h-full overflow-y-auto">
          
          {/* Section A: Profile summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prospect Profile</h4>
              <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-none font-bold text-[10px]">
                Score: {activeConv.matchScore}%
              </Badge>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Nom complet</span>
                <span className="text-xs font-bold text-zinc-900 block mt-0.5">{activeConv.prospectName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Entreprise &amp; Site Web</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-semibold text-zinc-800">{activeConv.company}</span>
                  <a 
                    href={`https://${activeConv.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[10px] text-primary hover:underline font-bold gap-0.5"
                  >
                    {activeConv.website}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Adresse e-mail</span>
                <span className="text-xs text-zinc-600 block mt-0.5">{activeConv.email}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Campagne d'origine</span>
                <span className="text-[10px] bg-zinc-200/50 text-zinc-700 px-2 py-0.5 rounded-full inline-block font-semibold mt-1">
                  {activeConv.campaign}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Magic Replies */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>Magic Replies (IA)</span>
              </h4>
            </div>
            
            <p className="text-[11px] text-zinc-500 leading-normal">
              Générez une réponse optimisée par l'IA basée sur le message reçu du prospect.
            </p>

            <div className="grid grid-cols-1 gap-2">
              
              <button
                onClick={() => generateMagicReply('suggest_call')}
                disabled={isAiGenerating || activeConv.sentiment === 'unsubscribe'}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-primary hover:bg-emerald-50/20 text-left transition-all text-xs group disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-800 block group-hover:text-primary transition-colors">📅 Proposer un appel</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Calendly link insertion</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => generateMagicReply('handle_price')}
                disabled={isAiGenerating || activeConv.sentiment === 'unsubscribe'}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-primary hover:bg-emerald-50/20 text-left transition-all text-xs group disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-800 block group-hover:text-primary transition-colors">💰 Justifier le Tarif</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Expliquer nos prix &amp; ROI</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => generateMagicReply('send_case')}
                disabled={isAiGenerating || activeConv.sentiment === 'unsubscribe'}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-primary hover:bg-emerald-50/20 text-left transition-all text-xs group disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-800 block group-hover:text-primary transition-colors">📁 Envoyer un Use Case</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Partager un succès client</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
              </button>

            </div>

            {isAiGenerating && (
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-2 font-medium">
                <Clock className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Génération du brouillon IA en cours...</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
