// =============================================================
// Ruby 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 Ruby 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 JS / Java 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 JS 高亮器的差异：
//   1. 注释：# 单行，以及行首 =begin/=end 多行块
//   2. 字符串："..." '...' 整段当一个 token（含 #{...} 内插简化处理）；
//      符号 :foo 与正则 /.../ 也按 string 着色
//   3. 数字：十进制/十六进制 0x/二进制 0b/浮点
//   4. 关键字集合不同（def/end/if/elsif/class/module/...）
//   5. 字面量 nil/true/false
//   6. 内建方法（puts/print/p/each/map/require/...）单独一类
//   7. 方法名（标识符后紧跟 '('）作为兜底
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串、符号、正则）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（def/if/class/module...）
//   tok-literal  : 蓝色（nil/true/false）
//   tok-builtin  : 青色（puts/print/each/map 等内建方法）
//   tok-function : 黄色（用户方法调用名）
// =============================================================

// ---- HTML 转义：防止用户代码里的 < > & 破坏 HTML 结构 ----
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- token 类型定义（顺序即优先级，越靠前越先匹配） ----
const TOKENS = [
  {
    type: "comment",
    // 注释：行首 =begin ... =end 多行块（必须独占一行）或 # 单行
    re: /^=begin[\s\S]*?^=end|#[^\n]*/,
  },
  {
    type: "string",
    // 字符串：双引号 "..."（含 #{...} 简化整段当一个 token）；
    //         单引号 '...'；符号 :foo；正则 /.../（简化处理）
    re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|:[A-Za-z_][A-Za-z0-9_]*|\/(?:\\.|[^\/\\])+\/[imoxneu]*/,
  },
  {
    type: "number",
    // Ruby 数字：十六进制 0x、二进制 0b、浮点（含科学计数法）、十进制整数
    re: /\b0[xX][0-9a-fA-F]+\b|\b0[bB][01]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
  },
  {
    type: "keyword",
    // Ruby 关键字（不含 nil/true/false，那些归到 literal）
    re: /\b(?:def|end|if|elsif|else|unless|case|when|while|until|for|do|break|next|redo|retry|return|yield|class|module|def|super|self|then|begin|rescue|ensure|raise|require|require_relative|include|extend|attr_accessor|attr_reader|attr_writer|public|private|protected|lambda|proc|and|or|not)\b/,
  },
  {
    type: "literal",
    // 布尔与空值
    re: /\b(?:nil|true|false)\b/,
  },
  {
    type: "builtin",
    // 常见内建方法/Kernel 方法，单独给一种颜色，方便识别
    re: /\b(?:puts|print|p|pp|require|require_relative|lambda|proc|gets|chomp|to_i|to_s|to_a|each|map|select|reject|reduce|inject|times)\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为方法调用，着色为方法名。
    // 用前瞻 (?=\s*() 不消费 '('，让括号留给普通文本。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

// 把所有 token 正则合并成一个「主正则」
// 注意：因含 ^ 锚点，主正则需启用 m 标志让 ^ 匹配每行行首
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "gm"
);

/**
 * 把 Ruby 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 Ruby 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightRuby(code) {
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
