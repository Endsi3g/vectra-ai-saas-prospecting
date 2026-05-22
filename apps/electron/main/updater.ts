import { autoUpdater } from 'electron-updater'
import { dialog, BrowserWindow } from 'electron'

export function setupUpdater(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', async (info) => {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: 'Mise à jour disponible',
      message: `Vectra ${info.version} est disponible. Veux-tu télécharger la mise à jour ?`,
      buttons: ['Télécharger', 'Plus tard'],
      defaultId: 0,
    })
    if (response === 0) {
      autoUpdater.downloadUpdate()
    }
  })

  autoUpdater.on('update-downloaded', async () => {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: 'Prêt à installer',
      message: 'La mise à jour a été téléchargée. Elle sera installée au prochain démarrage.',
      buttons: ['Redémarrer maintenant', 'Plus tard'],
      defaultId: 0,
    })
    if (response === 0) {
      autoUpdater.quitAndInstall()
    }
  })

  autoUpdater.on('error', (err) => {
    console.error('[updater] error:', err.message)
  })

  // Check on startup, then every 4 hours
  autoUpdater.checkForUpdates().catch(() => {})
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 4 * 60 * 60 * 1000)
}
