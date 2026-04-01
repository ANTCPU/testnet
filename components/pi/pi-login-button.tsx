"use client"

import { usePi } from "./pi-provider"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LogIn } from "lucide-react"

interface PiLoginButtonProps {
  className?: string
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline" | "secondary"
}

export function PiLoginButton({
  className,
  size = "default",
  variant = "default",
}: PiLoginButtonProps) {
  const { authenticate, isAuthenticating, isInPiBrowser, isAuthenticated } = usePi()

  if (isAuthenticated) {
    return null
  }

  const handleClick = () => {
    if (!isInPiBrowser) {
      // Show a message or redirect to Pi Browser instructions
      alert("Please open this app in Pi Browser to authenticate.")
      return
    }
    authenticate()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isAuthenticating}
      size={size}
      variant={variant}
      className={className}
    >
      {isAuthenticating ? (
        <>
          <Spinner className="size-4" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <LogIn className="size-4" />
          <span>Login with Pi</span>
        </>
      )}
    </Button>
  )
}
