"use client"

interface GlobalLoaderProps {
  isLoading: boolean
}

export function GlobalLoader({ isLoading }: GlobalLoaderProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <svg className="w-12 h-12 animate-spin text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
  )
}
