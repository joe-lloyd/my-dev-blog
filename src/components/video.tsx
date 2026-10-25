import * as React from "react"

type YouTubeVideoProps = {
  videoSrc?: string | null
  playlistId?: string | null
  title?: string
}

const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ videoSrc, playlistId, title }) => {
  if (!videoSrc && !playlistId) return null

  const src = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`
    : `https://www.youtube.com/embed/${videoSrc}`

  return (
    <div className="video">
      <iframe
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title={title || (playlistId ? "YouTube playlist" : "YouTube video")}
        loading="lazy"
        // YouTube refuses embeds that arrive without a Referer (Error 153). Set on the iframe so it
        // holds whatever Referrer-Policy the page itself was served with.
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

export default YouTubeVideo
