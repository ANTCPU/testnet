"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, ArrowLeftRight, Wallet, TrendingUp, ArrowRight } from "lucide-react"

interface Stats {
  totalSessions: number
  activeSessions: number
  totalTransactions: number
  completedTransactions: number
  totalVolume: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Sessions",
      value: stats?.totalSessions ?? 0,
      description: `${stats?.activeSessions ?? 0} currently active`,
      icon: Users,
      href: "/dashboard/sessions",
    },
    {
      title: "Total Transactions",
      value: stats?.totalTransactions ?? 0,
      description: `${stats?.completedTransactions ?? 0} completed`,
      icon: ArrowLeftRight,
      href: "/dashboard/transactions",
    },
    {
      title: "Total Volume",
      value: `${stats?.totalVolume ?? 0} Pi`,
      description: "From completed transactions",
      icon: TrendingUp,
      href: "/dashboard/transactions",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Pi infrastructure platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-between h-auto py-4" asChild>
              <Link href="/pay">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Make Payment</div>
                    <div className="text-xs text-muted-foreground">
                      Send Pi to test the gateway
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button variant="outline" className="justify-between h-auto py-4" asChild>
              <Link href="/dashboard/sessions">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Sessions</div>
                    <div className="text-xs text-muted-foreground">
                      Monitor active users
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button variant="outline" className="justify-between h-auto py-4" asChild>
              <Link href="/dashboard/transactions">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ArrowLeftRight className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Transactions</div>
                    <div className="text-xs text-muted-foreground">
                      View payment history
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Testnet Mode Active</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This platform is running on Pi Testnet. All transactions use Test
                Pi with no real value. Data is stored in-memory and will reset on
                server restart. For production use, connect a database and switch
                to mainnet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
