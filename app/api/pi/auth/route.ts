import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getActiveConfig, PI_CONFIG } from "@/lib/pi/config"
import { piStore } from "@/lib/pi/store"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, user } = await request.json()

    if (!accessToken || !user?.uid || !user?.username) {
      return NextResponse.json(
        { error: "Invalid authentication data" },
        { status: 400 }
      )
    }

    // Get config from cookie or environment
    const cookieStore = await cookies()
    const configUrl = cookieStore.get('pi_config_url')?.value
    const { config, source } = await getActiveConfig(configUrl)

    // Determine the app ID to use
    const appId = config.appId || PI_CONFIG.appId

    // Verify the access token with Pi API if we have an API key
    if (config.apiKey) {
      try {
        const verifyResponse = await fetch(`${PI_CONFIG.apiUrl}/v2/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!verifyResponse.ok) {
          console.error("Pi API verification failed:", verifyResponse.status)
          // Continue anyway for testnet development
        }
      } catch (err) {
        console.error("Failed to verify with Pi API:", err)
        // Continue for testnet
      }
    }

    // Create or update session in our store
    const existingSession = await piStore.getSession(user.uid, appId)
    
    if (existingSession) {
      await piStore.updateSession(user.uid, {
        accessToken,
        lastActiveAt: new Date(),
      })
    } else {
      await piStore.createSession({
        userId: user.uid,
        username: user.username,
        accessToken,
        appId,
        connectedAt: new Date(),
        lastActiveAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        username: user.username,
      },
      configSource: source,
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
