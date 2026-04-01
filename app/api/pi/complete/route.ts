import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getActiveConfig, PI_CONFIG } from "@/lib/pi/config"
import { piStore } from "@/lib/pi/store"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, txid, accessToken } = await request.json()

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: "Payment ID and transaction ID are required" },
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

    let paymentData: { amount?: number; memo?: string } = {}

    // Complete the payment with Pi API
    if (config.apiKey) {
      try {
        const completeResponse = await fetch(
          `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}/complete`,
          {
            method: "POST",
            headers: {
              Authorization: `Key ${config.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ txid }),
          }
        )

        if (completeResponse.ok) {
          const data = await completeResponse.json()
          paymentData = {
            amount: data.amount,
            memo: data.memo,
          }
        } else {
          const errorData = await completeResponse.text()
          console.error("Pi API completion failed:", errorData)
        }
      } catch (err) {
        console.error("Failed to complete with Pi API:", err)
      }
    }

    // Update the transaction record
    const existingTxn = await piStore.getTransactionByPaymentId(paymentId)
    if (existingTxn) {
      await piStore.updateTransaction(existingTxn.id, {
        status: "completed",
        txid,
        amount: paymentData.amount || existingTxn.amount,
        memo: paymentData.memo || existingTxn.memo,
        updatedAt: new Date(),
      })
    } else {
      // Create a new transaction record if it doesn't exist
      await piStore.createTransaction({
        paymentId,
        userId: session.userId,
        username: session.username,
        amount: paymentData.amount || 0,
        memo: paymentData.memo || "Payment completed",
        status: "completed",
        appId,
        txid,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Update session activity
    await piStore.updateSession(session.userId, {
      lastActiveAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      paymentId,
      txid,
    })
  } catch (error) {
    console.error("Payment completion error:", error)
    return NextResponse.json(
      { error: "Payment completion failed" },
      { status: 500 }
    )
  }
}
