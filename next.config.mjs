/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["graphql"],

  turbopack: {},

  async rewrites() {
    return [
      {
        source: "/api/todos/:path*",
        destination: "http://127.0.0.1:8000/items/:path*",
      },
      {
        source: "/api/todos",
        destination: "http://127.0.0.1:8000/items",
      },
      {
        source: "/api/blog/:path*",
        destination: "http://127.0.0.1:8000/api/blog/:path*",
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          monaco: {
            test: /[\\/]node_modules[\\/](monaco-editor|@monaco-editor)[\\/]/,
            name: "monaco-editor",
            priority: 40,
            chunks: "async",
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react-vendor",
            priority: 30,
            chunks: "all",
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
