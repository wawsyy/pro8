import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM Relayer SDK requires strict COOP and COEP headers for SharedArrayBuffer support
    // COOP: 'same-origin' is required for FHEVM threads to work
    // COEP: 'require-corp' is required for proper cross-origin isolation
    // Note: This may conflict with Base Account SDK, but FHEVM is the core functionality
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
            value: 'require-corp',
          },
        ],
      },
    ]);
  },
};

export default nextConfig;
