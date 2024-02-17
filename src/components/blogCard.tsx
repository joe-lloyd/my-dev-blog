import * as React from "react"
import { Link } from "gatsby"
import "./blogCard.scss"
import {
  GatsbyImage,
  getImage,
  IGatsbyImageData,
  ImageDataLike,
} from "gatsby-plugin-image"
import { OverviewPageQuery } from "../generated/graphql"

type BlogCardProps =
  OverviewPageQuery["allMdx"]["edges"][0]["node"]["frontmatter"]

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  excerpt,
  slug,
  featuredImage,
  date,
}) => {
  const imageData = getImage(featuredImage as ImageDataLike)

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">{title}</p>
      </header>
      <GatsbyImage
        image={imageData as IGatsbyImageData}
        alt={title}
        className="card-image"
      />
      <div className="card-content">
        <div className="content">{excerpt}</div>
      </div>
      <footer className="card-footer">
        <Link to={slug} className="card-footer-item">
          Read More
        </Link>
        <time className="card-footer-item" dateTime="2016-1-1">
          {date}
        </time>
      </footer>
    </div>
  )
}

export default BlogCard
