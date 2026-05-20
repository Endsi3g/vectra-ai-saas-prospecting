'use client';

import React, { useState } from 'react';
import { Upload, Check, RefreshCw } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';

interface UploadZoneProps {
  label: string;
  subtext: string;
  recommended: string;
  fileName: string | null;
  onUpload: () => void;
  onClear: () => void;
}

function UploadZone({ label, subtext, recommended, fileName, onUpload, onClear }: UploadZoneProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      {fileName ? (
        <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-zinc-50 select-none">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#5FC890]" />
            <span className="text-xs font-bold text-zinc-700">{fileName}</span>
          </div>
          <button
            onClick={onClear}
            className="text-[10px] text-red-500 font-bold hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={onUpload}
          className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50/50 hover:border-zinc-300 transition-all cursor-pointer select-none"
        >
          <Upload className="h-5 w-5 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-500 hover:text-zinc-700">Click to upload {label.toLowerCase()}</span>
          <span className="text-[10px] text-zinc-400">{subtext}</span>
        </div>
      )}
    </div>
  );
}

export default function BrandingPage() {
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<string | null>(null);
  const [ogFile, setOgFile] = useState<string | null>(null);

  const [primaryColor, setPrimaryColor] = useState('#5FC890');
  const [secondaryColor, setSecondaryColor] = useState('#4A4A4A');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const simulateUpload = (zone: 'logo' | 'hero' | 'og') => {
    const mockNames = {
      logo: 'logo_vectra_primary.png (124 KB)',
      hero: 'banner_summer_campaign.jpg (1.2 MB)',
      og: 'og_social_preview.png (843 KB)'
    };
    if (zone === 'logo') setLogoFile(mockNames.logo);
    else if (zone === 'hero') setHeroFile(mockNames.hero);
    else if (zone === 'og') setOgFile(mockNames.og);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }, 1000);
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-3xl space-y-8">
        {/* Title Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Branding</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Configure the branded assets and preview for your shared list experience.
          </p>
        </div>

        {/* Section Logo & Uploads */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-2">Branding</h2>

          {/* Logo upload */}
          <UploadZone
            label="Logo"
            subtext="PNG, JPG up to 2MB"
            recommended=""
            fileName={logoFile}
            onUpload={() => simulateUpload('logo')}
            onClear={() => setLogoFile(null)}
          />

          {/* Hero Image upload */}
          <UploadZone
            label="Hero Image"
            subtext="Recommended: 1700x400px"
            recommended="1700x400px"
            fileName={heroFile}
            onUpload={() => simulateUpload('hero')}
            onClear={() => setHeroFile(null)}
          />

          {/* OG Image upload */}
          <UploadZone
            label="OG Image (Social Preview)"
            subtext="Recommended: 1200x630px"
            recommended="1200x630px"
            fileName={ogFile}
            onUpload={() => simulateUpload('og')}
            onClear={() => setOgFile(null)}
          />
        </div>

        {/* Color pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Primary color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Primary Color</label>
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-lg border border-zinc-200 shadow-sm shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 text-xs text-zinc-800 border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-primary uppercase"
              />
            </div>
          </div>

          {/* Secondary color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Secondary Color</label>
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-lg border border-zinc-200 shadow-sm shrink-0"
                style={{ backgroundColor: secondaryColor }}
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

        {/* Save Options */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
          <span className="text-[11px] text-zinc-400 font-medium">
            Ces éléments de marque s'appliqueront aux listes partagées avec vos clients.
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
                Saved
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
