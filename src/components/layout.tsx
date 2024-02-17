import * as React from "react"

import Header from "./header"
import "./layout.scss"
import { PropsWithChildren } from "react"
import Hero from "./hero"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <Hero />
      <main>
        {children}
      </main>
    </>
  )
}

export default Layout
