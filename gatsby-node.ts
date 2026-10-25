/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

import * as fs from "fs"
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
  // The slug is the page path, the canonical URL (siteUrl + slug) and the card link, so it must
  // start with "/". Without it the canonical URL reads "…joe-lloyd.comyour-post".
  const badSlugs = posts.map(({ node }) => node.frontmatter.slug).filter((slug) => typeof slug !== "string" || !slug.startsWith("/"))
  if (badSlugs.length) {
    throw new Error(`Post slugs must start with "/": ${badSlugs.map((s) => JSON.stringify(s)).join(", ")}`)
  }

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

  // The Git Gud tour was 13 posts, one per episode, before it became one post over the playlist.
  // The old URLs went out in video descriptions, so each lands on its section of the tour.
  const gitGudEpisodes: [string, string][] = [
    ["01-meet-git-gud", "meet-git-gud"],
    ["02-commit-graph", "reading-the-commit-graph"],
    ["03-staging-and-committing", "staging-and-committing"],
    ["04-branches-tags-stashes", "branches-tags-stashes-and-worktrees"],
    ["05-remotes", "working-with-remotes"],
    ["06-rewriting-history", "rewriting-history"],
    ["07-conflicts-and-auto-fix", "conflicts-and-auto-fix"],
    ["08-recovery-tools", "recovery-and-power-tools"],
    ["09-gerrit-mode", "gerrit-mode"],
    ["10-settings-and-updates", "settings-and-updates"],
    ["11-peer-connections", "peer-connections"],
    ["12-headless-and-relay", "the-headless-daemon-and-the-relay"],
    ["13-companion-app", "the-companion-app"],
  ]
  gitGudEpisodes.forEach(([oldSlug, section]) => {
    actions.createRedirect({
      fromPath: `/git-gud-${oldSlug}/`,
      toPath: `/git-gud-tour/#${section}`,
      isPermanent: true,
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
      videoId: String
      playlistId: String
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

/**
 * gatsby-plugin-offline used to install a service worker at /sw.js that kept serving returning
 * visitors stale pages, stale headers included (the YouTube embed failed with Error 153 for them
 * after the fix). Browsers re-check /sw.js on navigation, so publishing one that unregisters
 * itself and reloads the open tabs clears it out everywhere.
 */
const RETIRE_SERVICE_WORKER = `self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
  );
});
`

export const onPostBuild: GatsbyNode["onPostBuild"] = async () => {
  await fs.promises.writeFile(path.join("public", "sw.js"), RETIRE_SERVICE_WORKER)
}
