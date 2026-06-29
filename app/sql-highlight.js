// =============================================================
// SQL 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 SQL 语句转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 JS / Java 高亮器相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 JS 高亮器的差异：
//   1. 注释：-- 单行、/* */ 多行
//   2. 字符串：单引号 '...'（SQL 标准）、双引号 "..."（标识符）
//   3. 数字：整数、浮点
//   4. 关键字大小写不敏感（主正则启用 i 标志）
//   5. 字面量 TRUE/FALSE/NULL 单独归到 literal（与关键字区分）
//   6. 内建函数（COUNT/SUM/AVG/MIN/MAX/CONCAT/...）单独一类
//   7. 函数名（标识符后紧跟 '('）作为兜底
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串与标识符引用）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（SELECT/FROM/WHERE...）
//   tok-literal  : 蓝色（TRUE/FALSE/NULL）
//   tok-builtin  : 青色（COUNT/SUM/CONCAT 等聚合与字符串函数）
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
    // 注释：/* */ 多行或 -- 单行（注意 -- 后通常需空格，这里简化）
    re: /\/\*[\s\S]*?\*\/|--[^\n]*/,
  },
  {
    type: "string",
    // 字符串：单引号 '...'（SQL 标准字符串）、双引号 "..."（标识符引用）
    re: /'(?:''|[^'])*'|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "number",
    // SQL 数字：整数、浮点
    re: /\b\d+(?:\.\d+)?\b/,
  },
  {
    type: "keyword",
    // SQL 关键字（大小写不敏感，由主正则的 i 标志统一处理）
    re: /\b(?:SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|CREATE|TABLE|DROP|ALTER|ADD|MODIFY|COLUMN|VALUES|SET|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|OFFSET|DISTINCT|AS|AND|OR|NOT|IS|IN|LIKE|BETWEEN|EXISTS|UNION|ALL|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|CHECK|UNIQUE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|BEGIN|COMMIT|ROLLBACK|CASE|WHEN|THEN|ELSE|END)\b/,
  },
  {
    type: "literal",
    // 布尔与空值（单独 literal 类，与关键字区分）
    re: /\b(?:TRUE|FALSE|NULL)\b/,
  },
  {
    type: "builtin",
    // 常见内建函数：聚合、字符串、日期、类型转换
    re: /\b(?:COUNT|SUM|AVG|MIN|MAX|CONCAT|LENGTH|UPPER|LOWER|SUBSTRING|TRIM|NOW|DATE|COALESCE|CAST)\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为函数调用，着色为函数名。
    // 用前瞻 (?=\s*() 不消费 '('，让括号留给普通文本。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

// 把所有 token 正则合并成一个「主正则」
// 注意：SQL 关键字大小写不敏感，主正则启用 i 标志
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "gi"
);

/**
 * 把 SQL 语句高亮成 HTML 字符串。
 * @param {string} code 原始 SQL 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightSql(code) {
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
