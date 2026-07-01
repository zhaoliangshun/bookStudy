// =============================================================
// 外网在线运行平台（External Playground）定义
// -------------------------------------------------------------
// 当本地未安装某语言的运行环境时，可将代码发送到外部在线平台运行。
// 每个平台通过 open(code, langLower) 方法在新标签页打开并尽量自动填入代码。
//
// 四种代码传递方式：
//   1. form  — 创建临时 <form> POST 提交（CodePen / JSFiddle）
//   2. url   — URL 直接携带编码后的代码（Python Tutor）
//   3. fetch — 先 fetch 获取分享 ID 再跳转（Go Playground）
//   4. copy  — 平台不支持 URL 传码，打开空白页 + 复制代码到剪贴板
// =============================================================

// ---------- 辅助：创建临时表单并 POST 提交 ----------
// CodePen / JSFiddle 通过表单 POST 接收代码，这是最可靠的代码传递方式。
// 表单 target="_blank" 在新标签页打开，提交后立即移除临时表单。
function submitForm(action, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.target = "_blank";
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

// ---------- 辅助：复制代码到剪贴板 ----------
// 优先使用现代 Clipboard API，降级到 execCommand 兼容旧浏览器。
async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

// ---------- 辅助：先开新标签页，再复制代码 ----------
// 注意：必须先 window.open（在用户手势同步调用栈内），再 await 复制。
// 反过来会导致 window.open 被 popup blocker 拦截（脱离了用户手势上下文）。
async function openAndCopy(url, code) {
  window.open(url, "_blank", "noopener,noreferrer");
  return await copyCode(code);
}

// ---------- 轻量 Toast 提示 ----------
// 用固定定位的 div 显示提示，3 秒后自动淡出。
// 不依赖 React 状态，可在非组件代码（如本模块）中直接调用。
let toastTimer = null;
function showToast(message, type = "info") {
  let toast = document.getElementById("ext-pg-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ext-pg-toast";
    toast.className = "ext-pg-toast";
    document.body.appendChild(toast);
  }
  toast.className = "ext-pg-toast ext-pg-toast-" + type;
  toast.textContent = message;
  // 触发重排后再设置 opacity，确保过渡动画生效
  void toast.offsetWidth;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
  }, 3000);
}

// ---------- Replit 语言标识映射 ----------
const REPLIT_LANG = {
  py: "python3", python: "python3",
  java: "java10",
  c: "c", cpp: "cpp", "c++": "cpp", cc: "cpp",
  cs: "csharp", csharp: "csharp",
  rb: "ruby", ruby: "ruby",
  swift: "swift",
  sh: "bash", bash: "bash", shell: "bash", zsh: "bash",
  ts: "typescript", typescript: "typescript",
  js: "nodejs", javascript: "nodejs", node: "nodejs",
};

// ---------- OnlineGDB 语言页面对照 ----------
const ONLINEGDB_SLUG = {
  c: "online_c_compiler",
  cpp: "online_cpp_compiler",
  "c++": "online_cpp_compiler",
  cc: "online_cpp_compiler",
  java: "online_java_compiler",
  rb: "online_ruby_compiler",
  ruby: "online_ruby_compiler",
  swift: "online_swift_compiler",
  sh: "online_bash_shell",
  bash: "online_bash_shell",
  shell: "online_bash_shell",
  zsh: "online_bash_shell",
};

