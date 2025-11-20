import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM Relayer SDK requires COOP and COEP headers for SharedArrayBuffer support
    // Using 'credentialless' for COEP to allow third-party resources while enabling threads
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ]);
  },
};

export default nextConfig;
