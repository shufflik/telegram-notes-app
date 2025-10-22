"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import type { Topic } from "@/app/page"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface TopicListProps {
  topics: Topic[]
  onSelectTopic: (topic: string) => void
  onNavigationChange?: (hasNavigation: boolean, parentPath: string) => void
  resetNavigation?: boolean
}

const TOPIC_COLORS: Record<string, string> = {
  Work: "bg-primary/10 border-l-primary",
  Personal: "bg-accent/10 border-l-accent",
  Learning: "bg-secondary/10 border-l-muted-foreground",
  Health: "bg-accent/10 border-l-accent",
}

function SwipeableTopicItem({
  topic,
  onSelect,
  onDelete,
  onEdit,
  fullPath,
}: {
  topic: Topic
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
  fullPath: string
}) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  const minSwipeDistance = 50
  const maxSwipeOffset = 140

  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    const distance = touchStart - e.targetTouches[0].clientX

    if (distance > 0 && distance <= maxSwipeOffset) {
      setSwipeOffset(distance)
    }
  }

  const handleTouchEnd = () => {
    const distance = touchStart - touchEnd

    if (distance > minSwipeDistance) {
      setIsRevealed(true)
      setSwipeOffset(maxSwipeOffset)
    } else {
      setIsRevealed(false)
      setSwipeOffset(0)
    }
  }

  const handleClick = () => {
    if (isRevealed) {
      setIsRevealed(false)
      setSwipeOffset(0)
    } else {
      onSelect()
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4 transition-opacity duration-200"
        style={{
          opacity: swipeOffset > 0 ? Math.min(swipeOffset / 100, 1) : 0,
          pointerEvents: isRevealed ? "auto" : "none",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
            setIsRevealed(false)
            setSwipeOffset(0)
          }}
          className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
            setIsRevealed(false)
            setSwipeOffset(0)
          }}
          className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Swipeable card */}
      <Card
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: touchEnd === touchStart ? "transform 0.3s ease-out" : "none",
        }}
        className={`p-4 cursor-pointer hover:shadow-md active:scale-[0.98] border-l-4 ${
          TOPIC_COLORS[topic.name] || "bg-muted/10 border-l-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-card-foreground">{topic.name}</h3>
              <p className="text-sm text-muted-foreground">
                {topic.count} {topic.count === 1 ? "note" : "notes"}
                {hasSubtopics &&
                  ` • ${topic.subtopics!.length} ${topic.subtopics!.length === 1 ? "subtopic" : "subtopics"}`}
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </div>
  )
}

export function TopicList({ topics, onSelectTopic, onNavigationChange, resetNavigation }: TopicListProps) {
  const [navigationStack, setNavigationStack] = useState<{ topics: Topic[]; path: string }[]>([{ topics, path: "" }])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<string>("")

  // Сброс навигации при возврате в главное меню
  React.useEffect(() => {
    if (resetNavigation) {
      setNavigationStack([{ topics, path: "" }])
    }
  }, [resetNavigation, topics])

  const currentLevel = navigationStack[navigationStack.length - 1]

  const handleNavigateInto = (topic: Topic, fullPath: string) => {
    onSelectTopic(fullPath)

    // This ensures the Back button and topic name are shown, while hiding the subtopics list for final topics
    const newStack = [
      ...navigationStack,
      {
        topics: topic.subtopics || [],
        path: fullPath,
      },
    ]
    setNavigationStack(newStack)

    const hasSubtopics = Boolean(topic.subtopics && topic.subtopics.length > 0)
    onNavigationChange?.(hasSubtopics, fullPath)
  }

  const handleNavigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1)
      setNavigationStack(newStack)
      const parentLevel = newStack[newStack.length - 1]
      const parentPath = parentLevel.path

      // Select the parent topic to show its notes
      onSelectTopic(parentPath || "")
      onNavigationChange?.(newStack.length > 1, parentPath)
    } else {
      onSelectTopic("")
      onNavigationChange?.(false, "")
    }
  }

  const handleDelete = (topicName: string) => {
    setTopicToDelete(topicName)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    console.log("[v0] Delete topic:", topicToDelete)
    // Здесь будет реальная логика удаления темы
    // alert(`Delete topic: ${topicToDelete}`) // Убираем дублирующий alert
    setShowDeleteDialog(false)
    setTopicToDelete("")
  }

  const handleEdit = (topicName: string) => {
    console.log("[v0] Edit topic:", topicName)
    alert(`Edit topic: ${topicName}`)
  }

  const breadcrumbs = navigationStack.map((level) => level.path).filter(Boolean)

  // Функция для умного сокращения пути
  const truncatePath = (path: string) => {
    const parts = path.split('/')
    if (parts.length <= 2) {
      return path
    }
    return `${parts[0]}/../${parts[parts.length - 1]}`
  }

  return (
    <div className="space-y-3">
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={handleNavigateBack}
            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          <span 
            className="text-xs sm:text-sm text-muted-foreground truncate" 
            title={breadcrumbs[breadcrumbs.length - 1]}
          >
            {truncatePath(breadcrumbs[breadcrumbs.length - 1])}
          </span>
        </div>
      )}

      {currentLevel.topics.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1">
            {breadcrumbs.length > 0 ? "Subtopics" : "Topics"}
          </h2>

          {currentLevel.topics.map((topic) => {
            const fullPath = currentLevel.path ? `${currentLevel.path}/${topic.name}` : topic.name
            return (
              <SwipeableTopicItem
                key={fullPath}
                topic={topic}
                fullPath={fullPath}
                onSelect={() => handleNavigateInto(topic, fullPath)}
                onDelete={() => handleDelete(fullPath)}
                onEdit={() => handleEdit(fullPath)}
              />
            )
          })}
        </>
      )}
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topicToDelete}"? This action cannot be undone and will also delete all notes in this topic.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
