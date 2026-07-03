// =============================================================
// 后端开发教程 - 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 Node.js 源代码（用于演示后端概念，如
//       HTTP、缓存、认证、限流、消息队列等），转交给共享沙箱
//       执行器运行，捕获 console 输出与异常，再以 JSON 形式
//       返回给前端展示。
//
// 复用说明：
//   本路由与 /api/run（Node.js 教程）一样，调用 app/sandbox-runner.js
//   的 runInSandbox。后端概念多用 Node.js 演示，因为其内置模块
//   （http/crypto/events/stream 等）足以覆盖大部分后端知识点，
//   且沙箱已预加载常用模块、模拟 process，执行稳定可靠。
// =============================================================

import { NextResponse } from "next/server";
import { runInSandbox } from "../../sandbox-runner";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { output: "", error: "请求体不是合法的 JSON" },
      { status: 400 }
    );
  }

  const code = body?.code ?? "";

  // 类型校验：防止 {code: 123} 导致 .trim() 抛未捕获异常
  if (typeof code !== "string") {
    return NextResponse.json(
      { output: "", error: "code 必须是字符串" },
      { status: 400 }
    );
  }

  if (!code.trim()) {
    return NextResponse.json({
      output: "",
      error: "代码为空，请输入要执行的后端示例代码。",
    });
  }

  const result = await runInSandbox(code);
  return NextResponse.json(result);
}

// 简单的 GET 接口，用于健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "后端教程代码执行服务正在运行（复用共享沙箱）",
  });
}
