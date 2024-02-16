/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

import * as path from "path"

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const mdxContent = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            frontmatter {
              slug
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `)

  mdxContent.data.allMdx.edges.forEach(({ node }) => {
    const templatePath = path.resolve(`./src/templates/blog-post.tsx`)

    createPage({
      path: node.frontmatter.slug,
      component: `${templatePath}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
      },
    })
  })
}

exports.createSchemaCustomization = ({ actions }) => {
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
