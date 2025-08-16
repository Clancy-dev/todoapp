"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  name: string
  email: string
  profilePicture?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" }
    }

    const { password: _, securityAnswer: __, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  securityQuestion: string,
  securityAnswer: string,
  profilePicture?: string | null,
): Promise<AuthResult> {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 12)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        securityQuestion,
        securityAnswer: hashedSecurityAnswer,
        profilePicture,
      },
    })

    const { password: _, securityAnswer: __, ...userWithoutPassword } = user

    revalidatePath("/")

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}

export async function getUserById(userId: string): Promise<AuthResult> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const { password: _, securityAnswer: __, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Get user error:", error)
    return { success: false, error: "An error occurred while fetching user" }
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<AuthResult> {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: updates,
    })

    const { password: _, securityAnswer: __, ...userWithoutPassword } = user

    revalidatePath("/")

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "An error occurred while updating profile" }
  }
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    return { success: true }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, error: "An error occurred while changing password" }
  }
}

export async function resetUserPassword(
  email: string,
  securityAnswer: string,
  newPassword: string,
): Promise<AuthResult> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isSecurityAnswerValid = await bcrypt.compare(securityAnswer.toLowerCase(), user.securityAnswer)

    if (!isSecurityAnswerValid) {
      return { success: false, error: "Security answer is incorrect" }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    await db.user.update({
      where: { email },
      data: { password: hashedNewPassword },
    })

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "An error occurred while resetting password" }
  }
}
