import * as React from "react"
import { graphql, HeadFC } from "gatsby"
import { PropsWithChildren } from "react"
import { ImageDataLike } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Hero from "../components/hero"
import Breadcrumbs from "../components/breadcrumbs"
import Tags from "../components/tags"
import YouTubeVideo from "../components/video"
import ArticleFooter from "../components/article-footer"
import { BlogPostPageQuery } from "../generated/graphql"

const BlogPost: React.FC<PropsWithChildren<{ data: BlogPostPageQuery }>> = ({ data, children }) => {
  const post = data.mdx!
  const fm = post.frontmatter

  return (
    <Layout>
      <Hero kicker={`cat ~/posts${fm.slug}.mdx`} title={fm.title} compact>
        <div className="hero__meta">
          <span>{fm.date}</span>
          <span aria-hidden="true">·</span>
          <span>{post.fields?.readingTime?.text}</span>
          <span aria-hidden="true">·</span>
          <span>by {fm.author}</span>
        </div>
      </Hero>

      <section className="post">
        <div className="container">
          <Breadcrumbs slug={fm.slug || ""} />
          <Tags tags={fm.tags || []} />
          {fm.videoId && <YouTubeVideo videoSrc={fm.videoId} />}
          <article className="prose">{children}</article>
          <ArticleFooter
            author={fm.author}
            date={fm.date}
            gistLink={fm.gistLink}
            gitHubLink={fm.gitHubLink}
            slug={fm.slug}
          />
        </div>
      </section>
    </Layout>
  )
}

export const Head: HeadFC<BlogPostPageQuery> = ({ data }) => (
  <Seo
    title={data.mdx?.frontmatter.seoTitle}
    description={data.mdx?.frontmatter.seoDescription}
    image={data.mdx?.frontmatter.featuredImage as ImageDataLike}
    pathname={data.mdx?.frontmatter.slug}
    article={true}
  />
)

export default BlogPost

export const query = graphql`
  query BlogPostPage($id: String!) {
    mdx(id: { eq: $id }) {
      id
      frontmatter {
        slug
        title
        author
        gistLink
        gitHubLink
        date(formatString: "YYYY, DD MMM")
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800)
          }
        }
        tags
        videoId
        seoTitle
        seoDescription
      }
      fields {
        readingTime {
          text
        }
      }
    }
  }
`
