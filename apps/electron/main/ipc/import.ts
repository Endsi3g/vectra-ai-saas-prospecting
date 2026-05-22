import { BrowserWindow, ipcMain } from 'electron'

export interface ImportSource {
  type: 'notion' | 'google_sheets' | 'airtable'
  url: string
}

export function setupImport(mainWindow: BrowserWindow): void {
  ipcMain.handle('import:from-source', async (_event, source: ImportSource) => {
    try {
      const siteUrl = process.env.VECTRA_WEB_URL || 'http://localhost:3000'
      const resp = await fetch(`${siteUrl}/api/leads/import-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source),
      })
      if (!resp.ok) throw new Error(`Import error: ${resp.status}`)
      const result = (await resp.json()) as { count: number }
      mainWindow.webContents.send('import:complete', result)
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  })
}
