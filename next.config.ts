import type { NextConfig } from "next";

const isDockerBuild = process.env.DOCKER_BUILD === "1";

const nextConfig: NextConfig = {
  output: isDockerBuild ? undefined : "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    // Alpine VPS: serve remote avatars directly (optimizer rejects pravatar URLs in prod).
    unoptimized: isDockerBuild,
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
