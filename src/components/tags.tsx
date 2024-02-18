import React from "react"
import './tags.scss'

const Tags: React.FC<{ tags: string[] }> = ({ tags }) => {
  return (
    <div className="tags">
      {tags.map(tag => (
        <span key={tag} className={`tag is-primary tag-${tag.toLowerCase()}`}>{tag}</span>
      ))}
    </div>
  )
}

export default Tags
