"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useSubscriptionStatus } from "@/hooks/useSubscription";

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

// Extend Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  adSlot,
  adFormat = "auto",
  style,
  className = "",
  responsive = true,
}) => {
  const { isPremiumUser, isLoading } = useSubscriptionStatus();

  useEffect(() => {
    // Only push ads for non-premium users and when not loading
    if (!isLoading && !isPremiumUser) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.log("AdSense error:", error);
      }
    }
  }, [isPremiumUser, isLoading]);

  // Don't render ads for premium users or while loading
  if (isLoading || isPremiumUser) {
    return null;
  }

  // Only render in production or when explicitly testing
  if (
    process.env.NODE_ENV !== "production" &&
    !process.env.NEXT_PUBLIC_ADSENSE_TEST
  ) {
    return (
      <div
        className={`border-2 border-dashed border-gray-400 p-4 text-center text-gray-500 ${className}`}
        style={style}
      >
        AdSense Placeholder (Development Mode)
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        ...style,
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
};

export default GoogleAdSense;
