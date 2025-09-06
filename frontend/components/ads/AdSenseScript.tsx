'use client';

import Script from 'next/script';

interface AdSenseScriptProps {
  clientId: string;
  testMode?: boolean;
}

const AdSenseScript: React.FC<AdSenseScriptProps> = ({ 
  clientId, 
  testMode = false 
}) => {
  // Only load in production or when testing is enabled
  if (process.env.NODE_ENV !== 'production' && !testMode) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      data-adbreak-test={testMode ? 'on' : undefined}
    />
  );
};

export default AdSenseScript;