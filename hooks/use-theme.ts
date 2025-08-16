"use client"

type Theme = "light" | "dark" | "system"

interface ThemeState {
  theme: Theme
  actualTheme: "light" | "dark"
}

// Global theme state
const themeState: ThemeState = {
  theme: "system",
  actualTheme: "light",
}

// Listeners for theme changes
const themeListeners: (() => void)[] = []

// Initialize theme on client side
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("theme") as Theme
  if (savedTheme) {
    themeState.theme = savedTheme
  }
  updateActualTheme()
}

function updateActualTheme() {
  if (typeof window === "undefined") return

  let newTheme: "light" | "dark"

  if (themeState.theme === "system") {
    newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  } else {
    newTheme = themeState.theme
  }

  themeState.actualTheme = newTheme
  document.documentElement.classList.toggle("dark", newTheme === "dark")
  localStorage.setItem("theme", themeState.theme)

  // Notify all listeners
  themeListeners.forEach((listener) => listener())
}

// Listen for system theme changes
if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", () => {
    if (themeState.theme === "system") {
      updateActualTheme()
    }
  })
}

export function useTheme() {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const listener = () => forceUpdate({})
    themeListeners.push(listener)

    return () => {
      const index = themeListeners.indexOf(listener)
      if (index > -1) {
        themeListeners.splice(index, 1)
      }
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    themeState.theme = newTheme
    updateActualTheme()
  }

  return {
    theme: themeState.theme,
    setTheme,
    actualTheme: themeState.actualTheme,
  }
}

import { useState, useEffect } from "react"
