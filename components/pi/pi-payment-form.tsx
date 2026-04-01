"use client"

import { useState } from "react"
import { usePi } from "./pi-provider"
import { PI_CONFIG } from "@/lib/pi/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { AlertCircle, CheckCircle2, Wallet } from "lucide-react"
import { toast } from "sonner"

interface PiPaymentFormProps {
  defaultAmount?: number
  memo?: string
  metadata?: Record<string, unknown>
  onSuccess?: (paymentId: string) => void
  onError?: (error: string) => void
  className?: string
}

export function PiPaymentForm({
  defaultAmount = PI_CONFIG.defaultAmount,
  memo = PI_CONFIG.defaultMemo,
  metadata = {},
  onSuccess,
  onError,
  className,
}: PiPaymentFormProps) {
  const { createPayment, isPaymentPending, isAuthenticated, error, clearError } = usePi()
  const [amount, setAmount] = useState(defaultAmount.toString())
  const [customMemo, setCustomMemo] = useState(memo)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setPaymentSuccess(false)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      await createPayment(numAmount, customMemo, metadata)
      setPaymentSuccess(true)
      toast.success("Payment completed successfully!")
      onSuccess?.("payment-completed")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed"
      toast.error(message)
      onError?.(message)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Please login with Pi Network to make a payment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5" />
          Pi Payment
        </CardTitle>
        <CardDescription>
          Enter the amount of Pi you want to send
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentSuccess && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="size-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Payment completed successfully!
              </AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount">Amount (Pi)</FieldLabel>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPaymentPending}
                  className="pr-10 text-lg font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Pi
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="memo">Memo (optional)</FieldLabel>
              <Input
                id="memo"
                type="text"
                placeholder="Payment description"
                value={customMemo}
                onChange={(e) => setCustomMemo(e.target.value)}
                disabled={isPaymentPending}
                maxLength={100}
              />
            </Field>
          </FieldGroup>

          {/* Quick amount buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground w-full">Quick amounts:</span>
            {[0.01, 0.1, 1, 5, 10].map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isPaymentPending}
              >
                {quickAmount} Pi
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPaymentPending || !amount}
          >
            {isPaymentPending ? (
              <>
                <Spinner className="size-4" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="size-4" />
                <span>Pay {amount || "0"} Pi</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
