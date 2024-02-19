import * as React from "react"
import "./footer.scss"

type FooterProps = {
  twitterLink: string
  linkedinLink: string
}

const Footer: React.FC<FooterProps> = ({
  twitterLink,
  linkedinLink
}) => {

  return (
    <footer className="footer">
      <div className="container">
        <div className="content has-text-centered">
          <div className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Follow us</p>
                <p>
                  <a href="your-twitter-link" aria-label="Twitter">
                <span className="icon">
                  <i className="fab fa-twitter"></i>
                </span>Twitter
                  </a> |
                  <a href="your-linkedin-link" aria-label="LinkedIn">
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
                  <a href="https://joe-lloyd.com/">Joe's CV</a> |
                  <a href="https://joe-lloyd.com/personal-projects"> Joe's Personal Projects</a>
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
