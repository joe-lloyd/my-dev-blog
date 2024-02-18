/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

import * as path from "path"
import { GatsbyNode } from "gatsby"
import { GatsbyNodeGetPostsQuery } from "./src/generated/graphql"

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
      title: String!
      excerpt: String
      featuredImage: File @fileByRelativePath
    }

    type Mdx implements Node {
      frontmatter: MdxFrontmatter!
    }
  `
  createTypes(typeDefs)
}

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ stage, getConfig, rules, loaders, actions }) => {
  actions.setWebpackConfig({
    devtool: "cheap-module-source-map"
  });
}
