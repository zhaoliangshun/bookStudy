/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ["graphql"],

  // -------------------------------------------------------------
  // rewrites：把前端发起的请求代理到后端，避免跨域
  // -------------------------------------------------------------
  // 【为什么需要这个】
  //   前端跑在 http://localhost:3000，后端跑在 http://127.0.0.1:8000，
  //   端口不同属于跨域。虽然后端都开了 CORS，但用 Next.js 的 rewrites
  //   做同源代理是更优雅的方案：
  //     - 浏览器只跟同源 3000 端口通信，没有跨域问题
  //     - 后端地址变了只改这里一处，前端代码不用动
  //     - 生产部署时也可以把 :8000 换成内网地址
  //
  // 【两个后端的代理规则】
  //   /api/todos/*  → http://127.0.0.1:8000/items/*  （入门 Todo demo）
  //   /api/blog/*   → http://127.0.0.1:8000/api/blog/* （博客平台）
  //
  // 【注意】rewrites 是异步函数，返回数组形式的规则；:path* 是通配占位符。
  async rewrites() {
    return [
      // ---------- Todo demo ----------
      {
        source: "/api/todos/:path*",
        destination: "http://127.0.0.1:8000/items/:path*",
      },
      {
        source: "/api/todos",
        destination: "http://127.0.0.1:8000/items",
      },
      // ---------- Blog Platform ----------
      // 注意：后端博客接口本身就有 /api/blog 前缀，所以 destination 要带上
      {
        source: "/api/blog/:path*",
        destination: "http://127.0.0.1:8000/api/blog/:path*",
      },
    ];
  },
};

export default nextConfig;
