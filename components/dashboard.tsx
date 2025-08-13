"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TodoPage } from "@/components/pages/todo-page"
import { ExpensePage } from "@/components/pages/expense-page"
import { NotesPage } from "@/components/pages/notes-page"
import { PlansPage } from "@/components/pages/plans-page"
import { SettingsPage } from "@/components/pages/settings-page"

export type PageType = "todos" | "expenses" | "notes" | "plans" | "settings"

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("todos")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case "todos":
        return <TodoPage />
      case "expenses":
        return <ExpensePage />
      case "notes":
        return <NotesPage />
      case "plans":
        return <PlansPage />
      case "settings":
        return <SettingsPage />
      default:
        return <TodoPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-8">{renderPage()}</main>
      </div>
    </div>
  )
}
