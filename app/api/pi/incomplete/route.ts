import { NextRequest, NextResponse } from "next/server"
import { PI_SERVER_CONFIG, PI_CONFIG } from "@/lib/pi/config"

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      )
    }

    // Check the payment status with Pi API and handle accordingly
    if (PI_SERVER_CONFIG.apiKey) {
      try {
        const statusResponse = await fetch(
          `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Key ${PI_SERVER_CONFIG.apiKey}`,
            },
          }
        )

        if (statusResponse.ok) {
          const payment = await statusResponse.json()
          
          // If payment is approved but not completed, complete it
          if (
            payment.status.developer_approved &&
            payment.transaction?.txid &&
            !payment.status.developer_completed
          ) {
            await fetch(
              `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}/complete`,
              {
                method: "POST",
                headers: {
                  Authorization: `Key ${PI_SERVER_CONFIG.apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ txid: payment.transaction.txid }),
              }
            )
          }
        }
      } catch (err) {
        console.error("Failed to handle incomplete payment:", err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Incomplete payment handling error:", error)
    return NextResponse.json(
      { error: "Failed to handle incomplete payment" },
      { status: 500 }
    )
  }
}
