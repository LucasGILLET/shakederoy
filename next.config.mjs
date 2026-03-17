/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '');
        
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
