import * as React from "react"
import { PropsWithChildren } from "react"

import "../styles/theme.scss"
import Header from "./header"
import Footer from "./footer"

const Layout: React.FC<PropsWithChildren> = ({ children }) => (
  <>
    <Header />
    {/* CRT overlay: decorative only, never intercepts pointer events. */}
    <div className="crt-overlay" aria-hidden="true" />
    <main id="main">{children}</main>
    <Footer />
  </>
)

export default Layout
