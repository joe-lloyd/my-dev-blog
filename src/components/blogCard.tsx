import * as React from "react"
import { Link } from "gatsby"
import "./blogCard.css"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

type BlogCardProps = {
  title: string;
  excerpt: string;
  slug: string;
  image: string; // You'll need to get this URL from your MDX or static files
};

const BlogCard: React.FC<BlogCardProps> = ({ title, excerpt, slug, image }) => {
  const imageData = getImage(image); // This helper function is used to extract image data

  return (
    <div className="card">
      return <GatsbyImage image={imageData} alt={title} className="card-image" />;
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-excerpt">{excerpt}</p>
        <Link to={slug} className="button">Read More</Link>
      </div>
    </div>
  )
}

export default BlogCard
