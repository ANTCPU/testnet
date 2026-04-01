// Developer-hosted config file schema and fetcher
// Developers host this JSON file on their own server

export interface PiAppConfig {
  // Required fields
  appId: string
  apiKey: string
  
  // Optional fields
  appName?: string
  walletAddress?: string
  sandbox?: boolean
  
  // Webhook URLs (optional - defaults to our routes)
  webhooks?: {
    onIncompletePayment?: string
    onPaymentApproved?: string
    onPaymentCompleted?: string
  }
}

export interface ConfigValidation {
  valid: boolean
  errors: string[]
  config?: PiAppConfig
}

/**
 * Example config file that developers should host:
 * 
 * {
 *   "appId": "your-app-id-from-pi-developer-portal",
 *   "apiKey": "your-api-key-from-pi-developer-portal",
 *   "appName": "My Pi App",
 *   "walletAddress": "GXXXX...",
 *   "sandbox": true
 * }
 */

export function validateConfig(data: unknown): ConfigValidation {
  const errors: string[] = []
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Config must be a JSON object'] }
  }
  
  const config = data as Record<string, unknown>
  
  if (!config.appId || typeof config.appId !== 'string') {
    errors.push('Missing or invalid "appId" field')
  }
  
  if (!config.apiKey || typeof config.apiKey !== 'string') {
    errors.push('Missing or invalid "apiKey" field')
  }
  
  if (config.sandbox !== undefined && typeof config.sandbox !== 'boolean') {
    errors.push('"sandbox" must be a boolean')
  }
  
  if (errors.length > 0) {
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    errors: [],
    config: {
      appId: config.appId as string,
      apiKey: config.apiKey as string,
      appName: config.appName as string | undefined,
      walletAddress: config.walletAddress as string | undefined,
      sandbox: (config.sandbox as boolean) ?? true,
      webhooks: config.webhooks as PiAppConfig['webhooks'],
    }
  }
}

// Cache for fetched configs (short TTL to allow updates)
const configCache = new Map<string, { config: PiAppConfig; fetchedAt: number }>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute cache

export async function fetchAppConfig(configUrl: string): Promise<ConfigValidation> {
  try {
    // Check cache first
    const cached = configCache.get(configUrl)
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return { valid: true, errors: [], config: cached.config }
    }
    
    // Validate URL format
    let url: URL
    try {
      url = new URL(configUrl)
    } catch {
      return { valid: false, errors: ['Invalid config URL format'] }
    }
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      return { valid: false, errors: ['Config URL must use HTTPS in production'] }
    }
    
    // Fetch the config
    const response = await fetch(configUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Don't follow too many redirects
      redirect: 'follow',
    })
    
    if (!response.ok) {
      return { 
        valid: false, 
        errors: [`Failed to fetch config: ${response.status} ${response.statusText}`] 
      }
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return { valid: false, errors: ['Config URL must return JSON (application/json)'] }
    }
    
    const data = await response.json()
    const validation = validateConfig(data)
    
    // Cache valid configs
    if (validation.valid && validation.config) {
      configCache.set(configUrl, { 
        config: validation.config, 
        fetchedAt: Date.now() 
      })
    }
    
    return validation
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Failed to fetch config: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    }
  }
}

// Clear a specific config from cache (useful after setup changes)
export function clearConfigCache(configUrl: string) {
  configCache.delete(configUrl)
}

// Clear entire cache
export function clearAllConfigCache() {
  configCache.clear()
}
