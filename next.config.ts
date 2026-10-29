import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static files only, the app is all client side and calls the API directly */
  output: "export",
  experimental: {
    optimizePackageImports: ["@chakra-ui/react", "usehooks-ts"],
  },
  reactCompiler: true,
};

export default nextConfig;
