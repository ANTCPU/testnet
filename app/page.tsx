"use client"

import { useState, useEffect } from "react"

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  return "Just now"
}

function memberDuration(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  if (years > 0) return `${years} year${years > 1 ? "s" : ""}`
  if (months > 0) return `${months} month${months > 1 ? "s" : ""}`
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`
  return "Today"
}

function memberTier(dateString: string) {
  const days = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days >= 365) return { label: "Pioneer", color: "#FFD700", icon: "🏆" }
  if (days >= 180) return { label: "Builder", color: "#C0C0C0", icon: "🔨" }
  if (days >= 90) return { label: "Explorer", color: "#CD7F32", icon: "🧭" }
  if (days >= 30) return { label: "Member", color: "#7B3FE4", icon: "⭐" }
  return { label: "Newcomer", color: "#3f8fe4", icon: "🌱" }
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string>("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [txCount, setTxCount] = useState<number>(0)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://sdk.minepi.com/pi-sdk.js"
    script.async = true
    script.onload = () => {
      const Pi = (window as any).Pi
      Pi.init({ version: "2.0", sandbox: true })
      setStatus("Pi SDK ready — Sandbox mode")
    }
    document.head.appendChild(script)
  }, [])

  async function fetchUserData(uid: string) {
    try {
      // Fetch session info
      const sessionRes = await fetch("/api/sessions")
      const sessionData = await sessionRes.json()
      const mySession = sessionData.sessions?.find((s: any) => s.userId === uid)
      if (mySession) setSessionInfo(mySession)

      // Fetch transaction count
      const txRes = await fetch(`/api/transactions?userId=${uid}`)
      const txData = await txRes.json()
      if (txData.total !== undefined) setTxCount(txData.total)
    } catch (err) {
      console.error("Failed to fetch user data:", err)
    }
  }

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
          await fetchUserData(auth.user.uid)
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
            setTxCount((prev) => prev + 1)
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
    setSessionInfo(null)
    setTxCount(0)
    setStatus("Logged out.")
  }

  const tier = sessionInfo ? memberTier(sessionInfo.connectedAt) : null

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

        {/* Logo */}
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
          color: "white",
          fontWeight: "bold",
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
          background: "rgba(255,152,0,0.15)",
          color: "#ffb74d",
          border: "1px solid rgba(255,152,0,0.3)",
        }}>
          ⚠ Sandbox Mode
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
            }}
          >
            {loading ? "Connecting..." : "Login with Pi"}
          </button>
        )}

        {/* Logged in state */}
        {user && (
          <div>

            {/* User profile card */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "20px",
              marginBottom: 20,
              textAlign: "left",
            }}>
              {/* Username and tier */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ color: "#81c784", fontWeight: 700, margin: 0, fontSize: 16 }}>
                    @{user.username}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.3)", margin: "2px 0 0", fontSize: 12 }}>
                    Pi Network User
                  </p>
                </div>
                {tier && (
                  <div style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background: `${tier.color}22`,
                    color: tier.color,
                    border: `1px solid ${tier.color}44`,
                  }}>
                    {tier.icon} {tier.label}
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <p style={{ color: "#7B3FE4", fontWeight: 700, margin: 0, fontSize: 18 }}>
                    {txCount}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontSize: 10 }}>
                    Transactions
                  </p>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <p style={{ color: "#3f8fe4", fontWeight: 700, margin: 0, fontSize: 18 }}>
                    {sessionInfo ? memberDuration(sessionInfo.connectedAt) : "—"}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontSize: 10 }}>
                    Member For
                  </p>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <p style={{ color: "#ffb74d", fontWeight: 700, margin: 0, fontSize: 14 }}>
                    {sessionInfo ? timeAgo(sessionInfo.lastActiveAt) : "—"}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontSize: 10 }}>
                    Last Active
                  </p>
                </div>
              </div>
            </div>

            {/* Payment button */}
            <button
              onClick={handleTestPayment}
              disabled={loading}
              style={{
                background: loading
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.06)",
                color: loading ? "rgba(255,255,255,0.2)" : "white",
                border: "1px solid rgba(123,63,228,0.6)",
                borderRadius: 12,
                padding: "16px 32px",
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                marginBottom: 10,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Processing..." : "Send Testnet Payment (0.001 π)"}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "10px 32px",
                fontSize: 13,
                cursor: "pointer",
                width: "100%",
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
              : "rgba(255,255,255,0.04)",
            border: status.startsWith("✓")
              ? "1px solid rgba(76,175,80,0.3)"
              : status.includes("failed") || status.includes("error") || status.includes("Error")
              ? "1px solid rgba(244,67,54,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            fontSize: 13,
            color: status.startsWith("✓")
              ? "#81c784"
              : status.includes("failed") || status.includes("error") || status.includes("Error")
              ? "#ef9a9a"
              : "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
          }}>
            {status}
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
          Testnet only — Test Pi has no real value
        </p>

      </div>
    </main>
  )
}
