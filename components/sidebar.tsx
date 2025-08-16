"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { CheckSquare, DollarSign, BookOpen, Calendar, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  {
    name: "Todo",
    href: "/dashboard/todos",
    icon: CheckSquare,
    description: "Manage your tasks and todos",
  },
  {
    name: "Expenses",
    href: "/dashboard/expenses",
    icon: DollarSign,
    description: "Track income and expenses",
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: BookOpen,
    description: "Short notes and lessons learned",
  },
  {
    name: "Plans",
    href: "/dashboard/plans",
    icon: Calendar,
    description: "Long-term goals and planning",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "App preferences and settings",
  },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-left",
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.name}</span>
                    <span className={cn("text-xs", isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400")}>
                      {item.description}
                    </span>
                  </div>
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>TaskMaster Pro v1.0</p>
          <p>Your productivity companion</p>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onClose={() => onToggle()} />
        </SheetContent>
      </Sheet>
    </>
  )
}
