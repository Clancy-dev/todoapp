"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Flag, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Todo } from "@/hooks/use-todos"

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onViewDetails: (todo: Todo) => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const categoryColors = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
]

const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return ""
  const [hours, minutes] = time24.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function TodoItem({ todo, onToggleComplete, onEdit, onDelete, onViewDetails }: TodoItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleToggleComplete = async () => {
    setIsCompleting(true)
    onToggleComplete(todo.id)
    setTimeout(() => setIsCompleting(false), 300)
  }

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  const getCategoryColor = (category: string) => {
    const index = category.length % categoryColors.length
    return categoryColors[index]
  }

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", todo.completed && "opacity-75")}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isCompleting}
            className="mt-0.5"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={cn(
                  "font-medium text-gray-900 dark:text-white text-sm",
                  todo.completed && "line-through text-gray-500 dark:text-gray-400",
                )}
              >
                {todo.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(todo)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(todo)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(todo.id)} className="text-red-600 dark:text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {todo.description && (
              <p
                className={cn(
                  "text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1",
                  todo.completed && "line-through",
                )}
              >
                {todo.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Badge variant="secondary" className={cn("text-xs px-2 py-0.5 h-5", getCategoryColor(todo.category))}>
                {todo.category}
              </Badge>

              <Badge variant="secondary" className={cn("text-xs px-2 py-0.5 h-5", priorityColors[todo.priority])}>
                <Flag className="w-2.5 h-2.5 mr-1" />
                {todo.priority}
              </Badge>

              {todo.dueDate && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs px-2 py-0.5 h-5 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                    isOverdue && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                  )}
                >
                  <Calendar className="w-2.5 h-2.5 mr-1" />
                  {new Date(todo.dueDate).toLocaleDateString()}
                </Badge>
              )}

              {todo.time && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 h-5 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300"
                >
                  <Clock className="w-2.5 h-2.5 mr-1" />
                  {formatTimeTo12Hour(todo.time)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
