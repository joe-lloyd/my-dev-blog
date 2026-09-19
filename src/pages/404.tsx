import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <section className="not-found container">
      <p className="kicker">
        <span className="kicker__prompt" aria-hidden="true">
          &gt;
        </span>{" "}
        cat: no such file
      </p>
      <h1>404</h1>
      <p>That route doesn't exist.</p>
      <p>
        <Link className="btn-term" to="/">
          Back to ~/posts
        </Link>
      </p>
    </section>
  </Layout>
)

export const Head = () => <Seo title="404: Not Found" />

export default NotFoundPage
