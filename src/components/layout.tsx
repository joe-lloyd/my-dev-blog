import * as React from "react"

import Header from "./header"
import "./layout.scss"
import { PropsWithChildren } from "react"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        <section className="section section--full-height">
          {children}
        </section>
      </main>
    </>
  )
}

export default Layout
