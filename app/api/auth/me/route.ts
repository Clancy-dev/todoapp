import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/actions/auth"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 401 })
    }

    const result = await getUserById(userId)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 404 })
    }
  } catch (error) {
    console.error("Get user API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
