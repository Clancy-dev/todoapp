"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, DollarSign, TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { PageLoadingSpinner } from "@/components/loading-spinner"
import { useExpenses, type Transaction } from "@/hooks/use-expenses"
import { TransactionForm, type TransactionFormData } from "@/components/expense/transaction-form"
import { TransactionItem } from "@/components/expense/transaction-item"
import { TransactionDetailsModal } from "@/components/expense/transaction-details-modal"
import { DeleteTransactionModal } from "@/components/expense/delete-transaction-modal"

const ITEMS_PER_PAGE = 10

export function ExpensePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("placeholder")
  const [categoryFilter, setCategoryFilter] = useState<string>("placeholder")
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
  } = useExpenses()

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesSearch =
          transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        const matchesType = typeFilter === "placeholder" || transaction.type === typeFilter
        const matchesCategory = categoryFilter === "placeholder" || transaction.category === categoryFilter

        return matchesSearch && matchesType && matchesCategory
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, searchQuery, typeFilter, categoryFilter])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const categories = Array.from(new Set(transactions.map((transaction) => transaction.category)))

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      if (editingTransaction) {
        updateTransaction(editingTransaction.id, data)
      } else {
        addTransaction(data)
      }
      setShowForm(false)
      setEditingTransaction(undefined)
      setCurrentPage(1) // Reset to first page after adding/editing
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      setDeletingTransactionId(id)
    }
  }

  const confirmDelete = () => {
    if (deletingTransactionId) {
      deleteTransaction(deletingTransactionId)
      setDeletingTransactionId(null)
      if (paginatedTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
  }

  const handleViewDetails = (transaction: Transaction) => {
    setViewingTransaction(transaction)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) return <PageLoadingSpinner />

  const deletingTransaction = transactions.find((t) => t.id === deletingTransactionId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">{transactions.length} total transactions</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search transactions..."
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

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue>{typeFilter === "placeholder" ? "Type" : typeFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>
                Type
              </SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>{categoryFilter === "placeholder" ? "Category" : categoryFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>
                Category
              </SelectItem>
             {categories
             .filter((category) => category) // remove empty/undefined
             .map((category) => (
             <SelectItem key={category} value={category}>
              {category}
             </SelectItem>
   ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">
              {transactions.length === 0 ? "No transactions yet" : "No transactions match your filters"}
            </CardTitle>
            <CardDescription className="mb-4">
              {transactions.length === 0
                ? "Start tracking your income and expenses"
                : "Try adjusting your search or filter criteria"}
            </CardDescription>
            {transactions.length === 0 && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Transaction
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}{" "}
                transactions
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
      <TransactionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTransaction(undefined)
        }}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
        isLoading={isSubmitting}
      />

      <TransactionDetailsModal
        isOpen={!!viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        transaction={viewingTransaction}
      />

      <DeleteTransactionModal
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={confirmDelete}
        transactionTitle={deletingTransaction?.title || ""}
      />
    </div>
  )
}
