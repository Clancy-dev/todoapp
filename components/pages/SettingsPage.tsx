"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "react-hot-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Moon, Sun, Monitor, Download, Trash2, User, Shield, Bell, Camera, Key, Eye } from "lucide-react"

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function SettingsPage() {
  const { theme, setTheme, actualTheme } = useTheme()
  const { user, logout, updateProfile, changePassword } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showProfilePicture, setShowProfilePicture] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const passwordForm = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.clear()
      toast.success("All local data has been cleared successfully.")
      window.location.reload()
    }
  }

  const handleExportData = () => {
    try {
      const data: {
        todos: Record<string, any[]>
        expenses: any[]
        notes: any[]
        plans: any[]
        exportDate: string
      } = {
        todos: {},
        expenses: JSON.parse(localStorage.getItem(`expenses_${user?.id}`) || "[]"),
        notes: JSON.parse(localStorage.getItem(`notes_${user?.id}`) || "[]"),
        plans: JSON.parse(localStorage.getItem(`plans_${user?.id}`) || "[]"),
        exportDate: new Date().toISOString(),
      }

      const todoKeys = Object.keys(localStorage).filter((key) => key.startsWith(`todos_${user?.id}_`))
      todoKeys.forEach((key) => {
        const date = key.replace(`todos_${user?.id}_`, "")
        data.todos[date] = JSON.parse(localStorage.getItem(key) || "[]")
      })

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `taskmaster-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Your data has been exported successfully.")
    } catch (error) {
      toast.error("Failed to export data. Please try again.")
    }
  }

  const handleChangePassword = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError("confirmPassword", {
        message: "Passwords do not match",
      })
      return
    }

    setIsChangingPassword(true)
    const success = await changePassword(data.currentPassword, data.newPassword)
    setIsChangingPassword(false)

    if (success) {
      setShowChangePassword(false)
      passwordForm.reset()
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploadingImage(true)

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = async () => {
        // Resize image to max 400x400 while maintaining aspect ratio
        const maxSize = 400
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8)

        try {
          await updateProfile({ profilePicture: compressedBase64 })
          setShowProfilePicture(false)
          toast.success("Profile picture updated successfully!")
        } catch (error) {
          console.error("Profile update error:", error)
          toast.error("Failed to update profile picture")
        } finally {
          setIsUploadingImage(false)
        }
      }

      img.onerror = () => {
        toast.error("Failed to process image file")
        setIsUploadingImage(false)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("Failed to upload image")
      setIsUploadingImage(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return
    }

    try {
      // ✅ FIX: use undefined instead of null
      await updateProfile({ profilePicture: undefined })
      setShowProfilePicture(false)
      toast.success("Profile picture removed successfully!")
    } catch (error) {
      toast.error("Failed to remove profile picture")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your preferences and app settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback className="bg-blue-600 text-white text-lg">{user?.initials || "U"}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                onClick={() => setShowProfilePicture(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{user?.name || "User"}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
              {user?.profilePicture && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-auto p-0 text-xs"
                  onClick={() => setShowProfilePicture(true)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Picture
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowChangePassword(true)} className="flex-1">
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" onClick={logout} className="flex-1 bg-transparent">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {actualTheme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications for reminders and updates
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportData} variant="outline" className="w-full bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>

          <Button onClick={handleClearAllData} variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>App information and version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Build:</strong> {new Date().toISOString().split("T")[0]}
            </p>
            <p>
              <strong>Storage:</strong> Local Storage
            </p>
            <p>
              <strong>Offline Support:</strong> Full
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>

          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                {...passwordForm.register("currentPassword", { required: "Current password is required" })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                {...passwordForm.register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                {...passwordForm.register("confirmPassword", { required: "Please confirm your new password" })}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isChangingPassword}>
                {isChangingPassword ? <LoadingSpinner size="sm" /> : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfilePicture} onOpenChange={setShowProfilePicture}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
            <DialogDescription>Upload or view your profile picture.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {user?.profilePicture && (
              <div className="flex justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">{user.initials}</AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="space-y-2">
              <Label>Upload New Picture</Label>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (max 5MB)</p>

                {isUploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <LoadingSpinner size="sm" />
                    Uploading image...
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {user?.profilePicture && (
                <Button variant="outline" onClick={handleRemoveProfilePicture} className="flex-1 bg-transparent">
                  Remove Picture
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowProfilePicture(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
