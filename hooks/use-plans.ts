"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  createPlan,
  getPlansByUser,
  updatePlan as updatePlanServer,
  deletePlan as deletePlanServer,
} from "@/lib/actions/plans"

export interface Milestone {
  id: string
  text: string
  completed: boolean
  completedAt?: string
}

export interface Plan {
  id: string
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed" | "on-hold"
  targetDate?: string
  progress: number
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
  userId: string
}

export function usePlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadPlans = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const result = await getPlansByUser(user.id)
        if (result.success && result.plans) {
          const mappedPlans: Plan[] = result.plans.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description ?? undefined,
            category: p.category,
            priority: p.priority as "low" | "medium" | "high",
            status: p.status as "not-started" | "in-progress" | "completed" | "on-hold",
            targetDate: p.targetDate ? new Date(p.targetDate).toISOString() : undefined,
            progress: p.progress,
            milestones: p.milestones,
            createdAt: new Date(p.createdAt).toISOString(),
            updatedAt: new Date(p.updatedAt).toISOString(),
            userId: p.userId,
          }))
          setPlans(mappedPlans)
        } else {
          toast.error(result.error || "Failed to load plans")
        }
      } catch (error) {
        console.error("Error loading plans:", error)
        toast.error("Failed to load plans")
      } finally {
        setIsLoading(false)
      }
    }

    loadPlans()
  }, [user])

  const addPlan = async (planData: Omit<Plan, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) {
      toast.error("Please log in to create plans")
      return null
    }

    try {
      const serverData = {
        ...planData,
        targetDate: planData.targetDate ? new Date(planData.targetDate) : undefined,
        userId: user.id,
        milestones: planData.milestones.map((m) => ({
          id: m.id,
          text: m.text,
          completed: m.completed,
        })),
      }

      const result = await createPlan(serverData)
      if (result.success && result.plan) {
        const newPlan: Plan = {
          id: result.plan.id,
          title: result.plan.title,
          description: result.plan.description ?? undefined,
          category: result.plan.category,
          priority: result.plan.priority as "low" | "medium" | "high",
          status: result.plan.status as "not-started" | "in-progress" | "completed" | "on-hold",
          targetDate: result.plan.targetDate ? new Date(result.plan.targetDate).toISOString() : undefined,
          progress: result.plan.progress,
          milestones: result.plan.milestones,
          createdAt: new Date(result.plan.createdAt).toISOString(),
          updatedAt: new Date(result.plan.updatedAt).toISOString(),
          userId: result.plan.userId,
        }

        setPlans((prev) => [...prev, newPlan])
        toast.success("Plan created successfully")
        return newPlan
      } else {
        toast.error(result.error || "Failed to create plan")
        return null
      }
    } catch (error) {
      console.error("Failed to create plan:", error)
      toast.error("Failed to create plan")
      return null
    }
  }

  const updatePlan = async (
    id: string,
    data: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt" | "userId">>
  ) => {
    try {
      const result = await updatePlanServer(id, {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      })

      if (result.success && result.plan) {
        const updatedPlan: Plan = {
          id: result.plan.id,
          title: result.plan.title,
          description: result.plan.description ?? undefined,
          category: result.plan.category,
          priority: result.plan.priority as "low" | "medium" | "high",
          status: result.plan.status as "not-started" | "in-progress" | "completed" | "on-hold",
          targetDate: result.plan.targetDate ? new Date(result.plan.targetDate).toISOString() : undefined,
          progress: result.plan.progress,
          milestones: result.plan.milestones,
          createdAt: new Date(result.plan.createdAt).toISOString(),
          updatedAt: new Date(result.plan.updatedAt).toISOString(),
          userId: result.plan.userId,
        }

        setPlans((prev) => prev.map((p) => (p.id === id ? updatedPlan : p)))
        toast.success("Plan updated successfully")
        return updatedPlan
      } else {
        toast.error(result.error || "Failed to update plan")
        return null
      }
    } catch (error) {
      console.error("Failed to update plan:", error)
      toast.error("Failed to update plan")
      return null
    }
  }

  const deletePlan = async (id: string) => {
    try {
      const result = await deletePlanServer(id)
      if (result.success) {
        setPlans((prev) => prev.filter((p) => p.id !== id))
        toast.success("Plan deleted successfully")
        return true
      } else {
        toast.error(result.error || "Failed to delete plan")
        return false
      }
    } catch (error) {
      console.error("Failed to delete plan:", error)
      toast.error("Failed to delete plan")
      return false
    }
  }

  const updateMilestone = async (planId: string, milestoneId: string, completed: boolean) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return
    const updatedMilestones = plan.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed } : m
    )
    return updatePlan(planId, { milestones: updatedMilestones })
  }

  return {
    plans,
    isLoading,
    addPlan,
    updatePlan,
    deletePlan,
    updateMilestone,
  }
}
