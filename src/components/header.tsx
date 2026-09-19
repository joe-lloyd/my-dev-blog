import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const links = [
  { label: "home", href: "https://joe-lloyd.com/", external: true },
  { label: "projects", href: "https://joe-lloyd.com/projects", external: true },
  { label: "ai", href: "https://joe-lloyd.com/ai", external: true },
  { label: "blog", href: "/", external: false },
]

const Header: React.FC = () => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const item = (l: (typeof links)[number], mobile = false) =>
    l.external ? (
      <a href={l.href}>
        {mobile && <span className="bracket">[</span>}
        {l.label}
        {mobile && <span className="bracket">]</span>}
      </a>
    ) : (
      <Link to={l.href} activeClassName="is-current" aria-current="page">
        {mobile && <span className="bracket">[</span>}
        {l.label}
        {mobile && <span className="bracket">]</span>}
      </Link>
    )

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="site-header">
        <nav aria-label="Main">
          <Link to="/" className="brand">
            <StaticImage
              src="../images/my-logo-2.png"
              alt=""
              aria-hidden="true"
              placeholder="none"
              layout="fixed"
              width={34}
              height={29}
              formats={["auto", "webp", "avif"]}
            />
            Joe Lloyd<span>&nbsp;Dev Blog</span>
          </Link>

          <span className="prompt" aria-hidden="true">
            :~$ <span className="caret" />
          </span>

          <ul className="site-nav">
            {links.map((l) => (
              <li key={l.label}>{item(l)}</li>
            ))}
            <li>
              <a className="hire" href="https://joe-lloyd.com/ai">
                hire me
              </a>
            </li>
          </ul>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="navMenu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <div id="navMenu" className="nav-panel" hidden={!open}>
        <ul onClick={() => setOpen(false)}>
          {links.map((l) => (
            <li key={l.label}>{item(l, true)}</li>
          ))}
          <li>
            <a className="hire" href="https://joe-lloyd.com/ai">
              hire me
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}

export default Header
