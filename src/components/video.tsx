import * as React from "react"

const YouTubeVideo: React.FC<{ videoSrc: string }> = ({ videoSrc }) => (
  <div className="video">
    <iframe
      src={`https://www.youtube.com/embed/${videoSrc}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title="YouTube video"
      loading="lazy"
      // YouTube refuses embeds that arrive without a Referer (Error 153). Set on the iframe so it
      // holds whatever Referrer-Policy the page itself was served with.
      referrerPolicy="strict-origin-when-cross-origin"
    />
  </div>
)

export default YouTubeVideo
