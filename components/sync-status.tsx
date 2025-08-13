"use client"

import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSync } from "@/hooks/use-sync"

export function SyncStatus() {
  const { isOnline, pendingSyncCount, isSyncing, syncAllData } = useSync()

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <div className="flex items-center gap-1">
        {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
        <span className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>
      </div>

      {/* Pending Sync Count */}
      {pendingSyncCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {pendingSyncCount} pending
        </Badge>
      )}

      {/* Sync Button */}
      {isOnline && (
        <Button variant="ghost" size="sm" onClick={syncAllData} disabled={isSyncing} className="h-6 px-2 text-xs">
          {isSyncing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3 mr-1" />
              Sync
            </>
          )}
        </Button>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1">
          <CloudOff className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-muted-foreground">Changes saved locally</span>
        </div>
      )}
    </div>
  )
}
