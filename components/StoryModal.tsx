"use client"

interface StoryModalProps {
  show: boolean
  image: string
  onClose: () => void
}

export default function StoryModal({ show, image, onClose }: StoryModalProps) {
  if (!show) return null

  return (
    <div className="story-modal" id="storyModal">
      <div className="story-modal-content">
        <span className="story-close-btn" onClick={onClose}>
          <i className="fas fa-times-circle"></i>
        </span>
        <img id="storyImage" src={image || "/placeholder.svg"} alt="Story Fullscreen" />
      </div>
    </div>
  )
}
