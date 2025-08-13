"use client"

import { toast } from "react-hot-toast"
import { createTodo, getTodosByUserAndDate, updateTodo, deleteTodo, syncTodos } from "@/lib/actions/todos"
import { createExpense, getExpensesByUser, updateExpense, deleteExpense, syncExpenses } from "@/lib/actions/expenses"
import { createNote, getNotesByUser, updateNote, deleteNote, syncNotes } from "@/lib/actions/notes"
import { createPlan, getPlansByUser, updatePlan, deletePlan, syncPlans } from "@/lib/actions/plans"

export interface SyncOperation {
  id: string
  type: "create" | "update" | "delete"
  entity: "todo" | "expense" | "note" | "plan"
  data: any
  timestamp: number
  userId: string
}

class SyncService {
  private isOnline = true
  private syncQueue: SyncOperation[] = []
  private isSyncing = false
  private syncCallbacks: (() => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      this.setupEventListeners()
      this.loadSyncQueue()
    }
  }

  private setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true
      toast.success("Back online! Syncing data...")
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      toast.error("You're offline. Changes will sync when reconnected.")
    })
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem("syncQueue")
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load sync queue:", error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem("syncQueue", JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("Failed to save sync queue:", error)
    }
  }

  public addToSyncQueue(operation: Omit<SyncOperation, "id" | "timestamp">) {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }

    this.syncQueue.push(syncOperation)
    this.saveSyncQueue()

    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  public async processSyncQueue() {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return
    }

    this.isSyncing = true
    const operations = [...this.syncQueue]
    const processedIds: string[] = []

    try {
      for (const operation of operations) {
        try {
          await this.processOperation(operation)
          processedIds.push(operation.id)
        } catch (error) {
          console.error("Failed to process operation:", operation, error)
          // Keep failed operations in queue for retry
        }
      }

      // Remove successfully processed operations
      this.syncQueue = this.syncQueue.filter((op) => !processedIds.includes(op.id))
      this.saveSyncQueue()

      if (processedIds.length > 0) {
        toast.success(`Synced ${processedIds.length} changes`)
        this.notifySyncCallbacks()
      }
    } catch (error) {
      console.error("Sync queue processing failed:", error)
    } finally {
      this.isSyncing = false
    }
  }

  private async processOperation(operation: SyncOperation) {
    const { type, entity, data, userId } = operation

    switch (entity) {
      case "todo":
        return this.processTodoOperation(type, data, userId)
      case "expense":
        return this.processExpenseOperation(type, data, userId)
      case "note":
        return this.processNoteOperation(type, data, userId)
      case "plan":
        return this.processPlanOperation(type, data, userId)
      default:
        throw new Error(`Unknown entity type: ${entity}`)
    }
  }

  private async processTodoOperation(type: string, data: any, userId: string) {
    switch (type) {
      case "create":
        return await createTodo({ ...data, userId })
      case "update":
        return await updateTodo(data.id, data)
      case "delete":
        return await deleteTodo(data.id)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  private async processExpenseOperation(type: string, data: any, userId: string) {
    switch (type) {
      case "create":
        return await createExpense({ ...data, userId })
      case "update":
        return await updateExpense(data.id, data)
      case "delete":
        return await deleteExpense(data.id)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  private async processNoteOperation(type: string, data: any, userId: string) {
    switch (type) {
      case "create":
        return await createNote({ ...data, userId })
      case "update":
        return await updateNote(data.id, data)
      case "delete":
        return await deleteNote(data.id)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  private async processPlanOperation(type: string, data: any, userId: string) {
    switch (type) {
      case "create":
        return await createPlan({ ...data, userId })
      case "update":
        return await updatePlan(data.id, data)
      case "delete":
        return await deletePlan(data.id)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  public async syncAllData(userId: string) {
    if (!this.isOnline) {
      toast.error("Cannot sync while offline")
      return
    }

    try {
      toast.loading("Syncing all data...")

      // Get all local data
      const localTodos = this.getAllLocalTodos(userId)
      const localExpenses = this.getAllLocalExpenses(userId)
      const localNotes = this.getAllLocalNotes(userId)
      const localPlans = this.getAllLocalPlans(userId)

      // Sync each entity type
      await Promise.all([
        syncTodos(userId, localTodos),
        syncExpenses(userId, localExpenses),
        syncNotes(userId, localNotes),
        syncPlans(userId, localPlans),
      ])

      // Clear sync queue after successful full sync
      this.syncQueue = []
      this.saveSyncQueue()

      toast.dismiss()
      toast.success("All data synced successfully!")
      this.notifySyncCallbacks()
    } catch (error) {
      toast.dismiss()
      toast.error("Failed to sync data")
      console.error("Full sync failed:", error)
    }
  }

  private getAllLocalTodos(userId: string): any[] {
    const todos: any[] = []
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(`todos_${userId}_`))

    keys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]")
        todos.push(...data)
      } catch (error) {
        console.error("Failed to parse todos from localStorage:", error)
      }
    })

    return todos
  }

  private getAllLocalExpenses(userId: string): any[] {
    try {
      const data = localStorage.getItem(`expenses_${userId}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Failed to parse expenses from localStorage:", error)
      return []
    }
  }

  private getAllLocalNotes(userId: string): any[] {
    try {
      const data = localStorage.getItem(`notes_${userId}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Failed to parse notes from localStorage:", error)
      return []
    }
  }

  private getAllLocalPlans(userId: string): any[] {
    try {
      const data = localStorage.getItem(`plans_${userId}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Failed to parse plans from localStorage:", error)
      return []
    }
  }

  public async loadDataFromServer(userId: string) {
    if (!this.isOnline) {
      return
    }

    try {
      // Load data from server and update local storage
      const [todosResult, expensesResult, notesResult, plansResult] = await Promise.all([
        this.loadTodosFromServer(userId),
        getExpensesByUser(userId),
        getNotesByUser(userId),
        getPlansByUser(userId),
      ])

      if (expensesResult.success) {
        localStorage.setItem(`expenses_${userId}`, JSON.stringify(expensesResult.expenses))
      }

      if (notesResult.success) {
        localStorage.setItem(`notes_${userId}`, JSON.stringify(notesResult.notes))
      }

      if (plansResult.success) {
        localStorage.setItem(`plans_${userId}`, JSON.stringify(plansResult.plans))
      }

      this.notifySyncCallbacks()
    } catch (error) {
      console.error("Failed to load data from server:", error)
    }
  }

  private async loadTodosFromServer(userId: string) {
    // Load todos for all dates that exist in localStorage
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(`todos_${userId}_`))

    for (const key of keys) {
      const date = key.replace(`todos_${userId}_`, "")
      const result = await getTodosByUserAndDate(userId, date)

      if (result.success) {
        localStorage.setItem(key, JSON.stringify(result.todos))
      }
    }
  }

  public onSyncComplete(callback: () => void) {
    this.syncCallbacks.push(callback)
  }

  public offSyncComplete(callback: () => void) {
    this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback)
  }

  private notifySyncCallbacks() {
    this.syncCallbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("Sync callback error:", error)
      }
    })
  }

  public getIsOnline(): boolean {
    return this.isOnline
  }

  public getPendingSyncCount(): number {
    return this.syncQueue.length
  }
}

export const syncService = new SyncService()
