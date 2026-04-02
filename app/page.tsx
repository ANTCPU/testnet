"use client"

import { useState, useEffect } from "react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string>("")
  const [status, setStatus] = useState("")
  const [isSandbox, setIsSandbox] = useState(true)

  useEffect(() => {
    // Detect if running inside Pi Browser
    const inPiBrowser = /PiBrowser/i.test(navigator.userAgent)
    const sandboxMode = !inPiBrowser
    setIsSandbox(sandboxMode)

    const script = document.createElement("script")
    script.src = "https://sdk.minepi.com/pi-sdk.js"
    script.async = true
    script.onload = () => {
      const Pi = (window as any).Pi
      Pi.init({ version: "2.0", sandbox: sandboxMode })
      setStatus(
        sandboxMode
          ? "Pi SDK ready — Sandbox mode"
          : "Pi SDK ready — Pi Browser mode"
      )
    }
    document.head.appendChild(script)
  }, [])

  function handleLogin() {
    setStatus("Connecting to Pi Network...")

    const Pi = (window as any).Pi

    if (!Pi) {
      setStatus("Pi SDK not found. Please open this app inside the Pi Browser.")
      return
    }

    Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
      .then(async (auth: any) => {
        const res = await fetch("/api/pi/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: auth.accessToken }),
        })
        const data = await res.json()
        if (res.ok) {
          setUser(auth.user)
          setAccessToken(auth.accessToken)
          setStatus("Logged in as @" + auth.user.username)
        } else {
          setStatus("Auth failed: " + (data.error || "Unknown error"))
        }
      })
      .catch((err: any) => {
        setStatus("Login failed: " + err.message)
      })
  }

  async function onIncompletePaymentFound(payment: any) {
    setStatus("Incomplete payment found. Resolving...")
    await fetch("/api/pi/incomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.identifier }),
    })
  }

  function handleTestPayment() {
    setStatus("Initiating payment...")

    const Pi = (window as any).Pi

    Pi.createPayment(
      {
        amount: 0.001,
        memo: "ANTCPU Testnet Transaction",
        metadata: { test: true },
      },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          setStatus("Approving payment...")
          const res = await fetch("/api/pi/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, accessToken }),
          })
          const data = await res.json()
          if (res.ok) {
            setStatus("Payment approved. Waiting for completion...")
          } else {
            setStatus("Approval failed: " + (data.error || "Unknown error"))
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setStatus("Completing payment...")
          const res = await fetch("/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid, accessToken }),
          })
          const data = await res.json()
          if (res.ok) {
            setStatus("✓ Payment complete! TX ID: " + txid)
          } else {
            setStatus("Completion failed: " + (data.error || "Unknown error"))
          }
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

  function handleLogout() {
    fetch("/api/pi/logout", { method: "POST" })
    setUser(null)
    setAccessToken("")
    setStatus("Logged out.")
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>ANTCPU Testnet</h1>
      <p style={{ color: "#888", marginBottom: 8 }}>Pi Network authentication and payment testing</p>

      {/* Environment indicator */}
      <div style={{
        display: "inline-block",
        marginBottom: 32,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: "bold",
        background: isSandbox ? "#fff3e0" : "#e8f5e9",
        color: isSandbox ? "#e65100" : "#2e7d32",
        border: isSandbox ? "1px solid #ffb74d" : "1px solid #66bb6a",
      }}>
        {isSandbox ? "⚠ Sandbox Mode" : "✓ Pi Browser Mode"}
      </div>

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
              marginBottom: 12,
            }}
          >
            Send Testnet Payment (0.001 π)
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "10px 32px",
              fontSize: 14,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Logout
          </button>
        </div>
      )}

      {status && (
        <p style={{
          marginTop: 24,
          padding: 12,
          background: status.startsWith("✓") ? "#e8f5e9" : "#f5f5f5",
          borderRadius: 8,
          fontSize: 14,
          color: status.startsWith("✓") ? "#2e7d32" : "#333",
        }}>
          {status}
        </p>
      )}

      <p style={{ marginTop: 48, fontSize: 12, color: "#bbb" }}>
        Testnet only — Test Pi has no real value
      </p>

    </main>
  )
}
