// =============================================================
// HTML 语法高亮器（用于 Tailwind 教程）
// -------------------------------------------------------------
// 把 HTML 片段转成带 <span class="tok-xxx"> 的彩色 HTML，
// 用于代码编辑器下方的 <pre> 高亮层。
//
// HTML 高亮的难点在于要同时识别：
//   1. 标签名 <div> </div>
//   2. 属性名 class= src= href=
//   3. 属性值 "p-4 bg-blue-500"（这里特别要高亮 Tailwind class）
//   4. HTML 注释 <!-- -->
//   5. <script> 标签内的 JS 内容（按 JS 规则高亮）
//
// 实现思路：单遍扫描，用主正则交替匹配各种 token。
// 对于 <script> 标签内容，简单按 JS 规则二次着色。
// =============================================================

// HTML 转义：防止 < > & " 破坏输出 HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 给 class 属性值里的每个 Tailwind 工具类单独着色。
// 例如 "p-4 bg-blue-500 hover:bg-red-500" 会变成
//   <span class="tok-cls">p-4</span> <span class="tok-cls">bg-blue-500</span> ...
// 前缀变体（hover:/md:/dark: 等）用稍暗的颜色区分。
function highlightClasses(classValue) {
  // 按空白拆分出各个工具类
  const classes = classValue.trim().split(/\s+/);
  return classes
    .map((cls) => {
      // 识别变体前缀：hover:, md:, dark:, group-hover: 等
      const variantMatch = cls.match(/^([a-zA-Z-]+:)+/);
      if (variantMatch) {
        const prefix = variantMatch[0];
        const rest = cls.slice(prefix.length);
        return (
          '<span class="tok-variant">' +
          escapeHtml(prefix) +
          "</span>" +
          '<span class="tok-cls">' +
          escapeHtml(rest) +
          "</span>"
        );
      }
      return '<span class="tok-cls">' + escapeHtml(cls) + "</span>";
    })
    .join(" "); // 用空格连接（保持原样）
}

