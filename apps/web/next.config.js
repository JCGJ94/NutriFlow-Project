/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    typedRoutes: true,
    transpilePackages: ['@nutriflow/shared'],

    // API rewrites to backend
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const apiBase = apiUrl.replace(/\/v1$/, ''); // Remove /v1 suffix if present

        return [
            {
                source: '/api/:path*',
                destination: `${apiBase}/v1/:path*`,
            },
        ];
    },

    // Security Headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ],
            },
        ];
    },


};

module.exports = nextConfig;
