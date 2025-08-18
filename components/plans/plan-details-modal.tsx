"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Flag, Target, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Plan } from "@/hooks/use-plans"

interface PlanDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null
  onUpdateMilestone: (planId: string, milestoneId: string, completed: boolean) => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusColors = {
  "not-started": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "on-hold": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
}

const categoryColors = [
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
]

export function PlanDetailsModal({ isOpen, onClose, plan, onUpdateMilestone }: PlanDetailsModalProps) {
  if (!plan) return null

  const getCategoryColor = (category: string) => {
    const index = category.length % categoryColors.length
    return categoryColors[index]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isOverdue = plan.targetDate && new Date(plan.targetDate) < new Date() && plan.status !== "completed"
  const completedMilestones = plan.milestones.filter((m) => m.completed).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold pr-8">{plan.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-8rem)]">
            <div className="space-y-6 pr-4">
              {/* Status and Progress Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={getCategoryColor(plan.category)}>
                      <Target className="w-3 h-3 mr-1" />
                      {plan.category}
                    </Badge>
                    <Badge variant="secondary" className={priorityColors[plan.priority]}>
                      <Flag className="w-3 h-3 mr-1" />
                      {plan.priority} priority
                    </Badge>
                    <Badge variant="secondary" className={statusColors[plan.status]}>
                      {plan.status.replace("-", " ")}
                    </Badge>
                  </div>

                  {plan.targetDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Target Date:</span>
                      <span className={cn(isOverdue && "text-red-600 dark:text-red-400")}>
                        {formatDate(plan.targetDate)}
                        {isOverdue && " (Overdue)"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Created:</span>
                    <span>{formatDate(plan.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Last Updated:</span>
                    <span>{formatDate(plan.updatedAt)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-2xl font-bold text-orange-600">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-3" />
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{completedMilestones} completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>{plan.milestones.length - completedMilestones} remaining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {plan.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <div className="border rounded-lg bg-gray-50 dark:bg-gray-800/30">
                    <ScrollArea className="max-h-48 p-4">
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {plan.description}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {/* Milestones Section */}
              {plan.milestones.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Milestones</h3>
                    <Badge variant="outline">
                      {completedMilestones} of {plan.milestones.length} completed
                    </Badge>
                  </div>

                  <ScrollArea className="max-h-60 border rounded-md p-2">
                    <div className="space-y-3">
                      {plan.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50"
                        >
                          <Checkbox
                            checked={milestone.completed}
                            onCheckedChange={(checked) => onUpdateMilestone(plan.id, milestone.id, !!checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm break-words",
                                milestone.completed && "line-through text-gray-500 dark:text-gray-400",
                              )}
                            >
                              {milestone.text}
                            </p>
                          </div>
                          {milestone.completed && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
