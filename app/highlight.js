// =============================================================
// JavaScript / Node.js 语法高亮器
// -------------------------------------------------------------
// 作用：把一段 JS 源代码转换成带 <span class="tok-xxx"> 标签的 HTML，
//       用于在代码编辑器下方的 <pre> 高亮层中渲染彩色代码。
//
// 实现思路：
//   textarea 元素本身只能显示纯色文本，无法直接着色。常见的做法是
//   「叠加层 (overlay)」——在 textarea 下面放一个 <pre>，把高亮后的
//   HTML 放进 <pre>，再把 textarea 的文字颜色设为透明、只保留光标，
//   两层用完全相同的字体度量对齐，用户看到的就是彩色代码，但实际
//   编辑的还是 textarea 里的原始文本。
//
//   本文件只负责「文本 -> 高亮 HTML」这一步。
//
// 算法：单遍扫描 + 主正则交替 (alternation)
//   把所有 token 类型按优先级写进一个正则的多个分组里，用 exec 循环
//   扫描整段代码。每命中一个 token，就把它包进对应 class 的 <span>，
//   命中之间的「夹缝文本」原样转义输出。这样不会出现互相嵌套、重复
//   高亮的问题。
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
//   - re:   匹配该 token 的正则（注意不要用 g 标志，主正则会统一加）
//
// 顺序要点：
//   1. 注释、字符串必须最先匹配，否则里面的 //、" 等会被后续规则误吃。
//   2. 关键字要排在「函数名」之前，因为 if( 会被函数规则 (标识符后跟 '(') 命中。
//   3. 字面量 (true/false/null) 排关键字之后，避免被当成普通标识符。
//   4. 内建全局 (console/require/process...) 单独一类，颜色更突出。
//   5. 函数名（标识符后紧跟 '('）放最后，作为兜底的「调用」高亮。
const TOKENS = [
  {
    type: "comment",
    // 单行注释 //... 或多行注释 /* ... */（多行用 [\s\S] 跨行匹配）
    re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
  },
  {
    type: "string",
    // 三种字符串：模板字符串 `...`、单引号 '...'、双引号 "..."
    // 每种都允许反斜杠转义，模板字符串里还允许 ${...}（这里简化处理，整段当一个 string）
    re: /`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/,
  },
  {
    type: "number",
    // 十进制整数/小数/科学计数法、十六进制 0x、BigInt 后缀 n
    re: /\b0x[0-9a-fA-F]+\b|\b\d+n\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/,
  },
  {
    type: "keyword",
    // JS 关键字（不含 true/false/null，那些归到 literal）
    re: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|void|delete|throw|try|catch|finally|async|await|yield|import|export|default|from|as|static|get|set)\b/,
  },
  {
    type: "literal",
    // 布尔/空值/特殊数值
    re: /\b(?:true|false|null|undefined|NaN|Infinity)\b/,
  },
  {
    type: "builtin",
    // Node.js 与 JS 常见内建全局对象/函数，单独给一种颜色，方便识别
    re: /\b(?:console|require|module|exports|process|Buffer|global|globalThis|setTimeout|setInterval|setImmediate|clearTimeout|clearInterval|clearImmediate|queueMicrotask|Promise|Array|Object|String|Number|Boolean|Math|JSON|Date|RegExp|Error|TypeError|RangeError|SyntaxError|ReferenceError|Map|Set|WeakMap|WeakSet|Symbol|Proxy|Reflect|URL|URLSearchParams|TextEncoder|TextDecoder|EventEmitter|Readable|Writable|Transform|Stream|Worker)\b/,
  },
  {
    type: "function",
    // 「标识符紧跟 (」视为函数调用，着色为函数名。
    // 用前瞻 (?=\s*\() 不消费 '('，让括号留给普通文本。
    re: /[A-Za-z_$][A-Za-z0-9_$]*(?=\s*\()/,
  },
];

// 把所有 token 正则合并成一个「主正则」：
// 每个分组对应一个 token 类型，exec 时通过判断哪个分组有值来确定类型。
// 注意：源码里的小括号会成为分组，所以 token 正则内部若有小括号需谨慎。
// 这里我们用 (?:...) 非捕获分组避免干扰分组序号。
const MASTER_REGEX = new RegExp(
  TOKENS.map((t) => `(${t.re.source})`).join("|"),
  "g"
);

/**
 * 把 JS 源代码高亮成 HTML 字符串。
 * @param {string} code 原始代码
 * @returns {string} 带 <span> 标签的 HTML（已转义，可直接放进 dangerouslySetInnerHTML）
 */
export function highlightJavaScript(code) {
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
    // 兜底：理论上不会发生
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
