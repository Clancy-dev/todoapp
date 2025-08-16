"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/loading-spinner"
import WelcomePage from "@/components/welcome-page"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return

    const hasVisited = localStorage.getItem("hasVisited")

    if (user) {
      setIsRedirecting(true)
      localStorage.setItem("hasVisited", "true")
      router.push("/dashboard")
    } else if (!hasVisited) {
      setShowWelcome(true)
    } else {
      setIsRedirecting(true)
      router.push("/welcome")
    }
  }, [user, loading, router])

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasVisited", "true")
    setShowWelcome(false)
    router.push("/welcome")
  }

  if (loading || isRedirecting) {
    return <LoadingSpinner />
  }

  if (showWelcome) {
    return <WelcomePage onComplete={handleWelcomeComplete} />
  }

  return <WelcomePage onComplete={handleWelcomeComplete} />
}
