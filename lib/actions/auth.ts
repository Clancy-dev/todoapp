"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  name: string
  email: string
  profilePicture?: string
  securityQuestion: string
  createdAt: Date
  updatedAt: Date
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    const { password: _, securityAnswer: __, ...userWithoutSensitive } = user
    return { success: true, user: userWithoutSensitive }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  securityQuestion: string,
  securityAnswer: string,
) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "User already exists" }
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
      },
    })

    const { password: _, securityAnswer: __, ...userWithoutSensitive } = user
    return { success: true, user: userWithoutSensitive }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: updates,
    })

    const { password: _, securityAnswer: __, ...userWithoutSensitive } = user
    revalidatePath("/settings")
    return { success: true, user: userWithoutSensitive }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
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
    return { success: false, error: "Failed to change password" }
  }
}

export async function resetUserPassword(email: string, securityAnswer: string, newPassword: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isValidAnswer = await bcrypt.compare(securityAnswer.toLowerCase(), user.securityAnswer)
    if (!isValidAnswer) {
      return { success: false, error: "Security answer is incorrect" }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Failed to reset password" }
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const { password: _, securityAnswer: __, ...userWithoutSensitive } = user
    return { success: true, user: userWithoutSensitive }
  } catch (error) {
    console.error("Get user error:", error)
    return { success: false, error: "Failed to get user" }
  }
}
