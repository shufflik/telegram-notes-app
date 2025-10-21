"use client"

import { cn } from "@/lib/utils"

interface TopicFilterProps {
  topics: string[]
  selectedTopic: string
  onSelectTopic: (topic: string) => void
}

export function TopicFilter({ topics, selectedTopic, onSelectTopic }: TopicFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelectTopic(topic)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedTopic === topic
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
        >
          {topic}
        </button>
      ))}
    </div>
  )
}
