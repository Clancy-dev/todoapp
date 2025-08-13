"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { toast } from "react-hot-toast"
import { syncService } from "@/lib/sync-service"
import {
  createUser,
  authenticateUser,
  resetPasswordWithSecurity as resetPasswordServer,
  updateUserProfile,
  changePassword as changePasswordServer,
} from "@/lib/actions/auth"

export interface User {
  id: string
  name: string
  email: string
  initials: string
  profilePicture?: string
  securityQuestion?: string
  lastActivity?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
    profilePicture?: string,
  ) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  resetPasswordWithSecurity: (email: string, securityAnswer: string, newPassword: string) => Promise<boolean>
  checkSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = () => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      const lastActivity = userData.lastActivity ? new Date(userData.lastActivity) : new Date()
      const now = new Date()
      const daysDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)

      if (daysDiff > 1) {
        // Session expired
        localStorage.removeItem("currentUser")
        setUser(null)
        toast.error("Session expired. Please log in again.")
        return
      }

      // Update last activity
      const updatedUser = { ...userData, lastActivity: now.toISOString() }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  useEffect(() => {
    checkSession()
    setLoading(false)

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try server authentication first if online
      if (syncService.getIsOnline()) {
        const result = await authenticateUser(email, password)
        if (result.success && result.user) {
          const userWithActivity = {
            ...result.user,
            initials: result.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            lastActivity: new Date().toISOString(),
          }
          setUser(userWithActivity)
          localStorage.setItem("currentUser", JSON.stringify(userWithActivity))

          // Load user data from server
          await syncService.loadDataFromServer(result.user.id)

          toast.success(`Welcome back, ${result.user.name}!`)
          return true
        } else {
          toast.error(result.error || "Login failed")
          return false
        }
      }

      // Fallback to local authentication
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const foundUser = users.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const userWithoutPassword = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          initials: foundUser.initials,
          profilePicture: foundUser.profilePicture,
          securityQuestion: foundUser.securityQuestion,
          lastActivity: new Date().toISOString(),
        }
        setUser(userWithoutPassword)
        localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
        toast.success(`Welcome back, ${foundUser.name}!`)
        return true
      } else {
        toast.error("Invalid email or password")
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
    profilePicture?: string,
  ): Promise<boolean> => {
    try {
      // Try server registration first if online
      if (syncService.getIsOnline()) {
        const result = await createUser({
          name,
          email,
          password,
          securityQuestion,
          securityAnswer,
          profilePicture,
        })

        if (result.success && result.user) {
          const userWithActivity = {
            ...result.user,
            initials: result.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            lastActivity: new Date().toISOString(),
          }
          setUser(userWithActivity)
          localStorage.setItem("currentUser", JSON.stringify(userWithActivity))
          toast.success(`Welcome, ${result.user.name}!`)
          return true
        } else {
          toast.error(result.error || "Registration failed")
          return false
        }
      }

      // Fallback to local registration
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      if (users.find((u: any) => u.email === email)) {
        toast.error("User with this email already exists")
        return false
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        securityQuestion,
        securityAnswer: securityAnswer.toLowerCase().trim(),
        profilePicture,
        initials: name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        initials: newUser.initials,
        profilePicture: newUser.profilePicture,
        securityQuestion: newUser.securityQuestion,
        lastActivity: new Date().toISOString(),
      }
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

      toast.success(`Welcome, ${name}!`)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
      return false
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates, lastActivity: new Date().toISOString() }
    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))

    // Try to update on server if online
    if (syncService.getIsOnline()) {
      try {
        const result = await updateUserProfile(user.id, updates)
        if (result.success) {
          toast.success("Profile updated successfully")
          return
        }
      } catch (error) {
        console.error("Failed to update profile on server:", error)
      }
    }

    // Update locally
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem("users", JSON.stringify(users))
    }

    toast.success("Profile updated successfully")
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    try {
      // Try server password change if online
      if (syncService.getIsOnline()) {
        const result = await changePasswordServer(user.id, currentPassword, newPassword)
        if (result.success) {
          toast.success("Password changed successfully")
          return true
        } else {
          toast.error(result.error || "Password change failed")
          return false
        }
      }

      // Fallback to local password change
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex === -1 || users[userIndex].password !== currentPassword) {
        toast.error("Current password is incorrect")
        return false
      }

      users[userIndex].password = newPassword
      localStorage.setItem("users", JSON.stringify(users))
      toast.success("Password changed successfully")
      return true
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
      // Try server password reset if online
      if (syncService.getIsOnline()) {
        const result = await resetPasswordServer(email, securityAnswer, newPassword)
        if (result.success) {
          toast.success("Password reset successfully")
          return true
        } else {
          toast.error(result.error || "Password reset failed")
          return false
        }
      }

      // Fallback to local password reset
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.email === email)

      if (userIndex === -1) {
        toast.error("No account found with this email")
        return false
      }

      const user = users[userIndex]
      if (user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
        toast.error("Security answer is incorrect")
        return false
      }

      users[userIndex].password = newPassword
      localStorage.setItem("users", JSON.stringify(users))
      toast.success("Password reset successfully")
      return true
    } catch (error) {
      console.error("Password reset error:", error)
      toast.error("Password reset failed")
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    toast.success("Logged out successfully")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPasswordWithSecurity,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
