import * as React from "react"
import GlitchLogo from "./glitchLogo"
import TypingEffect from "./typingEffect"

interface HeroProps {
  kicker: string
  title: string
  /** Rotating accent line under the title. Off on post pages. */
  typed?: boolean
  lede?: string
  compact?: boolean
  children?: React.ReactNode
}

const Hero: React.FC<HeroProps> = ({ kicker, title, typed = false, lede, compact = false, children }) => (
  <section className={`hero${compact ? " hero--post" : ""}`}>
    <div className="hero-grid" aria-hidden="true">
      <div className="hero-grid__plane" />
    </div>
    <div className="hero-scrim" aria-hidden="true" />

    <div className="container">
      <div className="hero__copy">
        <p className="kicker">
          <span className="kicker__prompt" aria-hidden="true">
            &gt;
          </span>{" "}
          {kicker}
        </p>
        <h1 className={`hero__title${compact ? " hero__title--compact" : ""}`}>
          {title}
          {typed && <TypingEffect />}
        </h1>
        {lede && <p className="hero__lede">{lede}</p>}
        {children}
      </div>

      {!compact && (
        <div className="hero__crest">
          <GlitchLogo width={380} />
        </div>
      )}
    </div>
  </section>
)

export default Hero
