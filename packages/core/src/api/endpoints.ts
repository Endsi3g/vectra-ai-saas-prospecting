function getBaseUrl(): string {
  if (typeof process !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.EXPO_PUBLIC_SITE_URL ||
      'http://localhost:3000'
    )
  }
  return 'http://localhost:3000'
}

export const API = {
  sourcing: {
    agent: () => `${getBaseUrl()}/api/sourcing/agent`,
  },
  generate: {
    messages: () => `${getBaseUrl()}/api/generate/messages`,
  },
  agents: {
    hermes: () => `${getBaseUrl()}/api/agents/hermes`,
    apollo: () => `${getBaseUrl()}/api/agents/apollo`,
    status: () => `${getBaseUrl()}/api/agents/status`,
  },
  training: {
    chat: () => `${getBaseUrl()}/api/training/chat`,
  },
  activity: {
    log: () => `${getBaseUrl()}/api/activity`,
  },
  notify: {
    push: () => `${getBaseUrl()}/api/notify`,
  },
  auth: {
    callback: () => `${getBaseUrl()}/auth/callback`,
  },
  billing: {
    checkout: () => `${getBaseUrl()}/api/billing/checkout`,
    portal: () => `${getBaseUrl()}/api/billing/portal`,
  },
}
