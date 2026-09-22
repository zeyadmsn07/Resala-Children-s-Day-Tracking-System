import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  experimental: {
    // Persists Turbopack's compiled dev output across dev-server restarts.
    // Doesn't speed up a route's very first compile in a session, but a
    // restart no longer throws away everything already compiled.
    turbopackFileSystemCacheForDev: true,
  },
};
 
export default nextConfig;
