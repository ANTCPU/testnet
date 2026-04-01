// Pi Network SDK Configuration

export const PI_CONFIG = {
  // SDK Version
  version: "2.0",

  // Sandbox mode for testnet
  sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true",

  // API endpoints
  apiUrl: "https://api.minepi.com",

  // App identifier (set in environment)
  appId: process.env.NEXT_PUBLIC_PI_APP_ID || "pi-infrastructure-demo",

  // Default payment memo
  defaultMemo: "Pi Infrastructure Payment",

  // Default payment amount for testnet
  defaultAmount: 0.01,
} as const

// Server-side only config
export const PI_SERVER_CONFIG = {
  apiKey: process.env.PI_API_KEY || "",
  apiSecret: process.env.PI_API_SECRET || "",
} as const

// Validate required environment variables
export function validatePiConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!process.env.PI_API_KEY) {
    missing.push("PI_API_KEY")
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

// Get config from external URL (for developer-hosted configs)
import { fetchAppConfig, type PiAppConfig } from './app-config'

export async function getExternalConfig(configUrl: string): Promise<{
  config: typeof PI_CONFIG & { apiKey: string }
  source: 'external'
} | null> {
  const result = await fetchAppConfig(configUrl)
  
  if (!result.valid || !result.config) {
    return null
  }
  
  return {
    config: {
      ...PI_CONFIG,
      appId: result.config.appId,
      sandbox: result.config.sandbox ?? true,
      apiKey: result.config.apiKey,
    },
    source: 'external'
  }
}

// Unified config getter - checks external URL first, falls back to env
export async function getActiveConfig(configUrl?: string): Promise<{
  config: typeof PI_CONFIG & { apiKey?: string }
  source: 'external' | 'environment' | 'none'
}> {
  // Try external config first
  if (configUrl) {
    const external = await getExternalConfig(configUrl)
    if (external) {
      return external
    }
  }
  
  // Fall back to environment
  if (PI_SERVER_CONFIG.apiKey) {
    return {
      config: {
        ...PI_CONFIG,
        apiKey: PI_SERVER_CONFIG.apiKey,
      },
      source: 'environment'
    }
  }
  
  return {
    config: PI_CONFIG,
    source: 'none'
  }
}
