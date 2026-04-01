import { NextRequest, NextResponse } from "next/server"
import { piStore } from "@/lib/pi/store"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get("appId") || undefined

    const stats = await piStore.getStats(appId)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
