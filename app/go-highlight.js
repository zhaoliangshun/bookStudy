// =============================================================
// Go 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 Go 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 Java/C#/Python 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// Go 特性支持：
//   1. 注释：// 单行、/* */ 多行
//   2. 字符串：普通 "..."、反引号 `...`（原始字符串，可跨行）
//   3. 字符（rune）：'...'
//   4. 关键字：package/import/func/var/const/type/struct/interface/map/chan/go/range/select/defer/return/for/if/else/switch/case/default/break/continue/fallthrough/goto
//   5. 字面量：true/false/nil/iota
//   6. 内置类型：int/int8/int16/int32/int64/uint/uint8/uint16/uint32/uint64/uintptr/float32/float64/complex64/complex128/byte/rune/string/bool/error/any
//   7. 内置函数：make/new/len/cap/copy/append/delete/panic/recover/print/println/close/complex/real/imag/min/max/clear
//   8. 数字：整数（0x/0o/0b 前缀，_ 分隔符）、浮点、科学计数法、虚数后缀 i
//   9. 函数名：标识符紧跟 (
// =============================================================

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const TOKENS = [
  {
    type: "comment",
    // 注释：/* */ 多行、// 单行
    re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/,
  },
  {
    type: "string",
    // Go 字符串：
    //   1) `...` 原始字符串（可跨行，反引号包围，不能包含反引号）
    //   2) "..." 普通字符串（支持转义）
    re: /`[^`]*`|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "char",
    // 字符（rune）字面量 '...'
    re: /'(?:\\.|[^'\\])*'/,
  },
  {
    type: "number",
    // Go 数字：
    //   1) 0x 十六进制 0o 八进制 0b 二进制（支持 _ 分隔）
    //   2) 十进制整数（支持 _ 分隔）
    //   3) 浮点（含小数和科学计数法）
    //   4) 虚数后缀 i
    //   5) 数字后缀（Go 不支持 C 的 f/d/l 后缀，但保留兼容）
    re: /\b0[xX][0-9a-fA-F_]+|\b0[oO]?[0-7_]+|\b0[bB][01_]+|\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+)?i?\b/,
  },
  {
    type: "keyword",
    // Go 关键字（25 个，不含字面量）
    re: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
  },
  {
    type: "literal",
    // 字面量：true/false/nil/iota
    re: /\b(?:true|false|nil|iota)\b/,
  },
  {
    type: "type",
    // 内置类型与常见类型名（小写开头）
    re: /\b(?:int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|uintptr|float32|float64|complex64|complex128|byte|rune|string|bool|error|any|Comparable)\b/,
  },
  {
    type: "annotation",
    // 内置函数（高亮为 annotation 颜色，区分于普通函数）
    re: /\b(?:make|new|len|cap|copy|append|delete|panic|recover|print|println|close|complex|real|imag|min|max|clear)\b/,
  },
  {
    type: "contextual",
    // 大写字母开头的标识符（导出标识符，如 fmt.Println 中的 Println）
    // 用 type 颜色高亮，但放到 keyword/literal/type 之后匹配
    re: /\b[A-Z][A-Za-z0-9_]*\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为函数调用，着色为函数名。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 Go 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 Go 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightGo(code) {
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
