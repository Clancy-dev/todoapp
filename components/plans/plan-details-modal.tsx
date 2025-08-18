"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Flag, Target } from "lucide-react"
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

export function PlanDetailsModal({ isOpen, onClose, plan, onUpdateMilestone }: PlanDetailsModalProps) {
  if (!plan) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isOverdue = plan.targetDate && new Date(plan.targetDate) < new Date() && plan.status !== "completed"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{plan.title}</DialogTitle>
          <DialogDescription>Plan Details</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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

              {plan.targetDate && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                    isOverdue && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                  )}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Target: {new Date(plan.targetDate).toLocaleDateString()}
                  {isOverdue && " (Overdue)"}
                </Badge>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
              <ScrollArea className="max-h-32">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed pr-4">
                  {plan.description}
                </p>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Overall Progress</h4>
                <span className="text-sm font-medium">{plan.progress}%</span>
              </div>
              <Progress value={plan.progress} className="h-3" />
            </div>

            {plan.milestones.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Milestones ({plan.milestones.filter((m) => m.completed).length}/{plan.milestones.length})
                </h4>
                <ScrollArea className="max-h-64">
                  <div className="space-y-3 pr-4">
                    {plan.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <Checkbox
                          checked={milestone.completed}
                          onCheckedChange={(checked) => onUpdateMilestone(plan.id, milestone.id, !!checked)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm break-words", milestone.completed && "line-through text-gray-500")}>
                            {milestone.text}
                          </p>
                          {milestone.completed && milestone.completedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Created</span>
                  </div>
                  <p className="break-words">{formatDate(plan.createdAt)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Updated</span>
                  </div>
                  <p className="break-words">{formatDate(plan.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
