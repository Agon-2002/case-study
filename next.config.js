/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: __dirname },
  reactStrictMode: true,
  // Development only: lets a phone on the same Wi-Fi load the dev server by
  // the computer's local IP address. Production builds ignore this.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
};

module.exports = nextConfig;
