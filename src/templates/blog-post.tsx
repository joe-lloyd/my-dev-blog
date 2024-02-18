import * as React from "react"
import { graphql, HeadFC } from "gatsby"
import Layout from "../components/layout"
import "../components/prism-theme.scss"
import "../components/detailPage.scss"
import { BlogPostPageQuery } from "../generated/graphql"
import { PropsWithChildren } from "react"
import Seo from "../components/seo"

const BlogPost: React.FC<PropsWithChildren<{ data: BlogPostPageQuery }>> = ({
  data,
  children
}) => {
  const post = data.mdx
  return (
    <Layout>
      <div className="container full-height display-flex is-max-desktop">
        <article className="section">
          <div className="content">
            {children}
          </div>
        </article>
      </div>
    </Layout>
  )
}

export const Head: HeadFC<BlogPostPageQuery> = ({ data }) => (
  <Seo
    title={data.mdx?.frontmatter.seoTitle}
    description={data.mdx?.frontmatter.seoDescription}
    image={data.mdx?.frontmatter.featuredImage?.absolutePath}
    pathname={data.mdx?.frontmatter.slug}
    article={true}
  />
)

export default BlogPost

export const query = graphql`
  query BlogPostPage($id: String!) {
    mdx(id: { eq: $id }) {
      id
      frontmatter {
        slug
        title
        featuredImage {
          absolutePath
        }
        tags
        seoTitle
        seoDescription
      }
    }
  }
`
