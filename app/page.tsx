"use client"

import { useEffect, useState } from "react"
import { WelcomePage } from "@/components/welcome-page"
import { Dashboard } from "@/components/dashboard"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Home() {
  const { user, loading } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited")
    if (!hasVisited && !user) {
      setShowWelcome(true)
    }
  }, [user])

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasVisited", "true")
    setShowWelcome(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (showWelcome && !user) {
    return <WelcomePage onComplete={handleWelcomeComplete} />
  }

  if (!user) {
    return <WelcomePage onComplete={handleWelcomeComplete} />
  }

  return <Dashboard />
}
