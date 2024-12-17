import React from "react"

import './ad.scss';

interface AdProps {
  className?: string;
}

const Ad: React.FC<AdProps> = ({ className }) => {
  const clientId = process.env.GATSBY_GOOGLE_ADSENSE_CLIENT_ID;
  const slotId = process.env.GATSBY_GOOGLE_ADSENSE_SLOT_ID;

  return (
    <div className={`ad-container ${className}`}>
      <ins className="adsbygoogle"
           data-ad-client={clientId}
           data-ad-slot={slotId}
           data-ad-format="auto" />
    </div>
  );
};

export default Ad;