// =============================================================
// 外网平台定义
// =============================================================
// 每个平台对象包含：
//   label — 显示名称
//   icon  — 图标 emoji
//   open(code, langLower) — 异步打开平台，尽量自动填入代码
export const PLAYGROUNDS = {
  // ---- CodePen：前端三件套（JS / HTML / CSS）的黄金标准 ----
  // 通过 POST 表单提交，data 字段为 JSON 字符串，含 title + js/html/css
  codepen: {
    label: "CodePen",
    icon: "✏️",
    open: (code, langLower) => {
      const field =
        langLower === "css" || langLower === "scss" || langLower === "sass"
          ? "css"
          : langLower === "html"
          ? "html"
          : "js";
      submitForm("https://codepen.io/pen/define", {
        data: JSON.stringify({ title: "bookStudy 代码", [field]: code }),
      });
    },
  },

  // ---- JSFiddle：与 CodePen 类似，POST 表单 ----
  jsfiddle: {
    label: "JSFiddle",
    icon: "🟣",
    open: (code, langLower) => {
      const field =
        langLower === "css" || langLower === "scss" || langLower === "sass"
          ? "css"
          : langLower === "html"
          ? "html"
          : "js";
      submitForm("https://jsfiddle.net/api/post/library/pure/", {
        [field]: code,
        wrap: "l",
      });
    },
  },

  // ---- TypeScript Playground ----
  // #code 片段使用 LZ-string 压缩，无法在前端不引入库的情况下直接传明文
  // 因此采用「打开空白页 + 复制代码」策略
  tsplayground: {
    label: "TS Playground",
    icon: "🔷",
    open: async (code) => {
      const ok = await openAndCopy("https://www.typescriptlang.org/play", code);
      showToast(
        ok
          ? "TypeScript 代码已复制，请粘贴到 TS Playground 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- Go Playground ----
  // 官方 Go Playground 支持通过 POST /share 获取分享 ID，再用 ID 打开
  // 若 fetch 因 CORS 等原因失败，回退到「打开空白页 + 复制代码」
  goplayground: {
    label: "Go Playground",
    icon: "🐹",
    open: async (code) => {
      try {
        const res = await fetch("https://go.dev/share", {
          method: "POST",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          body: code,
        });
        if (!res.ok) throw new Error("share failed");
        const id = (await res.text()).trim();
        window.open("https://go.dev/p/" + id, "_blank", "noopener,noreferrer");
      } catch {
        const ok = await openAndCopy("https://go.dev/play/", code);
        showToast(
          ok
            ? "Go 代码已复制，请粘贴到 Go Playground 编辑器中"
            : "复制失败，请手动复制代码",
          ok ? "info" : "error"
        );
      }
    },
  },

  // ---- Python Tutor：逐行可视化执行 Python 代码 ----
  // URL 的 #code 片段直接携带 encodeURIComponent 编码的明文代码
  pythontutor: {
    label: "Python Tutor",
    icon: "🎓",
    open: (code) => {
      window.open(
        "https://pythontutor.com/render.html#code=" +
          encodeURIComponent(code) +
          "&cumulative=false&curInstr=0&mode=display",
        "_blank",
        "noopener,noreferrer"
      );
    },
  },

  // ---- Replit：支持多语言的在线 IDE ----
  // 不支持 URL 传码，打开对应语言空白项目 + 复制代码
  replit: {
    label: "Replit",
    icon: "🌀",
    open: async (code, langLower) => {
      const rl = REPLIT_LANG[langLower] || "python3";
      const ok = await openAndCopy("https://replit.com/languages/" + rl, code);
      showToast(
        ok
          ? "代码已复制，请粘贴到 Replit 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- SassMeister：SCSS/Sass 在线编译 ----
  sassmeister: {
    label: "SassMeister",
    icon: "💅",
    open: async (code) => {
      const ok = await openAndCopy("https://www.sassmeister.com/", code);
      showToast(
        ok
          ? "SCSS 代码已复制，请粘贴到 SassMeister 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- .NET Fiddle：C# 在线运行 ----
  dotnetfiddle: {
    label: ".NET Fiddle",
    icon: "🟦",
    open: async (code) => {
      const ok = await openAndCopy("https://dotnetfiddle.net/", code);
      showToast(
        ok
          ? "C# 代码已复制，请粘贴到 .NET Fiddle 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- DB Fiddle：SQL 在线运行 ----
  dbfiddle: {
    label: "DB Fiddle",
    icon: "🗄️",
    open: async (code) => {
      const ok = await openAndCopy("https://www.db-fiddle.com/", code);
      showToast(
        ok
          ? "SQL 代码已复制，请粘贴到 DB Fiddle 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- GraphQL Bin：GraphQL 在线调试 ----
  graphqlbin: {
    label: "GraphQL Bin",
    icon: "◈",
    open: async (code) => {
      const ok = await openAndCopy("https://graphqlbin.com/v2/new", code);
      showToast(
        ok
          ? "GraphQL 代码已复制，请粘贴到 GraphQL Bin 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },

  // ---- OnlineGDB：多语言在线编译器 ----
  // 支持 C / C++ / Java / Ruby / Swift / Shell 等
  onlinegdb: {
    label: "OnlineGDB",
    icon: "💻",
    open: async (code, langLower) => {
      const slug = ONLINEGDB_SLUG[langLower] || "online_c_compiler";
      const ok = await openAndCopy("https://www.onlinegdb.com/" + slug, code);
      showToast(
        ok
          ? "代码已复制，请粘贴到 OnlineGDB 编辑器中"
          : "复制失败，请手动复制代码",
        ok ? "info" : "error"
      );
    },
  },
};

// =============================================================
// 语言 → 可用外网平台列表
// =============================================================
// 顺序即菜单展示顺序，最常用的排在前面
const LANG_EXTERNAL_MAP = {
  // JavaScript / Node.js → CodePen + JSFiddle
  js: ["codepen", "jsfiddle"],
  javascript: ["codepen", "jsfiddle"],
  jsx: ["codepen", "jsfiddle"],
  node: ["codepen", "jsfiddle"],
  // TypeScript → TS Playground + CodePen
  ts: ["tsplayground", "codepen"],
  typescript: ["tsplayground", "codepen"],
  tsx: ["tsplayground", "codepen"],
  // Python → Python Tutor + Replit
  py: ["pythontutor", "replit"],
  python: ["pythontutor", "replit"],
  // Java → OnlineGDB + Replit
  java: ["onlinegdb", "replit"],
  // C → OnlineGDB + Replit
  c: ["onlinegdb", "replit"],
  // C++ → OnlineGDB + Replit
  cpp: ["onlinegdb", "replit"],
  "c++": ["onlinegdb", "replit"],
  cc: ["onlinegdb", "replit"],
  // C# → .NET Fiddle + Replit
  cs: ["dotnetfiddle", "replit"],
  csharp: ["dotnetfiddle", "replit"],
  // Go → Go Playground（官方）
  go: ["goplayground"],
  golang: ["goplayground"],
  // Sass / SCSS → SassMeister + CodePen
  scss: ["sassmeister", "codepen"],
  sass: ["sassmeister", "codepen"],
  // GraphQL → GraphQL Bin
  gql: ["graphqlbin"],
  graphql: ["graphqlbin"],
  // Ruby → OnlineGDB + Replit
  rb: ["onlinegdb", "replit"],
  ruby: ["onlinegdb", "replit"],
  // Swift → OnlineGDB + Replit
  swift: ["onlinegdb", "replit"],
  // Shell → OnlineGDB + Replit
  sh: ["onlinegdb", "replit"],
  bash: ["onlinegdb", "replit"],
  shell: ["onlinegdb", "replit"],
  zsh: ["onlinegdb", "replit"],
  // SQL → DB Fiddle
  sql: ["dbfiddle"],
  // HTML → CodePen + JSFiddle
  html: ["codepen", "jsfiddle"],
  // CSS → CodePen + JSFiddle
  css: ["codepen", "jsfiddle"],
};

// ---------- 获取某语言可用的外网平台列表 ----------
// 返回 [{ id, label, icon }] 数组；无可用平台时返回空数组
export function getExternalPlaygrounds(langLower) {
  const ids = LANG_EXTERNAL_MAP[langLower];
  if (!ids || ids.length === 0) return [];
  return ids.map((id) => ({
    id,
    label: PLAYGROUNDS[id]?.label || id,
    icon: PLAYGROUNDS[id]?.icon || "🌐",
  }));
}

// ---------- 打开指定外网平台 ----------
export async function openExternal(id, code, langLower) {
  const pg = PLAYGROUNDS[id];
  if (!pg) return;
  await pg.open(code, langLower);
}
