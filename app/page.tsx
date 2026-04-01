"use client"

import { useState } from "react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState("")

  function handleLogin() {
    setStatus("Connecting to Pi Network...")

    const Pi = (window as any).Pi

    if (!Pi) {
      setStatus("Pi SDK not found. Please open this app inside the Pi Browser.")
      return
    }

    Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
      .then((auth: any) => {
        setUser(auth.user)
        setStatus("Logged in as @" + auth.user.username)
      })
      .catch((err: any) => {
        setStatus("Login failed: " + err.message)
      })
  }

  function onIncompletePaymentFound(payment: any) {
    setStatus("Incomplete payment found. Handling...")
    // You can wire this to your /api/payment/complete route later
    console.log("Incomplete payment:", payment)
  }

  function handleTestPayment() {
    setStatus("Initiating testnet payment...")

    const Pi = (window as any).Pi

    Pi.createPayment(
      {
        amount: 0.001,
        memo: "ANTCPU Testnet Transaction",
        metadata: { test: true },
      },
      {
        onReadyForServerApproval: (paymentId: string) => {
          setStatus("Ready for approval. Payment ID: " + paymentId)
          // Call your /api/payment/approve route here
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          setStatus("Complete! TX ID: " + txid)
          // Call your /api/payment/complete route here
        },
        onCancel: (paymentId: string) => {
          setStatus("Payment cancelled.")
        },
        onError: (error: any) => {
          setStatus("Payment error: " + error.message)
        },
      }
    )
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
      
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>ANTCPU Testnet</h1>
      <p style={{ color: "#888", marginBottom: 40 }}>Pi Network authentication and payment testing</p>

      {/* Step 1 — Login */}
      {!user && (
        <button
          onClick={handleLogin}
          style={{
            background: "#7B3FE4",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 18,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Login with Pi
        </button>
      )}

      {/* Step 2 — Logged in, show transaction button */}
      {user && (
        <div>
          <p style={{ color: "#4CAF50", fontWeight: "bold", marginBottom: 24 }}>
            ✓ Logged in as @{user.username}
          </p>
          <button
            onClick={handleTestPayment}
            style={{
              background: "#1a1a2e",
              color: "white",
              border: "2px solid #7B3FE4",
              borderRadius: 8,
              padding: "14px 32px",
              fontSize: 18,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Send Testnet Payment (0.001 π)
          </button>
        </div>
      )}

      {/* Status message */}
      {status && (
        <p style={{ marginTop: 24, padding: 12, background: "#f5f5f5", borderRadius: 8, fontSize: 14, color: "#333" }}>
          {status}
        </p>
      )}

      <p style={{ marginTop: 48, fontSize: 12, color: "#bbb" }}>
        Testnet only — Test Pi has no real value
      </p>

    </main>
  )
}
