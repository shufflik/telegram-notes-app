"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface EditTopicFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (oldName: string, newName: string) => Promise<void>
  topicName: string
  topicPath: string
}

export function EditTopicForm({ isOpen, onClose, onSave, topicName, topicPath }: EditTopicFormProps) {
  const [newName, setNewName] = useState(topicName)

  React.useEffect(() => {
    if (isOpen) {
      setNewName(topicName)
    }
  }, [isOpen, topicName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newName.trim()) {
      return
    }

    if (newName.trim() === topicName) {
      onClose()
      return
    }

    try {
      await onSave(topicPath, newName.trim())
    } catch (err) {
      // Ошибка обрабатывается в родительском компоненте
      console.error("Error in handleSubmit:", err)
    }
  }

  const handleClose = () => {
    setNewName(topicName)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogDescription>
            Rename the topic "{topicName}". This will update all notes in this topic.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic-name" className="block text-sm font-medium text-foreground mb-2">
              Topic Name
            </label>
            <Input
              id="topic-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter topic name"
              className="w-full"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!newName.trim() || newName.trim() === topicName}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
