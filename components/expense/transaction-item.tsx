"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, DollarSign } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/hooks/use-expenses"

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onViewDetails: (transaction: Transaction) => void
}

const categoryColors = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
]

export function TransactionItem({ transaction, onEdit, onDelete, onViewDetails }: TransactionItemProps) {
  const getCategoryColor = (category: string) => {
    const index = category.length % categoryColors.length
    return categoryColors[index]
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">{transaction.title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={cn("text-lg font-bold", transaction.type === "income" ? "text-green-600" : "text-red-600")}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(transaction)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {transaction.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{transaction.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={cn(
                  transaction.type === "income"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                )}
              >
                <DollarSign className="w-3 h-3 mr-1" />
                {transaction.type === "income" ? "Income" : "Expense"}
              </Badge>

              <Badge variant="secondary" className={getCategoryColor(transaction.category)}>
                {transaction.category}
              </Badge>

              <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(transaction.date).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
