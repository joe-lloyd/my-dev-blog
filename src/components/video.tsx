import React from "react"
import "./video.scss"

const YouTubeVideo: React.FC<{ videoSrc: string }> = ({ videoSrc }) => {
  return (
    <>
      <div className="image is-16by9">
        <iframe
          className="has-ratio"
          width="960"
          height="540"
          src={`https://www.youtube.com/embed/${videoSrc}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="YouTube Video"
        ></iframe>
      </div>
      <br />
    </>
  )
}

export default YouTubeVideo
