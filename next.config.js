/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Hot reload için webpack yapılandırması
    config.watchOptions = {
      poll: 1000, // Her saniye kontrol et
      aggregateTimeout: 300, // Değişikliklerden sonra beklenecek süre
    }
    return config
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'i.ytimg.com', 'img.youtube.com'], // YouTube thumbnail'ları için
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // YouTube iframe'leri için gerekli
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.gstatic.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: http:;
              font-src 'self' data:;
              connect-src 'self' https: http:;
              frame-src 'self' https://www.youtube.com https://youtube.com;
              media-src 'self' https: http:;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 