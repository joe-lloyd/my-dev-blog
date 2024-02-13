import * as React from "react"
import { Link } from "gatsby"
import "./blogCard.scss"
import { GatsbyImage, getImage, ImageDataLike } from "gatsby-plugin-image"

type BlogCardProps = {
  title: string;
  excerpt: string;
  slug: string;
  image: ImageDataLike;
};

const BlogCard: React.FC<BlogCardProps> = ({ title, excerpt, slug, image }) => {
  const imageData = getImage(image)

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">{title}</p>
      </header>
      <GatsbyImage image={imageData} alt={title} className="card-image" />
      <div className="card-content">
        <div className="content">{excerpt}</div>
      </div>
      <footer className="card-footer">
        <Link to={slug} className="card-footer-item">Read More</Link>
        <time className="card-footer-item" dateTime="2016-1-1">1 Jan 2016</time>
      </footer>
    </div>
  )
}

export default BlogCard
