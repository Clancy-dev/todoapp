"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createNote(data: {
  title: string
  content: string
  category?: string | null
  color: string
  tags: string[]
  userId: string
}) {
  try {
    const note = await db.note.create({
      data: {
        title: data.title,
        content: data.content,
        color: data.color,
        category: data.category ?? null,
        tags: data.tags,
        userId: data.userId, 
      },
    })

    revalidatePath("/notes")
    return { success: true, note }
  } catch (error) {
    console.error("Error creating note:", error)
    return { success: false, error: "Failed to create note" }
  }
}

export async function getNotesByUser(userId: string) {
  try {
    const notes = await db.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, notes }
  } catch (error) {
    console.error("Error fetching notes:", error)
    return { success: false, error: "Failed to get notes" }
  }
}

export async function updateNote(
  id: string,
  data: {
    title?: string
    content?: string
    color?: string
    category?: string
    tags?: string[]
  }
) {
  try {
    const note = await db.note.update({
      where: { id },
      data,
    })

    revalidatePath("/notes")
    return { success: true, note }
  } catch (error) {
    console.error("Error updating note:", error)
    return { success: false, error: "Failed to update note" }
  }
}

export async function deleteNote(id: string) {
  try {
    await db.note.delete({ where: { id } })
    revalidatePath("/notes")
    return { success: true }
  } catch (error) {
    console.error("Error deleting note:", error)
    return { success: false, error: "Failed to delete note" }
  }
}

export async function syncNotes(userId: string, notes: any[]) {
  try {
    // Delete existing notes for this user
    await db.note.deleteMany({ where: { userId } })

    // Create new notes
    if (notes.length > 0) {
      await db.note.createMany({
        data: notes.map((note) => ({
          title: note.title,
          content: note.content,
          category: note.category ?? null,
          color: note.color,
          tags: note.tags,
          userId,
        })),
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing notes:", error)
    return { success: false, error: "Failed to sync notes" }
  }
}
