"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { PageLoadingSpinner } from "@/components/loading-spinner"
import { usePlans, type Plan } from "@/hooks/use-plans"
import { PlanForm, type PlanFormData } from "@/components/plans/plan-form"
import { PlanCard } from "@/components/plans/plan-card"
import { PlanDetailsModal } from "@/components/plans/plan-details-modal"
import { DeletePlanModal } from "@/components/plans/delete-plan-modal"

const ITEMS_PER_PAGE = 10

export default function PlansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>()
  const [viewingPlan, setViewingPlan] = useState<Plan | null>(null)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { plans, isLoading, addPlan, updatePlan, deletePlan, updateMilestone } = usePlans()

  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        const matchesSearch =
          plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (plan.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "all" || plan.category === categoryFilter
        const matchesStatus = statusFilter === "all" || plan.status === statusFilter
        const matchesPriority = priorityFilter === "all" || plan.priority === priorityFilter
        return matchesSearch && matchesCategory && matchesStatus && matchesPriority
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [plans, searchQuery, categoryFilter, statusFilter, priorityFilter])

  const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE)
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const categories = Array.from(new Set(plans.map((plan) => plan.category)))

  const handleSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true)
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, data)
      } else {
        await addPlan(data)
      }
      setShowForm(false)
      setEditingPlan(undefined)
      setCurrentPage(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setDeletingPlanId(id)
  }

  const confirmDelete = async () => {
    if (!deletingPlanId) return
    await deletePlan(deletingPlanId)
    setDeletingPlanId(null)
  }

  if (isLoading) return <PageLoadingSpinner />

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select onValueChange={(val) => setCategoryFilter(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(val) => setStatusFilter(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(val) => setPriorityFilter(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => setShowForm(true)} className="mt-2">
        <Plus /> Add Plan
      </Button>

      {/* Plan Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEdit}
            onViewDetails={(plan) => setViewingPlan(plan)}
            onDelete={handleDelete}
            onUpdateMilestone={updateMilestone}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            <ChevronLeft />
          </Button>
          <span>{currentPage} / {totalPages}</span>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            <ChevronRight />
          </Button>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <PlanForm
          isOpen={showForm}
          plan={editingPlan}
          onClose={() => { setShowForm(false); setEditingPlan(undefined) }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      )}
      {viewingPlan && (
        <PlanDetailsModal
          isOpen={!!viewingPlan}
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          onUpdateMilestone={updateMilestone}
        />
      )}
      {deletingPlanId && (
        <DeletePlanModal
          isOpen={!!deletingPlanId}
          planTitle={plans.find((p) => p.id === deletingPlanId)?.title ?? "this plan"}
          onClose={() => setDeletingPlanId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
