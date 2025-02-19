import React from "react"
import "./hero.scss"
import { StaticImage } from "gatsby-plugin-image"
import TypingEffect from "./typingEffect"

const Hero = () => {
  return (
    <section className="hero is-small">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column">
              <div className="section">
                <TypingEffect />

                <p className="subtitle">
                  Another dev blog
                </p>
              </div>
            </div>
            <div
              className="column is-justify-content-flex-end is-hidden-mobile hovering-element"
              style={{ maxWidth: "400px" }}
            >
              <div className="glitch-shake">

              <StaticImage
                src="../images/logo.png"
                alt="logo"
                placeholder="blurred"
                formats={["auto", "webp", "avif"]}
              />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "0%",
                  width: "100%",
                  height: "100%",
                  zIndex:10,
                  backdropFilter: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b' x='0' y='0'%3E%3CfeFlood x='4' y='4' height='2' width='2'/%3E%3CfeComposite width='10' height='10'/%3E%3CfeTile result='a'/%3E%3CfeComposite in='SourceGraphic' in2='a' operator='in'/%3E%3CfeMorphology operator='dilate' radius='5'/%3E%3C/filter%3E%3C/svg%3E#b\")",
                }}
                className={"glitch"}
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
