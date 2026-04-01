"use client"

import { usePi } from "./pi-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Wallet } from "lucide-react"
import Link from "next/link"

interface PiUserInfoProps {
  showDropdown?: boolean
  className?: string
}

export function PiUserInfo({ showDropdown = true, className }: PiUserInfoProps) {
  const { user, isAuthenticated, logout } = usePi()

  if (!isAuthenticated || !user) {
    return null
  }

  const initials = user.username.slice(0, 2).toUpperCase()

  if (!showDropdown) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.username}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`gap-2 ${className}`}>
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="size-4" />
          {user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/pay" className="flex items-center gap-2 cursor-pointer">
            <Wallet className="size-4" />
            Make Payment
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <User className="size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 text-destructive cursor-pointer"
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
