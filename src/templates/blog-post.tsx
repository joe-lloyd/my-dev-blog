import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import "../components/detailPage.scss"
import { BlogPostByIdQuery } from "../generated/graphql"
import { PropsWithChildren } from "react"

const BlogPost: React.FC<PropsWithChildren<{ data: BlogPostByIdQuery }>> = ({
  data,
  children,
}) => {
  const post = data.mdx
  return (
    <Layout>
      <article>
        <div className="content">
          <h1>{post!.frontmatter.title}</h1>
          {children}
        </div>
      </article>
    </Layout>
  )
}

export default BlogPost

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
