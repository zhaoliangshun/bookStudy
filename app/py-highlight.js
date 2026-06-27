// =============================================================
// Python 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 Python 源代码转换成带 <span class="tok-xxx"> 标签的
//       HTML，用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：与 highlight.js（JS 高亮器）相同——「单遍扫描 + 主正则
//   交替 (alternation)」。把所有 token 类型按优先级写进一个正则的
//   多个分组里，用 exec 循环扫描整段代码，命中即包 span。
//
// 与 JS 高亮器的差异：
//   1. 注释只有 # 单行注释（没有 /* */），但要避开字符串内的 #
//   2. 字符串有三引号 '''...''' 和 """..."""，且支持前缀 r/b/f/u
//      （如 r'\d+', f"{name}", b"bytes"）
//   3. 关键字集合不同（def/class/import/return/if/elif/else/...）
//   4. 装饰器 @decorator 单独一类着色
//   5. 内建函数（print/len/range/open/...）单独一类
//   6. 没有 ; 语句结尾，靠缩进控制块，但高亮不需要处理缩进
//
// 颜色映射（CSS class → 颜色，定义在 globals.css）：
//   tok-comment  : 绿色斜体（注释）
//   tok-string   : 橙红色（字符串）
//   tok-number   : 绿色（数字）
//   tok-keyword  : 蓝色粗体（关键字 def/if/for...）
//   tok-literal  : 蓝色（True/False/None/...）
//   tok-builtin  : 青色（print/len/range/...）
//   tok-decorator: 金色（@decorator）
//   tok-function : 黄色（def 后的函数名、调用名）
//   tok-class    : 浅绿（class 后的类名）
// =============================================================

// ---- HTML 转义：防止用户代码里的 < > & 破坏 HTML 结构 ----
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- token 类型定义（顺序即优先级，越靠前越先匹配） ----
// 每一项 { type, re }：
//   - type: token 类别，会拼成 CSS class `tok-${type}`
//   - re:   匹配该 token 的正则（不要用 g 标志，主正则会统一加）
//
// 顺序要点：
//   1. 注释、字符串必须最先匹配，否则里面的 #、" 等会被后续规则误吃。
//   2. 装饰器 @xxx 要在关键字之前，避免被当标识符。
//   3. 数字要排在关键字之前，避免 0x1f 被部分匹配。
//   4. 关键字排在「函数名」之前，因为 def( 会被函数规则误命中。
//   5. 字面量 (True/False/None/...) 排关键字之后。
//   6. 内建 (print/len/range/...) 单独一类，颜色更突出。
//   7. 函数名（标识符后紧跟 '('）作为兜底「调用」高亮。
const TOKENS = [
  {
    type: "comment",
    // 单行注释 # ...（到行尾）。注意：在三引号字符串内的 # 不会被这里
    // 命中，因为字符串规则排在前面会先吃掉整段字符串。
    re: /#[^\n]*/,
  },
  {
    type: "string",
    // Python 字符串规则较复杂，按优先级排列：
    //   1) 三引号 '''...''' 或 """..."""（可跨行），带可选前缀 r/b/f/u/rb/fr
    //   2) 单引号 '...' 或双引号 "..."，带可选前缀
    // 前缀大小写不敏感，用 [rbfuRBFU]* 匹配零到多个前缀字符。
    // 每种引号内允许反斜杠转义。
    re: /[rbfuRBFU]{0,2}(?:'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/,
  },
  {
    type: "decorator",
    // 装饰器：@ 后跟标识符（可含点 . 表示模块路径），如 @property @functools.wraps
    re: /@[A-Za-z_][A-Za-z0-9_.]*/,
  },
  {
    type: "number",
    // Python 数字：整数（含 0x/0o/0b 前缀和 _ 分隔符）、浮点、复数 j、科学计数法
    re: /\b0[xX][0-9a-fA-F_]+|\b0[oO][0-7_]+|\b0[bB][01_]+|\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+)?[jJ]?\b/,
  },
  {
    type: "keyword",
    // Python 关键字（不含 True/False/None，那些是字面量归到 literal）
    re: /\b(?:def|class|return|if|elif|else|for|while|break|continue|pass|in|not|and|or|is|import|from|as|with|try|except|finally|raise|lambda|yield|global|nonlocal|del|assert|async|await|match|case)\b/,
  },
  {
    type: "literal",
    // 布尔、空值、特殊常量
    re: /\b(?:True|False|None|NotImplemented|Ellipsis|__debug__)\b/,
  },
  {
    type: "builtin",
    // Python 常见内建函数与类型，单独给一种颜色方便识别
    re: /\b(?:print|input|len|range|enumerate|zip|map|filter|reversed|sorted|sum|min|max|abs|round|pow|divmod|open|iter|next|type|isinstance|issubclass|id|hash|dir|vars|globals|locals|repr|str|int|float|bool|complex|list|tuple|set|frozenset|dict|bytes|bytearray|chr|ord|hex|oct|bin|format|getattr|setattr|hasattr|delattr|callable|super|property|staticmethod|classmethod|object|exec|eval|compile|help|exit|quit|any|all|slice|memoryview)\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为函数调用，着色为函数名。
    // 用前瞻 (?=\s*() 不消费 '('，让括号留给普通文本。
    re: /[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/,
  },
];

// 把所有 token 正则合并成一个「主正则」：
// 每个分组对应一个 token 类型，exec 时通过判断哪个分组有值来确定类型。
// 注意：token 正则内部若有捕获分组会干扰分组序号，这里用 (?:...) 非捕获分组。
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 Python 源代码高亮成 HTML 字符串。
 * @param {string} code 原始 Python 代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightPython(code) {
  let result = "";
  let lastIndex = 0;
  let match;

  // 重置正则的 lastIndex（因为带 g 标志的正则在 exec 循环中是带状态的）
  MASTER_REGEX.lastIndex = 0;

  while ((match = MASTER_REGEX.exec(code)) !== null) {
    // 命中位置之前的「夹缝文本」原样转义后输出
    if (match.index > lastIndex) {
      result += escapeHtml(code.slice(lastIndex, match.index));
    }

    // 判断命中了哪个分组：match[1]..match[TOKENS.length] 依次对应各 token 类型
    let type = null;
    for (let i = 1; i <= TOKENS.length; i++) {
      if (match[i] !== undefined) {
        type = TOKENS[i - 1].type;
        break;
      }
    }
    // 兜底：理论上不会发生（class 规则是空前瞻不会命中）
    if (!type) type = "plain";

    // 把命中文本转义后包进 span
    result += `<span class="tok-${type}">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }

  // 末尾剩余文本
  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex));
  }

  return result;
}
