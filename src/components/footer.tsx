import * as React from "react"

const socials = [
  { label: "GitHub", href: "https://github.com/joe-lloyd", handle: "joe-lloyd" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/josephmlloyd/", handle: "josephmlloyd" },
  { label: "Stack Overflow", href: "https://stackoverflow.com/users/2504407/joe-lloyd", handle: "22k rep" },
  { label: "Projects", href: "https://joe-lloyd.com/projects", handle: "joe-lloyd.com" },
  { label: "Twitter", href: "https://twitter.com/Josephl83378898", handle: "@Josephl83378898" },
]

const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">Elsewhere</p>
          <ul>
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} <small>{s.handle}</small>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Get in touch</p>
          <a className="site-footer__mail" href="mailto:info@joe-lloyd.com">
            info@joe-lloyd.com
          </a>
          <p>Open to freelance work.</p>
        </div>

        <div>
          <p className="eyebrow">Details</p>
          <p>Amsterdam, Netherlands</p>
          <p className="mono">KVK 74228684</p>
        </div>
      </div>

      <p className="site-footer__legal">
        © {new Date().getFullYear()} Joseph Lloyd · built with Gatsby and MDX
      </p>
    </div>
  </footer>
)

export default Footer
