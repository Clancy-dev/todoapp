"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthModal } from "@/components/auth-modal"
import { CheckCircle, DollarSign, BookOpen, Calendar } from "lucide-react"

interface WelcomePageProps {
  onComplete: () => void
}

export function WelcomePage({ onComplete }: WelcomePageProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600 dark:text-blue-400">TaskMaster Pro</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Your all-in-one productivity companion. Manage tasks, track expenses, capture insights, and plan your future
            - all in one beautiful, responsive application.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={onComplete} className="px-8 py-3 text-lg bg-transparent">
              Continue as Guest
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Why Choose TaskMaster Pro?</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Persistent Forms:</strong> Never lose your work - forms remember your input even if you close
                  them
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Responsive Design:</strong> Works perfectly on all devices - desktop, tablet, and mobile
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Smart Search:</strong> Find anything quickly with powerful search functionality
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Local Storage:</strong> Your data stays private and accessible offline
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={onComplete} />
    </div>
  )
}
