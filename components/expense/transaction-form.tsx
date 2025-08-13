"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Transaction } from "@/hooks/use-expenses"

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => void
  transaction?: Transaction
  isLoading?: boolean
}

export interface TransactionFormData {
  title: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
}

const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other Income"]
const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other Expense",
]

export function TransactionForm({ isOpen, onClose, onSubmit, transaction, isLoading = false }: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const watchedType = form.watch("type")

  useEffect(() => {
    if (isOpen) {
      const savedFormData = localStorage.getItem("transactionFormData")
      if (savedFormData && !transaction) {
        try {
          const parsedData = JSON.parse(savedFormData)
          form.reset(parsedData)
        } catch (error) {
          console.error("Error loading saved form data:", error)
        }
      } else if (transaction) {
        form.reset({
          title: transaction.title,
          description: transaction.description || "",
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
        })
      }
    }
  }, [isOpen, transaction, form])

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (isOpen && !transaction) {
        localStorage.setItem("transactionFormData", JSON.stringify(data))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, isOpen, transaction])

  // Reset category when type changes
  useEffect(() => {
    form.setValue("category", "")
  }, [watchedType, form])

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data)
    if (!transaction) {
      localStorage.removeItem("transactionFormData")
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
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    })
    localStorage.removeItem("transactionFormData")
  }

  const categories = watchedType === "income" ? incomeCategories : expenseCategories

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Update your transaction details." : "Add a new income or expense transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-3">
            <Label>Transaction Type</Label>
            <RadioGroup
              value={form.watch("type")}
              onValueChange={(value: "income" | "expense") => form.setValue("type", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">
                  Income
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">
                  Expense
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter transaction title"
              {...form.register("title", { required: "Title is required" })}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                valueAsNumber: true,
              })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
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
            {form.formState.errors.category && (
              <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" {...form.register("date", { required: "Date is required" })} />
            {form.formState.errors.date && <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description (optional)"
              rows={3}
              {...form.register("description")}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={clearForm}>
              Clear
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : transaction ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
