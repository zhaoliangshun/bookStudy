// =============================================================
// Java 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 Java 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 Python / JS 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 Python 高亮器的差异：
//   1. 注释有 // 单行和 /* */ 多行（含 /** */ Javadoc）
//   2. 字符串只有双引号 "..."，但 Java 13+ 支持文本块 """..."""
//   3. 字符 '...' 单独一类（Java 的 char 类型）
//   4. 关键字集合不同（public/class/static/void/int/if/for...）
//   5. 注解 @Override 单独一类着色
//   6. 类型名（大写开头的标识符如 String/System）单独一类
//   7. 字面量 true/false/null
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串）
//   tok-char     : 橙红色（字符）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（关键字 public/if/for...）
//   tok-literal  : 蓝色（true/false/null）
//   tok-type     : 青色（String/System/Integer...）
//   tok-annotation: 金色（@Override/@Deprecated）
//   tok-function : 黄色（方法调用名）
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
    // 注释：/* */ 多行（含 /** */ Javadoc）或 // 单行
    re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/,
  },
  {
    type: "string",
    // Java 字符串：
    //   1) 文本块 """..."""（Java 13+，可跨行）
    //   2) 双引号 "..."（支持转义）
    re: /"""[\s\S]*?"""|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "char",
    // 字符字面量 '...'（支持转义如 '\n' '\t'）
    re: /'(?:\\.|[^'\\])*'/,
  },
  {
    type: "annotation",
    // 注解：@ 后跟标识符（可含点 . 表示全限定名），如 @Override @java.lang.Deprecated
    re: /@[A-Za-z_][A-Za-z0-9_.]*/,
  },
  {
    type: "number",
    // Java 数字：整数（含 0x/0b 前缀和 _ 分隔符）、浮点、科学计数法、L/F/D 后缀
    re: /\b0[xX][0-9a-fA-F_]+|\b0[bB][01_]+|\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+)?[fFdDlL]?\b/,
  },
  {
    type: "keyword",
    // Java 关键字（不含 true/false/null，那些是字面量归到 literal）
    re: /\b(?:abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|record|sealed|permits|yield|non-sealed)\b/,
  },
  {
    type: "literal",
    // 布尔与空值
    re: /\b(?:true|false|null)\b/,
  },
  {
    type: "type",
    // 类型名：大写字母开头的标识符（如 String, System, Integer, ArrayList）
    re: /\b[A-Z][A-Za-z0-9_]*\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为方法调用，着色为函数名。
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
 * 把 Java 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 Java 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightJava(code) {
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
