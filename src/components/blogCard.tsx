import * as React from "react";
import { Link } from "gatsby"
import "./blogCard.css";

type BlogCardProps = {
  title: string;
  excerpt: string;
  slug: string;
  image: string; // You'll need to get this URL from your MDX or static files
};

const BlogCard: React.FC<BlogCardProps> = ({ title, excerpt, slug, image }) => {
  return (
    <div className="card">
      <img src={image} alt={title} className="card-image" />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-excerpt">{excerpt}</p>
        <Link to={slug} className="button">Read More</Link>
      </div>
    </div>
  );
};

export default BlogCard;
