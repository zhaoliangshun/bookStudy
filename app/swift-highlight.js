// =============================================================
// Swift 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 Swift 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 JS / Java 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 JS 高亮器的差异：
//   1. 注释：// 单行、/* */ 多行（含嵌套简化处理）
//   2. 字符串：双引号 "..."；以及 """...""" 多行字符串（简化匹配）
//   3. 数字：整数、浮点、十六进制 0x
//   4. 关键字集合不同（func/var/let/class/struct/protocol/...）
//   5. 字面量 true/false/nil
//   6. 内建（print/type(of)/Array/Dictionary/String/Int/...）单独一类
//   7. 函数名（标识符后紧跟 '('）作为兜底
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串与多行字符串）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（func/var/let/class...）
//   tok-literal  : 蓝色（true/false/nil）
//   tok-builtin  : 青色（print/Array/Int 等内建/标准库）
//   tok-function : 黄色（用户函数调用名）
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
    // 注释：/* */ 多行或 // 单行
    re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/,
  },
  {
    type: "string",
    // 字符串：先匹配 """...""" 多行字符串，再匹配普通双引号 "..."
    re: /"""[\s\S]*?"""|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "number",
    // Swift 数字：十六进制 0x、浮点（含科学计数法）、十进制整数
    re: /\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
  },
  {
    type: "keyword",
    // Swift 关键字（不含 true/false/nil，那些归到 literal）
    re: /\b(?:func|var|let|class|struct|enum|protocol|extension|init|deinit|self|Self|super|override|private|public|internal|fileprivate|open|static|final|lazy|weak|unowned|inout|mutating|nonmutating|convenience|required|optional|try|catch|throw|throws|rethrows|if|else|guard|switch|case|default|for|while|repeat|break|continue|return|fallthrough|where|as|is|in|do|defer|import|typealias|associatedtype)\b/,
  },
  {
    type: "literal",
    // 布尔与空值
    re: /\b(?:true|false|nil)\b/,
  },
  {
    type: "builtin",
    // 标准库常用类型/函数，单独给一种颜色，方便识别
    re: /\b(?:print|println|dump|type|Array|Dictionary|Set|String|Int|Double|Float|Bool|Optional)\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为函数调用，着色为函数名。
    // 用前瞻 (?=\s*() 不消费 '('，让括号留给普通文本。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

// 把所有 token 正则合并成一个「主正则」
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 Swift 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 Swift 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightSwift(code) {
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
