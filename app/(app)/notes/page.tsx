"use client"

import { useEffect, useState } from "react"
import { NotesSidebar } from "@/components/notes-sidebar"
import { NoteEditor } from "@/components/note-editor"
import { EmptyState } from "@/components/empty-state"
import type { NoteFile } from "@/lib/types"
import { StickyNote, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteFile[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const response = await fetch("/api/notes")
      const data = await response.json()
      const all = (data.success && data.data) || []
      setNotes(all)
      return all
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh().then((all) => {
      if (all.length > 0) setActiveNoteId(all[0].id)
    })
  }, [])

  async function handleCreate() {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Note" }),
    })
    const data = await response.json()
    if (data.success) {
      const all = await refresh()
      setActiveNoteId(data.data.id || all[0]?.id || null)
    }
  }

  async function handleDelete() {
    const all = await refresh()
    setActiveNoteId(all.length > 0 ? all[0].id : null)
  }

  async function handleUpdate() {
    await refresh()
  }

  const activeNote = notes.find((n) => n.id === activeNoteId)

  if (!loading && notes.length === 0) {
    return (
      <div className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Notes</h1>
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Create your first note to start capturing your learning."
        >
          <Button onClick={handleCreate} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Note
          </Button>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-64 lg:w-72 shrink-0 hidden sm:block">
        <NotesSidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelect={setActiveNoteId}
          onCreate={handleCreate}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a note to start editing
          </div>
        )}
      </div>

      {/* Mobile: floating create button */}
      <div className="sm:hidden fixed bottom-4 right-4">
        <Button onClick={handleCreate} size="icon" className="rounded-full h-12 w-12 shadow-lg">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
