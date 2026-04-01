import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CONFIG_COOKIE_NAME = 'pi_config_url'
const MAX_AGE = 60 * 60 * 24 // 24 hours

export async function GET() {
  const cookieStore = await cookies()
  const configUrl = cookieStore.get(CONFIG_COOKIE_NAME)?.value
  
  return NextResponse.json({ configUrl: configUrl || null })
}

export async function POST(request: NextRequest) {
  try {
    const { configUrl } = await request.json()
    
    const response = NextResponse.json({ success: true })
    
    if (configUrl) {
      response.cookies.set(CONFIG_COOKIE_NAME, configUrl, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: MAX_AGE,
        path: '/',
      })
    } else {
      response.cookies.delete(CONFIG_COOKIE_NAME)
    }
    
    return response
  } catch {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(CONFIG_COOKIE_NAME)
  return response
}
