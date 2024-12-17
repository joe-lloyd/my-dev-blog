import * as React from "react"
import { PageProps, graphql, HeadFC } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import BlogCard from "../components/blogCard"

import "../components/overviewPage.scss"
import { OverviewPageQuery, SeoComponentQuery } from "../generated/graphql"
import Ad from "../components/ad"

const Index: React.FC<PageProps<OverviewPageQuery, { postIds: string[] }>> = ({
  data,
  location,
  pageContext
}) => {
  const { postIds } = pageContext

  const filteredPosts = React.useMemo(() => {
    return data.allMdx.edges.filter(edge => postIds.includes(edge.node.id))
  }, [data.allMdx.edges, postIds])

  return (
    <Layout>
      <div className="container full-height display-flex">
        <div className="tile is-parent">
          <h1 className="title is-1">Latest posts</h1>
        </div>
        <div className="tile is-parent">
          <div className="columns is-multiline">
            {filteredPosts.map(({ node }, index) => (
              <div className="column is-one-third" key={node.id}>
                <BlogCard
                  index={index}
                  title={node.frontmatter.title}
                  excerpt={node.frontmatter.excerpt}
                  slug={node.frontmatter.slug}
                  date={node.frontmatter.date}
                  featuredImage={node.frontmatter.featuredImage}
                />
              </div>
            ))}
          </div>
        </div>
        <Ad className="bottom-banner-ad" />
      </div>
    </Layout>
  )
}
export const Head: HeadFC<SeoComponentQuery> = () => (
  <Seo title="Using TypeScript" />
)

export default Index

export const blogOverviewPageQuery = graphql`
  query OverviewPage{
    allMdx(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          id
          frontmatter {
            published
            slug
            title
            date(formatString: "YYYY, DD MMM")
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
