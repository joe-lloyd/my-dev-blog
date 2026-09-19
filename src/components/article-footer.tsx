import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"

type ArticleFooterProps = {
  author: string
  date: string
  gistLink?: string | null
  gitHubLink?: string | null
  slug?: string
}

const ArticleFooter: React.FC<ArticleFooterProps> = ({ author, date, gitHubLink, gistLink, slug }) => {
  const { site } = useStaticQuery(graphql`
    query ArticleFooterComponent {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `)
  const url = `${site.siteMetadata.siteUrl}${slug ?? ""}`

  return (
    <footer className="article-footer tile">
      <p className="article-footer__byline">
        <span>
          <strong>{author}</strong> · {date}
        </span>
        <span>{slug}</span>
      </p>
      <div className="article-footer__actions">
        <a
          className="btn-term"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
            `Read this by ${author}`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tweet ↗
        </a>
        <a
          className="btn-term"
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn ↗
        </a>
        {gistLink && (
          <a className="btn-term btn-term--pink" href={gistLink} target="_blank" rel="noopener noreferrer">
            Gist ↗
          </a>
        )}
        {gitHubLink && (
          <a className="btn-term btn-term--pink" href={gitHubLink} target="_blank" rel="noopener noreferrer">
            Source ↗
          </a>
        )}
      </div>
    </footer>
  )
}

export default ArticleFooter
