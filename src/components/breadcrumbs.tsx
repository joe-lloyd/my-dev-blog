import * as React from "react"
import { Link } from "gatsby"

const Breadcrumbs: React.FC<{ slug: string }> = ({ slug }) => (
  <nav className="breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li>
        <Link to="/">~/posts</Link>
      </li>
      <li>
        <span aria-current="page">{slug.replace(/^\//, "")}</span>
      </li>
    </ol>
  </nav>
)

export default Breadcrumbs
