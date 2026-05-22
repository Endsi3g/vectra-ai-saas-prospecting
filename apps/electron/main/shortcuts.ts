import { BrowserWindow, globalShortcut, Notification } from 'electron'
import { createBrowserClient } from '@workspace/core/api'
import { openSpotlightWindow } from './ipc/spotlight'

let mainWindowRef: BrowserWindow | null = null

export function registerShortcuts(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow

  // Cmd+Shift+S / Ctrl+Shift+S → Quick sourcing spotlight
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    openSpotlightWindow(mainWindow)
  })

  // Cmd+Shift+L / Ctrl+Shift+L → Show latest leads notification
  globalShortcut.register('CommandOrControl+Shift+L', async () => {
    await showLatestLeads()
  })
}

export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll()
}

async function showLatestLeads(): Promise<void> {
  try {
    const supabase = createBrowserClient()
    const { data: leads } = await supabase
      .from('leads')
      .select('name, company, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!leads || leads.length === 0) {
      new Notification({ title: 'Vectra', body: 'Aucun lead trouvé pour le moment.' }).show()
      return
    }

    const body = leads
      .map((l: { name?: string; company?: string }) => `• ${l.name ?? 'Inconnu'} — ${l.company ?? ''}`)
      .join('\n')

    const n = new Notification({ title: 'Derniers leads', body })
    n.on('click', () => {
      mainWindowRef?.show()
      mainWindowRef?.focus()
    })
    n.show()
  } catch {
    new Notification({ title: 'Vectra', body: 'Impossible de charger les leads.' }).show()
  }
}
