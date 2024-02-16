import * as React from "react"

import Header from "./header"
import "./layout.scss"
import { PropsWithChildren } from "react"
import { BlogPostByIdQuery } from "../generated/graphql"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        <section className="section section--full-height">
          <div className="container full-height display-flex">{children}</div>
        </section>
      </main>
    </>
  )
}

export default Layout
