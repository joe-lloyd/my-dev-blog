// If you don't want to use TypeScript you can delete this file!
import * as React from "react"
import { PageProps, Link, graphql, HeadFC } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

type DataProps = {
  site: {
    buildTime: string
  }
  allMdx: {
    edges: Array<{
      node: {
        id: string
        frontmatter: {
          slug: string
          title: string
        }
      }
    }>
  }
}

const Index: React.FC<PageProps<DataProps>> = ({ data, location }) => (
  <Layout>
    <h1>Gatsby & MDX Blog</h1>
    <ul>
      {data.allMdx.edges.map(({ node }) => (
        <li key={node.id}>
          <Link to={node.frontmatter.slug}>{node.frontmatter.title}</Link>
        </li>
      ))}
    </ul>
    <p>You're currently on the page <code>{location.pathname}</code> which was built on {data.site.buildTime}.</p>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export const Head: HeadFC<DataProps> = () => <Seo title="Using TypeScript" />

export default Index

export const query = graphql`
    {
        site {
            buildTime(formatString: "YYYY-MM-DD hh:mm a z")
        }
        allMdx {
            edges {
                node {
                    id
                    frontmatter {
                        slug
                        title
                    }
                }
            }
        }
    }
`
