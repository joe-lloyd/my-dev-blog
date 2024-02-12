import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

import "./header.scss"
import { Link } from "gatsby"
const Header = () => (
  <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <Link className="navbar-item logo" to="/">
        <div className="navbar-item logo">
          <StaticImage
            src="../images/my-logo-2.png"
            alt="logo"
            placeholder="blurred"
            layout="fixed"
            width={57}
            height={48}
            formats={["auto", "webp", "avif"]}
            sizes="(min-width: 800px) 48px, 100vw"
          />
        </div>

      </Link>
      <h1 className="title navbar-item is-marginless">Joe Lloyd&nbsp;<span>Web Apps</span></h1>
      <a
        role="button" className="is-hidden-desktop navbar-burger is-mobile" aria-label="menu"
        aria-expanded="false" data-target="navMenu"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div className="navbar-menu" id="navMenu">
      <div className="navbar-end">
        <a className="navbar-item" href="https://joe-lloyd.com/">
        Home
        </a>

        <a className="navbar-item" href="https://joe-lloyd.com/personal-projects">
          Personal Projects
        </a>
      </div>
    </div>
  </nav>
)

export default Header
