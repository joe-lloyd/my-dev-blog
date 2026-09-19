declare global {
  interface Window {
    /** AdSense queue: one push per <ins class="adsbygoogle"> to request an ad. */
    adsbygoogle: Array<Record<string, unknown>>
  }
}

export {}
