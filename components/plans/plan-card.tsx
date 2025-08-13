"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Flag, Target } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Plan } from "@/hooks/use-plans"

interface PlanCardProps {
  plan: Plan
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
  onViewDetails: (plan: Plan) => void
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

export function PlanCard({ plan, onEdit, onDelete, onViewDetails, onUpdateMilestone }: PlanCardProps) {
  const getCategoryColor = (category: string) => {
    const index = category.length % categoryColors.length
    return categoryColors[index]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue = plan.targetDate && new Date(plan.targetDate) < new Date() && plan.status !== "completed"

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-lg leading-tight line-clamp-2 cursor-pointer"
            onClick={() => onViewDetails(plan)}
          >
            {plan.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(plan)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(plan.id)} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <p
            className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 cursor-pointer"
            onClick={() => onViewDetails(plan)}
          >
            {plan.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{plan.progress}%</span>
            </div>
            <Progress value={plan.progress} className="h-2" />
          </div>

          {plan.milestones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Milestones ({plan.milestones.filter((m) => m.completed).length}/{plan.milestones.length})
              </h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {plan.milestones.slice(0, 3).map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={(checked) => onUpdateMilestone(plan.id, milestone.id, !!checked)}
                    />
                    <span className={cn(milestone.completed && "line-through text-gray-500")}>{milestone.title}</span>
                  </div>
                ))}
                {plan.milestones.length > 3 && (
                  <p className="text-xs text-gray-500 pl-6">+{plan.milestones.length - 3} more milestones</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={getCategoryColor(plan.category)}>
              <Target className="w-3 h-3 mr-1" />
              {plan.category}
            </Badge>

            <Badge variant="secondary" className={priorityColors[plan.priority]}>
              <Flag className="w-3 h-3 mr-1" />
              {plan.priority}
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
                {formatDate(plan.targetDate)}
                {isOverdue && " (Overdue)"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
