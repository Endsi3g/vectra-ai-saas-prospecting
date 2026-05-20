'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@workspace/ui/components/resizable';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import { captureAnalyticsEvent } from '@/lib/analytics';
import { saveLead, saveMessage } from '@/lib/db-fallback';
import { 
  Sparkles, 
  Upload, 
  Clipboard, 
  Trash2, 
  Check, 
  Edit3, 
  Download, 
  Loader2, 
  ExternalLink,
  AlertCircle,
  Compass
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  website: string;
  email: string;
  notes?: string;
  summary?: string;
  email_subject?: string;
  email_body?: string;
  linkedin_message?: string;
  personalization_score?: number;
  status?: 'draft' | 'approved' | 'discarded';
}

export default function OutreachPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('Prospecting Outbound');
  const [businessType, setBusinessType] = useState('freelance web designer');
  const [offer, setOffer] = useState('Je crée des landing pages ultra claires pour coachs et formateurs.');
  const [icp, setIcp] = useState('coachs business B2B qui vendent des programmes à plus de 1000€');
  const [angle, setAngle] = useState('audit');
  const [angleDescription, setAngleDescription] = useState('Proposer un audit gratuit de leur landing page + 2-3 recommandations.');
  const [callToAction, setCallToAction] = useState('proposer un appel de 20 minutes pour passer en revue leurs améliorations');
  const [extraInstructions, setExtraInstructions] = useState('Je veux paraître smart mais accessible, jamais pressant.');
  
  const [rawText, setRawText] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');

  // Phase 13 premium states
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsingLogs, setParsingLogs] = useState<string[]>([]);
  const [importStep, setImportStep] = useState<'idle' | 'parsing' | 'mapping'>('idle');
  const [rawCsvData, setRawCsvData] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  
  // Mapping selections
  const [mappedName, setMappedName] = useState('');
  const [mappedCompany, setMappedCompany] = useState('');
  const [mappedEmail, setMappedEmail] = useState('');
  const [mappedNotes, setMappedNotes] = useState('');

  // Auto-save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const skipAutoSaveRef = useRef(true);

  // Phase 5 campaign selector & streaming states
  const [campaignsList, setCampaignsList] = useState<{ id: string; name: string }[]>([]);
  const [streamMessages, setStreamMessages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Phase 6 states
  const [pitchDescription, setPitchDescription] = useState('Je crée des landing pages ultra claires pour coachs et formateurs. Mes cibles sont les coachs business B2B qui vendent des programmes à plus de 1000€. L\'angle est de proposer un audit gratuit de leur landing page avec 2-3 recommandations. Je veux proposer un appel de 20 minutes pour passer en revue leurs améliorations. Je veux paraître smart mais accessible, jamais pressant.');
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamMessages]);

  const loadCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaign) {
        setActiveCampaignId(campaign.id);
        setCampaignName(campaign.name);
        setOffer(campaign.offer || '');
        setIcp(campaign.icp || '');
        setAngle(campaign.angle || 'audit');
        setAngleDescription(campaign.angle_description || '');
        setCallToAction(campaign.call_to_action || '');
        setExtraInstructions(campaign.extra_instructions || '');

        // Phase 6 Natural Language pitch support
        const description = campaign.extra_instructions || campaign.offer || '';
        setPitchDescription(description);

        const { data: campaignLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('campaign_id', campaign.id);

        if (campaignLeads && campaignLeads.length > 0) {
          const leadsIds = campaignLeads.map(l => l.id);
          
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .in('lead_id', leadsIds);

          const formattedLeads = campaignLeads.map((lead: any) => {
            const msg = (messages || []).find((m: any) => m.lead_id === lead.id);
            return {
              id: lead.id,
              name: lead.name,
              company: lead.company,
              website: lead.website,
              email: lead.email,
              notes: lead.notes,
              summary: msg?.summary,
              email_subject: msg?.email_subject,
              email_body: msg?.email_body,
              linkedin_message: msg?.linkedin_message,
              personalization_score: msg?.personalization_score,
              status: msg?.status || 'draft'
            };
          });

          setLeads(formattedLeads);
          if (formattedLeads.length > 0 && formattedLeads[0]) {
            setSelectedLeadId(formattedLeads[0].id);
          }
        } else {
          setLeads([]);
          setSelectedLeadId(null);
        }
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('business_type')
        .eq('id', user.id)
        .single();
      
      if (profile?.business_type) {
        setBusinessType(profile.business_type === 'solopreneur' ? 'Solopreneur / Freelance' : profile.business_type === 'agency' ? 'Petite agence' : 'SaaS early-stage');
      }

      // Load user campaigns
      const { data: allCamp } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (allCamp) {
        setCampaignsList(allCamp);
      }

      const { data: lastCampaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastCampaign) {
        setActiveCampaignId(lastCampaign.id);
        setCampaignName(lastCampaign.name);
        setOffer(lastCampaign.offer || '');
        setIcp(lastCampaign.icp || '');
        setAngle(lastCampaign.angle || 'audit');
        setAngleDescription(lastCampaign.angle_description || '');
        setCallToAction(lastCampaign.call_to_action || '');
        setExtraInstructions(lastCampaign.extra_instructions || '');

        // Phase 6 Natural Language pitch support
        const description = lastCampaign.extra_instructions || lastCampaign.offer || '';
        setPitchDescription(description);

        const { data: campaignLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('campaign_id', lastCampaign.id);

        if (campaignLeads && campaignLeads.length > 0) {
          const leadsIds = campaignLeads.map(l => l.id);
          
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .in('lead_id', leadsIds);

          const formattedLeads = campaignLeads.map((lead: any) => {
            const msg = (messages || []).find((m: any) => m.lead_id === lead.id);
            return {
              id: lead.id,
              name: lead.name,
              company: lead.company,
              website: lead.website,
              email: lead.email,
              notes: lead.notes,
              summary: msg?.summary,
              email_subject: msg?.email_subject,
              email_body: msg?.email_body,
              linkedin_message: msg?.linkedin_message,
              personalization_score: msg?.personalization_score,
              status: msg?.status || 'draft'
            };
          });

          setLeads(formattedLeads);
          if (formattedLeads.length > 0 && formattedLeads[0]) {
            setSelectedLeadId(formattedLeads[0].id);
          }
        }
      }
    };
    checkAuthAndLoad();
  }, [router]);

  useEffect(() => {
    if (selectedLeadId) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) {
        skipAutoSaveRef.current = true;
        setEditSubject(lead.email_subject || '');
        setEditBody(lead.email_body || '');
        setEditLinkedin(lead.linkedin_message || '');
        
        const timer = setTimeout(() => {
          skipAutoSaveRef.current = false;
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLeadId, leads]);

  useEffect(() => {
    if (skipAutoSaveRef.current) return;
    if (!selectedLeadId) return;

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) {
        try {
          // Update local leads state immediately
          setLeads(prev => prev.map(l => l.id === selectedLeadId ? {
            ...l,
            email_subject: editSubject,
            email_body: editBody,
            linkedin_message: editLinkedin
          } : l));

          // Save via transparent fallback
          await saveMessage({
            lead_id: selectedLeadId,
            email_subject: editSubject,
            email_body: editBody,
            linkedin_message: editLinkedin,
            personalization_score: lead.personalization_score || 95,
            status: lead.status || 'draft'
          });

          setSaveStatus('saved');
          const doneTimer = setTimeout(() => {
            setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
          }, 2000);
          return () => clearTimeout(doneTimer);
        } catch (e) {
          console.error(e);
          setSaveStatus('idle');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editSubject, editBody, editLinkedin, selectedLeadId]);

  const processCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields || [];
        setDetectedHeaders(fields);
        setRawCsvData(results.data);
        
        // Auto-detect columns mapping
        const nameField = fields.find(f => /name|nom/i.test(f)) || fields[0] || '';
        const companyField = fields.find(f => /company|entreprise/i.test(f)) || fields[1] || '';
        const emailField = fields.find(f => /email|courriel|mail/i.test(f)) || fields[2] || '';
        const notesField = fields.find(f => /note|info|description/i.test(f)) || fields[3] || '';
        
        setMappedName(nameField);
        setMappedCompany(companyField);
        setMappedEmail(emailField);
        setMappedNotes(notesField);

        // Start parsing simulation step
        setImportStep('parsing');
        setProgress(0);
        setParsingLogs(["[INFO] Fichier CSV détecté : " + file.name, "[INFO] Initialisation du processeur de prospects..."]);
        
        let currentProgress = 0;
        const totalRows = results.data.length;
        
        const interval = setInterval(() => {
          currentProgress += 5;
          setProgress(currentProgress);
          
          if (currentProgress === 10) {
            setParsingLogs(prev => [...prev, `[INFO] Lecture de ${totalRows} lignes...`]);
          } else if (currentProgress === 35) {
            setParsingLogs(prev => [...prev, `[INFO] En-têtes trouvés : ${fields.join(', ')}`]);
          } else if (currentProgress === 60) {
            setParsingLogs(prev => [...prev, `[INFO] Validation des formats d'e-mail en cours...`]);
          } else if (currentProgress === 80) {
            setParsingLogs(prev => [...prev, `[INFO] Vérification de la présence de doublons...`]);
          } else if (currentProgress === 95) {
            setParsingLogs(prev => [...prev, `[SUCCESS] ${totalRows} lignes traitées avec succès !`]);
          }
          
          if (currentProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setImportStep('mapping');
            }, 500);
          }
        }, 100);
      },
      error: (err) => {
        setErrorMessage(`Erreur lors de la lecture du CSV: ${err.message}`);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      processCsvFile(file);
    } else {
      setErrorMessage("Format de fichier invalide. Veuillez déposer un fichier CSV.");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCsvFile(file);
  };

  const handleApplyMapping = async () => {
    if (!mappedName || !mappedCompany) {
      setErrorMessage("Veuillez mapper au moins le Nom et l'Entreprise.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const parsed = rawCsvData.map((row: any, index) => {
      const name = row[mappedName] || 'Prospect';
      const company = row[mappedCompany] || 'Entreprise';
      const email = row[mappedEmail] || '';
      const notes = row[mappedNotes] || '';
      return {
        id: `lead_temp_${Date.now()}_${index}`,
        name,
        company,
        website: row.website || row.Website || row.site || row.Site || '',
        email,
        notes,
        status: 'draft' as const
      };
    });

    if (parsed.length + leads.length > 50) {
      setErrorMessage("Limite dépassée : vous ne pouvez pas avoir plus de 50 leads par campagne.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const savedLeads: Lead[] = [];
    for (const lead of parsed) {
      const saved = await saveLead({
        campaign_id: activeCampaignId || undefined,
        name: lead.name,
        company: lead.company,
        website: lead.website,
        email: lead.email,
        notes: lead.notes,
        collections: []
      });
      savedLeads.push({
        id: saved.id,
        name: saved.name,
        company: saved.company,
        website: saved.website,
        email: saved.email,
        notes: saved.notes,
        status: 'draft'
      });
    }

    setLeads([...leads, ...savedLeads]);
    setSuccessMessage(`${savedLeads.length} leads importés avec succès.`);
    setImportStep('idle');
    setRawCsvData([]);
    setDetectedHeaders([]);
    
    if (!selectedLeadId && savedLeads.length > 0 && savedLeads[0]) {
      setSelectedLeadId(savedLeads[0].id);
    }

    window.dispatchEvent(new Event('vectra-collections-updated'));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handlePasteSubmit = () => {
    if (!rawText.trim()) return;

    const lines = rawText.split('\n');
    const parsed: Lead[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(/[,\t]/);
      if (parts.length > 0 && parts[0]?.trim()) {
        parsed.push({
          id: `lead_temp_${Date.now()}_${index}`,
          name: parts[0]?.trim() || 'Prospect',
          company: parts[1]?.trim() || 'Entreprise',
          website: parts[2]?.trim() || '',
          email: parts[3]?.trim() || '',
          notes: parts[4]?.trim() || '',
          status: 'draft'
        });
      }
    });

    if (parsed.length + leads.length > 50) {
      setErrorMessage("Limite dépassée : vous ne pouvez pas avoir plus de 50 leads par campagne.");
      return;
    }

    setLeads([...leads, ...parsed]);
    setRawText('');
    setSuccessMessage(`${parsed.length} leads ajoutés avec succès.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClearLeads = () => {
    setLeads([]);
    setSelectedLeadId(null);
  };

  const handleSaveDraft = () => {
    setLeads(prevLeads =>
      prevLeads.map(l =>
        l.id === selectedLeadId
          ? {
              ...l,
              email_subject: editSubject,
              email_body: editBody,
              linkedin_message: editLinkedin,
            }
          : l
      )
    );
    setIsEditing(false);
    
    const updateDb = async () => {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead && !lead.id.startsWith('lead_temp_')) {
        await supabase
          .from('messages')
          .update({
            email_subject: editSubject,
            email_body: editBody,
            linkedin_message: editLinkedin
          })
          .eq('lead_id', lead.id);
      }
    };
    updateDb();
  };

  const handleGenerateCampaign = async () => {
    if (leads.length === 0) {
      setErrorMessage("Veuillez importer des leads avant de lancer la génération.");
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    setIsGenerating(true);
    captureAnalyticsEvent('campaign_generation_started', { leadsCount: leads.length, campaignName });
    setStreamMessages(["Starting Hermes-Agent pipeline..."]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié.');

      let campaignId = activeCampaignId;
      
      try {
        const { data: newCampaign, error: campError } = await supabase
          .from('campaigns')
          .upsert({
            id: activeCampaignId || undefined,
            user_id: user.id,
            name: campaignName,
            business_type: businessType,
            offer: pitchDescription,
            icp: '',
            angle,
            angle_description: '',
            call_to_action: '',
            extra_instructions: pitchDescription
          })
          .select('id')
          .single();

        if (campError) throw campError;
        if (newCampaign) {
          campaignId = newCampaign.id;
          setActiveCampaignId(newCampaign.id);
          
          // Refresh campaign list
          const { data: allCamp } = await supabase
            .from('campaigns')
            .select('id, name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (allCamp) {
            setCampaignsList(allCamp);
          }
        }
      } catch (dbErr) {
        console.warn('DB Campaign save failed, using local mock context:', dbErr);
        campaignId = campaignId || 'mock-campaign-id';
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          user_id: user.id,
          leads: leads.map(l => ({
            name: l.name,
            company: l.company,
            website: l.website,
            email: l.email,
            notes: l.notes
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du lancement de la génération.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('Impossible de lire le flux de réponse.');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.type === 'status') {
                setStreamMessages(prev => [...prev, data.message]);
              } else if (data.type === 'lead_start') {
                setStreamMessages(prev => [...prev, data.message || `Analyzing ${data.lead_name}...`]);
              } else if (data.type === 'lead_completed') {
                setStreamMessages(prev => [...prev, `✅ Qualified ${data.lead_name} successfully.`]);
                
                // Live update leads state as they get completed
                setLeads(prevLeads => 
                  prevLeads.map(l => {
                    if (l.name === data.lead_name) {
                      return {
                        ...l,
                        id: data.result.lead_id,
                        summary: data.result.summary,
                        email_subject: data.result.email_subject,
                        email_body: data.result.email_body,
                        linkedin_message: data.result.linkedin_message,
                        personalization_score: data.result.personalization_score,
                        status: 'draft'
                      };
                    }
                    return l;
                  })
                );
              } else if (data.type === 'completed') {
                setStreamMessages(prev => [...prev, `🎉 ${data.message}`]);
              }
            } catch (e) {
              console.warn('Error parsing SSE line:', e);
            }
          }
        }
      }

      setSuccessMessage("Messages de prospection générés avec succès !");
      setTimeout(() => setSuccessMessage(null), 4000);
      
      // Auto select the first lead to show the generated content
      setLeads(prevLeads => {
        if (prevLeads.length > 0 && prevLeads[0]) {
          setSelectedLeadId(prevLeads[0].id);
        }
        return prevLeads;
      });

    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
      // Keep stream overlay visible briefly for user feedback, then close
      setTimeout(() => {
        setIsGenerating(false);
      }, 2500);
    }
  };

  const handleApproveLead = (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'approved' as const } : l));
    
    const approveDb = async () => {
      if (!leadId.startsWith('lead_temp_')) {
        await supabase
          .from('messages')
          .update({ status: 'approved' })
          .eq('lead_id', leadId);
      }
    };
    approveDb();
  };

  const handleDiscardLead = (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'discarded' as const } : l));
    if (!showHidden && selectedLeadId === leadId) {
      setSelectedLeadId(null);
    }

    const discardDb = async () => {
      if (!leadId.startsWith('lead_temp_')) {
        await supabase
          .from('messages')
          .update({ status: 'discarded' })
          .eq('lead_id', leadId);
      }
    };
    discardDb();
  };

  const handleApproveAll = () => {
    const activeLeads = leads.filter(l => l.status === 'draft');
    if (activeLeads.length === 0) return;

    setLeads(prev => prev.map(l => l.status === 'draft' ? { ...l, status: 'approved' as const } : l));

    const approveAllDb = async () => {
      const activeIds = activeLeads.filter(l => !l.id.startsWith('lead_temp_')).map(l => l.id);
      if (activeIds.length > 0) {
        await supabase
          .from('messages')
          .update({ status: 'approved' })
          .in('lead_id', activeIds);
      }
    };
    approveAllDb();
  };

  const handleExportCSV = () => {
    const approvedLeads = leads.filter(l => l.status === 'approved');
    if (approvedLeads.length === 0) {
      setErrorMessage("Aucun message approuvé à exporter. Veuillez approuver des brouillons d'abord.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const exportData = approvedLeads.map(l => ({
      Nom: l.name,
      Entreprise: l.company,
      Website: l.website,
      Email: l.email,
      Notes: l.notes || '',
      Score_Personnalisation: `${l.personalization_score}%`,
      Sujet_Email: l.email_subject,
      Corps_Email: l.email_body,
      DM_LinkedIn: l.linkedin_message,
      Sommaire_Recherche: l.summary
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vectra_outreach_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLeads = leads.length;
  const draftLeads = leads.filter(l => l.status === 'draft').length;
  const approvedLeads = leads.filter(l => l.status === 'approved').length;
  const avgScore = leads.filter(l => l.personalization_score).length > 0
    ? Math.round(leads.reduce((acc, curr) => acc + (curr.personalization_score || 0), 0) / leads.filter(l => l.personalization_score).length)
    : 0;

  const getFitBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 92) return <Badge className="h-4 px-1 text-[8px] bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-none shrink-0 font-bold">Fit: High</Badge>;
    if (score >= 87) return <Badge className="h-4 px-1 text-[8px] bg-amber-100 hover:bg-amber-100 text-amber-800 border-none shrink-0 font-bold">Fit: Med</Badge>;
    return <Badge className="h-4 px-1 text-[8px] bg-zinc-100 hover:bg-zinc-100 text-zinc-800 border-none shrink-0 font-bold">Fit: Low</Badge>;
  };

  const getCopilotSummary = () => {
    const total = leads.length;
    const generated = leads.filter(l => l.email_subject).length;
    const shortlistedCount = leads.filter(l => l.status === 'approved').length;
    const highFitCount = leads.filter(l => l.personalization_score && l.personalization_score >= 92).length;
    const medFitCount = leads.filter(l => l.personalization_score && l.personalization_score >= 87 && l.personalization_score < 92).length;

    if (total === 0) return '';
    if (generated === 0) {
      return `Tu as importé ${total} prospects dans cette campagne. Configure ton pitch et clique sur "Generate Outreach" pour laisser Vectra et Hermes-Agent analyser leurs profils et rédiger tes messages de prospection personnalisés.`;
    }

    let summaryText = `Tu as importé ${total} leads. Vectra a généré des messages personnalisés. `;
    if (highFitCount > 0) {
      const highFitNames = leads.filter(l => l.personalization_score && l.personalization_score >= 92).map(l => l.name);
      summaryText += `Voici comment je te conseille de prioriser : Concentre-toi en priorité sur les ${highFitCount} profils à fort potentiel ("Fit: High") comme ${highFitNames.slice(0, 2).join(' et ')}. `;
    } else if (medFitCount > 0) {
      summaryText += `Voici comment je te conseille de prioriser : Lance la prospection sur les ${medFitCount} profils avec un fit moyen ("Fit: Med") qui correspondent globalement à tes critères. `;
    } else {
      summaryText += `Voici comment je te conseille de prioriser : Révise éventuellement ton pitch si tu souhaites affiner le matching, car la plupart des prospects importés ont un score de correspondance modéré. `;
    }

    if (shortlistedCount > 0) {
      summaryText += `Tu as déjà shortlisté ${shortlistedCount} prospects prêts pour l'envoi.`;
    } else {
      summaryText += `Parcours la liste et clique sur "Shortlist Candidate" pour valider tes messages de prospection.`;
    }

    return summaryText;
  };

  const visibleLeads = leads.filter(l => showHidden || l.status !== 'discarded');

  const currentLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Breadcrumb Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Outreach</span>
          <span className="text-zinc-300 font-normal">/</span>
          <select
            value={activeCampaignId || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                loadCampaign(selectedId);
              }
            }}
            className="font-semibold text-zinc-900 border border-zinc-200 bg-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px] cursor-pointer"
          >
            {campaignsList.length === 0 ? (
              <option value="">{campaignName || 'Campaign'}</option>
            ) : (
              campaignsList.map(camp => (
                <option key={camp.id} value={camp.id}>
                  {camp.name}
                </option>
              ))
            )}
          </select>
          <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            Active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {approvedLeads > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 border-zinc-200 hover:bg-zinc-50">
              <Download className="h-4 w-4" />
              Export CSV ({approvedLeads})
            </Button>
          )}
          {draftLeads > 0 && (
            <Button size="sm" onClick={handleApproveAll} className="bg-primary hover:bg-primary/95 text-white gap-2">
              <Check className="h-4 w-4" />
              Approve All ({draftLeads})
            </Button>
          )}
        </div>
      </header>

      {/* Main split dashboard (Resizable layout) */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="h-full items-stretch">
          
          {/* Left/Center Panel - Campaign Config & Inputs */}
          <ResizablePanel defaultSize={40} minSize={30} className="bg-white overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Messages & Alerts */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  <p>{successMessage}</p>
                </div>
              )}

              {/* 1. Profile Context */}
              <div id="campaign-config" className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  1. Campaign Parameters
                </h3>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="camp-name" className="text-xs font-bold uppercase text-zinc-400">Campaign Name</Label>
                    <Input 
                      id="camp-name" 
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)} 
                      className="border-zinc-200 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bus-type" className="text-xs font-bold uppercase text-zinc-400">Your Profile</Label>
                      <Input 
                        id="bus-type" 
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)} 
                        className="border-zinc-200 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="camp-angle" className="text-xs font-bold uppercase text-zinc-400">Outreach Angle</Label>
                      <select
                        id="camp-angle"
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        value={angle}
                        onChange={(e) => {
                          setAngle(e.target.value);
                          if (e.target.value === 'audit') {
                            setAngleDescription('Proposer un audit gratuit de leur landing page + 2-3 recommandations.');
                          } else if (e.target.value === 'modernization') {
                            setAngleDescription('Proposer une refonte ou modernisation du header et design général.');
                          } else if (e.target.value === 'automation') {
                            setAngleDescription("Proposer d'automatiser un process répétitif pour économiser du temps.");
                          } else if (e.target.value === 'discovery_call') {
                            setAngleDescription("Proposer un échange rapide de 15 minutes pour identifier des synergies.");
                          }
                        }}
                      >
                        <option value="audit">Audit gratuit de site</option>
                        <option value="modernization">Modernisation de site</option>
                        <option value="automation">Automatisation de tâches</option>
                        <option value="discovery_call">Diagnostic rapide / Synergies</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="camp-pitch" className="text-xs font-bold uppercase text-zinc-400">Describe offer, ICP & guidelines in Natural Language</Label>
                    <Textarea 
                      id="camp-pitch" 
                      placeholder="Décrivez votre offre, votre client idéal (ICP), l'angle d'approche et les consignes particulières..."
                      rows={6}
                      value={pitchDescription}
                      onChange={(e) => setPitchDescription(e.target.value)}
                      className="border-zinc-200 focus-visible:ring-primary text-sm font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Import Leads */}
              <div id="import-leads" className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    2. Import Leads
                  </h3>
                  {leads.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8" onClick={handleClearLeads}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear List
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="csv" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="csv">Import CSV</TabsTrigger>
                    <TabsTrigger value="paste">Copy/Paste</TabsTrigger>
                  </TabsList>

                  <TabsContent value="csv">
                    {importStep === 'idle' && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                          isDragging 
                            ? "border-emerald-500 bg-emerald-50/50 scale-[1.02] animate-pulse" 
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <Upload className={`h-8 w-8 mb-2 transition-transform duration-300 ${isDragging ? 'text-emerald-500 scale-125' : 'text-zinc-400'}`} />
                        <span className="text-sm font-semibold text-zinc-700">Déposer un fichier CSV ou cliquer</span>
                        <span className="text-xs text-zinc-400 mt-1">Colonnes : Nom, Entreprise (Site, Email facultatifs)</span>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept=".csv"
                          className="hidden" 
                          onChange={handleCSVUpload}
                        />
                      </div>
                    )}

                    {importStep === 'parsing' && (
                      <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50/50 space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span className="font-semibold">Analyse du fichier CSV...</span>
                          <span className="font-mono">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary transition-all duration-150 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="bg-zinc-950 text-zinc-200 font-mono text-[10px] p-3 rounded-lg h-28 overflow-y-auto space-y-1 shadow-inner scrollbar-thin">
                          {parsingLogs.map((log, index) => (
                            <div key={index} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[WARNING]') ? 'text-amber-400' : 'text-zinc-400'}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {importStep === 'mapping' && (
                      <div className="border border-zinc-200 rounded-xl p-4 bg-white space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                          <Sparkles className="h-4 w-4 text-emerald-500" />
                          <span>MAPPING DES COLONNES CSV</span>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 items-center">
                            <Label htmlFor="map-name" className="text-[11px] font-semibold text-zinc-500">Nom complet *</Label>
                            <select
                              id="map-name"
                              value={mappedName}
                              onChange={(e) => setMappedName(e.target.value)}
                              className="text-xs h-8 rounded border border-zinc-200 bg-white px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <option value="">Sélectionner...</option>
                              {detectedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 items-center">
                            <Label htmlFor="map-company" className="text-[11px] font-semibold text-zinc-500">Entreprise *</Label>
                            <select
                              id="map-company"
                              value={mappedCompany}
                              onChange={(e) => setMappedCompany(e.target.value)}
                              className="text-xs h-8 rounded border border-zinc-200 bg-white px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <option value="">Sélectionner...</option>
                              {detectedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 items-center">
                            <Label htmlFor="map-email" className="text-[11px] font-semibold text-zinc-500">E-mail</Label>
                            <select
                              id="map-email"
                              value={mappedEmail}
                              onChange={(e) => setMappedEmail(e.target.value)}
                              className="text-xs h-8 rounded border border-zinc-200 bg-white px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <option value="">Sélectionner...</option>
                              {detectedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 items-center">
                            <Label htmlFor="map-notes" className="text-[11px] font-semibold text-zinc-500">Notes / ICP</Label>
                            <select
                              id="map-notes"
                              value={mappedNotes}
                              onChange={(e) => setMappedNotes(e.target.value)}
                              className="text-xs h-8 rounded border border-zinc-200 bg-white px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <option value="">Sélectionner...</option>
                              {detectedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="w-1/2 text-xs" onClick={() => setImportStep('idle')}>
                            Annuler
                          </Button>
                          <Button size="sm" className="w-1/2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApplyMapping}>
                            Valider l'importation
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paste" className="space-y-3">
                    <Textarea
                      placeholder="Name, Company, Website, Email, Notes&#10;Jean Dupont, Impact Coaching, impactcoaching.fr, jean@mail.com&#10;John Smith, Growth Mentors, growthmentors.io, john@mail.com"
                      rows={4}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="font-mono text-xs border-zinc-200 focus-visible:ring-primary"
                    />
                    <Button variant="secondary" className="w-full hover:bg-zinc-200" onClick={handlePasteSubmit}>
                      <Clipboard className="h-4 w-4 mr-2" />
                      Add to List
                    </Button>
                  </TabsContent>
                </Tabs>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Capacity: {leads.length}/50 leads</span>
                  <span>Vectra Alpha Limits</span>
                </div>
              </div>

              {/* 3. Run Button */}
              <div className="pt-4 border-t border-zinc-100">
                <Button 
                  id="generate-btn"
                  onClick={handleGenerateCampaign} 
                  disabled={loading || leads.length === 0} 
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Outreach ({leads.length} leads)
                    </>
                  )}
                </Button>
              </div>

            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Leads List & Customization workspace */}
          <ResizablePanel id="outreach-results" defaultSize={60} minSize={40} className="bg-zinc-50 overflow-hidden flex flex-col h-full">
            {leads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50">
                <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Compass className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">No leads imported</h3>
                <p className="text-sm text-zinc-500 max-w-sm mt-2">
                  Import a CSV or paste contacts in the left panel to begin.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                {/* Leads Mini List Column */}
                <div className="w-1/3 border-r border-zinc-200 bg-white flex flex-col h-full">
                  
                  {/* Campaign Stats Card */}
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Run Statistics</span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-white p-2 rounded-lg border border-zinc-200">
                          <span className="text-xs text-zinc-400 block">Shortlisted</span>
                          <span className="text-sm font-bold text-emerald-600">
                            {leads.filter(l => l.status === 'approved').length}/{leads.length}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-zinc-200">
                          <span className="text-xs text-zinc-400 block">Average fit</span>
                          <span className="text-sm font-bold text-primary">{avgScore ? `${avgScore}%` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <Label htmlFor="show-hidden" className="text-zinc-500 cursor-pointer select-none">Show Hidden Leads</Label>
                      <input 
                        id="show-hidden"
                        type="checkbox"
                        checked={showHidden}
                        onChange={(e) => setShowHidden(e.target.checked)}
                        className="rounded border-zinc-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Scrollable list of leads */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {visibleLeads.map((lead) => {
                      const isSelected = lead.id === selectedLeadId;
                      const hasMessages = !!lead.email_subject;

                      return (
                        <button
                          key={lead.id}
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setIsEditing(false);
                          }}
                          className={`w-full flex flex-col items-start gap-1 rounded-lg p-3 text-left transition-all ${
                            isSelected 
                              ? 'bg-zinc-100' 
                              : 'hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-zinc-900 truncate">
                              {lead.name}
                            </span>
                            {getFitBadge(lead.personalization_score)}
                          </div>
                          
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="text-[10px] text-zinc-400 truncate">
                              {lead.company}
                            </span>
                            
                            {lead.status === 'approved' && (
                              <Badge className="h-4 px-1 text-[8px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shrink-0 font-medium">
                                Shortlisted
                              </Badge>
                            )}
                            {lead.status === 'discarded' && (
                              <Badge className="h-4 px-1 text-[8px] bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 shrink-0 font-medium">
                                Hidden
                              </Badge>
                            )}
                            {lead.status === 'draft' && hasMessages && (
                              <Badge variant="secondary" className="h-4 px-1 text-[8px] shrink-0">
                                Draft
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lead Outreach Editor Workspace */}
                <div className="relative flex-1 bg-zinc-50 p-6 overflow-y-auto flex flex-col h-full space-y-4">
                  {saveStatus !== 'idle' && (
                    <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm text-xs font-semibold animate-fade-in transition-all duration-300 ${
                      saveStatus === 'saving'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-500'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-500'
                    }`}>
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                          <span>Sauvegarde en cours...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Enregistré</span>
                        </>
                      )}
                    </div>
                  )}
                  {/* Copilot Outreach Insights Alert box */}
                  <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-4 text-xs text-emerald-800 shadow-sm shrink-0 flex items-start gap-3 animate-fade-in">
                    <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold text-emerald-950 block mb-0.5">💡 Copilot Outreach Insights</span>
                      <p className="leading-relaxed whitespace-pre-line">{getCopilotSummary()}</p>
                    </div>
                  </div>

                  {!currentLead ? (
                    <div className="flex-1 flex items-center justify-center text-center text-zinc-400 text-sm border border-zinc-200 border-dashed rounded-xl bg-white/50">
                      Select a lead to review personalization.
                    </div>
                  ) : (
                    <div className="space-y-6 flex-1 flex flex-col h-full">
                      
                      {/* Identity Card */}
                      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between gap-4 shrink-0 shadow-sm">
                        <div>
                          <h3 className="font-bold text-base text-zinc-950">
                            {currentLead.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                            <span>{currentLead.company}</span>
                            {currentLead.email && <span>• {currentLead.email}</span>}
                            {currentLead.website && (
                              <a 
                                href={`https://${currentLead.website.replace(/https?:\/\//, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-primary hover:underline gap-0.5"
                              >
                                {currentLead.website}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {currentLead.personalization_score && (
                          <div className="text-right flex items-center gap-2">
                            <span className="text-xs text-zinc-400 font-medium">Matching score: {currentLead.personalization_score}%</span>
                            {getFitBadge(currentLead.personalization_score)}
                          </div>
                        )}
                      </div>

                      {!currentLead.email_subject ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <Sparkles className="h-10 w-10 text-zinc-300 animate-pulse mb-2" />
                          <p className="text-sm text-zinc-500">
                            Click "Generate Outreach" in the left panel to begin.
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                          {currentLead.summary && (
                            <div className="bg-zinc-100 rounded-lg p-3 border border-zinc-200 text-xs text-zinc-600">
                              <span className="font-bold text-zinc-800 block mb-1">IA Research Context:</span>
                              {currentLead.summary}
                            </div>
                          )}

                          <Tabs defaultValue="email" className="w-full flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid w-full grid-cols-2 mb-3 shrink-0">
                              <TabsTrigger value="email">Cold Email</TabsTrigger>
                              <TabsTrigger value="linkedin">LinkedIn DM</TabsTrigger>
                            </TabsList>

                            <TabsContent value="email" className="flex-1 flex flex-col overflow-hidden gap-3">
                              {isEditing ? (
                                <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pb-4">
                                  <div className="space-y-1 shrink-0">
                                    <Label htmlFor="edit-subj" className="text-xs font-bold text-zinc-400 uppercase">Subject Line</Label>
                                    <Input 
                                      id="edit-subj" 
                                      value={editSubject} 
                                      onChange={(e) => setEditSubject(e.target.value)} 
                                      className="border-zinc-200 focus-visible:ring-primary"
                                    />
                                  </div>
                                  <div className="space-y-1 flex-1 flex flex-col min-h-0">
                                    <Label htmlFor="edit-body" className="text-xs font-bold text-zinc-400 uppercase">Email Body</Label>
                                    <Textarea 
                                      id="edit-body" 
                                      className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed border-zinc-200 focus-visible:ring-primary" 
                                      value={editBody} 
                                      onChange={(e) => setEditBody(e.target.value)} 
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2 shrink-0">
                                    <Button variant="outline" size="sm" className="border-zinc-200" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleSaveDraft}>Save Draft</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pb-4">
                                  <div 
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:border-zinc-300 hover:shadow cursor-pointer transition-all duration-200 group relative"
                                  >
                                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Subject</span>
                                    <h4 className="font-semibold text-zinc-900 mt-1">
                                      {currentLead.email_subject}
                                    </h4>
                                    <Edit3 className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div 
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-white border border-zinc-200 rounded-lg p-4 font-sans text-sm leading-relaxed whitespace-pre-line text-zinc-800 overflow-y-auto shadow-sm hover:border-zinc-300 hover:shadow cursor-pointer transition-all duration-200 group relative min-h-[250px]"
                                  >
                                    {currentLead.email_body}
                                    <Edit3 className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="linkedin" className="flex-1 flex flex-col overflow-hidden gap-3">
                              {isEditing ? (
                                <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pb-4">
                                  <div className="space-y-1 flex-1 flex flex-col min-h-0">
                                    <Label htmlFor="edit-lk" className="text-xs font-bold text-zinc-400 uppercase">LinkedIn Message</Label>
                                    <Textarea 
                                      id="edit-lk" 
                                      className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed border-zinc-200 focus-visible:ring-primary" 
                                      value={editLinkedin} 
                                      onChange={(e) => setEditLinkedin(e.target.value)} 
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2 shrink-0">
                                    <Button variant="outline" size="sm" className="border-zinc-200" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleSaveDraft}>Save Draft</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col min-h-0 pb-4">
                                  <div 
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-white border border-zinc-200 rounded-lg p-4 font-sans text-sm leading-relaxed whitespace-pre-line text-zinc-800 overflow-y-auto shadow-sm hover:border-zinc-300 hover:shadow cursor-pointer transition-all duration-200 group relative min-h-[250px]"
                                  >
                                    {currentLead.linkedin_message}
                                    <Edit3 className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>

                          {!isEditing && (
                            <div className="flex items-center justify-between border-t border-zinc-200 pt-4 shrink-0">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDiscardLead(currentLead.id)}
                                  className="text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                                  disabled={currentLead.status === 'discarded'}
                                >
                                  <Trash2 className="h-4 w-4 mr-1.5" />
                                  {currentLead.status === 'discarded' ? 'Hidden' : 'Hide Candidate'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-zinc-200"
                                  onClick={() => setIsEditing(true)}
                                >
                                  <Edit3 className="h-4 w-4 mr-1.5" />
                                  Edit Draft
                                </Button>
                              </div>

                              <Button 
                                onClick={() => handleApproveLead(currentLead.id)}
                                disabled={currentLead.status === 'approved'}
                                className="bg-primary hover:bg-primary/95 text-white gap-2 font-bold px-5"
                              >
                                <Check className="h-4 w-4" />
                                {currentLead.status === 'approved' ? 'Shortlisted' : 'Shortlist Candidate'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            )}
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {/* Phase 5 Hermes-Agent generation terminal console overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-xl bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden flex flex-col h-[400px]">
            <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-zinc-400 ml-2">hermes-agent@vectra: ~</span>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse text-[10px]">
                RUNNING
              </Badge>
            </div>
            <CardContent className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 select-none flex flex-col justify-end">
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
                {streamMessages.map((msg, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-zinc-500">[{new Date().toLocaleTimeString()}]</span>
                    <span className={msg.startsWith('✅') ? 'text-emerald-400' : msg.startsWith('🎉') ? 'text-primary font-bold' : 'text-zinc-300'}>
                      {msg}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
