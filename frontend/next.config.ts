import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM Relayer SDK requires COEP header for SharedArrayBuffer support
    // Base Account SDK requires COOP to NOT be 'same-origin'
    // Using 'same-origin-allow-popups' for COOP to balance both requirements
    // Using 'credentialless' for COEP to allow third-party resources while enabling threads
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
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
