'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, RefreshCw, X } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { supabase } from '@/lib/supabase';

interface UploadZoneProps {
  label: string;
  subtext: string;
  fileUrl: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  uploading: boolean;
}

function UploadZone({ label, subtext, fileUrl, onFile, onClear, uploading }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      {fileUrl ? (
        <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-zinc-50 select-none">
          <div className="flex items-center gap-3">
            <img src={fileUrl} alt={label} className="h-10 w-10 rounded-lg object-cover border border-zinc-200" />
            <span className="text-xs font-bold text-zinc-700 truncate max-w-[200px]">{label} uploadé</span>
          </div>
          <button onClick={onClear} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1">
            <X className="h-3 w-3" />
            Supprimer
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50/50 hover:border-zinc-300 transition-all cursor-pointer select-none ${uploading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {uploading ? (
            <RefreshCw className="h-5 w-5 text-zinc-400 animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-zinc-400" />
          )}
          <span className="text-xs font-bold text-zinc-500 hover:text-zinc-700">
            {uploading ? 'Upload en cours...' : `Cliquez pour uploader votre ${label.toLowerCase()}`}
          </span>
          <span className="text-[10px] text-zinc-400">{subtext}</span>
        </div>
      )}
    </div>
  );
}

export default function BrandingPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [ogUrl, setOgUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  const [primaryColor, setPrimaryColor] = useState('#5FC890');
  const [secondaryColor, setSecondaryColor] = useState('#4A4A4A');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('logo_url, agent_config')
        .eq('id', user.id)
        .single();

      if (profile?.logo_url) setLogoUrl(profile.logo_url);
      if (profile?.agent_config?.primary_color) setPrimaryColor(profile.agent_config.primary_color);
      if (profile?.agent_config?.secondary_color) setSecondaryColor(profile.agent_config.secondary_color);
    });
  }, []);

  const uploadFile = async (
    file: File,
    path: string,
    setUrl: (url: string | null) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const filePath = `${user.id}/${path}`;
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('branding').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      if (path === 'logo') {
        await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', user.id);
      }

      setUrl(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Erreur upload. Vérifiez que le bucket "branding" existe dans Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: profile } = await supabase.from('profiles').select('agent_config').eq('id', user.id).single();
      const updatedConfig = {
        ...(profile?.agent_config || {}),
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ agent_config: updatedConfig })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Branding</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Configurez vos assets de marque pour vos listes partagées.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-2">Assets visuels</h2>

          <UploadZone
            label="Logo"
            subtext="PNG, JPG jusqu'à 2 Mo"
            fileUrl={logoUrl}
            uploading={uploadingLogo}
            onFile={(f) => uploadFile(f, 'logo', setLogoUrl, setUploadingLogo)}
            onClear={() => setLogoUrl(null)}
          />

          <UploadZone
            label="Image Hero"
            subtext="Recommandé : 1700x400px"
            fileUrl={heroUrl}
            uploading={uploadingHero}
            onFile={(f) => uploadFile(f, 'hero', setHeroUrl, setUploadingHero)}
            onClear={() => setHeroUrl(null)}
          />

          <UploadZone
            label="OG Image (Aperçu réseaux sociaux)"
            subtext="Recommandé : 1200x630px"
            fileUrl={ogUrl}
            uploading={uploadingOg}
            onFile={(f) => uploadFile(f, 'og', setOgUrl, setUploadingOg)}
            onClear={() => setOgUrl(null)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Couleur principale (Primary Color)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer shrink-0 p-0.5"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 text-xs text-zinc-800 border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-primary uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Couleur secondaire (Secondary Color)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer shrink-0 p-0.5"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 text-xs text-zinc-800 border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-primary uppercase"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
          <span className="text-[11px] text-zinc-400 font-medium">
            Ces éléments s'appliqueront aux listes partagées avec vos clients.
          </span>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-6 bg-[#5FC890] hover:bg-[#4eb67e] text-white text-xs font-bold rounded-lg transition-colors"
          >
            {saving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : success ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-white" />
                Sauvegardé
              </>
            ) : (
              'Sauvegarder'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
