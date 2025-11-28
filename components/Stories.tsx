"use client"

interface Story {
  title?: string
  image: string
  images: string[]
}

interface StoriesProps {
  stories: Story[]
  onStoryClick: (images: string[]) => void
}

export default function Stories({ stories, onStoryClick }: StoriesProps) {
  return (
    <div className="stories-container-new">
      {stories.map((story, index) => (
        <div key={index} className="story-new" onClick={() => onStoryClick(story.images)}>
          <div className="story-circle-new">
            <div className="story-image-wrapper">
              <img src={story.image || "/placeholder.svg"} alt="Story" />
            </div>
          </div>
          {story.title && <span className="story-title">{story.title}</span>}
        </div>
      ))}
    </div>
  )
}
