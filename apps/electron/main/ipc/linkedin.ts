import { BrowserWindow, ipcMain } from 'electron'

export function setupLinkedInCapture(mainWindow: BrowserWindow): void {
  ipcMain.handle('linkedin:capture', async () => {
    try {
      // Dynamic import — screenshot-desktop is an optional native dep
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const screenshot = require('screenshot-desktop') as {
        default: () => Promise<Buffer>
      }
      const imgBuffer: Buffer = await screenshot.default()
      const base64 = imgBuffer.toString('base64')

      // Call the web app's API to run vision LLM extraction
      // We use the web app's /api/leads/extract-linkedin route (to be added)
      const result = await callVisionExtraction(base64)

      // Send result to renderer to open confirmation modal
      mainWindow.webContents.send('linkedin:capture-result', result)
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  })
}

async function callVisionExtraction(imageBase64: string): Promise<Record<string, string>> {
  const siteUrl = process.env.VECTRA_WEB_URL || 'http://localhost:3000'
  const resp = await fetch(`${siteUrl}/api/leads/extract-linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  })
  if (!resp.ok) throw new Error(`Vision API error: ${resp.status}`)
  return resp.json() as Promise<Record<string, string>>
}
