import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, securityQuestion, securityAnswer, profilePicture } = await request.json()

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
    }

    const result = await registerUser(name, email, password, securityQuestion, securityAnswer, profilePicture)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
