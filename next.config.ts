import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local images from /public to be used with next/image  
  images: {
    unoptimized: true, // simplest for fully local/static deployment
  },
};

export default nextConfig;
