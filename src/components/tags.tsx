import * as React from "react"

const Tags: React.FC<{ tags: string[] }> = ({ tags }) =>
  tags.length ? (
    <ul className="post__tags" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag} className="chip">
          {tag}
        </li>
      ))}
    </ul>
  ) : null

export default Tags
