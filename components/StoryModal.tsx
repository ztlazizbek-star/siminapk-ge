"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface StoryModalProps {
  show: boolean
  images: string[]
  onClose: () => void
}

export default function StoryModal({ show, images, onClose }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (show) {
      setCurrentIndex(0)
    }
  }, [show])

  if (!show || images.length === 0) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onClose() // Close modal when reaching the end
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width

    if (clickX < width / 2) {
      handlePrevious()
    } else {
      handleNext()
    }
  }

  return (
    <div className="story-modal" id="storyModal">
      <div className="story-modal-content">
        <div className="story-progress-bars">
          {images.map((_, index) => (
            <div
              key={index}
              className={`story-progress-bar ${index < currentIndex ? "completed" : ""} ${
                index === currentIndex ? "active" : ""
              }`}
            />
          ))}
        </div>

        <span className="story-close-btn" onClick={onClose}>
          <i className="fas fa-times-circle"></i>
        </span>

        <div className="story-image-container" onClick={handleImageClick}>
          <img id="storyImage" src={images[currentIndex] || "/placeholder.svg"} alt="Story Fullscreen" />
        </div>

        <div className="story-counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}
