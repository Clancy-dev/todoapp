"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Clock, Tag } from "lucide-react"
import type { Note } from "@/hooks/use-notes"

interface NoteDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  note: Note | null
}

export function NoteDetailsModal({ isOpen, onClose, note }: NoteDetailsModalProps) {
  if (!note) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{note.title}</DialogTitle>
          <DialogDescription>Note Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              <User className="w-3 h-3 mr-1" />
              {note.category}
            </Badge>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${note.color}`}>Color Theme</div>
          </div>

          <ScrollArea className="max-h-96">
            <div className="pr-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Content</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </div>
            </div>
          </ScrollArea>

          {note.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Created</span>
                </div>
                <p>{formatDate(note.createdAt)}</p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Updated</span>
                </div>
                <p>{formatDate(note.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
