import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM may work without strict COEP, but it's recommended for SharedArrayBuffer support
    // Try without COEP first, and only add it if FHEVM fails
    // This avoids blocking third-party resources like Coinbase Analytics
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // Temporarily removed COEP to avoid blocking third-party resources
          // If FHEVM requires it, we can add it back with 'credentialless' or 'require-corp'
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'credentialless',
          // },
        ],
      },
    ]);
  },
};

export default nextConfig;
