"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createExpense(data: {
  title: string
  description?: string
  amount: number
  type: string
  category: string
  date: Date
  userId: string
}) {
  try {
    const expense = await db.expense.create({
      data,
    })

    revalidatePath("/expenses")
    return { success: true, expense }
  } catch (error) {
    return { success: false, error: "Failed to create expense" }
  }
}

export async function getExpensesByUser(userId: string) {
  try {
    const expenses = await db.expense.findMany({
      where: { userId },
      orderBy: {
        date: "desc",
      },
    })

    return { success: true, expenses }
  } catch (error) {
    return { success: false, error: "Failed to get expenses" }
  }
}

export async function updateExpense(
  id: string,
  data: {
    title?: string
    description?: string
    amount?: number
    type?: string
    category?: string
    date?: Date
  },
) {
  try {
    const expense = await db.expense.update({
      where: { id },
      data,
    })

    revalidatePath("/expenses")
    return { success: true, expense }
  } catch (error) {
    return { success: false, error: "Failed to update expense" }
  }
}

export async function deleteExpense(id: string) {
  try {
    await db.expense.delete({
      where: { id },
    })

    revalidatePath("/expenses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete expense" }
  }
}

export async function syncExpenses(userId: string, expenses: any[]) {
  try {
    // Delete existing expenses for this user
    await db.expense.deleteMany({
      where: { userId },
    })

    // Create new expenses
    if (expenses.length > 0) {
      await db.expense.createMany({
        data: expenses.map((expense) => ({
          ...expense,
          userId,
          id: undefined, // Let MongoDB generate new IDs
        })),
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to sync expenses" }
  }
}
