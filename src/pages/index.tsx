import * as React from "react"
import { PageProps, graphql, HeadFC } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import BlogCard from "../components/blogCard"

import "../components/overviewPage.scss"
import { OverviewPageQuery, SeoQueryQuery } from "../generated/graphql"

const Index: React.FC<PageProps<OverviewPageQuery>> = ({ data, location }) => {
  return (
    <Layout>
      <div className="tile is-parent">
        <div className="columns is-multiline">
          {data.allMdx.edges.map(({ node }) => (
            <div className="column is-one-third" key={node.id}>
              <BlogCard
                title={node.frontmatter.title}
                excerpt={node.frontmatter.excerpt}
                slug={node.frontmatter.slug}
                featuredImage={node.frontmatter.featuredImage}
              />
            </div>
          ))}
        </div>
      </div>
      <p>
        You're currently on the page <code>{location.pathname}</code> which was
        built on {data.site!.buildTime}.
      </p>
    </Layout>
  )
}
export const Head: HeadFC<SeoQueryQuery> = () => (
  <Seo title="Using TypeScript" />
)

export default Index

export const query = graphql`
  query OverviewPage {
    allMdx {
      edges {
        node {
          id
          frontmatter {
            slug
            title
            excerpt
            featuredImage {
              childImageSharp {
                gatsbyImageData(width: 800)
              }
            }
          }
        }
      }
    }
    site {
      buildTime(formatString: "YYYY-MM-DD hh:mm a z")
    }
  }
`
