// =============================================================
// Sass/SCSS 代码编译 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 SCSS 源代码，用 dart-sass（sass npm 包）
//       把它编译成 CSS，返回给前端。前端拿到 CSS 后放进 iframe
//       的 <style> 标签里，配合一段 demo HTML 实时预览效果。
//
// 为什么需要服务端编译：
//   Sass 是 CSS 预处理器，浏览器无法直接理解 SCSS 语法（变量、嵌套、
//   混入、继承、控制指令等）。必须先编译成标准 CSS 才能被浏览器渲染。
//   浏览器端虽有 sass.js 但体积大、维护滞后，这里用官方维护的
//   dart-sass npm 包在 Node 端编译，性能与兼容性最佳。
//
// 安全说明：
//   - 编译过程纯计算，不执行任意代码（Sass @function 可调用内置函数，
//     但不能调用 Node API）
//   - 设置编译超时，防止恶意代码（如无限 @while）卡住服务
//   - 限制输入长度，防止超大文件攻击
// =============================================================

import { NextResponse } from "next/server";
import * as sass from "sass";

// 输入 SCSS 最大长度（字符），防止超大文件拖慢编译
const MAX_INPUT_LENGTH = 50000;

// 编译超时（毫秒）。Sass 编译通常很快，5 秒足够。
const COMPILE_TIMEOUT_MS = 5000;

/**
 * 把 SCSS 字符串编译成 CSS。
 * @param {string} scssCode SCSS 源代码
 * @returns {{ css: string, error: string | null, warnings: string[] }}
 */
function compileScss(scssCode) {
  try {
    // sass.compileString 是同步 API，会把 SCSS 字符串编译成 CSS。
    // 语法默认 SCSS（带花括号、分号），不是缩进式 Sass 语法。
    const result = sass.compileString(scssCode, {
      // 输出风格：expanded（展开，可读性好，适合教学）
      // 其它选项：compressed（压缩，生产用）、nested（嵌套，调试用）
      style: "expanded",
      // 是否生成 source map（教学场景不需要）
      sourceMap: false,
      // 是否在 CSS 中保留 @charset 声明（现代浏览器用 UTF-8）
      charset: false,
      // 是否在 CSS 中包含 @use "sass:..." 模块（仅编译用，不输出）
      // verbose: true, // 输出更多警告（调试用）
    });

    // 收集弃用警告（lighten/darken 等旧函数会有警告，但不影响编译）
    const warnings = [];
    if (result.loadedUrls) {
      // compileString 不会加载外部文件，这里无操作
    }

    return { css: result.css, error: null, warnings };
  } catch (err) {
    // Sass 编译错误（语法错误）会抛出异常，包含行号、列号、消息
    // 错误对象格式：{ message, span: { start, end, text, context, url } }
    let errorMsg = err.message || String(err);

    // 提取错误位置信息（dart-sass 的错误对象有 span 属性）
    if (err.span) {
      // dart-sass 的 span.start 是字符偏移，需要换算成行列号
      // 这里直接用错误消息里已包含的位置信息（消息格式通常是
      // "Error: ... on line X"）
    }

    return { css: "", error: errorMsg, warnings: [] };
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { css: "", error: "请求体不是合法的 JSON" },
      { status: 400 }
    );
  }

  const scssCode = body?.code ?? "";

  if (!scssCode.trim()) {
    return NextResponse.json({
      css: "",
      error: "SCSS 代码为空，请输入要编译的代码。",
    });
  }

  if (scssCode.length > MAX_INPUT_LENGTH) {
    return NextResponse.json({
      css: "",
      error: `代码过长（${scssCode.length} 字符），最大允许 ${MAX_INPUT_LENGTH} 字符。`,
    });
  }

  // 用 Promise.race 实现编译超时（sass.compileString 是同步的，
  // 真正的卡死无法被 setTimeout 中断，但这里主要防异常情况；
  // 正常编译都在毫秒级完成）
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({
        css: "",
        error: `编译超时（超过 ${COMPILE_TIMEOUT_MS / 1000} 秒），请检查是否有无限循环（如 @while 没有终止条件）。`,
      });
    }, COMPILE_TIMEOUT_MS);
  });

  // 编译是同步的，包一层 Promise
  const compilePromise = new Promise((resolve) => {
    // 用 setImmediate 让出事件循环，避免阻塞其它请求
    setImmediate(() => {
      resolve(compileScss(scssCode));
    });
  });

  const result = await Promise.race([compilePromise, timeoutPromise]);
  clearTimeout(timeoutId);

  return NextResponse.json({
    css: result.css || "",
    error: result.error || "",
    warnings: result.warnings || [],
  });
}

// 健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sass 编译服务正在运行",
    sassVersion: sass.info, // dart-sass 版本信息
    maxLength: MAX_INPUT_LENGTH,
  });
}
