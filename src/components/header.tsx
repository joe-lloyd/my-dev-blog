import * as React from "react"
import "./header.scss"
const Header = () => (
  <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <a className="navbar-item logo" href="/">
        <picture className="navbar-item logo">
          <source
            srcSet="../images/my-logo-2.png?as=avif&width=114 2x, ../images/my-logo-2.png?as=avif&width=57"
            type="image/avif"
            sizes="(min-width: 800px) 48px, 100vw"
          />
          <source
            srcSet="../images/my-logo-2.png?as=webp&width=114 2x, ../images/my-logo-2.png?as=webp&width=57"
            type="image/webp"
            sizes="(min-width: 800px) 48px, 100vw"
          />
          <source
            srcSet="../images/my-logo-2.png?width=114 2x, ../images/my-logo-2.png?width=57"
            type="image/png"
            sizes="(min-width: 800px) 48px, 100vw"
          />
          <img src="../images/my-logo-2.png?width=57" alt="logo" />
        </picture>

      </a>
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
