/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ["graphql"],

  // -------------------------------------------------------------
  // rewrites：把前端发起的 /api/todos/* 请求代理到 FastAPI 后端
  // -------------------------------------------------------------
  // 【为什么需要这个】
  //   前端跑在 http://localhost:3000，后端跑在 http://127.0.0.1:8000，
  //   端口不同属于跨域。虽然 FastAPI 那边已经开了 CORS，
  //   但用 Next.js 的 rewrites 做同源代理是更优雅的方案：
  //     - 浏览器只跟同源 3000 端口通信，没有跨域问题
  //     - 后端地址变了只改这里一处，前端代码不用动
  //     - 生产部署时也可以把 :8000 换成内网地址
  //
  // 【匹配规则】
  //   /api/todos         → http://127.0.0.1:8000/items
  //   /api/todos/5       → http://127.0.0.1:8000/items/5
  //   /api/todos?done=false → http://127.0.0.1:8000/items?done=false
  //
  // 【注意】rewrites 是异步函数，返回数组形式的规则；:path* 是通配占位符。
  async rewrites() {
    return [
      {
        source: "/api/todos/:path*",
        destination: "http://127.0.0.1:8000/items/:path*",
      },
      // 不带参数的根路径单独写一条（避免上面 :path* 匹配不到空路径）
      {
        source: "/api/todos",
        destination: "http://127.0.0.1:8000/items",
      },
    ];
  },
};

export default nextConfig;
