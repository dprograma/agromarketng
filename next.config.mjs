/** @type {import('next').NextConfig} */
// const nextConfig = {};

const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
          },
          {
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com',
          },
          {
            protocol: 'https',
            hostname: 'via.placeholder.com/40',
          }
        ],
      },
}

export default nextConfig;
