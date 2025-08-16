import { type NextRequest, NextResponse } from "next/server"
import { updateUserProfile } from "@/lib/actions/auth"

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const updates = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 401 })
    }

    const result = await updateUserProfile(userId, updates)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Update profile API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
