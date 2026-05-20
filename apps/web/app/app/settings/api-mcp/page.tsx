'use client';

import React, { useState } from 'react';
import { Terminal, Key, Eye, EyeOff, Plus, Check } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export default function ApiMcpPage() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('vt_live_92hf84h74h284h183h0102');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-3xl space-y-8 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">API / MCP Config</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Generate credentials to connect external agents and services
          </p>
        </div>

        {/* Api key block */}
        <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600">
                <Key className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-sm text-zinc-900">API Keys</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-1 hover:bg-zinc-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create key</span>
            </Button>
          </div>

          <div className="border border-zinc-150 rounded-xl divide-y divide-zinc-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-zinc-50/30 text-xs font-bold text-zinc-500">
              <div className="flex items-center gap-4">
                <span>Vectra Live Key</span>
                <span className="font-mono text-zinc-400">
                  {apiKeyVisible ? 'vt_live_92hf84h74h284h183h0102' : '••••••••••••••••••••••••••••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                >
                  {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-[10px] font-bold"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MCP info */}
        <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600">
              <Terminal className="h-4 w-4" />
            </span>
            <h3 className="font-extrabold text-sm text-zinc-900">Model Context Protocol (MCP)</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
            Connect your local IDE agent (like Antigravity or Claude Desktop) directly to your Vectra candidate database using our secure MCP server.
          </p>
          <div className="bg-zinc-950 p-4 rounded-xl font-mono text-[10px] text-zinc-400 select-all max-w-xl">
            npx @vectra-ai/mcp-server --key vt_live_92hf8...
          </div>
        </div>
      </div>
    </div>
  );
}
