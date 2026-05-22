import { BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development' || !require('electron').app.isPackaged
const WEB_URL = isDev
  ? process.env.VITE_WEB_URL || 'http://localhost:3000'
  : process.env.VECTRA_WEB_URL || 'https://vectra.yourdomain.com'

let spotlightWindow: BrowserWindow | null = null

export function setupSpotlight(_mainWindow: BrowserWindow): void {
  ipcMain.on('spotlight:open', () => openSpotlightWindow(_mainWindow))
  ipcMain.on('spotlight:close', () => {
    spotlightWindow?.close()
    spotlightWindow = null
  })
}

export function openSpotlightWindow(_mainWindow: BrowserWindow): void {
  if (spotlightWindow && !spotlightWindow.isDestroyed()) {
    spotlightWindow.focus()
    return
  }

  const { workAreaSize } = screen.getPrimaryDisplay()
  const width = 440
  const height = 320

  spotlightWindow = new BrowserWindow({
    width,
    height,
    x: Math.round((workAreaSize.width - width) / 2),
    y: Math.round(workAreaSize.height * 0.25),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    vibrancy: 'sidebar',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  spotlightWindow.loadURL(`${WEB_URL}/electron/spotlight`)

  spotlightWindow.once('ready-to-show', () => {
    spotlightWindow?.show()
    spotlightWindow?.focus()
  })

  spotlightWindow.on('blur', () => {
    spotlightWindow?.close()
    spotlightWindow = null
  })

  spotlightWindow.on('closed', () => {
    spotlightWindow = null
  })
}
