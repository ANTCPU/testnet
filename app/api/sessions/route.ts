import { NextRequest, NextResponse } from "next/server"
import { piStore } from "@/lib/pi/store"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get("appId") || undefined

    const sessions = await piStore.listSessions(appId)

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        username: s.username,
        appId: s.appId,
        connectedAt: s.connectedAt.toISOString(),
        lastActiveAt: s.lastActiveAt.toISOString(),
      })),
      total: sessions.length,
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
