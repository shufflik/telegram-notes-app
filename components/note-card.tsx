"use client"

import type { Note } from "@/app/page"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState } from "react"

interface NoteCardProps {
  note: Note
  onClick: () => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const shouldShowImage = note.showPreview !== false

  const defaultImage = "/note-placeholder.jpg"
  const imageSource = note.image || defaultImage

  const handleImageLoad = () => {
    setTimeout(() => {
      setImageLoading(false)
    }, 2000)
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md active:scale-[0.98] overflow-hidden",
        "border border-border bg-card",
        "h-[220px] flex flex-col",
      )}
    >
      {shouldShowImage && (
        <div className="p-2 flex-shrink-0">
          <div className="relative w-full h-24 bg-muted rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse">
                <div className="w-full h-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer" />
              </div>
            )}
            <Image
              src={imageSource || "/placeholder.svg"}
              alt={note.title}
              fill
              className={cn("object-cover transition-opacity duration-300", imageLoading ? "opacity-0" : "opacity-100")}
              onLoad={handleImageLoad}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          </div>
        </div>
      )}

      <div className="px-2 pb-2 flex flex-col gap-1 flex-1 min-h-0">
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{note.title}</h3>

        <div className="flex items-center justify-between gap-2 text-xs mt-auto flex-shrink-0">
          <span className="text-muted-foreground">{formatDate(note.date)}</span>

          <div className="flex-shrink-0">
            {note.isFavorite && (
              <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>

          <span className="font-medium text-primary">{note.topic}</span>
        </div>
      </div>
    </Card>
  )
}
