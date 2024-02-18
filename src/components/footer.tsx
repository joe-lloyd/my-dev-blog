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
                <p className="heading">Email us</p>
                <p>
                  <a href="mailto:your-email">
                <span className="icon">
                  <i className="fas fa-envelope"></i>
                </span>
                    your-email@example.com
                  </a>
                </p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">More Info</p>
                <p>
                  <a href="your-privacy-policy-link">Privacy Policy</a> |
                  <a href="your-terms-link">Terms of Use</a>
                </p>
              </div>
            </div>
          </div>
          <p>
            <strong>App Name</strong> by <a href="your-website">Your Name</a>. The source code is
            licensed
            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content
            is licensed <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY NC SA
            4.0</a>.
          </p>
        </div>
      </div>
    </footer>

  )
}

export default Footer
