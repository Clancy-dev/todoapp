"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
import { syncService } from "@/lib/sync-service"
import {
  createPlan,
  getPlansByUser,
  updatePlan as updatePlanServer,
  deletePlan as deletePlanServer,
} from "@/lib/actions/plans"

export interface Plan {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed" | "on-hold"
  targetDate?: string
  progress: number
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
  userId?: string
}

export interface Milestone {
  id: string
  text: string
  completed: boolean
  completedAt?: string
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const getStorageKey = () => {
    return user ? `plans_${user.id}` : "plans_guest"
  }

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)

        // Always load from localStorage first (works offline)
        const savedPlans = localStorage.getItem(getStorageKey())
        if (savedPlans) {
          setPlans(JSON.parse(savedPlans))
        } else {
          setPlans([])
        }

        // If online and user exists, try to load from server
        if (user && syncService.getIsOnline()) {
          try {
            const result = await getPlansByUser(user.id)
            if (result.success) {
              localStorage.setItem(getStorageKey(), JSON.stringify(result.plans))
              setPlans(result.plans)
            }
          } catch (error) {
            console.error("Failed to load plans from server:", error)
            // Continue with local data
          }
        }
      } catch (error) {
        console.error("Error loading plans:", error)
        toast.error("Failed to load plans")
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [user])

  const savePlans = (newPlans: Plan[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newPlans))
      setPlans(newPlans)
    } catch (error) {
      console.error("Error saving plans:", error)
      toast.error("Failed to save plans")
    }
  }

  const addPlan = async (planData: Omit<Plan, "id" | "createdAt" | "updatedAt" | "userId">) => {
    const newPlan: Plan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id,
    }

    // Save locally first
    const newPlans = [...plans, newPlan]
    savePlans(newPlans)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const serverData = {
          ...newPlan,
          targetDate: newPlan.targetDate ? new Date(newPlan.targetDate) : undefined,
        }
        const result = await createPlan(serverData)
        if (result.success) {
          toast.success("Plan created successfully")
          return result.plan
        }
      } catch (error) {
        console.error("Failed to create plan on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "create",
        entity: "plan",
        data: newPlan,
        userId: user.id,
      })
    }

    toast.success("Plan created successfully")
    return newPlan
  }

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    const updatedPlan = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Update locally first
    const newPlans = plans.map((plan) => (plan.id === id ? { ...plan, ...updatedPlan } : plan))
    savePlans(newPlans)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const serverData = {
          ...updatedPlan,
          targetDate: updatedPlan.targetDate ? new Date(updatedPlan.targetDate) : undefined,
        }
        const result = await updatePlanServer(id, serverData)
        if (result.success) {
          toast.success("Plan updated successfully")
          return
        }
      } catch (error) {
        console.error("Failed to update plan on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "update",
        entity: "plan",
        data: { id, ...updatedPlan },
        userId: user.id,
      })
    }

    toast.success("Plan updated successfully")
  }

  const deletePlan = async (id: string) => {
    // Delete locally first
    const newPlans = plans.filter((plan) => plan.id !== id)
    savePlans(newPlans)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const result = await deletePlanServer(id)
        if (result.success) {
          toast.success("Plan deleted successfully")
          return
        }
      } catch (error) {
        console.error("Failed to delete plan on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "delete",
        entity: "plan",
        data: { id },
        userId: user.id,
      })
    }

    toast.success("Plan deleted successfully")
  }

  const updateMilestone = (planId: string, milestoneId: string, completed: boolean) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    const updatedMilestones = plan.milestones.map((milestone) =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          }
        : milestone,
    )

    const completedMilestones = updatedMilestones.filter((m) => m.completed).length
    const progress = updatedMilestones.length > 0 ? (completedMilestones / updatedMilestones.length) * 100 : 0

    updatePlan(planId, {
      milestones: updatedMilestones,
      progress: Math.round(progress),
      status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
    })
  }

  return {
    plans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    updateMilestone,
  }
}
