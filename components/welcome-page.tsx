"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthModal } from "@/components/auth-modal"
import { CheckCircle, DollarSign, BookOpen, Calendar } from "lucide-react"

interface WelcomePageProps {
  onComplete: () => void
}

export default function WelcomePage({ onComplete }: WelcomePageProps) {
  const [showAuth, setShowAuth] = useState(false)

  const features = [
    {
      icon: CheckCircle,
      title: "Smart Todo Management",
      description: "Create, organize, and track your tasks with intelligent categorization and priority levels.",
    },
    {
      icon: DollarSign,
      title: "Expense Tracking",
      description: "Monitor your income and expenses with detailed analytics and pagination for large datasets.",
    },
    {
      icon: BookOpen,
      title: "Learning Notes",
      description: "Capture and organize your insights, lessons learned, and important knowledge.",
    },
    {
      icon: Calendar,
      title: "Long-term Planning",
      description: "Set and track your long-term goals and aspirations with structured planning tools.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome to <span className="text-primary">TaskMaster Pro</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                Your all-in-one productivity companion. Manage tasks, track expenses, capture insights, and plan your
                future - all in one beautiful, responsive application.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto lg:mx-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="relative group">
                  <div className="aspect-square rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 hover:-translate-y-1">
                    <img
                      src="/task image3.jpg"
                      alt="Task Management Dashboard"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <div className="aspect-square rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 hover:-translate-y-1">
                    <img
                      src="/task image2.jpg"
                      alt="Productivity Analytics"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="relative group col-span-2">
                  <div className="aspect-[2/1] rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 hover:-translate-y-1">
                    <img
                      src="/tasks image.jpg"
                      alt="Team Collaboration Workspace"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 dark:bg-card dark:border-border"
            >
              <CardHeader className="pb-4">
                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-base sm:text-lg dark:text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm dark:text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-4xl mx-auto dark:bg-card dark:border-border">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl dark:text-card-foreground">
                Why Choose TaskMaster Pro?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Persistent Forms</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Never lose your work - forms remember your input even if you close them
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Responsive Design</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Works perfectly on all devices - desktop, tablet, and mobile
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Smart Search</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Find anything quickly with powerful search functionality
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Local Storage</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your data stays private and accessible offline
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={onComplete} />
    </div>
  )
}
