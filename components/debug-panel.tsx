"use client"

import { useAuth } from "@/hooks/use-auth"
import { syncService } from "@/lib/sync-service"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugPanel() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(syncService.getIsOnline())
  const [pendingSync, setPendingSync] = useState(syncService.getPendingSyncCount())

  const handleManualSync = async () => {
    if (user) {
      await syncService.syncAllData(user.id)
      setPendingSync(syncService.getPendingSyncCount())
    }
  }

  const handleLoadFromServer = async () => {
    if (user) {
      await syncService.loadDataFromServer(user.id)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader>
        <CardTitle className="text-sm">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs">
          <p>
            <strong>User:</strong> {user ? `${user.name} (${user.id})` : "Not logged in"}
          </p>
          <p>
            <strong>Online:</strong> {isOnline ? "Yes" : "No"}
          </p>
          <p>
            <strong>Pending Sync:</strong> {pendingSync} operations
          </p>
        </div>

        {user && (
          <div className="space-y-1">
            <Button size="sm" onClick={handleManualSync} className="w-full">
              Manual Sync to DB
            </Button>
            <Button size="sm" onClick={handleLoadFromServer} variant="outline" className="w-full bg-transparent">
              Load from Server
            </Button>
          </div>
        )}

        {!user && <p className="text-xs text-red-500">Please log in to sync with database</p>}
      </CardContent>
    </Card>
  )
}
