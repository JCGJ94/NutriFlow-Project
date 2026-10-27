import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutriflow.app';

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/register', '/blog/*'],
            disallow: ['/dashboard/', '/settings/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
