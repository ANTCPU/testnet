"use client"

import { Badge } from "@/components/ui/badge"
import { PI_CONFIG } from "@/lib/pi/config"

export function PiNetworkBadge() {
  return (
    <Badge
      variant={PI_CONFIG.sandbox ? "secondary" : "default"}
      className="font-mono text-xs"
    >
      {PI_CONFIG.sandbox ? "Testnet" : "Mainnet"}
    </Badge>
  )
}
