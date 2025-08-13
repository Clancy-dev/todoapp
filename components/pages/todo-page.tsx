"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, CheckSquare, Filter, Calendar } from "lucide-react"
import { PageLoadingSpinner } from "@/components/loading-spinner"
import { useTodos, type Todo } from "@/hooks/use-todos"
import { TodoForm, type TodoFormData } from "@/components/todo/todo-form"
import { TodoItem } from "@/components/todo/todo-item"
import { TodoDetailsModal } from "@/components/todo/todo-details-modal"
import { DeleteConfirmationModal } from "@/components/todo/delete-confirmation-modal"

export function TodoPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null)
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleComplete } = useTodos(selectedDate)

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesCategory = categoryFilter === "all" || todo.category === categoryFilter
      const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && todo.completed) ||
        (statusFilter === "pending" && !todo.completed)

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus
    })
  }, [todos, searchQuery, categoryFilter, priorityFilter, statusFilter])

  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTodos = filteredTodos.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, priorityFilter, statusFilter, selectedDate])

  const categories = Array.from(new Set(todos.map((todo) => todo.category)))
  const completedCount = todos.filter((todo) => todo.completed).length
  const pendingCount = todos.filter((todo) => !todo.completed).length

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today"
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday"
    } else if (dateStr === tomorrow.toISOString().split("T")[0]) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  const handleSubmit = async (data: TodoFormData) => {
    setIsSubmitting(true)
    try {
      if (editingTodo) {
        updateTodo(editingTodo.id, data)
      } else {
        addTodo(data)
      }
      setShowForm(false)
      setEditingTodo(undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setDeletingTodoId(id)
    }
  }

  const confirmDelete = () => {
    if (deletingTodoId) {
      deleteTodo(deletingTodoId)
      setDeletingTodoId(null)
    }
  }

  const handleViewDetails = (todo: Todo) => {
    setViewingTodo(todo)
  }

  if (loading) {
    return <PageLoadingSpinner />
  }

  const deletingTodo = todos.find((t) => t.id === deletingTodoId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Todo Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {todos.length} total • {completedCount} completed • {pendingCount} pending
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Todo
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">{formatDateDisplay(selectedDate)}</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Select a date to view and manage todos for that day
              </p>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">
              {todos.length === 0 ? `No todos for ${formatDateDisplay(selectedDate)}` : "No todos match your filters"}
            </CardTitle>
            <CardDescription className="mb-4">
              {todos.length === 0
                ? "Get started by creating your first todo for this date"
                : "Try adjusting your search or filter criteria"}
            </CardDescription>
            {todos.length === 0 && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Todo for {formatDateDisplay(selectedDate)}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={toggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTodos.length)} of{" "}
                {filteredTodos.length} todos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TodoForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTodo(undefined)
        }}
        onSubmit={handleSubmit}
        todo={editingTodo}
        isLoading={isSubmitting}
      />

      <TodoDetailsModal isOpen={!!viewingTodo} onClose={() => setViewingTodo(null)} todo={viewingTodo} />

      <DeleteConfirmationModal
        isOpen={!!deletingTodoId}
        onClose={() => setDeletingTodoId(null)}
        onConfirm={confirmDelete}
        todoTitle={deletingTodo?.title || ""}
      />
    </div>
  )
}
