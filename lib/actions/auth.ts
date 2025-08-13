"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createUser(data: {
  email: string
  name: string
  password: string
  securityQuestion: string
  securityAnswer: string
  profilePicture?: string
}) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)
    const hashedSecurityAnswer = await bcrypt.hash(data.securityAnswer.toLowerCase(), 12)

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        securityQuestion: data.securityQuestion,
        securityAnswer: hashedSecurityAnswer,
        profilePicture: data.profilePicture,
      },
    })

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name, profilePicture: user.profilePicture },
    }
  } catch (error) {
    return { success: false, error: "Failed to create user" }
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid password" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        securityQuestion: user.securityQuestion,
      },
    }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, profilePicture: true, securityQuestion: true },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    return { success: false, error: "Failed to get user" }
  }
}

export async function resetPasswordWithSecurity(email: string, securityAnswer: string, newPassword: string) {
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

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to reset password" }
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string
    profilePicture?: string
  },
) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, profilePicture: true },
    })

    revalidatePath("/")
    return { success: true, user }
  } catch (error) {
    return { success: false, error: "Failed to update profile" }
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
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

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to change password" }
  }
}
