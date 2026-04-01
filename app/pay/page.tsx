"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePi } from "@/components/pi/pi-provider"
import { PiPaymentForm } from "@/components/pi/pi-payment-form"
import { PiNetworkBadge } from "@/components/pi/pi-network-badge"
import { PiUserInfo } from "@/components/pi/pi-user-info"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Layers } from "lucide-react"

export default function PaymentPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = usePi()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isInitialized, isAuthenticated, router])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="size-5 text-primary-foreground" />
              </div>
              <span className="font-semibold hidden sm:inline">Pi Infrastructure</span>
            </Link>
            <PiNetworkBadge />
          </div>
          <PiUserInfo />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/onboarding">
              <ArrowLeft className="size-4" />
              Back to Checklist
            </Link>
          </Button>

          {/* Payment Form */}
          <PiPaymentForm
            onSuccess={() => {
              // Mark test payment as complete
              localStorage.setItem('pi_test_payment_complete', 'true')
              // Redirect back to onboarding
              setTimeout(() => {
                router.push('/onboarding')
              }, 1500)
            }}
            onError={(error) => {
              console.error("Payment error:", error)
            }}
          />

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground">
            Payments are processed on the Pi Network. Test Pi has no real value.
          </p>
        </div>
      </main>
    </div>
  )
}
