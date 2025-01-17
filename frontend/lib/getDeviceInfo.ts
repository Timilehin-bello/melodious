// Helper function to get device information
export type DeviceInfo = {
  type: string;
  browser: string;
  os: string;
  networkType: string;
};

export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const connection = (navigator as any).connection || {};

  return {
    type: /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop",
    browser: (() => {
      if (userAgent.includes("Chrome")) return "chrome";
      if (userAgent.includes("Firefox")) return "firefox";
      if (userAgent.includes("Safari")) return "safari";
      if (userAgent.includes("Edge")) return "edge";
      return "unknown";
    })(),
    os: (() => {
      if (platform.includes("Win")) return "windows";
      if (platform.includes("Mac")) return "macOS";
      if (platform.includes("Linux")) return "linux";
      if (/Android/i.test(userAgent)) return "android";
      if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
      return "unknown";
    })(),
    networkType: connection.effectiveType || "unknown",
  };
};
