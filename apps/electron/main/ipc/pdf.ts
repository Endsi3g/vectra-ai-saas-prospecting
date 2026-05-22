import { BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

export function setupPdfImport(mainWindow: BrowserWindow): void {
  ipcMain.handle('pdf:extract-lead', async (_event, filePath: string) => {
    try {
      if (!filePath.toLowerCase().endsWith('.pdf')) {
        return { success: false, error: 'Le fichier doit être un PDF.' }
      }

      const buffer = fs.readFileSync(filePath)
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(buffer)
      const text = parsed.text

      const siteUrl = process.env.VECTRA_WEB_URL || 'http://localhost:3000'
      const resp = await fetch(`${siteUrl}/api/leads/extract-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!resp.ok) throw new Error(`LLM extraction error: ${resp.status}`)
      const lead = (await resp.json()) as Record<string, string>

      mainWindow.webContents.send('pdf:lead-extracted', lead)
      return { success: true, data: lead }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  })

  // Listen for file drag-drop from renderer
  ipcMain.on('pdf:dropped', async (_event, filePaths: string[]) => {
    const pdfPath = filePaths.find((p) => p.toLowerCase().endsWith('.pdf'))
    if (pdfPath) {
      const result = await ipcMain.emit('pdf:extract-lead', null, pdfPath)
      void result
    }
  })
}
