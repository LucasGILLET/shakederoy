import type { NextConfig } from 'next';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
    async rewrites() {
        if (!backendUrl) {
            return [];
        }

        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
