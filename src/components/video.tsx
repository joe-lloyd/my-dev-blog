import * as React from "react"

const YouTubeVideo: React.FC<{ videoSrc: string }> = ({ videoSrc }) => (
  <div className="video">
    <iframe
      src={`https://www.youtube.com/embed/${videoSrc}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title="YouTube video"
      loading="lazy"
    />
  </div>
)

export default YouTubeVideo
