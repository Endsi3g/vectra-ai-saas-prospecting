export function formatDate(dateStr: string | null | undefined, locale = 'fr-FR'): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(dateStr),
  )
}

export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  return formatDate(dateStr)
}

export function truncate(str: string | null | undefined, max = 60): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e' // green-500
  if (score >= 60) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Bon'
  if (score >= 40) return 'Moyen'
  return 'Faible'
}

export function formatCredits(count: number, limit: number): string {
  return `${count.toLocaleString()} / ${limit.toLocaleString()} crédits`
}
