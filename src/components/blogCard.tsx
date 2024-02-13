import * as React from "react"
import { Link } from "gatsby"
import "./blogCard.css"
import { GatsbyImage, getImage, ImageDataLike } from "gatsby-plugin-image"

type BlogCardProps = {
  title: string;
  excerpt: string;
  slug: string;
  image: ImageDataLike;
};

const BlogCard: React.FC<BlogCardProps> = ({ title, excerpt, slug, image }) => {
  const imageData = getImage(image);

  return (
    <div className="card">
      <GatsbyImage image={imageData} alt={title} className="card-image" />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-excerpt">{excerpt}</p>
        <Link to={slug} className="button">Read More</Link>
      </div>
    </div>
  )
}

export default BlogCard
