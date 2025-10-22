"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note, NoteFile } from "@/lib/api"
import type { Topic } from "@/app/page"
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
  const [link, setLink] = useState(editingNote?.link || "")
  const [topic, setTopic] = useState(editingNote?.topic || "")
  const [isNewTopic, setIsNewTopic] = useState(false)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(
    editingNote?.showPreview && editingNote?.image ? editingNote.image : null,
  )
  const [showPreview, setShowPreview] = useState<boolean>(editingNote?.showPreview || true)
  const [files, setFiles] = useState<NoteFile[]>(editingNote?.files || [])

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

  // File handling functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    const newFiles: NoteFile[] = Array.from(selectedFiles).map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // In real app, upload to server and get URL
    }))

    setFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  const removeFile = (fileId: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find(f => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prevFiles.filter(f => f.id !== fileId)
    })
  }

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
      files: files.length > 0 ? files : undefined,
      link: link.trim() || undefined,
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

          {/* File Upload */}
          <div>
            <label htmlFor="files" className="block text-sm font-medium text-foreground mb-2">
              Attach Files
            </label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                />
                <div className="flex items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="text-center">
                    <svg className="w-6 h-6 text-muted-foreground mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-muted-foreground">Click to upload files</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Images, videos, documents, archives</p>
                  </div>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
                      <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 7.414V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 text-destructive"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
