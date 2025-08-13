"use client"

import { useEffect, useState } from "react"
import { syncService } from "@/lib/sync-service"
import { useAuth } from "@/hooks/use-auth"

export function useSync() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateStatus = () => {
      setIsOnline(syncService.getIsOnline())
      setPendingSyncCount(syncService.getPendingSyncCount())
    }

    const handleSyncComplete = () => {
      updateStatus()
      setIsSyncing(false)
    }

    // Initial status
    updateStatus()

    // Listen for sync completion
    syncService.onSyncComplete(handleSyncComplete)

    // Set up periodic status updates
    const interval = setInterval(updateStatus, 1000)

    return () => {
      clearInterval(interval)
      syncService.offSyncComplete(handleSyncComplete)
    }
  }, [])

  const syncAllData = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      await syncService.syncAllData(user.id)
    } finally {
      setIsSyncing(false)
    }
  }

  const loadDataFromServer = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      await syncService.loadDataFromServer(user.id)
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    syncAllData,
    loadDataFromServer,
    addToSyncQueue: syncService.addToSyncQueue.bind(syncService),
  }
}
