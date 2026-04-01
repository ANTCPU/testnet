// In-Memory Data Store for Pi Sessions and Transactions
// Designed as a pluggable interface - easily swap to database/smart contract

import type { PiSession, PiTransaction, TransactionFilters } from "./types"

// Data Store Interface - implement this for different backends
export interface PiDataStore {
  // Sessions
  createSession(session: Omit<PiSession, "id">): Promise<PiSession>
  getSession(userId: string, appId?: string): Promise<PiSession | null>
  getSessionByToken(accessToken: string): Promise<PiSession | null>
  listSessions(appId?: string): Promise<PiSession[]>
  updateSession(userId: string, data: Partial<PiSession>): Promise<void>
  deleteSession(userId: string, appId?: string): Promise<void>

  // Transactions
  createTransaction(txn: Omit<PiTransaction, "id">): Promise<PiTransaction>
  getTransaction(id: string): Promise<PiTransaction | null>
  getTransactionByPaymentId(paymentId: string): Promise<PiTransaction | null>
  listTransactions(filters?: TransactionFilters): Promise<PiTransaction[]>
  updateTransaction(id: string, data: Partial<PiTransaction>): Promise<void>

  // Stats
  getStats(appId?: string): Promise<{
    totalSessions: number
    activeSessions: number
    totalTransactions: number
    completedTransactions: number
    totalVolume: number
  }>
}

// In-Memory Implementation for Testnet
class InMemoryPiStore implements PiDataStore {
  private sessions: Map<string, PiSession> = new Map()
  private transactions: Map<string, PiTransaction> = new Map()
  private idCounter = 0

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${++this.idCounter}`
  }

  private getSessionKey(userId: string, appId?: string): string {
    return `${userId}:${appId || "default"}`
  }

  // Sessions
  async createSession(data: Omit<PiSession, "id">): Promise<PiSession> {
    const session: PiSession = {
      ...data,
      id: this.generateId("sess"),
    }
    this.sessions.set(this.getSessionKey(session.userId, session.appId), session)
    return session
  }

  async getSession(userId: string, appId?: string): Promise<PiSession | null> {
    return this.sessions.get(this.getSessionKey(userId, appId)) || null
  }

  async getSessionByToken(accessToken: string): Promise<PiSession | null> {
    for (const session of this.sessions.values()) {
      if (session.accessToken === accessToken) {
        return session
      }
    }
    return null
  }

  async listSessions(appId?: string): Promise<PiSession[]> {
    const sessions = Array.from(this.sessions.values())
    if (appId) {
      return sessions.filter((s) => s.appId === appId)
    }
    return sessions
  }

  async updateSession(userId: string, data: Partial<PiSession>): Promise<void> {
    const key = this.getSessionKey(userId, data.appId)
    const existing = this.sessions.get(key)
    if (existing) {
      this.sessions.set(key, { ...existing, ...data })
    }
  }

  async deleteSession(userId: string, appId?: string): Promise<void> {
    this.sessions.delete(this.getSessionKey(userId, appId))
  }

  // Transactions
  async createTransaction(data: Omit<PiTransaction, "id">): Promise<PiTransaction> {
    const txn: PiTransaction = {
      ...data,
      id: this.generateId("txn"),
    }
    this.transactions.set(txn.id, txn)
    return txn
  }

  async getTransaction(id: string): Promise<PiTransaction | null> {
    return this.transactions.get(id) || null
  }

  async getTransactionByPaymentId(paymentId: string): Promise<PiTransaction | null> {
    for (const txn of this.transactions.values()) {
      if (txn.paymentId === paymentId) {
        return txn
      }
    }
    return null
  }

  async listTransactions(filters?: TransactionFilters): Promise<PiTransaction[]> {
    let txns = Array.from(this.transactions.values())

    if (filters) {
      if (filters.userId) {
        txns = txns.filter((t) => t.userId === filters.userId)
      }
      if (filters.appId) {
        txns = txns.filter((t) => t.appId === filters.appId)
      }
      if (filters.status) {
        txns = txns.filter((t) => t.status === filters.status)
      }
      if (filters.startDate) {
        txns = txns.filter((t) => t.createdAt >= filters.startDate!)
      }
      if (filters.endDate) {
        txns = txns.filter((t) => t.createdAt <= filters.endDate!)
      }
    }

    // Sort by creation date descending
    txns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (filters?.offset) {
      txns = txns.slice(filters.offset)
    }
    if (filters?.limit) {
      txns = txns.slice(0, filters.limit)
    }

    return txns
  }

  async updateTransaction(id: string, data: Partial<PiTransaction>): Promise<void> {
    const existing = this.transactions.get(id)
    if (existing) {
      this.transactions.set(id, { ...existing, ...data, updatedAt: new Date() })
    }
  }

  // Stats
  async getStats(appId?: string): Promise<{
    totalSessions: number
    activeSessions: number
    totalTransactions: number
    completedTransactions: number
    totalVolume: number
  }> {
    const sessions = await this.listSessions(appId)
    const txns = await this.listTransactions(appId ? { appId } : undefined)

    const completedTxns = txns.filter((t) => t.status === "completed")
    const totalVolume = completedTxns.reduce((sum, t) => sum + t.amount, 0)

    // Consider sessions active if last active within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const activeSessions = sessions.filter((s) => s.lastActiveAt > fiveMinutesAgo)

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalTransactions: txns.length,
      completedTransactions: completedTxns.length,
      totalVolume: Math.round(totalVolume * 1000000) / 1000000, // Round to 6 decimals
    }
  }
}

// Singleton instance - replace with different implementation for production
export const piStore: PiDataStore = new InMemoryPiStore()

// Export for testing or custom implementations
export { InMemoryPiStore }
