// keytar stores tokens in the OS credential vault (macOS Keychain / Windows Credential Store)
let keytar: typeof import('keytar') | null = null

async function getKeytar() {
  if (!keytar) {
    try {
      // Dynamic import so TypeScript doesn't error at compile time if keytar isn't installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      keytar = require('keytar') as typeof import('keytar')
    } catch {
      // Fall back silently — token won't persist between restarts
    }
  }
  return keytar
}

const SERVICE = 'vectra'
const ACCOUNT = 'supabase-session'

export async function saveToken(token: string): Promise<void> {
  const kt = await getKeytar()
  if (kt) {
    await kt.setPassword(SERVICE, ACCOUNT, token)
  }
}

export async function loadToken(): Promise<string | null> {
  const kt = await getKeytar()
  if (!kt) return null
  return await kt.getPassword(SERVICE, ACCOUNT)
}

export async function clearToken(): Promise<void> {
  const kt = await getKeytar()
  if (kt) {
    await kt.deletePassword(SERVICE, ACCOUNT)
  }
}
