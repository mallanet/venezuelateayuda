import type { NextConfig } from "next";

const isDockerBuild = process.env.DOCKER_BUILD === "1";

const nextConfig: NextConfig = {
  output: isDockerBuild ? undefined : "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    // Alpine VPS: avatars locales (/uploads, /api/avatar) sin optimizador remoto.
    unoptimized: isDockerBuild,
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
