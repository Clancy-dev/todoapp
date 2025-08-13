"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
import { syncService } from "@/lib/sync-service"
import {
  createExpense,
  getExpensesByUser,
  updateExpense as updateExpenseServer,
  deleteExpense as deleteExpenseServer,
} from "@/lib/actions/expenses"

export interface Transaction {
  id: string
  title: string
  description?: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  createdAt: string
  updatedAt: string
  userId?: string
}

export function useExpenses() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const getStorageKey = () => {
    return user ? `expenses_${user.id}` : "expenses_guest"
  }

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)

        // Always load from localStorage first (works offline)
        const savedTransactions = localStorage.getItem(getStorageKey())
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        } else {
          setTransactions([])
        }

        // If online and user exists, try to load from server
        if (user && syncService.getIsOnline()) {
          try {
            const result = await getExpensesByUser(user.id)
            if (result.success) {
              localStorage.setItem(getStorageKey(), JSON.stringify(result.expenses))
              setTransactions(result.expenses)
            }
          } catch (error) {
            console.error("Failed to load expenses from server:", error)
            // Continue with local data
          }
        }
      } catch (error) {
        console.error("Error loading transactions:", error)
        toast.error("Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [user])

  const saveTransactions = (newTransactions: Transaction[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newTransactions))
      setTransactions(newTransactions)
    } catch (error) {
      console.error("Error saving transactions:", error)
      toast.error("Failed to save transactions")
    }
  }

  const addTransaction = async (transactionData: Omit<Transaction, "id" | "createdAt" | "updatedAt" | "userId">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id,
    }

    // Save locally first
    const newTransactions = [...transactions, newTransaction]
    saveTransactions(newTransactions)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const serverData = {
          ...newTransaction,
          date: new Date(newTransaction.date),
        }
        const result = await createExpense(serverData)
        if (result.success) {
          toast.success(`${transactionData.type === "income" ? "Income" : "Expense"} added successfully`)
          return result.expense
        }
      } catch (error) {
        console.error("Failed to create expense on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "create",
        entity: "expense",
        data: newTransaction,
        userId: user.id,
      })
    }

    toast.success(`${transactionData.type === "income" ? "Income" : "Expense"} added successfully`)
    return newTransaction
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updatedTransaction = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Update locally first
    const newTransactions = transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction,
    )
    saveTransactions(newTransactions)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const serverData = {
          ...updatedTransaction,
          date: updatedTransaction.date ? new Date(updatedTransaction.date) : undefined,
        }
        const result = await updateExpenseServer(id, serverData)
        if (result.success) {
          toast.success("Transaction updated successfully")
          return
        }
      } catch (error) {
        console.error("Failed to update expense on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "update",
        entity: "expense",
        data: { id, ...updatedTransaction },
        userId: user.id,
      })
    }

    toast.success("Transaction updated successfully")
  }

  const deleteTransaction = async (id: string) => {
    // Delete locally first
    const newTransactions = transactions.filter((transaction) => transaction.id !== id)
    saveTransactions(newTransactions)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const result = await deleteExpenseServer(id)
        if (result.success) {
          toast.success("Transaction deleted successfully")
          return
        }
      } catch (error) {
        console.error("Failed to delete expense on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "delete",
        entity: "expense",
        data: { id },
        userId: user.id,
      })
    }

    toast.success("Transaction deleted successfully")
  }

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
  }
}
