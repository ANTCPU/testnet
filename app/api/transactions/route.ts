import { NextRequest, NextResponse } from "next/server"
import { piStore } from "@/lib/pi/store"
import type { TransactionFilters } from "@/lib/pi/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters: TransactionFilters = {}
    
    const appId = searchParams.get("appId")
    if (appId) filters.appId = appId
    
    const userId = searchParams.get("userId")
    if (userId) filters.userId = userId
    
    const status = searchParams.get("status")
    if (status) filters.status = status as TransactionFilters["status"]
    
    const limit = searchParams.get("limit")
    if (limit) filters.limit = parseInt(limit, 10)
    
    const offset = searchParams.get("offset")
    if (offset) filters.offset = parseInt(offset, 10)

    const transactions = await piStore.listTransactions(filters)

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        paymentId: t.paymentId,
        userId: t.userId,
        username: t.username,
        amount: t.amount,
        memo: t.memo,
        status: t.status,
        appId: t.appId,
        txid: t.txid,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total: transactions.length,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
