import { BrowserWindow, ipcMain, shell } from 'electron'

export function setupContacts(mainWindow: BrowserWindow): void {
  // On macOS, trigger AppleScript to read contacts from Apple Mail/Contacts
  ipcMain.handle('contacts:sync-apple-mail', async () => {
    if (process.platform !== 'darwin') {
      return { success: false, error: 'Apple Mail sync is only available on macOS.' }
    }
    try {
      const { execSync } = await import('child_process')
      // AppleScript: get recent senders from Apple Mail
      const script = `
        tell application "Mail"
          set contactList to {}
          set theMessages to messages of inbox of account 1
          repeat with m in (items 1 thru (count of theMessages) of theMessages)
            set senderAddr to address of sender of m
            set senderName to name of sender of m
            set end of contactList to (senderName & "|" & senderAddr)
          end repeat
          return contactList
        end tell
      `
      const output = execSync(`osascript -e '${script}'`, { timeout: 10000 }).toString()
      const contacts = output
        .split(', ')
        .map((line) => {
          const [name, email] = line.trim().split('|')
          return { name: name?.trim(), email: email?.trim() }
        })
        .filter((c) => c.email?.includes('@'))
        .slice(0, 50)

      mainWindow.webContents.send('contacts:sync-result', contacts)
      return { success: true, data: contacts }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('contacts:sync-outlook', async () => {
    if (process.platform !== 'win32') {
      return { success: false, error: 'Outlook sync is only available on Windows.' }
    }
    try {
      // PowerShell to get recent Outlook contacts
      const { execSync } = await import('child_process')
      const ps = `
        Add-Type -Assembly "Microsoft.Office.Interop.Outlook"
        $ol = New-Object -ComObject Outlook.Application
        $ns = $ol.GetNameSpace("MAPI")
        $contacts = $ns.GetDefaultFolder(10).Items
        $result = @()
        foreach ($c in $contacts) {
          $result += "$($c.FullName)|$($c.Email1Address)"
        }
        $result[0..49] -join ","
      `
      const output = execSync(`powershell -Command "${ps}"`, { timeout: 15000 }).toString()
      const contacts = output
        .split(',')
        .map((line) => {
          const [name, email] = line.trim().split('|')
          return { name: name?.trim(), email: email?.trim() }
        })
        .filter((c) => c.email?.includes('@'))

      mainWindow.webContents.send('contacts:sync-result', contacts)
      return { success: true, data: contacts }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  })
}
