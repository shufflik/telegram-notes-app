"use client"

import { Button } from "@/components/ui/button"

type AddNoteButtonProps = {
  onClick: () => void
}

export function AddNoteButton({ onClick }: AddNoteButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-20">
      <Button
        size="lg"
        onClick={onClick}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
        aria-label="Add new note"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </div>
  )
}
