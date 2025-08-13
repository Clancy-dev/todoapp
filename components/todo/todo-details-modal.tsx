"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flag, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Todo } from "@/hooks/use-todos"

interface TodoDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  todo: Todo | null
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function TodoDetailsModal({ isOpen, onClose, todo }: TodoDetailsModalProps) {
  if (!todo) return null

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {todo.title}
            {todo.completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Completed
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Todo Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {todo.description && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-400">{todo.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Category</h4>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <User className="w-3 h-3 mr-1" />
                {todo.category}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Priority</h4>
              <Badge variant="secondary" className={priorityColors[todo.priority]}>
                <Flag className="w-3 h-3 mr-1" />
                {todo.priority}
              </Badge>
            </div>
          </div>

          {todo.dueDate && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Due Date</h4>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                  isOverdue && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(todo.dueDate).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </Badge>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Created</span>
                </div>
                <p>{new Date(todo.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Updated</span>
                </div>
                <p>{new Date(todo.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
