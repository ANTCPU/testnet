// Pi Network SDK Types

export interface PiUser {
  uid: string
  username: string
}

export interface PiAuthResult {
  accessToken: string
  user: PiUser
}

export interface PiPaymentData {
  identifier: string
  user_uid: string
  amount: number
  memo: string
  metadata: Record<string, unknown>
  from_address: string
  to_address: string
  direction: "user_to_app" | "app_to_user"
  created_at: string
  network: "Pi Network" | "Pi Testnet"
  status: {
    developer_approved: boolean
    transaction_verified: boolean
    developer_completed: boolean
    cancelled: boolean
    user_cancelled: boolean
  }
  transaction: {
    txid: string
    verified: boolean
    _link: string
  } | null
}

// Application Types for Data Store

export interface PiSession {
  id: string
  userId: string
  username: string
  accessToken: string
  appId: string
  connectedAt: Date
  lastActiveAt: Date
  metadata?: Record<string, unknown>
}

export interface PiTransaction {
  id: string
  paymentId: string
  userId: string
  username: string
  amount: number
  memo: string
  status: "pending" | "approved" | "completed" | "cancelled" | "failed"
  appId: string
  txid?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

export interface TransactionFilters {
  userId?: string
  appId?: string
  status?: PiTransaction["status"]
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

// Pi SDK Window Extension
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: PiPaymentData) => void
      ) => Promise<PiAuthResult>
      createPayment: (
        paymentData: {
          amount: number
          memo: string
          metadata: Record<string, unknown>
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void
          onReadyForServerCompletion: (paymentId: string, txid: string) => void
          onCancel: (paymentId: string) => void
          onError: (error: Error, payment?: PiPaymentData) => void
        }
      ) => void
    }
  }
}

export {}
