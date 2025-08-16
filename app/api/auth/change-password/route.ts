// import { type NextRequest, NextResponse } from "next/server"
// import { changeUserPassword } from "@/lib/actions/auth"

// export async function PUT(request: NextRequest) {
//   try {
//     const userId = request.headers.get("x-user-id")
//     const { currentPassword, newPassword } = await request.json()

//     if (!userId) {
//       return NextResponse.json({ success: false, error: "User ID is required" }, { status: 401 })
//     }

//     if (!currentPassword || !newPassword) {
//       return NextResponse.json(
//         { success: false, error: "Current password and new password are required" },
//         { status: 400 },
//       )
//     }

//     const result = await changeUserPassword(userId, currentPassword, newPassword)

//     if (result.success) {
//       return NextResponse.json(result, { status: 200 })
//     } else {
//       return NextResponse.json(result, { status: 400 })
//     }
//   } catch (error) {
//     console.error("Change password API error:", error)
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
//   }
// }
