"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { authApi } from "@/lib/api-client"

export interface User {
  id: string
  name: string
  email: string
  profilePicture?: string | null
  securityQuestion?: string
  lastActivity?: string
}

// Simple authentication state management
let currentUser: User | null = null
let authListeners: Array<(user: User | null) => void> = []

export function useAuth() {
  const [user, setUser] = useState<User | null>(currentUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
    setLoading(false)

    // Add this component to listeners
    authListeners.push(setUser)

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => {
      // Remove listener on cleanup
      authListeners = authListeners.filter((listener) => listener !== setUser)
      clearInterval(interval)
    }
  }, [])

  const checkSession = async () => {
    const sessionData = sessionStorage.getItem("userSession")
    if (sessionData) {
      try {
        const { userId, lastActivity } = JSON.parse(sessionData)
        const lastActivityDate = new Date(lastActivity)
        const now = new Date()
        const daysDiff = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)

        if (daysDiff > 1) {
          // Session expired
          sessionStorage.removeItem("userSession")
          updateAuthState(null)
          toast.error("Session expired. Please log in again.")
          window.location.href = "/welcome"
          return
        }

        const result = await authApi.getMe(userId)
        if (result.success && result.user) {
          const userWithActivity: User = {
            ...result.user,
            lastActivity: now.toISOString(),
          }
          updateAuthState(userWithActivity)
          // Update session with new activity time
          sessionStorage.setItem(
            "userSession",
            JSON.stringify({
              userId: result.user.id,
              lastActivity: now.toISOString(),
            }),
          )
        } else {
          sessionStorage.removeItem("userSession")
          updateAuthState(null)
          window.location.href = "/welcome"
        }
      } catch (error) {
        console.error("Session check error:", error)
        sessionStorage.removeItem("userSession")
        updateAuthState(null)
        window.location.href = "/welcome"
      }
    }
  }

  const updateAuthState = (newUser: User | null) => {
    currentUser = newUser
    authListeners.forEach((listener) => listener(newUser))
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authApi.login(email, password)

      if (result.success && result.user) {
        const userWithActivity: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          profilePicture: result.user.profilePicture ?? null,
          securityQuestion: result.user.securityQuestion,
          lastActivity: new Date().toISOString(),
        }
        updateAuthState(userWithActivity)
        sessionStorage.setItem(
          "userSession",
          JSON.stringify({
            userId: result.user.id,
            lastActivity: new Date().toISOString(),
          }),
        )
        toast.success(`Welcome back, ${result.user.name}!`)
        return true
      } else {
        toast.error(result.error || "Invalid email or password")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please try again.")
      return false
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
    profilePicture?: string | null,
  ): Promise<boolean> => {
    try {
      const result = await authApi.register(name, email, password, securityQuestion, securityAnswer, profilePicture)

      if (result.success && result.user) {
        const userWithActivity: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          profilePicture: result.user.profilePicture ?? null,
          securityQuestion: result.user.securityQuestion,
          lastActivity: new Date().toISOString(),
        }
        updateAuthState(userWithActivity)
        sessionStorage.setItem(
          "userSession",
          JSON.stringify({
            userId: result.user.id,
            lastActivity: new Date().toISOString(),
          }),
        )
        toast.success(`Welcome, ${name}!`)
        return true
      } else {
        toast.error(result.error || "Registration failed")
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
      return false
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return

    try {
      const result = await authApi.updateProfile(user.id, updates)

      if (result.success && result.user) {
        const updatedUser: User = {
          ...result.user,
          lastActivity: new Date().toISOString(),
        }
        updateAuthState(updatedUser)
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error || "Profile update failed")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Profile update failed")
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    try {
      const result = await authApi.changePassword(user.id, currentPassword, newPassword)

      if (result.success) {
        toast.success("Password changed successfully")
        return true
      } else {
        toast.error(result.error || "Password change failed")
        return false
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast.error("Password change failed")
      return false
    }
  }

  const resetPasswordWithSecurity = async (
    email: string,
    securityAnswer: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      const result = await authApi.resetPassword(email, securityAnswer, newPassword)

      if (result.success) {
        toast.success("Password reset successfully")
        return true
      } else {
        toast.error(result.error || "Password reset failed")
        return false
      }
    } catch (error) {
      console.error("Password reset error:", error)
      toast.error("Password reset failed")
      return false
    }
  }

  const logout = () => {
    updateAuthState(null)
    sessionStorage.removeItem("userSession")
    toast.success("Logged out successfully")
    window.location.href = "/welcome"
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPasswordWithSecurity,
    checkSession,
  }
}
