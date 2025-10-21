"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note, Topic } from "@/app/page"
import Image from "next/image"

type AddNoteFormProps = {
  onClose: () => void
  onSubmit: (note: Omit<Note, "id" | "date">) => void
  topics: Topic[]
  editingNote?: Note | null
}

export function AddNoteForm({ onClose, onSubmit, topics, editingNote }: AddNoteFormProps) {
  const [title, setTitle] = useState(editingNote?.title || "")
  const [content, setContent] = useState(editingNote?.content || "")
  const [link, setLink] = useState("")
  const [topic, setTopic] = useState(editingNote?.topic || "")
  const [isNewTopic, setIsNewTopic] = useState(false)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(
    editingNote?.showPreview && editingNote?.image ? editingNote.image : null,
  )
  const [showPreview, setShowPreview] = useState(editingNote?.showPreview || true)

  // Flatten topics for selection
  const flattenTopics = (topics: Topic[], prefix = ""): string[] => {
    return topics.reduce((acc: string[], topic) => {
      const fullPath = prefix ? `${prefix}/${topic.name}` : topic.name
      acc.push(fullPath)
      if (topic.subtopics && topic.subtopics.length > 0) {
        acc.push(...flattenTopics(topic.subtopics, fullPath))
      }
      return acc
    }, [])
  }

  const allTopics = flattenTopics(topics)

  // Detect video links and generate preview
  useEffect(() => {
    if (!link) {
      setVideoThumbnail(null)
      return
    }

    // YouTube detection
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    const youtubeMatch = link.match(youtubeRegex)
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      setVideoThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
      return
    }

    // Vimeo detection - fetch thumbnail via API
    const vimeoRegex = /vimeo\.com\/(\d+)/
    const vimeoMatch = link.match(vimeoRegex)
    if (vimeoMatch) {
      const videoId = vimeoMatch[1]
      fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0]?.thumbnail_large) {
            setVideoThumbnail(data[0].thumbnail_large)
          }
        })
        .catch(() => {
          setVideoThumbnail(null)
        })
      return
    }

    setVideoThumbnail(null)
  }, [link])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !topic.trim()) return

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      topic: topic.trim(),
      color: "primary",
      isFavorite: false,
      image: showPreview && videoThumbnail ? videoThumbnail : "/business-meeting-workspace.jpg",
      showPreview: showPreview && !!videoThumbnail,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl shadow-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{editingNote ? "Edit Note" : "New Note"}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note description"
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {/* Link */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-foreground mb-2">
              Link
            </label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com or video URL"
              className="w-full"
            />
            {videoThumbnail && (
              <div className="mt-3 space-y-3">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image src={videoThumbnail || "/placeholder.svg"} alt="Video preview" fill className="object-cover" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Save and show video preview</span>
                </label>
              </div>
            )}
          </div>

          {/* Topic Selection */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-foreground mb-2">
              Topic *
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsNewTopic(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !isNewTopic
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setIsNewTopic(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isNewTopic
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Create New
              </button>
            </div>

            {isNewTopic ? (
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter new topic (e.g., Work/Projects)"
                required
                className="w-full"
              />
            ) : (
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a topic</option>
                {allTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim() || !topic.trim()}>
              {editingNote ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
