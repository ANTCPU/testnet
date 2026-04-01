import { NextResponse } from 'next/server'
import { fetchAppConfig } from '@/lib/pi/app-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { configUrl } = body
    
    if (!configUrl || typeof configUrl !== 'string') {
      return NextResponse.json(
        { valid: false, errors: ['Config URL is required'] },
        { status: 400 }
      )
    }
    
    const validation = await fetchAppConfig(configUrl)
    
    // Don't expose the full API key in response - just confirm it exists
    if (validation.valid && validation.config) {
      return NextResponse.json({
        valid: true,
        errors: [],
        config: {
          appId: validation.config.appId,
          appName: validation.config.appName || 'Unnamed App',
          sandbox: validation.config.sandbox,
          hasApiKey: true,
          hasWalletAddress: !!validation.config.walletAddress,
        }
      })
    }
    
    return NextResponse.json(validation)
  } catch (error) {
    return NextResponse.json(
      { valid: false, errors: ['Failed to validate config'] },
      { status: 500 }
    )
  }
}
