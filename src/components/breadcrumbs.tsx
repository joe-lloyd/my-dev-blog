import React from "react"
import './breadcrumbs.scss'

const Breadcrumbs: React.FC<{ slug: string }> = ({ slug }) => {
  return (
    <nav className="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><a href="/">Overview</a></li>
        <li className="is-active"><a href={slug} aria-current="page">{slug.replace(/^\//, '')}</a></li>
      </ul>
    </nav>
  )
}

export default Breadcrumbs
