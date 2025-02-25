/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

import * as path from "path"
import { GatsbyNode } from "gatsby"
import { GatsbyNodeGetPostsQuery } from "./src/generated/graphql"
import readingTime from "reading-time"

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions
}) => {
  const { createPage } = actions
  const isProduction = process.env.NODE_ENV === "production"

  const result = await graphql<GatsbyNodeGetPostsQuery>(`
    query gatsbyNodeGetPosts {
      allMdx(sort: { frontmatter: { date: DESC } }) {
        edges {
          node {
            id
            frontmatter {
              slug
              published
              date
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw new Error(result.errors.join(", "))
  }

  if (!result.data) {
    throw new Error("No data found!");
  }

  const posts = result.data.allMdx.edges
    .filter(
      ({ node }) =>
        process.env.NODE_ENV === "development" || node.frontmatter.published
    )

  /**
   * Create blog post pages
   */
  posts.forEach(({ node }) => {
    // In production, skip creating pages for unpublished posts
    if (isProduction && !node.frontmatter.published) {
      return
    }

    const templatePath = path.resolve(`./src/templates/blog-post.tsx`)

    createPage({
      path: node.frontmatter.slug,
      component: `${templatePath}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id
      }
    })
  })

  /**
   * Create paginated blog overview
   */
  createPage({
    path: '/',
    component: path.resolve("./src/templates/index.tsx"), // Resolve the path to the template component
    context: {
      postIds: posts.map(({ node }) => node.id)
    },
  });
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type MdxFrontmatter {
      slug: String!
      author: String!
      title: String!
      excerpt: String
      tags: [String!]!
      featuredImage: File @fileByRelativePath
    }

    type Mdx implements Node {
      frontmatter: MdxFrontmatter!
    }
    
    type ReadingTime {
      text: String!
    }
  `
  createTypes(typeDefs)
}

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ stage, getConfig, rules, loaders, actions }) => {
  actions.setWebpackConfig({
    devtool: "cheap-module-source-map"
  });
}

export const onCreateNode: GatsbyNode["onCreateNode"] = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    createNodeField({
      node,
      name: `readingTime`,
      value: readingTime(node.body as string)
    })
  }
}
