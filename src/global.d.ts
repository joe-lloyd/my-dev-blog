interface AdConfig {
  google_ad_client: string;
  enable_page_level_ads: boolean;
  [key: string]: any;
}

declare global {
  interface Window {
    adsbygoogle: AdConfig;
  }
}

declare var adsbygoogle: AdConfig;
