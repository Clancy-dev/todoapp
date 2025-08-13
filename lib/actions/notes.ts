"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createNote(data: {
  title: string
  content: string
  theme: string
  tags: string[]
  userId: string
}) {
  try {
    const note = await db.note.create({
      data,
    })

    revalidatePath("/")
    return { success: true, note }
  } catch (error) {
    return { success: false, error: "Failed to create note" }
  }
}

export async function getNotesByUser(userId: string) {
  try {
    const notes = await db.note.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, notes }
  } catch (error) {
    return { success: false, error: "Failed to get notes" }
  }
}

export async function updateNote(
  id: string,
  data: {
    title?: string
    content?: string
    theme?: string
    tags?: string[]
  },
) {
  try {
    const note = await db.note.update({
      where: { id },
      data,
    })

    revalidatePath("/")
    return { success: true, note }
  } catch (error) {
    return { success: false, error: "Failed to update note" }
  }
}

export async function deleteNote(id: string) {
  try {
    await db.note.delete({
      where: { id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete note" }
  }
}

export async function syncNotes(userId: string, notes: any[]) {
  try {
    // Delete existing notes for this user
    await db.note.deleteMany({
      where: { userId },
    })

    // Create new notes
    if (notes.length > 0) {
      await db.note.createMany({
        data: notes.map((note) => ({
          ...note,
          userId,
          id: undefined, // Let MongoDB generate new IDs
        })),
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to sync notes" }
  }
}
