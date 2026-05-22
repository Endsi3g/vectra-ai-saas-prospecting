import { BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development' || !require('electron').app.isPackaged
const WEB_URL = isDev
  ? process.env.VITE_WEB_URL || 'http://localhost:3000'
  : process.env.VECTRA_WEB_URL || 'https://vectra.yourdomain.com'

let overlayWindow: BrowserWindow | null = null

export function setupOverlay(_mainWindow: BrowserWindow): void {
  ipcMain.on('overlay:open', (_event, leadId: string) => openOverlayWindow(leadId))
  ipcMain.on('overlay:close', () => closeOverlay())
  ipcMain.on('overlay:toggle', (_event, leadId: string) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      closeOverlay()
    } else {
      openOverlayWindow(leadId)
    }
  })
}

function openOverlayWindow(leadId: string): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.focus()
    return
  }

  const { workAreaSize } = screen.getPrimaryDisplay()
  const width = 320
  const height = 220
  const margin = 20

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: workAreaSize.width - width - margin,
    y: workAreaSize.height - height - margin,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  overlayWindow.setIgnoreMouseEvents(false)
  overlayWindow.loadURL(`${WEB_URL}/electron/overlay?leadId=${encodeURIComponent(leadId)}`)

  overlayWindow.once('ready-to-show', () => {
    overlayWindow?.setOpacity(0.92)
    overlayWindow?.show()
  })

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })
}

function closeOverlay(): void {
  overlayWindow?.close()
  overlayWindow = null
}
