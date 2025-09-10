/**
 * 文件作用：Next.js 配置，开启严格模式与远程 API 代理占位。
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
}

module.exports = nextConfig


