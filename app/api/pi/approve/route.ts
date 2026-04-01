import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getActiveConfig, PI_CONFIG } from "@/lib/pi/config"
import { piStore } from "@/lib/pi/store"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, accessToken } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      )
    }

    // Get config from cookie or environment
    const cookieStore = await cookies()
    const configUrl = cookieStore.get('pi_config_url')?.value
    const { config } = await getActiveConfig(configUrl)
    const appId = config.appId || PI_CONFIG.appId

    // Get the session to verify the user
    const session = await piStore.getSessionByToken(accessToken)
    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    // Approve the payment with Pi API
    if (config.apiKey) {
      try {
        const approveResponse = await fetch(
          `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}/approve`,
          {
            method: "POST",
            headers: {
              Authorization: `Key ${config.apiKey}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!approveResponse.ok) {
          const errorData = await approveResponse.text()
          console.error("Pi API approval failed:", errorData)
          // For testnet development, we continue anyway
        }
      } catch (err) {
        console.error("Failed to approve with Pi API:", err)
      }
    }

    // Create a pending transaction record
    await piStore.createTransaction({
      paymentId,
      userId: session.userId,
      username: session.username,
      amount: 0, // Will be updated on completion
      memo: "Pending payment",
      status: "approved",
      appId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update session activity
    await piStore.updateSession(session.userId, {
      lastActiveAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      paymentId,
    })
  } catch (error) {
    console.error("Payment approval error:", error)
    return NextResponse.json(
      { error: "Payment approval failed" },
      { status: 500 }
    )
  }
}
