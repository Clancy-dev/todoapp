"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
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
  userId: string
}

// Helper to cast server type string to union
const mapType = (t: string): "income" | "expense" => {
  if (t === "income" || t === "expense") return t
  return "expense"
}

export function useExpenses() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) {
        setTransactions([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await getExpensesByUser(user.id)
        if (result.success && Array.isArray(result.expenses)) {
          const mapped: Transaction[] = result.expenses.map((t: any) => ({
            ...t,
            description: t.description ?? undefined,
            date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
            createdAt: new Date(t.createdAt).toISOString(),
            updatedAt: new Date(t.updatedAt).toISOString(),
            type: mapType(t.type),
          }))
          setTransactions(mapped)
        } else {
          console.error("Failed to load expenses:", result.error)
          toast.error("Failed to load transactions")
          setTransactions([])
        }
      } catch (error) {
        console.error("Error loading transactions:", error)
        toast.error("Failed to load transactions")
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [user])

  const addTransaction = async (transactionData: Omit<Transaction, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) {
      toast.error("Please log in to add transactions")
      return null
    }

    try {
      const serverData = {
        ...transactionData,
        date: transactionData.date ? new Date(transactionData.date) : new Date(),
        userId: user.id,
      }

      const result = await createExpense(serverData)
      if (result.success && result.expense) {
        const mapped: Transaction = {
          ...result.expense,
          description: result.expense.description ?? undefined,
          date: result.expense.date ? new Date(result.expense.date).toISOString() : new Date().toISOString(),
          createdAt: new Date(result.expense.createdAt).toISOString(),
          updatedAt: new Date(result.expense.updatedAt).toISOString(),
          type: mapType(result.expense.type),
        }
        setTransactions((prev) => [...prev, mapped])
        toast.success(`${transactionData.type === "income" ? "Income" : "Expense"} added successfully`)
        return mapped
      } else {
        toast.error(result.error || "Failed to add transaction")
        return null
      }
    } catch (error) {
      console.error("Failed to create expense:", error)
      toast.error("Failed to add transaction")
      return null
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) {
      toast.error("Please log in to update transactions")
      return
    }

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date(),
        date: updates.date ? new Date(updates.date) : undefined,
      }

      const result = await updateExpenseServer(id, updatedData)
      if (result.success && result.expense) {
        const mapped: Transaction = {
          ...result.expense,
          description: result.expense.description ?? undefined,
          date: result.expense.date ? new Date(result.expense.date).toISOString() : new Date().toISOString(),
          createdAt: new Date(result.expense.createdAt).toISOString(),
          updatedAt: new Date(result.expense.updatedAt).toISOString(),
          type: mapType(result.expense.type),
        }
        setTransactions((prev) => prev.map((t) => (t.id === id ? mapped : t)))
        toast.success("Transaction updated successfully")
      } else {
        toast.error(result.error || "Failed to update transaction")
      }
    } catch (error) {
      console.error("Failed to update expense:", error)
      toast.error("Failed to update transaction")
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) {
      toast.error("Please log in to delete transactions")
      return
    }

    try {
      const result = await deleteExpenseServer(id)
      if (result.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        toast.success("Transaction deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete transaction")
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
      toast.error("Failed to delete transaction")
    }
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
