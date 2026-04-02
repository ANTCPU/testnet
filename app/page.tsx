"use client"

import { useState, useEffect } from "react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string>("")
  const [status, setStatus] = useState("")
  const [isSandbox, setIsSandbox] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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
    setLoading(true)

    const Pi = (window as any).Pi

    if (!Pi) {
      setStatus("Pi SDK not found. Please open this app inside the Pi Browser.")
      setLoading(false)
      return
    }

    Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
      .then(async (auth: any) => {
        const res = await fetch("/api/pi/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: auth.accessToken,
            user: auth.user,
          }),
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
      .finally(() => setLoading(false))
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
    setLoading(true)

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
            setLoading(false)
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
          setLoading(false)
        },
        onCancel: () => {
          setStatus("Payment cancelled.")
          setLoading(false)
        },
        onError: (error: any) => {
          setStatus("Payment error: " + error.message)
          setLoading(false)
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
    <main style={{
      fontFamily: "'Segoe UI', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: "48px 36px",
        maxWidth: 440,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>

        {/* Logo / Title */}
        <div style={{
          width: 64,
          height: 64,
          background: "linear-gradient(135deg, #7B3FE4, #3f8fe4)",
          borderRadius: "50%",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}>
          π
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
          ANTCPU Testnet
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24, fontSize: 14 }}>
          Pi Network authentication and payment testing
        </p>

        {/* Environment badge */}
        <div style={{
          display: "inline-block",
          marginBottom: 32,
          padding: "5px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: isSandbox ? "rgba(255,152,0,0.15)" : "rgba(76,175,80,0.15)",
          color: isSandbox ? "#ffb74d" : "#81c784",
          border: isSandbox ? "1px solid rgba(255,152,0,0.3)" : "1px solid rgba(76,175,80,0.3)",
        }}>
          {isSandbox ? "⚠ Sandbox Mode" : "✓ Pi Browser Mode"}
        </div>

        {/* Login button */}
        {!user && (
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading
                ? "rgba(123,63,228,0.5)"
                : "linear-gradient(135deg, #7B3FE4, #5b2db0)",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 17,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              transition: "all 0.2s",
              letterSpacing: 0.5,
            }}
          >
            {loading ? "Connecting..." : "Login with Pi"}
          </button>
        )}

        {/* Logged in state */}
        {user && (
          <div>
            <div style={{
              background: "rgba(76,175,80,0.1)",
              border: "1px solid rgba(76,175,80,0.3)",
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 20,
            }}>
              <p style={{ color: "#81c784", fontWeight: 600, margin: 0, fontSize: 15 }}>
                ✓ Logged in as @{user.username}
              </p>
            </div>

            <button
              onClick={handleTestPayment}
              disabled={loading}
              style={{
                background: loading
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.08)",
                color: loading ? "rgba(255,255,255,0.3)" : "white",
                border: "1px solid rgba(123,63,228,0.6)",
                borderRadius: 12,
                padding: "16px 32px",
                fontSize: 17,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                marginBottom: 12,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Processing..." : "Send Testnet Payment (0.001 π)"}
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "10px 32px",
                fontSize: 13,
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s",
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Status box */}
        {status && (
          <div style={{
            marginTop: 24,
            padding: "12px 16px",
            background: status.startsWith("✓")
              ? "rgba(76,175,80,0.1)"
              : status.includes("failed") || status.includes("error") || status.includes("Error")
              ? "rgba(244,67,54,0.1)"
              : "rgba(255,255,255,0.05)",
            border: status.startsWith("✓")
              ? "1px solid rgba(76,175,80,0.3)"
              : status.includes("failed") || status.includes("error") || status.includes("Error")
              ? "1px solid rgba(244,67,54,0.3)"
              : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            fontSize: 13,
            color: status.startsWith("✓")
              ? "#81c784"
              : status.includes("failed") || status.includes("error") || status.includes("Error")
              ? "#ef9a9a"
              : "rgba(255,255,255,0.6)",
            lineHeight: 1.5,
          }}>
            {status}
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Testnet only — Test Pi has no real value
        </p>

      </div>
    </main>
  )
}
