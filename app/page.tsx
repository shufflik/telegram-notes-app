"use client"

import { useState, useMemo } from "react"
import { SearchBar } from "@/components/search-bar"
import { TopicList } from "@/components/topic-list"
import { NoteCard } from "@/components/note-card"
import { AddNoteButton } from "@/components/add-note-button"
import { NoteView } from "@/components/note-view"
import { AddNoteForm } from "@/components/add-note-form"

export type Note = {
  id: string
  title: string
  content: string
  topic: string
  date: string
  color?: string
  isFavorite?: boolean
  image?: string
  showPreview?: boolean
}

export type Topic = {
  name: string
  count: number
  subtopics?: Topic[]
}

const SAMPLE_NOTES: Note[] = [
  {
    id: "1",
    title: "Meeting Notes",
    content:
      "Discussed Q4 roadmap and feature priorities. Need to follow up on API integration timeline. Key action items: 1) Review technical specs by Friday, 2) Schedule follow-up with engineering team, 3) Prepare presentation for stakeholders.",
    topic: "Work",
    date: "2025-10-18",
    color: "primary",
    isFavorite: true,
    image: "/business-meeting-workspace.jpg",
    showPreview: true,
  },
  {
    id: "2",
    title: "Recipe Ideas",
    content:
      "Try making homemade pasta this weekend. Need: flour, eggs, salt, olive oil. Instructions: Mix 2 cups flour with 3 eggs, knead for 10 minutes, rest for 30 minutes, then roll out and cut into desired shapes.",
    topic: "Personal",
    date: "2025-10-17",
    color: "accent",
    isFavorite: false,
    showPreview: true,
  },
  {
    id: "3",
    title: "Book Recommendations",
    content:
      "The Design of Everyday Things - great insights on UX principles and human-centered design. Key takeaways: affordances, signifiers, feedback, and conceptual models are essential for good design.",
    topic: "Learning",
    date: "2025-10-16",
    color: "secondary",
    isFavorite: true,
    image: "/books-on-desk-learning.jpg",
    showPreview: true,
  },
  {
    id: "4",
    title: "Project Deadline",
    content:
      "Mobile app redesign due next Friday. Complete user testing and finalize mockups. Current progress: wireframes done, need to finish high-fidelity designs and prepare developer handoff documentation.",
    topic: "Work",
    date: "2025-10-15",
    color: "primary",
    isFavorite: false,
    showPreview: true,
  },
  {
    id: "5",
    title: "Workout Plan",
    content:
      "Monday: Upper body, Wednesday: Cardio, Friday: Lower body. Remember to stretch! Each session should be 45-60 minutes. Focus on progressive overload and proper form.",
    topic: "Health",
    date: "2025-10-14",
    color: "accent",
    isFavorite: true,
    image: "/fitness-workout-gym.png",
    showPreview: true,
  },
  {
    id: "6",
    title: "Travel Ideas",
    content:
      "Summer vacation options: Japan (cherry blossoms), Iceland (northern lights), or New Zealand. Budget considerations: flights, accommodation, activities. Best time to visit: March-April for Japan, September-March for Iceland.",
    topic: "Personal",
    date: "2025-10-13",
    color: "secondary",
    isFavorite: false,
    showPreview: true,
  },
  {
    id: "7",
    title: "Frontend Architecture",
    content: "Planning component structure and state management approach for the new dashboard.",
    topic: "Work/Projects/Web Development",
    date: "2025-10-12",
    color: "primary",
    isFavorite: false,
    showPreview: true,
  },
  {
    id: "8",
    title: "API Design",
    content: "RESTful endpoints for user management and authentication flows.",
    topic: "Work/Projects/Backend",
    date: "2025-10-11",
    color: "primary",
    isFavorite: true,
    image: "/business-meeting-workspace.jpg",
    showPreview: true,
  },
  {
    id: "9",
    title: "Team Standup",
    content: "Daily sync with the team on current sprint progress and blockers.",
    topic: "Work/Meetings",
    date: "2025-10-10",
    color: "primary",
    isFavorite: false,
    showPreview: true,
  },
]

