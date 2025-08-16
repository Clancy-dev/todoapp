"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPlan(data: {
  title: string
  description?: string
  category: string
  priority: string
  progress: number
  status: string
  targetDate?: Date
  milestones: Array<{ id: string; text: string; completed: boolean }>
  userId: string
}) {
  try {
    const plan = await db.plan.create({
      data,
    })

    revalidatePath("/plans")
    return { success: true, plan }
  } catch (error) {
    return { success: false, error: "Failed to create plan" }
  }
}

export async function getPlansByUser(userId: string) {
  try {
    const plans = await db.plan.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, plans }
  } catch (error) {
    return { success: false, error: "Failed to get plans" }
  }
}

export async function updatePlan(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    priority?: string
    status?: string
    targetDate?: Date
    milestones?: Array<{ id: string; text: string; completed: boolean }>
  },
) {
  try {
    const plan = await db.plan.update({
      where: { id },
      data,
    })

    revalidatePath("/plans")
    return { success: true, plan }
  } catch (error) {
    return { success: false, error: "Failed to update plan" }
  }
}

export async function deletePlan(id: string) {
  try {
    await db.plan.delete({
      where: { id },
    })

    revalidatePath("/plans")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete plan" }
  }
}

export async function syncPlans(userId: string, plans: any[]) {
  try {
    // Delete existing plans for this user
    await db.plan.deleteMany({
      where: { userId },
    })

    // Create new plans
    if (plans.length > 0) {
      await db.plan.createMany({
        data: plans.map((plan) => ({
          ...plan,
          userId,
          id: undefined, // Let MongoDB generate new IDs
        })),
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to sync plans" }
  }
}
