import * as React from "react"
import { graphql, HeadFC } from "gatsby"
import Layout from "../components/layout"
import "../components/prism-theme.scss"
import "../components/detailPage.scss"
import { BlogPostPageQuery } from "../generated/graphql"
import { PropsWithChildren } from "react"
import Seo from "../components/seo"
import Breadcrumbs from "../components/breadcrumbs"
import Tags from "../components/tags"
import YouTubeVideo from "../components/video"
import ArticleFooter from "../components/article-footer"
import Ad from "../components/ad"
import { ImageDataLike } from "gatsby-plugin-image"

const BlogPost: React.FC<PropsWithChildren<{ data: BlogPostPageQuery }>> = ({
  data,
  children
}) => {
  const post = data.mdx
  return (
    <Layout>
      <div className="container full-height display-flex is-max-desktop">
        <article>
          <Breadcrumbs slug={post?.frontmatter.slug || ""} />
          <Tags tags={post?.frontmatter.tags || []} />
          {post?.frontmatter.videoId && <YouTubeVideo videoSrc={post.frontmatter.videoId} />}
          <h1 className="title is-1">{post?.frontmatter.title}</h1>
          <div className="content">
            {children}
          </div>
        </article>
        {/*<Ad className="in-article-ad" />*/}

        {/*<Ad className="sidebar-ad" />*/}

        <Ad className="bottom-banner-ad" />
        <ArticleFooter
          author={post!.frontmatter.author}
          date={post?.frontmatter.date}
          gistLink={post?.frontmatter.gistLink}
          gitHubLink={post?.frontmatter.gitHubLink}
          slug={post?.frontmatter.slug}
        />
      </div>
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
    }
  }
`
