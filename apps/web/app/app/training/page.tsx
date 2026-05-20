'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  PhoneCall, 
  Mic, 
  Settings, 
  UserCircle, 
  Volume2, 
  Send,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { captureAnalyticsEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

type Persona = 'ceo_busy' | 'cto_skeptic' | 'hr_budget';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<Persona>('ceo_busy');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationEnded, setSimulationEnded] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping]);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationEnded(false);
    setMessages([]);
    captureAnalyticsEvent('training_simulation_started', { persona: selectedPersona, difficulty: selectedDifficulty });

    // Initial greeting from agent
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      let greeting = 'Allô ?';
      if (selectedPersona === 'ceo_busy') greeting = 'Oui, bonjour. Je suis très occupé, c\'est à quel sujet ?';
      if (selectedPersona === 'cto_skeptic') greeting = 'Bonjour. J\'espère que ce n\'est pas encore pour me vendre un outil SaaS...';
      if (selectedPersona === 'hr_budget') greeting = 'Bonjour, département RH, que puis-je pour vous ?';
      
      setMessages([{ sender: 'agent', text: greeting }]);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || agentTyping || simulationEnded) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');
    setAgentTyping(true);

    // Mock AI response
    setTimeout(() => {
      setAgentTyping(false);
      
      // Basic mock responses based on length of conversation
      const msgCount = messages.length;
      let reply = '';
      let shouldEnd = false;

      if (msgCount < 3) {
        if (selectedPersona === 'ceo_busy') reply = 'Allez droit au but, je rentre en réunion dans 2 minutes. Quelle est votre proposition de valeur ?';
        else if (selectedPersona === 'cto_skeptic') reply = 'Notre stack technique est déjà très complexe. Comment vous vous intégrez sans casser nos process ?';
        else reply = 'Nous n\'avons pas de budget alloué pour ce type de solution cette année. Pourquoi devrais-je écouter ?';
      } else if (msgCount < 5) {
        if (selectedPersona === 'ceo_busy') reply = 'D\'accord, ça m\'intrigue. Avez-vous des cas d\'usage dans mon industrie ?';
        else if (selectedPersona === 'cto_skeptic') reply = 'Le problème avec l\'IA, c\'est la sécurité des données. Que garantissez-vous ?';
        else reply = 'Si le ROI est prouvable en 3 mois, je peux potentiellement débloquer une enveloppe exceptionnelle...';
      } else {
        reply = 'Très bien, envoyez-moi un résumé par email et proposez-moi un créneau la semaine prochaine. Je dois vous laisser.';
        shouldEnd = true;
      }

      setMessages(prev => [...prev, { sender: 'agent', text: reply }]);
      
      if (shouldEnd) {
        setTimeout(() => {
          setSimulationEnded(true);
          captureAnalyticsEvent('training_simulation_ended', { messages_exchanged: msgCount });
        }, 1000);
      }
    }, 2000);
  };

  const renderScore = () => {
    return (
      <Card className="mt-4 border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Simulation Terminée !</h3>
              <p className="text-sm text-emerald-700 font-medium mt-1">Vous avez brillamment géré les objections.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-zinc-400">Score d'Écoute</span>
                <span className="text-xl font-black text-zinc-900">92/100</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-zinc-400">Force de Conviction</span>
                <span className="text-xl font-black text-zinc-900">85/100</span>
              </div>
            </div>
            
            <Button onClick={() => setIsSimulating(false)} className="mt-4 font-bold">
              <RotateCcw className="w-4 h-4 mr-2" />
              Nouveau Scénario
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA] text-zinc-950 font-sans">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Training</span>
          <span className="text-zinc-300 font-normal">/</span>
          <span className="font-semibold text-zinc-900">Cold Call Simulator</span>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold uppercase text-[10px]">
          Beta Module
        </Badge>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        {!isSimulating ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">Simulateur d'Appel (IA)</h1>
              <p className="text-sm text-zinc-500 font-medium mt-1">
                Entraînez-vous face à des objections complexes. L'Agent Vectra IA incarne vos prospects les plus difficiles.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-zinc-500" />
                    Profil du Prospect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase">Persona IA</label>
                    <div className="grid gap-2">
                      <div 
                        onClick={() => setSelectedPersona('ceo_busy')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPersona === 'ceo_busy' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                      >
                        <div className="font-bold text-sm">Le CEO Pressé</div>
                        <div className="text-xs text-zinc-500 mt-1">Temps limité, veut des preuves immédiates de ROI.</div>
                      </div>
                      
                      <div 
                        onClick={() => setSelectedPersona('cto_skeptic')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPersona === 'cto_skeptic' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                      >
                        <div className="font-bold text-sm">Le CTO Sceptique</div>
                        <div className="text-xs text-zinc-500 mt-1">Très technique, craint pour la sécurité et l'intégration.</div>
                      </div>

                      <div 
                        onClick={() => setSelectedPersona('hr_budget')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPersona === 'hr_budget' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                      >
                        <div className="font-bold text-sm">Le RH sans Budget</div>
                        <div className="text-xs text-zinc-500 mt-1">Intéressé mais contraint par la bureaucratie financière.</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-zinc-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="w-4 h-4 text-zinc-500" />
                      Paramètres
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase">Difficulté</label>
                      <select 
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="easy">Facile (Complaisant)</option>
                        <option value="medium">Normal (Réaliste)</option>
                        <option value="hard">Difficile (Objections continues)</option>
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-zinc-50 border-t border-zinc-100 rounded-b-xl pt-4">
                    <Button onClick={startSimulation} className="w-full font-bold">
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Lancer la Simulation
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-900 font-medium">
                      Conseil : Soyez direct et posez des questions ouvertes. L'IA analyse la sémantique de vos réponses pour déterminer si vous "gagnez" le droit de continuer l'appel.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Simulation Header */}
            <div className="flex items-center justify-between bg-zinc-900 text-white rounded-t-xl p-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <UserCircle className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">
                    {selectedPersona === 'ceo_busy' ? 'Marc (CEO)' : selectedPersona === 'cto_skeptic' ? 'David (CTO)' : 'Sophie (RH)'}
                  </h2>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Appel en cours...
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsSimulating(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <RotateCcw className="w-4 h-4 mr-2" />
                Quitter
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-white border-x border-zinc-200 p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-zinc-100 text-zinc-900 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {agentTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 text-zinc-500 px-4 py-3 rounded-2xl rounded-tl-sm text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              {simulationEnded && renderScore()}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-x border-b border-zinc-200 rounded-b-xl p-4 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tapez votre réponse (ou utilisez le micro)..."
                  disabled={simulationEnded || agentTyping}
                  className="flex-1 h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 w-12 shrink-0 rounded-xl border-zinc-200 text-zinc-500 hover:text-primary"
                  disabled={simulationEnded || agentTyping}
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || simulationEnded || agentTyping}
                  className="h-12 w-12 shrink-0 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
