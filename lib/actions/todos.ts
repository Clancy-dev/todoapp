"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createTodo(data: {
  title: string
  description?: string
  category: string
  priority: string
  dueDate?: Date
  time?: string
  userId: string
  date: string
}) {
  try {
    const todo = await db.todo.create({
      data,
    })

    revalidatePath("/todos")
    return { success: true, todo }
  } catch (error) {
    return { success: false, error: "Failed to create todo" }
    // If i fail to create i want it to see the real error
  }
}

export async function getTodosByUserAndDate(userId: string, date: string) {
  try {
    const todos = await db.todo.findMany({
      where: {
        userId,
        date,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, todos }
  } catch (error) {
    return { success: false, error: "Failed to get todos" }
  }
}

export async function updateTodo(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    priority?: string
    dueDate?: Date
    time?: string
    completed?: boolean
  },
) {
  try {
    const todo = await db.todo.update({
      where: { id },
      data,
    })

    revalidatePath("/todos")
    return { success: true, todo }
  } catch (error) {
    return { success: false, error: "Failed to update todo" }
  }
}

export async function deleteTodo(id: string) {
  try {
    await db.todo.delete({
      where: { id },
    })

    revalidatePath("/todos")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete todo" }
  }
}

export async function syncTodos(userId: string, todos: any[]) {
  try {
    // Delete existing todos for this user
    await db.todo.deleteMany({
      where: { userId },
    })

    // Create new todos
    if (todos.length > 0) {
      await db.todo.createMany({
        data: todos.map((todo) => ({
          ...todo,
          userId,
          id: undefined, // Let MongoDB generate new IDs
        })),
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to sync todos" }
  }
}
