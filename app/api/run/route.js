// =============================================================
// Node.js 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 Node.js 源代码，转交给共享沙箱执行器运行，
//       捕获 console 输出与异常，再以 JSON 形式返回给前端展示。
//
// 实际的沙箱执行逻辑（vm 上下文、模块白名单、process 模拟等）
// 已抽取到 app/sandbox-runner.js，供本路由和 /api/run-ts 复用。
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
  const result = await runInSandbox(code);
  return NextResponse.json(result);
}

// 简单的 GET 接口，用于健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Node.js 代码执行服务正在运行",
  });
}
