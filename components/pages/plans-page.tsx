"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { PageLoadingSpinner } from "@/components/loading-spinner"
import { usePlans, type Plan } from "@/hooks/use-plans"
import { PlanForm, type PlanFormData } from "@/components/plans/plan-form"
import { PlanCard } from "@/components/plans/plan-card"
import { PlanDetailsModal } from "@/components/plans/plan-details-modal"
import { DeletePlanModal } from "@/components/plans/delete-plan-modal"

const ITEMS_PER_PAGE = 10

export function PlansPage() {
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

  const { plans, loading, addPlan, updatePlan, deletePlan, updateMilestone } = usePlans()

  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        const matchesSearch =
          plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchQuery.toLowerCase())

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
  const completedPlans = plans.filter((plan) => plan.status === "completed").length
  const inProgressPlans = plans.filter((plan) => plan.status === "in-progress").length
  const notStartedPlans = plans.filter((plan) => plan.status === "not-started").length

  const handleSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true)
    try {
      if (editingPlan) {
        updatePlan(editingPlan.id, data)
      } else {
        addPlan(data)
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
    const plan = plans.find((p) => p.id === id)
    if (plan) {
      setDeletingPlanId(id)
    }
  }

  const confirmDelete = () => {
    if (deletingPlanId) {
      deletePlan(deletingPlanId)
      setDeletingPlanId(null)
      if (paginatedPlans.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
  }

  const handleViewDetails = (plan: Plan) => {
    setViewingPlan(plan)
  }

  if (loading) {
    return <PageLoadingSpinner />
  }

  const deletingPlan = plans.find((p) => p.id === deletingPlanId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Long-term Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {plans.length} plans • {completedPlans} completed • {inProgressPlans} in progress • {notStartedPlans} not
            started
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value) => {
              setPriorityFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">
              {plans.length === 0 ? "No plans yet" : "No plans match your filters"}
            </CardTitle>
            <CardDescription className="mb-4">
              {plans.length === 0
                ? "Start planning your long-term goals and aspirations"
                : "Try adjusting your search or filter criteria"}
            </CardDescription>
            {plans.length === 0 && (
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                onUpdateMilestone={updateMilestone}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPlans.length)} of {filteredPlans.length} plans
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PlanForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingPlan(undefined)
        }}
        onSubmit={handleSubmit}
        plan={editingPlan}
        isLoading={isSubmitting}
      />

      <PlanDetailsModal
        isOpen={!!viewingPlan}
        onClose={() => setViewingPlan(null)}
        plan={viewingPlan}
        onUpdateMilestone={updateMilestone}
      />

      <DeletePlanModal
        isOpen={!!deletingPlanId}
        onClose={() => setDeletingPlanId(null)}
        onConfirm={confirmDelete}
        planTitle={deletingPlan?.title || ""}
      />
    </div>
  )
}
