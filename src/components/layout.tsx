import * as React from "react"

import Header from "./header"
import "./layout.scss"

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        <section className="section section--full-height">
          <div className="container full-height display-flex">
            {children}
          </div>
        </section>
      </main>
    </>
  )
}

export default Layout
