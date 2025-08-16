import { type NextRequest, NextResponse } from "next/server"
import { resetUserPassword } from "@/lib/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, securityAnswer, newPassword } = await request.json()

    if (!email || !securityAnswer || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, security answer, and new password are required" },
        { status: 400 },
      )
    }

    const result = await resetUserPassword(email, securityAnswer, newPassword)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Reset password API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