// 简单的 JS 高亮（用于 <script> 标签内容）
function highlightJs(code) {
  const keywords =
    /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|void|delete|throw|try|catch|finally|async|await|yield|import|export|default|from|as|true|false|null|undefined)\b/;
  const builtins =
    /\b(?:document|window|tailwind|console|localStorage)\b/;
  let out = "";
  let i = 0;
  const isWord = (c) => /[a-zA-Z0-9_$]/.test(c);
  while (i < code.length) {
    const rest = code.slice(i);
    // 字符串
    const strM = rest.match(/^(['"`])[\s\S]*?\1/);
    if (strM) {
      out += '<span class="tok-string">' + escapeHtml(strM[0]) + "</span>";
      i += strM[0].length;
      continue;
    }
    // 注释
    const cmtM = rest.match(/^\/\/[^\n]*|^\/\*[\s\S]*?\*\//);
    if (cmtM) {
      out += '<span class="tok-comment">' + escapeHtml(cmtM[0]) + "</span>";
      i += cmtM[0].length;
      continue;
    }
    // 数字
    const numM = rest.match(/^\d+(\.\d+)?/);
    if (numM) {
      out += '<span class="tok-number">' + escapeHtml(numM[0]) + "</span>";
      i += numM[0].length;
      continue;
    }
    // 标识符
    const idM = rest.match(/^[a-zA-Z_$][\w$]*/);
    if (idM) {
      const word = idM[0];
      if (keywords.test(word)) {
        out += '<span class="tok-keyword">' + escapeHtml(word) + "</span>";
      } else if (builtins.test(word)) {
        out += '<span class="tok-builtin">' + escapeHtml(word) + "</span>";
      } else {
        // 函数名（后面跟 '('）
        const after = code.slice(i + word.length);
        if (/^\s*\(/.test(after)) {
          out += '<span class="tok-function">' + escapeHtml(word) + "</span>";
        } else {
          out += '<span class="tok-prop">' + escapeHtml(word) + "</span>";
        }
      }
      i += word.length;
      continue;
    }
    // 其他字符
    out += escapeHtml(code[i]);
    i++;
  }
  return out;
}

/**
 * 把 HTML 源码转成带高亮 span 的 HTML 字符串。
 * @param {string} htmlCode - 用户写的 HTML 片段（含 Tailwind class）
 * @returns {string} 带 <span> 的高亮 HTML
 */
export function highlightHtml(htmlCode) {
  let out = "";
  let i = 0;
  let inScript = false; // 是否在 <script> 标签内

  while (i < htmlCode.length) {
    const rest = htmlCode.slice(i);

    // HTML 注释 <!-- -->
    const cmt = rest.match(/^<!--[\s\S]*?-->/);
    if (cmt) {
      out += '<span class="tok-comment">' + escapeHtml(cmt[0]) + "</span>";
      i += cmt[0].length;
      continue;
    }

    // 标签开始 <div 或 </div
    const tagOpen = rest.match(/^<\/?[a-zA-Z][a-zA-Z0-9-]*/);
    if (tagOpen) {
      const tagText = tagOpen[0];
      out +=
        '<span class="tok-punct">&lt;</span>' +
        (tagText.startsWith("</")
          ? '<span class="tok-punct">/</span>'
          : "");
      const tagName = tagText.replace(/^<\/?/, "");
      out += '<span class="tok-tag">' + escapeHtml(tagName) + "</span>";
      i += tagText.length;

      // 检测是否进入 script 标签
      if (tagName.toLowerCase() === "script" && !tagText.startsWith("</")) {
        inScript = true;
      }

      // 继续处理标签内的属性，直到 >
      let j = i;
      while (j < htmlCode.length && htmlCode[j] !== ">") {
        const attrRest = htmlCode.slice(j);
        // 属性名 = 属性值
        const attrMatch = attrRest.match(
          /^\s*([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/
        );
        if (attrMatch) {
          const attrName = attrMatch[1];
          let attrVal = attrMatch[2];
          // 去掉引号
          const hasQuote = attrVal.startsWith('"') || attrVal.startsWith("'");
          const quote = hasQuote ? attrVal[0] : "";
          const valContent = hasQuote ? attrVal.slice(1, -1) : attrVal;

          out += escapeHtml(attrMatch[0].slice(0, attrMatch[0].indexOf(attrVal)));

          if (quote) out += quote;
          // class 属性的值要按 Tailwind 工具类着色
          if (attrName === "class" || attrName === "className") {
            out += highlightClasses(valContent);
          } else {
            out += '<span class="tok-string">' + escapeHtml(valContent) + "</span>";
          }
          if (quote) out += quote;
          j += attrMatch[0].length;
          i = j;
          continue;
        }
        // 单独的布尔属性
        const boolAttr = attrRest.match(/^\s*([a-zA-Z_:][a-zA-Z0-9_:.-]*)/);
        if (boolAttr) {
          out += '<span class="tok-attr">' + escapeHtml(boolAttr[1]) + "</span>";
          j += boolAttr[0].length;
          i = j;
          continue;
        }
        // 其他空白/字符
        out += escapeHtml(htmlCode[j]);
        j++;
        i = j;
      }
      // 闭合 >
      if (i < htmlCode.length && htmlCode[i] === ">") {
        // script 结束标签，先关闭 inScript
        if (tagText.startsWith("</") && tagName.toLowerCase() === "script") {
          inScript = false;
        }
        out += '<span class="tok-punct">&gt;</span>';
        i++;
      }
      continue;
    }

    // script 标签内的内容：按 JS 高亮，直到遇到 </script>
    if (inScript) {
      const closeIdx = rest.toLowerCase().indexOf("</script>");
      if (closeIdx === -1) {
        // 没有闭合，全部当 JS
        out += highlightJs(rest);
        i = htmlCode.length;
      } else {
        const jsCode = rest.slice(0, closeIdx);
        out += highlightJs(jsCode);
        i += closeIdx;
        inScript = false;
      }
      continue;
    }

    // 普通文本节点
    const textEnd = rest.indexOf("<");
    if (textEnd === -1) {
      out += escapeHtml(rest);
      i = htmlCode.length;
    } else if (textEnd > 0) {
      out += escapeHtml(rest.slice(0, textEnd));
      i += textEnd;
    } else {
      // textEnd === 0，说明当前字符是 <，但没匹配到标签（如 < 后非字母）
      out += escapeHtml(htmlCode[i]);
      i++;
    }
  }
  return out;
}
