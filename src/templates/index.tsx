import * as React from "react"
import { PageProps, graphql, HeadFC } from "gatsby"
import { ImageDataLike } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Hero from "../components/hero"
import BlogCard from "../components/blogCard"
import Ad from "../components/ad"
import { OverviewPageQuery } from "../generated/graphql"

const Index: React.FC<PageProps<OverviewPageQuery, { postIds: string[] }>> = ({ data, pageContext }) => {
  const { postIds } = pageContext
  const posts = React.useMemo(
    () => data.allMdx.edges.filter((edge) => postIds.includes(edge.node.id)),
    [data.allMdx.edges, postIds],
  )

  return (
    <Layout>
      <Hero
        kicker="cat ~/blog/README.md"
        title="10,000 Hours"
        typed
        lede="Notes from a decade and a bit of shipping software. Written the way I'd say it out loud, then tidied up just enough."
      />

      <section className="posts">
        <div className="container">
          <header className="posts__head">
            <div>
              <p className="section-kicker">
                01 / 01 <span>ls ~/posts --sort=date</span>
              </p>
              <h2>Latest posts</h2>
            </div>
            <span className="count">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </header>

          <div className="posts__grid">
            {posts.map(({ node }) => (
              <BlogCard
                key={node.id}
                title={node.frontmatter.title}
                excerpt={node.frontmatter.excerpt}
                slug={node.frontmatter.slug}
                date={node.frontmatter.date}
                tags={node.frontmatter.tags}
                readingTime={node.fields?.readingTime?.text}
                featuredImage={node.frontmatter.featuredImage as ImageDataLike}
              />
            ))}
          </div>

          <Ad className="bottom-banner-ad" />
        </div>
      </section>
    </Layout>
  )
}

export const Head: HeadFC<OverviewPageQuery> = ({ data }) => {
  const lastPost = data.allMdx.edges[0].node
  return <Seo title="Overview Page" image={lastPost.frontmatter.featuredImage as ImageDataLike} />
}

export default Index

export const blogOverviewPageQuery = graphql`
  query OverviewPage {
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
            tags
            featuredImage {
              childImageSharp {
                gatsbyImageData(width: 800)
              }
            }
          }
          fields {
            readingTime {
              text
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
