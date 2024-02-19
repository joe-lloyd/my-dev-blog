import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTwitter, faLinkedinIn, faGithub } from "@fortawesome/free-brands-svg-icons"

import "./article-footer.scss"

type ArticleFooterProps = {
  author: string
  date: string
  gistLink?: string | null
}

const ArticleFooter: React.FC<ArticleFooterProps> = ({ author, date, gistLink }) => (
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
            href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out this awesome article by ${author}!`}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faTwitter} />
            </span>
            <span>Tweet</span>
          </a>

          <a
            className="button linkedin-blue"
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faLinkedinIn} />
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
              <span>View on GitHub</span>
            </a>
          )}

        </div>
      </div>
    </footer>
  </>
)

export default ArticleFooter
