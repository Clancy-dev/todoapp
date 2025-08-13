"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"
import { syncService } from "@/lib/sync-service"
import {
  createNote,
  getNotesByUser,
  updateNote as updateNoteServer,
  deleteNote as deleteNoteServer,
} from "@/lib/actions/notes"

export interface Note {
  id: string
  title: string
  content: string
  theme: string
  tags: string[]
  createdAt: string
  updatedAt: string
  userId?: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const getStorageKey = () => {
    return user ? `notes_${user.id}` : "notes_guest"
  }

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true)

        // Always load from localStorage first (works offline)
        const savedNotes = localStorage.getItem(getStorageKey())
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes))
        } else {
          setNotes([])
        }

        // If online and user exists, try to load from server
        if (user && syncService.getIsOnline()) {
          try {
            const result = await getNotesByUser(user.id)
            if (result.success) {
              localStorage.setItem(getStorageKey(), JSON.stringify(result.notes))
              setNotes(result.notes)
            }
          } catch (error) {
            console.error("Failed to load notes from server:", error)
            // Continue with local data
          }
        }
      } catch (error) {
        console.error("Error loading notes:", error)
        toast.error("Failed to load notes")
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [user])

  const saveNotes = (newNotes: Note[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newNotes))
      setNotes(newNotes)
    } catch (error) {
      console.error("Error saving notes:", error)
      toast.error("Failed to save notes")
    }
  }

  const addNote = async (noteData: Omit<Note, "id" | "createdAt" | "updatedAt" | "userId">) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id,
    }

    // Save locally first
    const newNotes = [...notes, newNote]
    saveNotes(newNotes)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const result = await createNote(newNote)
        if (result.success) {
          toast.success("Note created successfully")
          return result.note
        }
      } catch (error) {
        console.error("Failed to create note on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "create",
        entity: "note",
        data: newNote,
        userId: user.id,
      })
    }

    toast.success("Note created successfully")
    return newNote
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updatedNote = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Update locally first
    const newNotes = notes.map((note) => (note.id === id ? { ...note, ...updatedNote } : note))
    saveNotes(newNotes)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const result = await updateNoteServer(id, updatedNote)
        if (result.success) {
          toast.success("Note updated successfully")
          return
        }
      } catch (error) {
        console.error("Failed to update note on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "update",
        entity: "note",
        data: { id, ...updatedNote },
        userId: user.id,
      })
    }

    toast.success("Note updated successfully")
  }

  const deleteNote = async (id: string) => {
    // Delete locally first
    const newNotes = notes.filter((note) => note.id !== id)
    saveNotes(newNotes)

    // Try to sync with server
    if (user && syncService.getIsOnline()) {
      try {
        const result = await deleteNoteServer(id)
        if (result.success) {
          toast.success("Note deleted successfully")
          return
        }
      } catch (error) {
        console.error("Failed to delete note on server:", error)
      }
    }

    // Add to sync queue if offline or server failed
    if (user) {
      syncService.addToSyncQueue({
        type: "delete",
        entity: "note",
        data: { id },
        userId: user.id,
      })
    }

    toast.success("Note deleted successfully")
  }

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  }
}
