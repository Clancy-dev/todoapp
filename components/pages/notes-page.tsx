"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, BookOpen, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { PageLoadingSpinner } from "@/components/loading-spinner"
import { useNotes, type Note } from "@/hooks/use-notes"
import { NoteForm, type NoteFormData } from "@/components/notes/note-form"
import { NoteCard } from "@/components/notes/note-card"
import { NoteDetailsModal } from "@/components/notes/note-details-modal"
import { DeleteNoteModal } from "@/components/notes/delete-note-modal"

const ITEMS_PER_PAGE = 10

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | undefined>()
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { notes, loading, addNote, updateNote, deleteNote } = useNotes()

  // Reset page when notes or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [notes, searchQuery, categoryFilter])

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = categoryFilter === "all" || note.color === categoryFilter

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [notes, searchQuery, categoryFilter])

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)
  const paginatedNotes = filteredNotes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Unique themes as categories
  const categories = Array.from(new Set(notes.map((note) => note.color)))

  // Handle create/update note
  const handleSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true)
    try {
      const noteData = {
        title: data.title,
        content: data.content,
        category: data.category,
        color: data.color,
        tags: data.tags,
      }

      if (editingNote) {
        await updateNote(editingNote.id, noteData)
      } else {
        await addNote(noteData)
      }

      setShowForm(false)
      setEditingNote(undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setDeletingNoteId(id)
    }
  }

  const confirmDelete = () => {
    if (deletingNoteId) {
      deleteNote(deletingNoteId)
      setDeletingNoteId(null)
      if (paginatedNotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
  }

  const handleViewDetails = (note: Note) => {
    setViewingNote(note)
  }

  if (loading) {
    return <PageLoadingSpinner />
  }

  const deletingNote = notes.find((n) => n.id === deletingNoteId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Short Notes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {notes.length} notes • Capture your insights and lessons learned
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notes, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">
              {notes.length === 0 ? "No notes yet" : "No notes match your search"}
            </CardTitle>
            <CardDescription className="mb-4">
              {notes.length === 0
                ? "Start capturing your insights and lessons learned"
                : "Try adjusting your search or filter criteria"}
            </CardDescription>
            {notes.length === 0 && (
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotes.length)} of {filteredNotes.length} notes
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
      <NoteForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingNote(undefined)
        } }
        onSubmit={handleSubmit}
        note={editingNote}
        isLoading={isSubmitting} onReload={function (): void {
          throw new Error("Function not implemented.")
        } }      />

      <NoteDetailsModal isOpen={!!viewingNote} onClose={() => setViewingNote(null)} note={viewingNote} />

      <DeleteNoteModal
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={confirmDelete}
        noteTitle={deletingNote?.title || ""}
      />
    </div>
  )
}
