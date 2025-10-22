"use client"

import type { Note } from "@/lib/api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { FileDisplay } from "@/components/file-display"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { GlobalLoader } from "@/components/global-loader"
import { useState } from "react"
import { notesApi } from "@/lib/api"

interface NoteViewProps {
  note: Note
  onClose: () => void
  onToggleFavorite: (noteId: string) => void
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NoteView({ note, onClose, onToggleFavorite, onEdit, onDelete }: NoteViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFavoriteDialog, setShowFavoriteDialog] = useState(false)
  const [isFavorite, setIsFavorite] = useState(note.isFavorite || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formattedDate = new Date(note.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Функция для API запроса к бекенду
  const toggleFavoriteOnServer = async (noteId: string, newFavoriteStatus: boolean) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await notesApi.toggleFavorite(noteId, newFavoriteStatus)
      
      if (response.success) {
        return true
      } else {
        throw new Error(response.message || 'Failed to update favorite status')
      }
    } catch (err) {
      console.error('Error updating favorite status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update favorite status')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete(note.id)
    onClose()
  }

  const handleToggleFavorite = () => {
    setShowFavoriteDialog(true)
  }

  const confirmToggleFavorite = async () => {
    const newFavoriteStatus = !isFavorite
    const success = await toggleFavoriteOnServer(note.id, newFavoriteStatus)
    
    if (success) {
      // Обновляем локальное состояние только при успешном ответе
      setIsFavorite(newFavoriteStatus)
      onToggleFavorite(note.id) // Обновляем глобальное состояние
      setShowFavoriteDialog(false)
    }
    // При ошибке состояние не изменяется и показывается уведомление об ошибке
  }

        return (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <div className="fixed inset-0 flex flex-col pt-[10vh]">
              <div className="flex-1 bg-background animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleDelete}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete note"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onEdit(note)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit note"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg
                    className="w-6 h-6"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close note"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
            {note.image && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
                <Image src={note.image || "/placeholder.svg"} alt={note.title} fill className="object-cover" />
              </div>
            )}

            <h1 className="text-3xl font-bold text-foreground mb-4 break-words">{note.title}</h1>

            {note.content && (
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{note.content}</p>
              </div>
            )}

            {note.files && note.files.length > 0 && (
              <div className="mb-6">
                <FileDisplay files={note.files} />
              </div>
            )}

            {note.link && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-2">Link</h3>
                <a
                  href={note.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-primary hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="truncate">{note.link}</span>
                </a>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Topic:</span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {note.topic}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Created:</span>
                <time className="text-sm text-foreground">{formattedDate}</time>
              </div>

              {note.color && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Color:</span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full",
                      note.color === "primary" && "bg-primary",
                      note.color === "accent" && "bg-accent",
                      note.color === "secondary" && "bg-muted-foreground",
                    )}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      
      <ConfirmDialog
        isOpen={showFavoriteDialog}
        onClose={() => setShowFavoriteDialog(false)}
        onConfirm={confirmToggleFavorite}
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        message={isFavorite 
          ? `Are you sure you want to remove "${note.title}" from your favorites?`
          : `Are you sure you want to add "${note.title}" to your favorites?`
        }
        confirmText={isFavorite ? "Remove" : "Add"}
        cancelText="Cancel"
        variant="default"
      />
      
      {/* Error Notification */}
      {error && (
        <div className="fixed top-4 right-4 z-[70] bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-destructive-foreground/70 hover:text-destructive-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Global Loader */}
      <GlobalLoader isLoading={isLoading} />
    </div>
  )
}
