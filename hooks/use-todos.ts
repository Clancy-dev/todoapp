"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
import { syncService } from "@/lib/sync-service"
import {
  createTodo,
  getTodosByUserAndDate,
  updateTodo as updateTodoServer,
  deleteTodo as deleteTodoServer,
} from "@/lib/actions/todos"

export interface Todo {
  id: string
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  time?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  userId?: string
}

export function useTodos(selectedDate?: string) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const getStorageKey = () => {
    const dateKey = selectedDate || new Date().toISOString().split("T")[0]
    return user ? `todos_${user.id}_${dateKey}` : `todos_guest_${dateKey}`
  }

  const getDateKey = () => {
    return selectedDate || new Date().toISOString().split("T")[0]
  }

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true)

        // Always load from localStorage first (works offline)
        const savedTodos = localStorage.getItem(getStorageKey())
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos))
        } else {
          setTodos([])
        }

        // If online and user exists, try to load from server
        if (user && syncService.getIsOnline()) {
          try {
            const result = await getTodosByUserAndDate(user.id, getDateKey())
            if (result.success) {
              localStorage.setItem(getStorageKey(), JSON.stringify(result.todos))
              setTodos(result.todos)
            }
          } catch (error) {
            console.error("Failed to load todos from server:", error)
            // Continue with local data
          }
        }
      } catch (error) {
        console.error("Error loading todos:", error)
        toast.error("Failed to load todos")
      } finally {
        setLoading(false)
      }
    }

    loadTodos()
  }, [user, selectedDate])

  const saveTodos = (newTodos: Todo[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newTodos))
      setTodos(newTodos)
    } catch (error) {
      console.error("Error saving todos:", error)
      toast.error("Failed to save todos")
    }
  }

  const addTodo = async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id,
    }

    // Save locally first
    const newTodos = [...todos, newTodo]
    saveTodos(newTodos)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const serverData = {
          ...newTodo,
          dueDate: newTodo.dueDate ? new Date(newTodo.dueDate) : undefined,
          date: getDateKey(),
        }
        const result = await createTodo(serverData)
        if (result.success) {
          toast.success("Todo created successfully")
          return result.todo
        }
      } catch (error) {
        console.error("Failed to create todo on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "create",
        entity: "todo",
        data: { ...newTodo, date: getDateKey() },
        userId: user.id,
      })
    }

    toast.success("Todo created successfully")
    return newTodo
  }

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const updatedTodo = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Update locally first
    const newTodos = todos.map((todo) => (todo.id === id ? { ...todo, ...updatedTodo } : todo))
    saveTodos(newTodos)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const serverData = {
          ...updatedTodo,
          dueDate: updatedTodo.dueDate ? new Date(updatedTodo.dueDate) : undefined,
        }
        const result = await updateTodoServer(id, serverData)
        if (result.success) {
          toast.success("Todo updated successfully")
          return
        }
      } catch (error) {
        console.error("Failed to update todo on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "update",
        entity: "todo",
        data: { id, ...updatedTodo },
        userId: user.id,
      })
    }

    toast.success("Todo updated successfully")
  }

  const deleteTodo = async (id: string) => {
    // Delete locally first
    const newTodos = todos.filter((todo) => todo.id !== id)
    saveTodos(newTodos)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const result = await deleteTodoServer(id)
        if (result.success) {
          toast.success("Todo deleted successfully")
          return
        }
      } catch (error) {
        console.error("Failed to delete todo on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "delete",
        entity: "todo",
        data: { id },
        userId: user.id,
      })
    }

    toast.success("Todo deleted successfully")
  }

  const toggleComplete = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      updateTodo(id, { completed: !todo.completed })
    }
  }

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  }
}
