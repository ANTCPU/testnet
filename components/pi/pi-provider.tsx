"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { PI_CONFIG } from "@/lib/pi/config"
import type { PiUser, PiPaymentData } from "@/lib/pi/types"

interface PiContextState {
  // SDK State
  isInitialized: boolean
  isInPiBrowser: boolean

  // Auth State
  user: PiUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isAuthenticating: boolean

  // Actions
  authenticate: () => Promise<void>
  logout: () => void

  // Payment
  createPayment: (
    amount: number,
    memo: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>
  isPaymentPending: boolean

  // Errors
  error: string | null
  clearError: () => void
}

const PiContext = createContext<PiContextState | null>(null)

export function usePi() {
  const context = useContext(PiContext)
  if (!context) {
    throw new Error("usePi must be used within a PiProvider")
  }
  return context
}

interface PiProviderProps {
  children: ReactNode
}

export function PiProvider({ children }: PiProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInPiBrowser, setIsInPiBrowser] = useState(false)
  const [user, setUser] = useState<PiUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isPaymentPending, setIsPaymentPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Pi SDK
  useEffect(() => {
    const initPi = () => {
      if (typeof window !== "undefined" && window.Pi) {
        try {
          window.Pi.init({
            version: PI_CONFIG.version,
            sandbox: PI_CONFIG.sandbox,
          })
          setIsInitialized(true)
          setIsInPiBrowser(true)
        } catch (err) {
          console.error("Failed to initialize Pi SDK:", err)
          setError("Failed to initialize Pi SDK")
        }
      } else {
        setIsInPiBrowser(false)
      }
    }

    // Wait for SDK script to load
    if (document.readyState === "complete") {
      initPi()
    } else {
      window.addEventListener("load", initPi)
      return () => window.removeEventListener("load", initPi)
    }
  }, [])

  // Handle incomplete payments on authentication
  const handleIncompletePayment = useCallback(async (payment: PiPaymentData) => {
    console.log("Incomplete payment found:", payment.identifier)
    // Notify server to complete or cancel the payment
    try {
      await fetch("/api/pi/incomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.identifier }),
      })
    } catch (err) {
      console.error("Failed to handle incomplete payment:", err)
    }
  }, [])

  // Authenticate with Pi Network
  const authenticate = useCallback(async () => {
    if (!window.Pi) {
      setError("Pi SDK not available. Please open in Pi Browser.")
      return
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      const scopes = ["username", "payments"]
      const authResult = await window.Pi.authenticate(
        scopes,
        handleIncompletePayment
      )

      // Verify with our backend
      const response = await fetch("/api/pi/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: authResult.accessToken,
          user: authResult.user,
        }),
      })

      if (!response.ok) {
        throw new Error("Authentication verification failed")
      }

      setUser(authResult.user)
      setAccessToken(authResult.accessToken)
    } catch (err) {
      console.error("Authentication failed:", err)
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsAuthenticating(false)
    }
  }, [handleIncompletePayment])

  // Logout
  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    // Notify backend
    fetch("/api/pi/logout", { method: "POST" }).catch(console.error)
  }, [])

  // Create Payment
  const createPayment = useCallback(
    async (amount: number, memo: string, metadata: Record<string, unknown> = {}) => {
      if (!window.Pi) {
        setError("Pi SDK not available")
        return
      }

      if (!accessToken) {
        setError("Please authenticate first")
        return
      }

      setIsPaymentPending(true)
      setError(null)

      try {
        await new Promise<void>((resolve, reject) => {
          window.Pi!.createPayment(
            {
              amount,
              memo,
              metadata: { ...metadata, appId: PI_CONFIG.appId },
            },
            {
              onReadyForServerApproval: async (paymentId: string) => {
                try {
                  const res = await fetch("/api/pi/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, accessToken }),
                  })
                  if (!res.ok) throw new Error("Payment approval failed")
                } catch (err) {
                  reject(err)
                }
              },
              onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                try {
                  const res = await fetch("/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid, accessToken }),
                  })
                  if (!res.ok) throw new Error("Payment completion failed")
                  resolve()
                } catch (err) {
                  reject(err)
                }
              },
              onCancel: (paymentId: string) => {
                console.log("Payment cancelled:", paymentId)
                reject(new Error("Payment was cancelled"))
              },
              onError: (err: Error) => {
                console.error("Payment error:", err)
                reject(err)
              },
            }
          )
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed")
        throw err
      } finally {
        setIsPaymentPending(false)
      }
    },
    [accessToken]
  )

  const clearError = useCallback(() => setError(null), [])

  const value: PiContextState = {
    isInitialized,
    isInPiBrowser,
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isAuthenticating,
    authenticate,
    logout,
    createPayment,
    isPaymentPending,
    error,
    clearError,
  }

  return <PiContext.Provider value={value}>{children}</PiContext.Provider>
}
