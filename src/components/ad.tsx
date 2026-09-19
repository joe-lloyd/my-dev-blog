import * as React from "react"

/**
 * One AdSense unit in a reserved slot. The loader script is in gatsby-ssr.js;
 * this component requests the ad when it mounts (Gatsby remounts it on every
 * route change) and collapses the slot if AdSense sends nothing back, so an
 * empty unit never leaves a hole.
 *
 * Placement is deliberate: one unit under the post grid on the index and one
 * after the article body on posts. Auto ads (anchors, vignettes, in-page
 * injection) must be turned off in the AdSense dashboard for the site, since
 * that is the only place it can be controlled.
 */

type AdFormat = "horizontal" | "in-article"

interface AdProps {
  format?: AdFormat
}

const Ad: React.FC<AdProps> = ({ format = "horizontal" }) => {
  const clientId = process.env.GATSBY_GOOGLE_ADSENSE_CLIENT_ID
  const slotId =
    format === "in-article"
      ? process.env.GATSBY_GOOGLE_ADSENSE_SLOT_IN_ARTICLE_ID || process.env.GATSBY_GOOGLE_ADSENSE_SLOT_ID
      : process.env.GATSBY_GOOGLE_ADSENSE_SLOT_ID
  const ref = React.useRef<HTMLDivElement>(null)
  const [unfilled, setUnfilled] = React.useState(false)

  React.useEffect(() => {
    if (!clientId || !slotId) return
    const ins = ref.current?.querySelector<HTMLElement>("ins.adsbygoogle")
    if (!ins || ins.dataset.adsbygoogleStatus) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      setUnfilled(true)
      return
    }
    // AdSense marks the <ins> once it has decided; watch for an empty response.
    const mo = new MutationObserver(() => {
      if (ins.dataset.adStatus === "unfilled") setUnfilled(true)
    })
    mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] })
    return () => mo.disconnect()
  }, [clientId, slotId])

  if (!clientId || !slotId || unfilled) return null

  const inArticle = format === "in-article"
  return (
    <div ref={ref} className={`ad-slot ad-slot--${format}`}>
      <span className="ad-slot__label">advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={inArticle ? "fluid" : "horizontal"}
        data-ad-layout={inArticle ? "in-article" : undefined}
        data-full-width-responsive={inArticle ? undefined : "true"}
      />
    </div>
  )
}

export default Ad
