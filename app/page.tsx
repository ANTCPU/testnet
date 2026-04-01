"use client"

import Link from "next/link"
import { usePi } from "@/components/pi/pi-provider"
import { PiLoginButton } from "@/components/pi/pi-login-button"
import { PiNetworkBadge } from "@/components/pi/pi-network-badge"
import { PiUserInfo } from "@/components/pi/pi-user-info"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Layers,
  Shield,
  Zap,
  Users,
  ArrowLeftRight,
  Code,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description:
      "Pi Network verified authentication with scopes for username and payments. Built on official Pi SDK.",
  },
  {
    icon: ArrowLeftRight,
    title: "Payment Gateway",
    description:
      "Process Pi payments with server-side approval and completion. Testnet ready, mainnet prepared.",
  },
  {
    icon: Users,
    title: "Session Management",
    description:
      "Track logged-in users with real-time session monitoring. Built for multi-app infrastructure.",
  },
  {
    icon: Code,
    title: "Developer Framework",
    description:
      "Reusable, white-label infrastructure. Designed to support multiple Pi apps from a single platform.",
  },
]

export default function HomePage() {
  const { isAuthenticated } = usePi()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold hidden sm:inline">Pi Infrastructure</span>
            <PiNetworkBadge />
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </Button>
                <PiUserInfo />
              </>
            ) : (
              <PiLoginButton size="sm" />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <Zap className="size-4 text-primary" />
              <span>Testnet Ready</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Pi Network Infrastructure Platform
          </h1>

          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Authentication and payment gateway infrastructure for Pi Network
            applications. Built for developers who want to integrate Pi payments
            into their apps with a robust, reusable framework.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pay">
                    <ArrowLeftRight className="size-4" />
                    Make a Payment
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/setup">
                    Setup Guide
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Built for Pi Developers
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Everything you need to build Pi-powered applications with robust
            authentication and payment processing.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/50">
              <CardHeader>
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to integrate Pi payments?
              </h2>
              <p className="text-muted-foreground">
                This platform is designed as reusable infrastructure. Use it as a
                foundation for your own Pi-powered application or as a monitoring
                service for multiple apps.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/setup">
                    Get Started
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded bg-primary flex items-center justify-center">
                <Layers className="size-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Pi Infrastructure Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for Pi Network testnet. Test Pi has no real value.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
