import { app, BrowserWindow, Menu, Tray, nativeImage, Notification } from 'electron'
import path from 'path'

let tray: Tray | null = null
let agentActive = false

export function setupTray(mainWindow: BrowserWindow): void {
  const iconPath = path.join(__dirname, '../../assets/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  tray.setToolTip('Vectra')

  updateTrayMenu(mainWindow)

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
    }
  })
}

function updateTrayMenu(mainWindow: BrowserWindow): void {
  if (!tray) return

  const menu = Menu.buildFromTemplate([
    {
      label: `Agent: ${agentActive ? '🟢 Actif' : '🔴 Inactif'}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Ouvrir Vectra',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    {
      label: 'Sourcing rapide',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: () => {
        mainWindow.webContents.send('spotlight:open')
      },
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => app.quit(),
    },
  ])

  tray.setContextMenu(menu)
}

export function setAgentStatus(active: boolean, mainWindow: BrowserWindow): void {
  agentActive = active
  updateTrayMenu(mainWindow)

  if (active) {
    sendNotification('Agent Hermes actif', "Hermes est en train de chercher des leads pour toi.")
  }
}

export function notifyNewLeads(count: number): void {
  sendNotification(
    `${count} nouveau${count > 1 ? 'x' : ''} lead${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`,
    'Hermes a trouvé de nouveaux prospects. Ouvre Vectra pour les voir.',
  )
}

function sendNotification(title: string, body: string): void {
  if (!Notification.isSupported()) return
  new Notification({ title, body }).show()
}
