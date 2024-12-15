import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";

import "./article-footer.scss"
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

  return (
    <>
      <hr />
      <footer className="content">
        <div className="box">
          <article className="media">
            <div className="media-content">
              <div className="content">
                <p>
                  <strong>Written by {author}</strong> <small>on {date}</small>
                </p>
              </div>
            </div>
          </article>
          <br />
          <div className="buttons">
            <a
              className="button twitter-blue"
              href={`https://twitter.com/intent/tweet?url=${site.siteMetadata.siteUrl}${slug}&text=Check out this awesome article by ${author}!`}
            >
              <span className="icon">
                <FontAwesomeIcon icon={faTwitter} />
              </span>
              <span>Tweet</span>
            </a>

            <a
              className="button linkedin-blue"
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${site.siteMetadata.siteUrl}${slug}`}
            >
              <span className="icon">
                <FontAwesomeIcon icon={faLinkedin} />
              </span>
              <span>Share on LinkedIn</span>
            </a>

            {gistLink && (
              <a
                className="button github-black" href={gistLink} target="_blank"
                rel="noopener noreferrer"
              >
              <span className="icon">
                <FontAwesomeIcon icon={faGithub} />
              </span>
                <span>View the Gist on GitHub</span>
              </a>
            )}

            {gitHubLink && (
              <a
                className="button github-black" href={gitHubLink} target="_blank"
                rel="noopener noreferrer"
              >
              <span className="icon">
                <FontAwesomeIcon icon={faGithub} />
              </span>
                <span>View on GitHub</span>
              </a>
            )}

          </div>
        </div>
      </footer>
    </>
  )
}

export default ArticleFooter
