"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/hooks/use-expenses"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transaction.title}
            <Badge
              variant="secondary"
              className={cn(
                transaction.type === "income"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
              )}
            >
              {transaction.type === "income" ? "Income" : "Expense"}
            </Badge>
          </DialogTitle>
          <DialogDescription>Transaction Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Amount</h4>
            <div
              className={cn("text-2xl font-bold", transaction.type === "income" ? "text-green-600" : "text-red-600")}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatAmount(transaction.amount)}
            </div>
          </div>

          {transaction.description && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-400">{transaction.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Category</h4>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <User className="w-3 h-3 mr-1" />
                {transaction.category}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Date</h4>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(transaction.date).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Created</span>
                </div>
                <p>{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Updated</span>
                </div>
                <p>{new Date(transaction.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
