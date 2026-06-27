// =============================================================
// SCSS / Sass 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 SCSS 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 highlight.js（JS 高亮器）相同——「单遍扫描 + 主正则
//   交替 (alternation)」。
//
// SCSS 特有的 token：
//   1. 注释：/* */ 块注释 和 // 单行注释
//   2. 字符串：单引号、双引号
//   3. 变量：$name
//   4. 插值：#{...}
//   5. 关键字：@mixin @include @function @return @if @else @for
//              @each @while @use @forward @import @extend @at-root
//              @content @media @supports @keyframes 等
//   6. 占位符选择器：%placeholder
//   7. 数字与单位：12px 1.5em 100% 0.5rem 等
//   8. 颜色：#hex、rgb()、hsl()
//   9. CSS 属性名：color: background: 等（简化处理，不单独着色）
// =============================================================

// ---- HTML 转义 ----
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- token 类型定义（顺序即优先级） ----
const TOKENS = [
  {
    type: "comment",
    // 块注释 /* */ 和单行注释 //
    re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/,
  },
  {
    type: "string",
    // 单引号或双引号字符串
    re: /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "keyword",
    // Sass @ 指令关键字（@mixin @include @if 等）
    re: /@(?:mixin|include|function|return|if|else|for|each|while|use|forward|import|extend|at-root|content|media|supports|keyframes|debug|warn|error|charset|namespace|font-face|page|layer)/,
  },
  {
    type: "builtin",
    // Sass 内置模块引用 @use "sass:math" 等
    re: /\b(?:math|color|string|list|map|meta|selector)s?\b(?=\s*")/,
  },
  {
    type: "variable",
    // Sass 变量 $name
    re: /\$[A-Za-z_][A-Za-z0-9_-]*/,
  },
  {
    type: "decorator",
    // 占位符选择器 %placeholder
    re: /%[A-Za-z_][A-Za-z0-9_-]*/,
  },
  {
    type: "literal",
    // CSS 关键字值
    re: /\b(?:true|false|null|important|inherit|initial|unset|auto|none|block|inline|flex|grid|absolute|relative|fixed|sticky|static|hidden|visible|solid|dashed|dotted|bold|normal|italic|underline|center|left|right|top|bottom|middle)\b/,
  },
  {
    type: "number",
    // 数字 + 可选单位（px/em/rem/%/vh/vw/s/ms/deg/fr 等）
    re: /\b\d+(?:\.\d+)?(?:px|em|rem|ex|ch|vw|vh|vmin|vmax|%|s|ms|deg|rad|turn|fr|pt|pc|in|cm|mm)?\b/,
  },
  {
    type: "string",
    // 颜色值 #hex
    re: /#[0-9a-fA-F]{3,8}\b/,
  },
  {
    type: "function",
    // 函数调用：标识符后紧跟 (
    re: /[A-Za-z_-][A-Za-z0-9_-]*(?=\s*\()/,
  },
];

// 合并主正则
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 SCSS 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 SCSS 代码
 * @returns {string} 带 <span> 标签的 HTML
 */
export function highlightScss(code) {
  let result = "";
  let lastIndex = 0;
  let match;

  MASTER_REGEX.lastIndex = 0;

  while ((match = MASTER_REGEX.exec(code)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(code.slice(lastIndex, match.index));
    }

    let type = null;
    for (let i = 1; i <= TOKENS.length; i++) {
      if (match[i] !== undefined) {
        type = TOKENS[i - 1].type;
        break;
      }
    }
    if (!type) type = "plain";

    result += `<span class="tok-${type}">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex));
  }

  return result;
}
