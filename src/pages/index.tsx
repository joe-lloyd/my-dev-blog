import * as React from "react"
import { PageProps, graphql, HeadFC } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import BlogCard from "../components/blogCard"

import "../components/overviewPage.scss"
import { ImageDataLike } from "gatsby-plugin-image"

type DataProps = {
  allMdx: {
    edges: Array<{
      node: {
        id: string
        frontmatter: {
          slug: string
          title: string
          excerpt: string
          featuredImage: ImageDataLike
        }
      }
    }>
  }
  site: {
    buildTime: string
  }
}
const Index: React.FC<PageProps<DataProps>> = ({ data, location }) => {
  return (
    <Layout>
      <div className="tile is-parent">
        <div className="columns is-multiline">
          {data.allMdx.edges.map(({ node }) => (
            <div className="column is-one-third">
              <BlogCard
                key={node.id}
                title={node.frontmatter.title}
                excerpt={node.frontmatter.excerpt}
                slug={node.frontmatter.slug}
                image={node.frontmatter.featuredImage}
              />
            </div>
          ))}
        </div>
      </div>
      <p>You're currently on the page <code>{location.pathname}</code> which was built
        on {data.site.buildTime}.</p>
    </Layout>
  )
}
export const Head: HeadFC<DataProps> = () => <Seo title="Using TypeScript" />

export default Index

export const query = graphql`
    {
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
