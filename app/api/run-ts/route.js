// =============================================================
// TypeScript 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 TypeScript 源代码，先用 typescript 编译器
//       把它转译成 JavaScript（抹掉类型注解、处理 enum/装饰器等），
//       再交给共享沙箱执行器运行，捕获输出与异常返回前端。
//
// 为什么需要转译：
//   Node.js 的 vm 沙箱只能直接执行 JavaScript。TypeScript 的类型
//   注解（如 `let x: number`）在 JS 里是语法错误，必须先剥离类型
//   信息转成等价的 JS 代码才能运行。
//
// 转译配置说明：
//   - target: ES2020  保留现代语法（async/await、可选链等），由 V8 直接支持
//   - module: CommonJS  让转译产物用 require/module.exports，与沙箱注入的
//                require 保持一致
//   - experimentalDecorators + emitDecoratorMetadata: 支持装饰器章节
//   - jsx: preserve  本教程不涉及 JSX，但保留默认不影响
// =============================================================

import { NextResponse } from "next/server";
import ts from "typescript";
import { runInSandbox } from "../../sandbox-runner";

// 预先构造 TS 编译选项，避免每次请求都重建
const TS_COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  // 允许非严格 JS 写法（教程里偶尔会演示松散代码）
  strict: false,
  noImplicitAny: false,
  // 装饰器支持（装饰器章节会用到）
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  // 保留枚举/类型断言等需要转译的特性，剥离纯类型注解
  removeComments: false,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  isolatedModules: true,
  // 不做类型检查（教程侧重运行结果，类型错误由编辑器/IDE 提示）
  noEmitOnError: false,
  reportDiagnostics: false,
};

/**
 * 把一段 TypeScript 源码转译成 JavaScript。
 * @param {string} tsCode TypeScript 源代码
 * @returns {{js: string, diagnostics: string[]}}
 */
function transpileTypeScript(tsCode) {
  const diagnostics = [];

  // ts.transpileModule 是单文件转译的快捷方式，不会做跨文件类型检查，
  // 速度快、适合在线运行场景。
  const output = ts.transpileModule(tsCode, {
    compilerOptions: TS_COMPILER_OPTIONS,
    fileName: "user-code.ts",
    reportDiagnostics: true,
  });

  // 收集诊断信息（语法错误等），转译失败时返回给前端
  if (output.diagnostics && output.diagnostics.length > 0) {
    for (const diag of output.diagnostics) {
      const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
      if (diag.file) {
        const { line, character } = diag.file.getLineAndCharacterOfPosition(
          diag.start
        );
        diagnostics.push(`第 ${line + 1} 行 第 ${character + 1} 列: ${message}`);
      } else {
        diagnostics.push(message);
      }
    }
  }

  return { js: output.outputText ?? "", diagnostics };
}

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

  const tsCode = body?.code ?? "";

  // 1. 转译 TS → JS
  const { js, diagnostics } = transpileTypeScript(tsCode);

  // 如果有语法错误导致无法产出 JS，直接返回错误
  if (js === "" && diagnostics.length > 0) {
    return NextResponse.json({
      output: "",
      error: "TypeScript 转译失败：\n" + diagnostics.join("\n"),
    });
  }

  // 2. 在沙箱中运行转译后的 JS
  const result = await runInSandbox(js);

  // 如果运行时出错，附加转译阶段的诊断信息（作为额外提示）
  if (diagnostics.length > 0) {
    const diagNote =
      "\n\n[TypeScript 编译提示]\n" + diagnostics.join("\n");
    return NextResponse.json({
      output: result.output,
      error: result.error ? result.error + diagNote : null,
      warnings: diagnostics,
      exports: result.exports,
    });
  }

  return NextResponse.json(result);
}

// 健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "TypeScript 代码执行服务正在运行",
    tsVersion: ts.version,
  });
}
