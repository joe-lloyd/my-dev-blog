import * as React from "react"
import "./footer.scss"
import { graphql, useStaticQuery } from "gatsby"

const Footer: React.FC = () => {
  const { site } = useStaticQuery(graphql`
    query FooterComponent {
      site {
        siteMetadata {
          twitterUsername
          microSiteUrl
          microSitePersonalProjectsUrl
        }
      }
    }
  `)

  return (
    <footer className="footer">
      <div className="container">
        <div className="content has-text-centered">
          <div className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Follow Me</p>
                <p>
                  <a href={`https://twitter.com/${site.siteMetadata.twitterUsername}`} aria-label="Twitter">
                <span className="icon">
                  <i className="fab fa-twitter"></i>
                </span>Twitter
                  </a> |
                  <a href="https://www.linkedin.com/in/josephmlloyd/" aria-label="LinkedIn">
                <span className="icon">
                  <i className="fab fa-linkedin"></i>
                </span>LinkedIn
                  </a>
                </p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Email Me</p>
                <p>
                  <a href="mailto:info@joe-lloyd.com">
                <span className="icon">
                  <i className="fas fa-envelope"></i>
                </span>
                    info@joe-lloyd.com
                  </a>
                </p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">More Links</p>
                <p>
                  <a href={site.siteMetadata.microSiteUrl}>Joe's CV</a> |
                  <a href={site.siteMetadata.microSitePersonalProjectsUrl}> Joe's Personal Projects</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
