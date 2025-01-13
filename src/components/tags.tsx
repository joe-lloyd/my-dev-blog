import React from "react"
import "./tags.scss"

const Tags: React.FC<{ tags: string[] }> = ({ tags }) => {
  return (
    <div className="tags">
      {tags.map(tag => (
        <span
          key={tag}
          className={`tag tag-${tag
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/\+/g, "p")
          }`}
        >{tag}</span>
      ))}
    </div>
  )
}

export default Tags
