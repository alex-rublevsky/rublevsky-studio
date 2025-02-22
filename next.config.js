/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./image-loader.js",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.rublevsky.studio',
      },
    ],
  },
}

module.exports = nextConfig