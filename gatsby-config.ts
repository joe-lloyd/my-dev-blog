import { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  flags: {
    DEV_SSR: true,
  },
  siteMetadata: {
    title: "Developer Blog: Joe Lloyd Web Apps",
    description: "Thoughts, Experiences and Life of a Dev.",
    author: "Joe Lloyd",
    siteUrl: "https://dev-blog.joe-lloyd.com",
    defaultImage: "image",
    twitterUsername: "@Josephl83378898",
    microSiteUrl: "https://joe-lloyd.com/",
    microSitePersonalProjectsUrl: "https://joe-lloyd.com/personal-projects",
  },
  plugins: [
    "gatsby-plugin-sass",
    'gatsby-plugin-image',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-offline',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `developer-blog-joe-lloyd-web-apps`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/my-logo-2.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/content/posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/content/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              // Optionally, you can set classPrefix to something like 'language-' to match your CSS
              // You can also add other options here to customize the behavior
              // See: https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/#options
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the in-post container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 590,
              wrapperStyle: `margin: 3rem auto;`,
            },
          },
        ]
      },
    },
  ],
}

export default config
