"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePi } from "@/components/pi/pi-provider"
import { usePiConfig } from "@/hooks/use-pi-config"
import { PiLoginButton } from "@/components/pi/pi-login-button"
import { PiNetworkBadge } from "@/components/pi/pi-network-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, Shield, Zap, Layers, Settings, Check } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isInPiBrowser, error, clearError } = usePi()
  const { isLoading: isConfigLoading, isConfigured, clearConfig } = usePiConfig()

  // Redirect to onboarding if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/onboarding")
    }
  }, [isAuthenticated, router])

  if (isConfigLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-muted/30">
        <Spinner className="size-8" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="size-6 text-primary-foreground" />
            </div>
            <PiNetworkBadge />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Pi Infrastructure Platform
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Authentication and payment gateway for Pi Network applications
          </p>
        </div>

        {/* Config Status */}
        {isConfigured ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">App configured</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearConfig}>
              <Settings className="size-4 mr-1" />
              Change
            </Button>
          </div>
        ) : (
          <Alert>
            <Settings className="size-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>No app configured yet</span>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link href="/setup">Set up your app</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Connect with Pi Network</CardTitle>
            <CardDescription>
              {isConfigured 
                ? "Authenticate securely using your Pi account"
                : "Demo mode - set up your app for full functionality"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
                <button
                  onClick={clearError}
                  className="absolute top-2 right-2 text-xs opacity-70 hover:opacity-100"
                >
                  Dismiss
                </button>
              </Alert>
            )}

            {!isInPiBrowser && (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  For full functionality, please open this app in Pi Browser.
                </AlertDescription>
              </Alert>
            )}

            <PiLoginButton className="w-full" size="lg" />
            
            {!isConfigured && (
              <p className="text-xs text-center text-muted-foreground">
                Running in demo mode with limited functionality
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
            <Shield className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Secure Auth</p>
              <p className="text-xs text-muted-foreground">
                Pi Network verified authentication
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
            <Zap className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fast Payments</p>
              <p className="text-xs text-muted-foreground">
                Seamless Pi transactions
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By connecting, you agree to authenticate your Pi account for use with
          this application.
        </p>
      </div>
    </main>
  )
}
