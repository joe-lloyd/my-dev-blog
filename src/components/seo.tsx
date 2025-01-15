import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { getImage, ImageDataLike } from "gatsby-plugin-image"

interface SEOProps {
  title?: string | null
  description?: string | null
  image?: ImageDataLike
  pathname?: string | null
  article?: boolean
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = "",
  image,
  pathname,
  article = false,
}) => {
  const { site } = useStaticQuery(graphql`
    query SeoComponent {
      site {
        siteMetadata {
          defaultTitle: title
          defaultDescription: description
          siteUrl
          twitterUsername
        }
      }
    }
  `)


  const imageData = image ? getImage(image) : null;

  const seo = {
    title: title || site.siteMetadata.defaultTitle,
    description: description || site.siteMetadata.defaultDescription,
    image: imageData ? `${site.siteMetadata.siteUrl}${imageData!.images.fallback!.src}` : '',
    url: `${site.siteMetadata.siteUrl}${pathname || "/"}`,
  }

  // Export Head component for Gatsby
  return (
    <>
      <title>
        {title
          ? `${title} | ${site.siteMetadata.defaultTitle}`
          : site.siteMetadata.defaultTitle}
      </title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      {article && <meta property="og:type" content="article" />}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta name="twitter:card" content="summary_large_image" />
      {site.siteMetadata.twitterUsername && (
        <meta
          name="twitter:creator"
          content={site.siteMetadata.twitterUsername}
        />
      )}
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <link rel="canonical" href={seo.url} />
    </>
  )
}

export default SEO
