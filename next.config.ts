import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react", "usehooks-ts"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
};

export default nextConfig;
