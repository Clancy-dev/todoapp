"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
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
  date: string // ISO date string
  time?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

// Helper to cast priority string from server to union type
const mapPriority = (p: string): "low" | "medium" | "high" => {
  if (p === "low" || p === "medium" || p === "high") return p
  return "low" // fallback
}

export function useTodos(selectedDate?: string) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const getDateKey = () => selectedDate || new Date().toISOString().split("T")[0]

  useEffect(() => {
    const loadTodos = async () => {
      if (!user) {
        setTodos([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await getTodosByUserAndDate(user.id, getDateKey())

        if (result.success && Array.isArray(result.todos)) {
          const todos: Todo[] = result.todos.map((t: any) => ({
            ...t,
            description: t.description ?? undefined,
            time: t.time ?? undefined,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
            createdAt: new Date(t.createdAt).toISOString(),
            updatedAt: new Date(t.updatedAt).toISOString(),
            priority: mapPriority(t.priority),
          }))
          setTodos(todos)
        } else {
          console.error("Failed to load todos:", result.error)
          toast.error("Failed to load todos")
          setTodos([])
        }
      } catch (error) {
        console.error("Error loading todos:", error)
        toast.error("Failed to load todos")
        setTodos([])
      } finally {
        setLoading(false)
      }
    }

    loadTodos()
  }, [user, selectedDate])

  const addTodo = async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) {
      toast.error("Please log in to create todos")
      return null
    }

    try {
      const serverData = {
        ...todoData,
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
        date: getDateKey(),
        userId: user.id,
      }

      const result = await createTodo(serverData)

      if (result.success && result.todo) {
        const todo: Todo = {
          ...result.todo,
          description: result.todo.description ?? undefined,
          time: result.todo.time ?? undefined,
          dueDate: result.todo.dueDate ? new Date(result.todo.dueDate).toISOString() : undefined,
          createdAt: new Date(result.todo.createdAt).toISOString(),
          updatedAt: new Date(result.todo.updatedAt).toISOString(),
          priority: mapPriority(result.todo.priority),
        }
        setTodos((prev) => [...prev, todo])
        toast.success("Todo created successfully")
        return todo
      } else {
        toast.error(result.error || "Failed to create todo")
        return null
      }
    } catch (error) {
      console.error("Failed to create todo:", error)
      toast.error("Failed to create todo")
      return null
    }
  }

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (!user) {
      toast.error("Please log in to update todos")
      return
    }

    try {
      const updatedData = {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        updatedAt: new Date(),
      }

      const result = await updateTodoServer(id, updatedData)

      if (result.success && result.todo) {
        const updatedTodo: Todo = {
          ...result.todo,
          description: result.todo.description ?? undefined,
          time: result.todo.time ?? undefined,
          dueDate: result.todo.dueDate ? new Date(result.todo.dueDate).toISOString() : undefined,
          createdAt: new Date(result.todo.createdAt).toISOString(),
          updatedAt: new Date(result.todo.updatedAt).toISOString(),
          priority: mapPriority(result.todo.priority),
        }
        setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
        toast.success("Todo updated successfully")
      } else {
        toast.error(result.error || "Failed to update todo")
      }
    } catch (error) {
      console.error("Failed to update todo:", error)
      toast.error("Failed to update todo")
    }
  }

  const deleteTodo = async (id: string) => {
    if (!user) {
      toast.error("Please log in to delete todos")
      return
    }

    try {
      const result = await deleteTodoServer(id)
      if (result.success) {
        setTodos((prev) => prev.filter((t) => t.id !== id))
        toast.success("Todo deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete todo")
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
      toast.error("Failed to delete todo")
    }
  }

  const toggleComplete = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) updateTodo(id, { completed: !todo.completed })
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