export default function NotesApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [notes, setNotes] = useState<Note[]>(SAMPLE_NOTES)
  const [view, setView] = useState<"favorites" | "topics">("favorites")
  const [showAddForm, setShowAddForm] = useState(false)
  const [hasSubtopics, setHasSubtopics] = useState(true)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const topics = useMemo(() => {
    const buildTopicTree = (): Topic[] => {
      const topicMap = new Map<string, Topic>()

      notes.forEach((note) => {
        const parts = note.topic.split("/")
        let currentPath = ""

        parts.forEach((part, index) => {
          currentPath = index === 0 ? part : `${currentPath}/${part}`

          if (!topicMap.has(currentPath)) {
            topicMap.set(currentPath, {
              name: part,
              count: 0,
              subtopics: [],
            })
          }

          const exactMatches = notes.filter((n) => n.topic === currentPath).length
          const topic = topicMap.get(currentPath)!
          topic.count = exactMatches
        })
      })

      const rootTopics: Topic[] = []

      topicMap.forEach((topic, path) => {
        const parts = path.split("/")
        if (parts.length === 1) {
          rootTopics.push(topic)
        } else {
          const parentPath = parts.slice(0, -1).join("/")
          const parent = topicMap.get(parentPath)
          if (parent) {
            parent.subtopics = parent.subtopics || []
            parent.subtopics.push(topic)
          }
        }
      })

      return rootTopics
    }

    return buildTopicTree()
  }, [notes])

  const favoriteNotes = useMemo(() => {
    return notes.filter((note) => note.isFavorite)
  }, [notes])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.topic.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTopic = !selectedTopic || note.topic === selectedTopic

      return matchesSearch && matchesTopic
    })
  }, [notes, searchQuery, selectedTopic])

  const toggleFavorite = (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note)),
    )
  }

  const handleAddNote = (newNote: Omit<Note, "id" | "date">) => {
    if (editingNote) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editingNote.id
            ? {
                ...newNote,
                id: editingNote.id,
                date: editingNote.date,
              }
            : note,
        ),
      )
      setEditingNote(null)
    } else {
      const note: Note = {
        ...newNote,
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
      }
      setNotes((prevNotes) => [note, ...prevNotes])
    }
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId))
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setSelectedNote(null)
    setShowAddForm(true)
  }

  const handleNavigationChange = (hasNav: boolean, parentPath: string) => {
    setHasSubtopics(hasNav)
  }

  const showTopicList = view === "topics" && !searchQuery
  const showFavorites = view === "favorites" && !selectedTopic && !searchQuery

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            {selectedTopic && (
              <button
                onClick={() => {
                  setSelectedTopic(null)
                  setHasSubtopics(true)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to topics"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-foreground">{selectedTopic || "My Notes"}</h1>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {!selectedTopic && !searchQuery && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setView("favorites")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  view === "favorites"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => setView("topics")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  view === "topics"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Topics
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {showTopicList && (
          <div className="mb-6">
            <TopicList topics={topics} onSelectTopic={setSelectedTopic} onNavigationChange={handleNavigationChange} />
          </div>
        )}

        {showFavorites ? (
          favoriteNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No favorite notes yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Star your important notes to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoriteNotes.map((note) => (
                <NoteCard key={note.id} note={note} onClick={() => setSelectedNote(note)} />
              ))}
            </div>
          )
        ) : selectedTopic || searchQuery ? (
          filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 2.888a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No notes found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery || selectedTopic
                  ? "Try adjusting your search or filter"
                  : "Create your first note to get started"}
              </p>
            </div>
          ) : (
            <div>
              {selectedTopic && (
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1 mb-3">
                  Notes in {selectedTopic.split("/").pop()}
                </h2>
              )}
              <div className="grid grid-cols-2 gap-3">
                {filteredNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onClick={() => setSelectedNote(note)} />
                ))}
              </div>
            </div>
          )
        ) : null}
      </main>

      {/* Floating Add Button */}
      <AddNoteButton onClick={() => setShowAddForm(true)} />

      {selectedNote && (
        <NoteView
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onToggleFavorite={toggleFavorite}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      )}

      {showAddForm && (
        <AddNoteForm
          onClose={() => {
            setShowAddForm(false)
            setEditingNote(null)
          }}
          onSubmit={handleAddNote}
          topics={topics}
          editingNote={editingNote}
        />
      )}
    </div>
  )
}
