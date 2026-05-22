import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import { setupTray } from './tray'
import { registerShortcuts, unregisterShortcuts } from './shortcuts'
import { setupUpdater } from './updater'
import { loadToken, saveToken, clearToken } from './auth'
import { setupLinkedInCapture } from './ipc/linkedin'
import { setupPdfImport } from './ipc/pdf'
import { setupOverlay } from './ipc/overlay'
import { setupSpotlight } from './ipc/spotlight'
import { setupImport } from './ipc/import'
import { setupContacts } from './ipc/contacts'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const WEB_URL = isDev
  ? process.env.VITE_WEB_URL || 'http://localhost:3000'
  : process.env.VECTRA_WEB_URL || 'https://vectra.yourdomain.com'

let mainWindow: BrowserWindow | null = null

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    frame: process.platform === 'darwin',
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    show: false,
  })

  win.loadURL(WEB_URL)

  win.once('ready-to-show', async () => {
    win.show()
    // Inject saved Supabase token so the web app re-hydrates the session
    const token = await loadToken()
    if (token) {
      win.webContents.executeJavaScript(
        `window.__ELECTRON_SUPABASE_TOKEN__ = ${JSON.stringify(token)};
         window.dispatchEvent(new CustomEvent('electron-token', { detail: ${JSON.stringify(token)} }));`
      )
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return win
}

app.whenReady().then(async () => {
  mainWindow = createMainWindow()

  setupTray(mainWindow)
  registerShortcuts(mainWindow)
  setupUpdater()

  // IPC handlers
  setupLinkedInCapture(mainWindow)
  setupPdfImport(mainWindow)
  setupOverlay(mainWindow)
  setupSpotlight(mainWindow)
  setupImport(mainWindow)
  setupContacts(mainWindow)

  // Auth persistence IPC
  ipcMain.handle('auth:save-token', async (_event, token: string) => {
    await saveToken(token)
  })
  ipcMain.handle('auth:clear-token', async () => {
    await clearToken()
  })
  ipcMain.handle('auth:get-token', async () => {
    return await loadToken()
  })

  // Window controls (for frameless on Windows)
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())

  // External link handler
  ipcMain.on('shell:open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('before-quit', () => {
  unregisterShortcuts()
})

app.on('window-all-closed', () => {
  // On macOS, keep the app running in the tray
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
