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

const MAX_CODE_LENGTH = 50000;

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

  // 空代码校验：与其他子进程路由保持一致
  if (!code.trim()) {
    return NextResponse.json({
      output: "",
      error: "代码为空，请输入要执行的 JavaScript 代码。",
    });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { output: "", error: "代码过长（超过 50000 字符），请精简后重试。" },
      { status: 413 }
    );
  }

  const result = await runInSandbox(code).catch((err) => ({
    output: "",
    error: "代码执行出错：" + (err?.message || String(err)),
    exitCode: -1,
  }));
  return NextResponse.json(result);
}

// 简单的 GET 接口，用于健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Node.js 代码执行服务正在运行",
  });
}
