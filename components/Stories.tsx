"use client"

interface Story {
  image: string
  images: string[] // Added array of images for full story
}

interface StoriesProps {
  stories: Story[]
  onStoryClick: (images: string[]) => void // Pass array of images
}

export default function Stories({ stories, onStoryClick }: StoriesProps) {
  return (
    <div className="stories-container">
      {stories.map((story, index) => (
        <div key={index} className="story" onClick={() => onStoryClick(story.images)}>
          <div className="story-circle">
            <img src={story.image || "/placeholder.svg"} alt="Story" />
          </div>
        </div>
      ))}
    </div>
  )
}
