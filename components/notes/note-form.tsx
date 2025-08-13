"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Note } from "@/hooks/use-notes"

interface NoteFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NoteFormData) => void
  note?: Note
  isLoading?: boolean
}

export interface NoteFormData {
  title: string
  content: string
  category: string
  tags: string[]
  color: string
}

const categories = ["Learning", "Insights", "Ideas", "Quotes", "Tips", "Reflections", "Research", "Other"]

const colors = [
  { name: "Yellow", value: "bg-yellow-100 border-yellow-200 text-yellow-900" },
  { name: "Blue", value: "bg-blue-100 border-blue-200 text-blue-900" },
  { name: "Green", value: "bg-green-100 border-green-200 text-green-900" },
  { name: "Purple", value: "bg-purple-100 border-purple-200 text-purple-900" },
  { name: "Pink", value: "bg-pink-100 border-pink-200 text-pink-900" },
  { name: "Orange", value: "bg-orange-100 border-orange-200 text-orange-900" },
  { name: "Gray", value: "bg-gray-100 border-gray-200 text-gray-900" },
]

export function NoteForm({ isOpen, onClose, onSubmit, note, isLoading = false }: NoteFormProps) {
  const form = useForm<NoteFormData>({
    defaultValues: {
      title: "",
      content: "",
      category: "Learning",
      tags: [],
      color: colors[0].value,
    },
  })

  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (isOpen) {
      const savedFormData = localStorage.getItem("noteFormData")
      if (savedFormData && !note) {
        try {
          const parsedData = JSON.parse(savedFormData)
          form.reset(parsedData)
        } catch (error) {
          console.error("Error loading saved form data:", error)
        }
      } else if (note) {
        form.reset({
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags,
          color: note.color,
        })
      }
    }
  }, [isOpen, note, form])

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (isOpen && !note) {
        localStorage.setItem("noteFormData", JSON.stringify(data))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, isOpen, note])

  const handleSubmit = (data: NoteFormData) => {
    onSubmit(data)
    if (!note) {
      localStorage.removeItem("noteFormData")
    }
    form.reset()
    setTagInput("")
  }

  const handleClose = () => {
    onClose()
    setTagInput("")
  }

  const clearForm = () => {
    form.reset({
      title: "",
      content: "",
      category: "Learning",
      tags: [],
      color: colors[0].value,
    })
    setTagInput("")
    localStorage.removeItem("noteFormData")
  }

  const addTag = () => {
    if (tagInput.trim() && !form.getValues("tags").includes(tagInput.trim())) {
      const currentTags = form.getValues("tags")
      form.setValue("tags", [...currentTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags")
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
          <DialogDescription>
            {note ? "Update your note details." : "Capture your insights, lessons learned, and important thoughts."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter note title"
              {...form.register("title", { required: "Title is required" })}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your note content here..."
              rows={8}
              {...form.register("content", { required: "Content is required" })}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color Theme</Label>
              <Select value={form.watch("color")} onValueChange={(value) => form.setValue("color", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.value}`} />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.watch("tags").length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("tags").map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={clearForm}>
              Clear
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
