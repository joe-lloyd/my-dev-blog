import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default function BlogPost({ data, children }) {
  const post = data.mdx
  return (
    <Layout>
      <article>
        <h1>{post.frontmatter.title}</h1>
        {children}
      </article>
    </Layout>
  )
}

export const query = graphql`
    query BlogPostById($id: String!) {
        mdx(id: { eq: $id }) {
            id
            frontmatter {
                title
            }
        }
    }
`
