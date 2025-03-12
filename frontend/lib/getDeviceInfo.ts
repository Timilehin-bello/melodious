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

// Helper functions for device detection
export function detectBrowser(ua: string): string {
  if (ua.includes("Chrome")) return "chrome";
  if (ua.includes("Firefox")) return "firefox";
  if (ua.includes("Safari")) return "safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "opera";
  if (ua.includes("Edge")) return "edge";
  if (ua.includes("MSIE") || ua.includes("Trident/")) return "ie";
  return "unknown";
}

export function detectOS(ua: string): string {
  if (ua.includes("Win")) return "windows";
  if (ua.includes("Mac")) return "macos";
  if (ua.includes("Linux")) return "linux";
  if (ua.includes("Android")) return "android";
  if (ua.includes("iOS")) return "ios";
  return "unknown";
}

export function detectDeviceType(ua: string): string {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
}
