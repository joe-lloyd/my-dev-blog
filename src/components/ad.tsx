import * as React from "react"

/**
 * One AdSense unit that only takes up space once an ad has actually filled.
 *
 * The loader script is in gatsby-ssr.js. On mount this requests the ad (Gatsby
 * remounts on every route change) and watches AdSense's data-ad-status. Until
 * it says "filled" the box is kept out of view but full width, so AdSense can
 * still measure a slot size. "unfilled", or no answer within a few seconds
 * (the script blocked at DNS, an ad blocker), removes the unit entirely, so a
 * reader never sees an empty labelled box.
 *
 * Placement is deliberate: one unit under the post grid on the index and one
 * after the article body on posts, both after the content so the reveal never
 * shifts what someone is reading. Auto ads is off in the AdSense dashboard.
 */

type AdFormat = "horizontal" | "in-article"
type AdStatus = "pending" | "filled" | "unfilled"

/** How long AdSense gets to answer before the slot is treated as unfilled. */
const ANSWER_TIMEOUT_MS = 6000

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
  const [status, setStatus] = React.useState<AdStatus>("pending")

  React.useEffect(() => {
    if (!clientId || !slotId) return
    const ins = ref.current?.querySelector<HTMLElement>("ins.adsbygoogle")
    if (!ins || ins.dataset.adsbygoogleStatus) return

    const read = () => {
      const s = ins.dataset.adStatus
      if (s === "filled" || s === "unfilled") setStatus(s)
    }
    const mo = new MutationObserver(read)
    mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] })
    const timer = window.setTimeout(() => {
      if (ins.dataset.adStatus !== "filled") setStatus("unfilled")
    }, ANSWER_TIMEOUT_MS)

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      setStatus("unfilled")
    }
    return () => {
      mo.disconnect()
      clearTimeout(timer)
    }
  }, [clientId, slotId])

  if (!clientId || !slotId || status === "unfilled") return null

  const inArticle = format === "in-article"
  return (
    <div ref={ref} className={`ad-slot ad-slot--${format}${status === "pending" ? " is-pending" : ""}`}>
      <span className="ad-slot__label">advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={inArticle ? "fluid" : "horizontal"}
        data-ad-layout={inArticle ? "in-article" : undefined}
        // No data-full-width-responsive: on phones it stretches the unit to the
        // viewport with negative margins and pushes it out of the box.
      />
    </div>
  )
}

export default Ad
