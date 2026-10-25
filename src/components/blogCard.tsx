import * as React from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage, IGatsbyImageData, ImageDataLike } from "gatsby-plugin-image"
import { bindCardGlitch } from "../scripts/cardGlitch"
import "../styles/cardGlitch.css"

export interface BlogCardProps {
  title: string
  excerpt: string
  slug: string
  date: string
  featuredImage: ImageDataLike | null
  tags?: string[] | null
  readingTime?: string | null
}

const BlogCard: React.FC<BlogCardProps> = ({ title, excerpt, slug, date, featuredImage, tags, readingTime }) => {
  const image = featuredImage ? getImage(featuredImage) : undefined
  const cardRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (cardRef.current) return bindCardGlitch(cardRef.current)
  }, [])

  return (
    <article ref={cardRef} className="tile post-card card-glitch">
      <div className="post-card__image" data-glitch-image>
        {image && <GatsbyImage image={image as IGatsbyImageData} alt="" />}
        <div className="card-glitch__slice card-glitch__slice--a" aria-hidden="true" />
        <div className="card-glitch__slice card-glitch__slice--b" aria-hidden="true" />
        <div className="card-glitch__lines" aria-hidden="true" />
        <div className="card-glitch__chroma" aria-hidden="true" />
        {readingTime && <span className="post-card__badge">{readingTime}</span>}
      </div>
      <div className="post-card__body">
        <h3 className="post-card__title">
          <Link to={slug}>{title}</Link>
          <time dateTime={date}>{date}</time>
        </h3>
        <p className="post-card__excerpt">{excerpt}</p>
        {tags && tags.length > 0 && (
          <ul className="post-card__tags">
            {tags.slice(0, 3).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        )}
        <span className="post-card__cta" aria-hidden="true">
          read → {slug.replace(/^\//, "")}
        </span>
      </div>
    </article>
  )
}

export default BlogCard
