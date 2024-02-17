import React from "react"
import "./hero.scss"
import { StaticImage } from "gatsby-plugin-image"

const Hero = () => {
  return (
    <section className="hero is-small">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <div className="section">
                <p className="title">
                  10,000 Hours of Debugging
                </p>
                <p className="subtitle">
                  Another dev blog
                </p>
              </div>
            </div>
            <div className="column is-justify-content-flex-end is-hidden-mobile" style={{maxWidth: "400px"}}>
              <StaticImage
                src="../images/logo.png"
                alt="logo"
                placeholder="blurred"
                formats={["auto", "webp", "avif"]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
