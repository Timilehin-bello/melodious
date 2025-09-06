'use client';

import GoogleAdSense from './GoogleAdSense';

// Banner Ad Component (Top of pages)
export const BannerAd: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <GoogleAdSense
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT || ''}
        adFormat="auto"
        className="max-w-full"
        style={{
          minHeight: '90px',
          maxWidth: '728px',
          width: '100%',
        }}
      />
    </div>
  );
};

// Sidebar Ad Component
export const SidebarAd: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <GoogleAdSense
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || ''}
        adFormat="auto"
        style={{
          minHeight: '250px',
          maxWidth: '300px',
          width: '100%',
        }}
      />
    </div>
  );
};

// Rectangle Ad Component (In-content)
export const RectangleAd: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex justify-center my-6 ${className}`}>
      <GoogleAdSense
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_RECTANGLE_SLOT || ''}
        adFormat="rectangle"
        style={{
          width: '336px',
          height: '280px',
        }}
      />
    </div>
  );
};

// Mobile Banner Ad Component
export const MobileBannerAd: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex justify-center my-4 md:hidden ${className}`}>
      <GoogleAdSense
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_MOBILE_SLOT || ''}
        adFormat="auto"
        style={{
          minHeight: '50px',
          maxWidth: '320px',
          width: '100%',
        }}
      />
    </div>
  );
};

// Responsive Display Ad Component
export const ResponsiveAd: React.FC<{ 
  className?: string;
  minHeight?: string;
}> = ({ className = '', minHeight = '200px' }) => {
  return (
    <div className={`w-full ${className}`}>
      <GoogleAdSense
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT || ''}
        adFormat="auto"
        responsive={true}
        style={{
          minHeight,
          width: '100%',
        }}
      />
    </div>
  );
};