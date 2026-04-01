"use client"

import { useState, useEffect } from "react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://sdk.minepi.com/pi-sdk.js"
    script.async = true
    script.onload = () => {
      const Pi = (window as any).Pi
      Pi.init({ version: "2.0", sandbox: true })
      setStatus("Pi SDK ready")
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
        // Call /api/pi/auth to verify the token server side
        const res = await fetch("/api/pi/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: auth.accessToken }),
        })
        const data = await r
