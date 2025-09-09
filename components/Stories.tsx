"use client"

interface Story {
  image: string
  fullImage: string
}

interface StoriesProps {
  stories: Story[]
  onStoryClick: (fullImage: string) => void
}

export default function Stories({ stories, onStoryClick }: StoriesProps) {
  return (
    <div className="stories-container">
      {stories.map((story, index) => (
        <div key={index} className="story" onClick={() => onStoryClick(story.fullImage)}>
          <div className="story-circle">
            <img src={story.image || "/placeholder.svg"} alt="Story" />
          </div>
        </div>
      ))}
    </div>
  )
}
