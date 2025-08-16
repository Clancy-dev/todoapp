"use client"

import WelcomePage from "@/components/welcome-page"
import { useRouter } from "next/navigation"


export default function Welcome() {
  const router = useRouter()

  const handleComplete = () => {
    router.push("/dashboard/todos")
  }

  return <WelcomePage onComplete={handleComplete} />
}
