"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose a safe API surface to the renderer (web app)
electron_1.contextBridge.exposeInMainWorld('electron', {
    // Auth
    saveToken: (token) => electron_1.ipcRenderer.invoke('auth:save-token', token),
    loadToken: () => electron_1.ipcRenderer.invoke('auth:get-token'),
    clearToken: () => electron_1.ipcRenderer.invoke('auth:clear-token'),
    // Window controls (Windows titlebar)
    minimize: () => electron_1.ipcRenderer.send('window:minimize'),
    maximize: () => electron_1.ipcRenderer.send('window:maximize'),
    close: () => electron_1.ipcRenderer.send('window:close'),
    // External links
    openExternal: (url) => electron_1.ipcRenderer.send('shell:open-external', url),
    // Spotlight
    openSpotlight: () => electron_1.ipcRenderer.send('spotlight:open'),
    closeSpotlight: () => electron_1.ipcRenderer.send('spotlight:close'),
    // Overlay
    openOverlay: (leadId) => electron_1.ipcRenderer.send('overlay:open', leadId),
    closeOverlay: () => electron_1.ipcRenderer.send('overlay:close'),
    toggleOverlay: (leadId) => electron_1.ipcRenderer.send('overlay:toggle', leadId),
    // LinkedIn capture
    captureLinkedIn: () => electron_1.ipcRenderer.invoke('linkedin:capture'),
    // PDF drag-drop
    extractPdf: (filePath) => electron_1.ipcRenderer.invoke('pdf:extract-lead', filePath),
    notifyPdfDropped: (paths) => electron_1.ipcRenderer.send('pdf:dropped', paths),
    // Import (Notion / Sheets / Airtable)
    importFromSource: (source) => electron_1.ipcRenderer.invoke('import:from-source', source),
    // Contacts sync
    syncAppleMail: () => electron_1.ipcRenderer.invoke('contacts:sync-apple-mail'),
    syncOutlook: () => electron_1.ipcRenderer.invoke('contacts:sync-outlook'),
    // Listen to events from main process
    on: (channel, listener) => {
        const validChannels = [
            'linkedin:capture-result',
            'pdf:lead-extracted',
            'import:complete',
            'contacts:sync-result',
            'spotlight:open',
            'electron-token',
        ];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, (_event, ...args) => listener(...args));
        }
    },
    off: (channel, listener) => {
        electron_1.ipcRenderer.removeListener(channel, listener);
    },
    // Platform info
    platform: process.platform,
    isElectron: true,
});
