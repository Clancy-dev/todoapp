// app/dashboard/todos/page.tsx
"use client"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TodoPage } from "@/components/pages/todo-page"
import { useState } from "react"

export default function TodosDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPage="todos"  isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          <TodoPage />
        </main>
      </div>
    </div>
  )
}
