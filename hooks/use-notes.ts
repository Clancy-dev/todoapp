"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  createNote as createNoteServer,
  getNotesByUser,
  updateNote as updateNoteServer,
  deleteNote as deleteNoteServer,
} from "@/lib/actions/notes"

export interface Note {
  id: string
  title: string
  content: string
  category: string
  color: string
  tags: string[]
  createdAt: string
  updatedAt: string
  userId?: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load notes when user is available
  useEffect(() => {
    if (!user?.id) return

    const loadNotes = async () => {
      setLoading(true)
      try {
        const result = await getNotesByUser(user.id)
        if (result.success && result.notes) {
          const mappedNotes: Note[] = result.notes.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            category: n.category,
            color: n.color,
            tags: n.tags,
            createdAt: new Date(n.createdAt).toISOString(),
            updatedAt: new Date(n.updatedAt).toISOString(),
            userId: n.userId,
          }))
          setNotes(mappedNotes)
        } else {
          setNotes([])
          toast.error(result.error || "Failed to load notes")
        }
      } catch (err) {
        console.error("Error loading notes:", err)
        toast.error("Failed to load notes")
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [user?.id])

  // Add note
  const addNote = async (noteData: {
    title: string
    content: string
    color: string
    tags: string[]
  }) => {
    if (!user?.id) {
      toast.error("Please log in to create notes")
      return null
    }

    try {
      const { title, content, color, tags } = noteData
      const result = await createNoteServer({
        title,
        content,
        color,
        tags,
        userId: user.id,
      })

      if (result.success && result.note) {
        const newNote: Note = {
          ...result.note,
          createdAt: new Date(result.note.createdAt).toISOString(),
          updatedAt: new Date(result.note.updatedAt).toISOString(),
        }
        // Add new note at the start so it shows immediately
        setNotes((prev) => [newNote, ...prev])
        toast.success("Note created successfully")
        return newNote
      } else {
        toast.error(result.error || "Failed to create note")
        return null
      }
    } catch (err) {
      console.error("Failed to create note:", err)
      toast.error("Failed to create note")
      return null
    }
  }

  // Update note
  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user?.id) {
      toast.error("Please log in to update notes")
      return
    }

    try {
      const updatedData: any = {}
      if (updates.title !== undefined) updatedData.title = updates.title
      if (updates.content !== undefined) updatedData.content = updates.content
      if (updates.color !== undefined) updatedData.color = updates.color
      if (updates.tags !== undefined) updatedData.tags = updates.tags
      if (updates.category !== undefined) updatedData.category = updates.category

      const result = await updateNoteServer(id, updatedData)

      if (result.success && result.note) {
        const updatedNote: Note = {
          ...result.note,
          createdAt: new Date(result.note.createdAt).toISOString(),
          updatedAt: new Date(result.note.updatedAt).toISOString(),
        }
        setNotes((prev) => prev.map((note) => (note.id === id ? updatedNote : note)))
        toast.success("Note updated successfully")
      } else {
        toast.error(result.error || "Failed to update note")
      }
    } catch (err) {
      console.error("Failed to update note:", err)
      toast.error("Failed to update note")
    }
  }

  // Delete note
  const deleteNote = async (id: string) => {
    if (!user?.id) {
      toast.error("Please log in to delete notes")
      return
    }

    try {
      const result = await deleteNoteServer(id)
      if (result.success) {
        setNotes((prev) => prev.filter((note) => note.id !== id))
        toast.success("Note deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete note")
      }
    } catch (err) {
      console.error("Failed to delete note:", err)
      toast.error("Failed to delete note")
    }
  }

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  }
}
