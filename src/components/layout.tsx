import * as React from "react"

import Header from "./header"
import { PropsWithChildren } from "react"
import Hero from "./hero"
import Footer from "./footer"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <Hero />
      <main className="section">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout
