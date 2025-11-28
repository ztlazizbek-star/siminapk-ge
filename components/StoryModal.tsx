"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface StoryModalProps {
  show: boolean
  images: string[]
  onClose: () => void
  title?: string
}

export default function StoryModal({ show, images, onClose, title }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!show) return

    const duration = 5000 // 5 seconds per story
    const interval = 50 // Update progress every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < images.length - 1) {
            setCurrentIndex((prev) => prev + 1)
            return 0
          } else {
            onClose()
            return 0
          }
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [show, currentIndex, images.length, onClose])

  useEffect(() => {
    if (show) {
      setCurrentIndex(0)
      setProgress(0)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [show])

  if (!show || images.length === 0) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
    setProgress(0)
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
    } else {
      onClose()
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
    <div className="story-modal-instagram" style={{ display: "flex" }}>
      <div className="story-modal-content-instagram">
        <button className="story-close-button-top-left" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>

        {/* Progress bars */}
        <div className="story-progress-bars-instagram">
          {images.map((_, index) => (
            <div
              key={index}
              className={`story-progress-bar-instagram ${index < currentIndex ? "completed" : ""} ${
                index === currentIndex ? "active" : ""
              }`}
            >
              {index === currentIndex && <div className="story-progress-fill" style={{ width: `${progress}%` }} />}
            </div>
          ))}
        </div>

        {/* Image container with click navigation */}
        <div className="story-image-container-instagram" onClick={handleImageClick}>
          <img src={images[currentIndex] || "/placeholder.svg"} alt="Story" />
        </div>

        {/* Counter */}
        <div className="story-counter-instagram">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}
