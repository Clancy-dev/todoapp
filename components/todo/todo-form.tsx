"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Todo } from "@/hooks/use-todos"

interface TodoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TodoFormData) => void
  todo?: Todo
  isLoading?: boolean
}

export interface TodoFormData {
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  dueDate: string
  time: string // Added time field for scheduling
  completed: boolean
}

const categories = ["Personal", "Work", "Health", "Finance", "Learning", "Shopping", "Travel", "Other"]

const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return ""
  const [hours, minutes] = time24.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const formatTimeTo24Hour = (time12: string): string => {
  if (!time12) return ""
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return ""

  const [, hours, minutes, ampm] = match
  let hour = Number.parseInt(hours, 10)

  if (ampm.toUpperCase() === "PM" && hour !== 12) {
    hour += 12
  } else if (ampm.toUpperCase() === "AM" && hour === 12) {
    hour = 0
  }

  return `${hour.toString().padStart(2, "0")}:${minutes}`
}

export function TodoForm({ isOpen, onClose, onSubmit, todo, isLoading = false }: TodoFormProps) {
  const form = useForm<TodoFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      dueDate: "",
      time: "", // Added time default value
      completed: false,
    },
  })

  useEffect(() => {
    if (isOpen) {
      const savedFormData = localStorage.getItem("todoFormData")
      if (savedFormData && !todo) {
        try {
          const parsedData = JSON.parse(savedFormData)
          form.reset(parsedData)
        } catch (error) {
          console.error("Error loading saved form data:", error)
        }
      } else if (todo) {
        form.reset({
          title: todo.title,
          description: todo.description || "",
          category: todo.category,
          priority: todo.priority,
          dueDate: todo.dueDate || "",
          time: todo.time || "", // Load existing time
          completed: todo.completed,
        })
      }
    }
  }, [isOpen, todo, form])

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (isOpen && !todo) {
        localStorage.setItem("todoFormData", JSON.stringify(data))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, isOpen, todo])

  const handleSubmit = (data: TodoFormData) => {
    onSubmit(data)
    if (!todo) {
      localStorage.removeItem("todoFormData")
      form.reset({
        title: "",
        description: "",
        category: "Personal",
        priority: "medium",
        dueDate: "",
        time: "",
        completed: false,
      })
    }
  }

  const handleClose = () => {
    onClose()
  }

  const clearForm = () => {
    form.reset({
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      dueDate: "",
      time: "", // Clear time field
      completed: false,
    })
    localStorage.removeItem("todoFormData")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{todo ? "Edit Todo" : "Create New Todo"}</DialogTitle>
          <DialogDescription>
            {todo ? "Update your todo item details." : "Add a new todo item to your list."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter todo title"
              {...form.register("title", { required: "Title is required" })}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter todo description (optional)"
              rows={3}
              {...form.register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value: "low" | "medium" | "high") => form.setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select value={form.watch("time")} onValueChange={(value) => form.setValue("time", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {Array.from({ length: 24 }, (_, hour) =>
                    Array.from({ length: 2 }, (_, half) => {
                      const minutes = half * 30
                      const time24 = `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                      const ampm = hour < 12 ? "AM" : "PM"
                      const time12 = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`

                      return (
                        <SelectItem key={time24} value={time24}>
                          {time12}
                        </SelectItem>
                      )
                    }),
                  ).flat()}
                </SelectContent>
              </Select>
              {form.watch("time") && (
                <p className="text-xs text-gray-500">Scheduled for: {formatTimeTo12Hour(form.watch("time"))}</p>
              )}
            </div>
          </div>

          {todo && (
            <div className="flex items-center space-x-2">
              <input
                id="completed"
                type="checkbox"
                className="rounded border-gray-300"
                {...form.register("completed")}
              />
              <Label htmlFor="completed">Mark as completed</Label>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={clearForm}>
              Clear
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : todo ? "Update Todo" : "Create Todo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
