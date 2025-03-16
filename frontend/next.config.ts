import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: { domains: ["chocolate-actual-weasel-471.mypinata.cloud"] },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chocolate-actual-weasel-471.mypinata.cloud",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
