import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * One canonical host.
   *
   * Google checks the exact origin a sign-in comes from, and `www.qulaynavbat.uz`
   * and `qulaynavbat.uz` are two different origins to it — landing on the one that
   * isn't registered fails with `origin_mismatch`, which reads like a broken app
   * rather than a console setting. Folding www into the apex means there is only
   * one origin to register, and the same for cookies and shared links.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.qulaynavbat.uz" }],
        destination: "https://qulaynavbat.uz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
