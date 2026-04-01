"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePi } from "@/components/pi/pi-provider"
import { usePiConfig } from "@/hooks/use-pi-config"
import { PiUserInfo } from "@/components/pi/pi-user-info"
import { PiNetworkBadge } from "@/components/pi/pi-network-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { 
  Check, 
  Circle, 
  ArrowRight, 
  Layers, 
  Shield, 
  Wallet, 
  Settings, 
  LayoutDashboard,
  ExternalLink,
  FileJson,
  TestTube,
  Rocket
} from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: React.ElementType
  status: 'complete' | 'current' | 'upcoming'
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  hint?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, user, isInPiBrowser } = usePi()
  const { isConfigured, isLoading: isConfigLoading } = usePiConfig()
  const [testPaymentComplete, setTestPaymentComplete] = useState(false)

  // Check localStorage for test payment completion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('pi_test_payment_complete')
      setTestPaymentComplete(completed === 'true')
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isConfigLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isConfigLoading, router])

  if (isConfigLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-muted/30">
        <Spinner className="size-8" />
      </main>
    )
  }

  // Calculate checklist items based on current state
  const checklistItems: ChecklistItem[] = [
    {
      id: 'auth',
      title: 'Pi Network Authentication',
      description: 'Connect your Pi account to this platform',
      icon: Shield,
      status: 'complete',
      hint: `Signed in as @${user?.username || 'pioneer'}`
    },
    {
      id: 'config',
      title: 'App Configuration',
      description: 'Host your Pi app credentials on your server',
      icon: FileJson,
      status: isConfigured ? 'complete' : 'current',
      action: isConfigured ? undefined : {
        label: 'Set Up Config',
        href: '/setup'
      },
      hint: isConfigured ? 'Config connected' : 'Required for payments'
    },
    {
      id: 'testpayment',
      title: 'Test Payment',
      description: 'Make a small test payment (0.01 Pi) to verify everything works',
      icon: Wallet,
      status: !isConfigured ? 'upcoming' : testPaymentComplete ? 'complete' : 'current',
      action: (!isConfigured || testPaymentComplete) ? undefined : {
        label: 'Make Test Payment',
        href: '/pay'
      },
      hint: testPaymentComplete ? 'Payment verified' : 'Uses testnet Pi'
    },
    {
      id: 'dashboard',
      title: 'View Dashboard',
      description: 'Monitor sessions and transactions in real-time',
      icon: LayoutDashboard,
      status: (!isConfigured || !testPaymentComplete) ? 'upcoming' : 'current',
      action: {
        label: 'Open Dashboard',
        href: '/dashboard'
      },
      hint: 'Track your app activity'
    },
    {
      id: 'integrate',
      title: 'Integrate with Your App',
      description: 'Point your Pi app to this platform for auth and payments',
      icon: Rocket,
      status: 'upcoming',
      hint: 'Coming next'
    }
  ]

  const completedCount = checklistItems.filter(item => item.status === 'complete').length
  const progressPercent = (completedCount / checklistItems.length) * 100

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Pi Infrastructure</h1>
                <PiNetworkBadge />
              </div>
            </div>
            <PiUserInfo variant="compact" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-balance">
            Welcome, @{user?.username || 'Pioneer'}
          </h1>
          <p className="text-muted-foreground text-pretty">
            Complete the checklist below to get your Pi app infrastructure ready for testing.
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {checklistItems.length} complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="size-5" />
              Testnet Setup Checklist
            </CardTitle>
            <CardDescription>
              Follow these steps to set up your Pi app for testnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {checklistItems.map((item, index) => {
                const Icon = item.icon
                const isComplete = item.status === 'complete'
                const isCurrent = item.status === 'current'
                const isUpcoming = item.status === 'upcoming'

                return (
                  <div key={item.id}>
                    <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                      isCurrent ? 'bg-primary/5 border border-primary/20' : ''
                    } ${isUpcoming ? 'opacity-50' : ''}`}>
                      {/* Status Icon */}
                      <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                        isComplete 
                          ? 'bg-green-500/10 text-green-600' 
                          : isCurrent 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isComplete ? (
                          <Check className="size-4" />
                        ) : (
                          <Icon className="size-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${isComplete ? 'text-muted-foreground line-through' : ''}`}>
                            {item.title}
                          </h3>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        {item.hint && (
                          <p className={`text-xs ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {item.hint}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      {item.action && !isUpcoming && (
                        <div className="shrink-0">
                          {item.action.href ? (
                            <Button 
                              size="sm" 
                              variant={isCurrent ? "default" : "outline"}
                              asChild
                            >
                              <Link href={item.action.href}>
                                {item.action.label}
                                <ArrowRight className="size-3 ml-1" />
                              </Link>
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant={isCurrent ? "default" : "outline"}
                              onClick={item.action.onClick}
                            >
                              {item.action.label}
                              <ArrowRight className="size-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Connector line */}
                    {index < checklistItems.length - 1 && (
                      <div className="ml-8 h-4 border-l-2 border-dashed border-border" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <a 
              href="https://develop.pi" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Pi Developer Portal
              <ExternalLink className="size-3 ml-2" />
            </a>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4 mr-2" />
              Skip to Dashboard
            </Link>
          </Button>
        </div>

        {/* Pi Browser Warning */}
        {!isInPiBrowser && (
          <div className="mt-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <strong>Tip:</strong> For the best experience and to test payments, 
              open this app in the Pi Browser.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
