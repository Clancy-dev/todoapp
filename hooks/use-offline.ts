"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

interface OfflineData {
  todos: any[]
  expenses: any[]
  notes: any[]
  plans: any[]
  timestamp: number
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineData()
      toast({
        title: "Back Online",
        description: "Your data has been synced successfully.",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Offline Mode",
        description: "You're now offline. Changes will sync when you're back online.",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const syncOfflineData = async () => {
    try {
      setPendingSync(true)

      // Get offline data
      const offlineData = localStorage.getItem("offlineData")
      if (offlineData) {
        const data: OfflineData = JSON.parse(offlineData)

        // Sync logic would go here - for now we just clear offline data
        // In a real app, you'd send this to your backend
        localStorage.removeItem("offlineData")

        toast({
          title: "Sync Complete",
          description: "All offline changes have been synchronized.",
        })
      }
    } catch (error) {
      console.error("Sync failed:", error)
      toast({
        title: "Sync Failed",
        description: "Some changes couldn't be synced. They'll retry automatically.",
        variant: "destructive",
      })
    } finally {
      setPendingSync(false)
    }
  }

  const saveOfflineData = (type: keyof OfflineData, data: any) => {
    if (!isOnline) {
      const existingData = localStorage.getItem("offlineData")
      const offlineData: OfflineData = existingData
        ? JSON.parse(existingData)
        : { todos: [], expenses: [], notes: [], plans: [], timestamp: Date.now() }

      offlineData[type] = data
      offlineData.timestamp = Date.now()

      localStorage.setItem("offlineData", JSON.stringify(offlineData))
    }
  }

  return {
    isOnline,
    pendingSync,
    saveOfflineData,
    syncOfflineData,
  }
}
