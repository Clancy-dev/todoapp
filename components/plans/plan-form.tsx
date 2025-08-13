"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2 } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Plan, Milestone } from "@/hooks/use-plans"

interface PlanFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PlanFormData) => void
  plan?: Plan
  isLoading?: boolean
}

export interface PlanFormData {
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed" | "on-hold"
  targetDate: string
  progress: number
  milestones: Milestone[]
}

const categories = [
  "Career",
  "Personal",
  "Financial",
  "Health",
  "Education",
  "Travel",
  "Business",
  "Relationships",
  "Other",
]

export function PlanForm({ isOpen, onClose, onSubmit, plan, isLoading = false }: PlanFormProps) {
  const form = useForm<PlanFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      status: "not-started",
      targetDate: "",
      progress: 0,
      milestones: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones",
  })

  useEffect(() => {
    if (isOpen) {
      const savedFormData = localStorage.getItem("planFormData")
      if (savedFormData && !plan) {
        try {
          const parsedData = JSON.parse(savedFormData)
          form.reset(parsedData)
        } catch (error) {
          console.error("Error loading saved form data:", error)
        }
      } else if (plan) {
        form.reset({
          title: plan.title,
          description: plan.description,
          category: plan.category,
          priority: plan.priority,
          status: plan.status,
          targetDate: plan.targetDate || "",
          progress: plan.progress,
          milestones: plan.milestones,
        })
      }
    }
  }, [isOpen, plan, form])

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (isOpen && !plan) {
        localStorage.setItem("planFormData", JSON.stringify(data))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, isOpen, plan])

  const handleSubmit = (data: PlanFormData) => {
    onSubmit(data)
    if (!plan) {
      localStorage.removeItem("planFormData")
    }
    form.reset()
  }

  const handleClose = () => {
    onClose()
  }

  const clearForm = () => {
    form.reset({
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      status: "not-started",
      targetDate: "",
      progress: 0,
      milestones: [],
    })
    localStorage.removeItem("planFormData")
  }

  const addMilestone = () => {
    append({
      id: Date.now().toString(),
      title: "",
      completed: false,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          <DialogDescription>
            {plan ? "Update your long-term plan details." : "Create a new long-term goal and track your progress."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter plan title"
              {...form.register("title", { required: "Title is required" })}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your long-term plan and goals..."
              rows={4}
              {...form.register("description", { required: "Description is required" })}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value: "low" | "medium" | "high") => form.setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: "not-started" | "in-progress" | "completed" | "on-hold") =>
                  form.setValue("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input id="targetDate" type="date" {...form.register("targetDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">Progress: {form.watch("progress")}%</Label>
            <Slider
              value={[form.watch("progress")]}
              onValueChange={(value) => form.setValue("progress", value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Milestones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="w-4 h-4 mr-1" />
                Add Milestone
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="Milestone title"
                  {...form.register(`milestones.${index}.title` as const, {
                    required: "Milestone title is required",
                  })}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={clearForm}>
              Clear
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : plan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
