//const MillionLint = require('@million/lint');

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
};

// module.exports = MillionLint.next({
//   rsc: true, // Required for app directory structure
// })(nextConfig);
export default nextConfig;