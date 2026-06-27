// =============================================================
// TypeScript 语法高亮器
// -------------------------------------------------------------
// 在 JavaScript 高亮器基础上扩展，增加 TypeScript 特有的关键字：
//   interface / type / enum / implements / public / private /
//   protected / readonly / abstract / as / keyof / infer /
//   namespace / declare / module / is / asserts / satisfies
//
// 实现方式：复用 highlight.js 的扫描框架，但替换 token 表里的
// keyword 正则，加入 TS 关键字。其余 token 类型（注释/字符串/
// 数字/函数等）完全相同。
// =============================================================

import { highlightJavaScript } from "./highlight";

// TS 关键字表（含 JS 关键字 + TS 特有关键字）
const TS_KEYWORDS =
  /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|void|delete|throw|try|catch|finally|async|await|yield|import|export|default|from|as|static|get|set|interface|type|enum|implements|public|private|protected|readonly|abstract|declare|namespace|module|is|keyof|infer|satisfies|asserts)\b/;

// 复用 highlight.js 的 escapeHtml 和扫描框架，但用 TS 的 token 表。
// 为了不重复整个框架，这里采用「调用 JS 高亮后再二次着色」的简单策略：
//   1. 先用 JS 高亮得到带 span 的 HTML
//   2. 由于 JS 高亮已把 TS 关键字识别成普通标识符，这里再做一层正则替换
// 这种做法简单但有局限（会替换字符串里的同形词），权衡之下可接受，
// 因为代码量小、性能足够、效果直观。更严谨的实现请参考 highlight.js
// 源码的扫描框架（见 ./highlight.js）。
export function highlightTypeScript(code) {
  // 先用 JS 高亮器处理一遍（注释、字符串、数字、JS 关键字、函数名等着色正确）
  let html = highlightJavaScript(code);

  // 二次着色：把 TS 类型与「伪类」关键字加上颜色。
  // 注意：JS 高亮器输出的是带 <span class="tok-xxx"> 的 HTML，
  // 我们只在「未着色的纯文本片段」里替换 TS 关键字，避免破坏已有的 span。
  // 用一个占位符标记法：先把所有 span 标签暂存，处理纯文本，再还原。
  const spans = [];
  html = html.replace(/<span class="tok-[^"]+">[\s\S]*?<\/span>/g, (m) => {
    spans.push(m);
    return `\x00${spans.length - 1}\x00`;
  });

  // 现在剩下的都是纯文本（已转义），可安全替换
  // TS 关键字着色（interface/type/enum/public 等）
  html = html.replace(
    new RegExp(TS_KEYWORDS.source, "g"),
    '<span class="tok-keyword">$&</span>'
  );

  // 还原 span 标签
  html = html.replace(/\x00(\d+)\x00/g, (_, i) => spans[Number(i)]);
  return html;
}
