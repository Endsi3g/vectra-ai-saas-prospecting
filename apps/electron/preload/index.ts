import { contextBridge, ipcRenderer } from 'electron'

// Expose a safe API surface to the renderer (web app)
contextBridge.exposeInMainWorld('electron', {
  // Auth
  saveToken: (token: string) => ipcRenderer.invoke('auth:save-token', token),
  loadToken: () => ipcRenderer.invoke('auth:get-token'),
  clearToken: () => ipcRenderer.invoke('auth:clear-token'),

  // Window controls (Windows titlebar)
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // External links
  openExternal: (url: string) => ipcRenderer.send('shell:open-external', url),

  // Spotlight
  openSpotlight: () => ipcRenderer.send('spotlight:open'),
  closeSpotlight: () => ipcRenderer.send('spotlight:close'),

  // Overlay
  openOverlay: (leadId: string) => ipcRenderer.send('overlay:open', leadId),
  closeOverlay: () => ipcRenderer.send('overlay:close'),
  toggleOverlay: (leadId: string) => ipcRenderer.send('overlay:toggle', leadId),

  // LinkedIn capture
  captureLinkedIn: () => ipcRenderer.invoke('linkedin:capture'),

  // PDF drag-drop
  extractPdf: (filePath: string) => ipcRenderer.invoke('pdf:extract-lead', filePath),
  notifyPdfDropped: (paths: string[]) => ipcRenderer.send('pdf:dropped', paths),

  // Import (Notion / Sheets / Airtable)
  importFromSource: (source: { type: string; url: string }) =>
    ipcRenderer.invoke('import:from-source', source),

  // Contacts sync
  syncAppleMail: () => ipcRenderer.invoke('contacts:sync-apple-mail'),
  syncOutlook: () => ipcRenderer.invoke('contacts:sync-outlook'),

  // Listen to events from main process
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    const validChannels = [
      'linkedin:capture-result',
      'pdf:lead-extracted',
      'import:complete',
      'contacts:sync-result',
      'spotlight:open',
      'electron-token',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => listener(...args))
    }
  },
  off: (channel: string, listener: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, listener)
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
})
