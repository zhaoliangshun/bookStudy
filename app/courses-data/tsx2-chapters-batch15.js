// =============================================================
// TypeScript + React 教程 —— 第十五批章节（样式与 UI 库，共 5 章）
// -------------------------------------------------------------
// 覆盖：CSS Modules / Tailwind / CSS-in-JS / UI 组件库选择 / Headless UI
// 沙箱支持 react 18、react-dom 18；CSS 库通过"概念演示 + 模式说明"方式呈现。
// 章节 ID：tsx2-ch71 ~ tsx2-ch75
// 分组：第十五部分 样式与 UI 库
// =============================================================

const chapters = [
  // =========================================================
  // 第七十一章 CSS Modules
  // =========================================================
  {
    id: "tsx2-ch71",
    group: "第十五部分 样式与 UI 库",
    icon: "🎨",
    title: "第七十一章 CSS Modules",
    content: `# 第七十一章 CSS Modules

CSS Modules 是最"朴素"的样式方案——给每个 className 自动加 hash 后缀，天然避免全局污染。本章讲清原理、配置、TypeScript 支持。

---

## 一、为什么需要 CSS Modules

普通 CSS 的最大问题：所有 className 都是全局的，命名冲突难以避免。

\`\`\`css
/* 全局 CSS：两个组件都定义了 .title，谁覆盖谁？*/
.title { font-size: 24px; }    /* 组件 A */
.title { color: red; }         /* 组件 B，被覆盖 */
\`\`\`

**CSS Modules 思路**：每个 \`.module.css\` 文件里的 className 编译时被改写为带 hash 的局部名，天然隔离。

\`\`\`css
/* Button.module.css */
.title { font-size: 24px; }   /* 编译后：.Button_title_abc123 */
\`\`\`

---

## 二、Vite/Webpack 配置（开箱即用）

\`\`\`ts
// Vite：CSS Modules 默认开箱，*.module.css 自动处理
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase",        // 支持 styles["primary-color"] 写成 styles.primaryColor
      generateScopedName: "[name]_[local]_[hash:base64:5]",
    },
  },
});
\`\`\`

---

## 三、TypeScript 类型声明

\`\`\`ts
// vite-env.d.ts 或 src/types/css-modules.d.ts
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
\`\`\`

---

## 四、最小可运行示例

\`\`\`tsx
import { useState } from "react";

// 用 inline style + 命名空间模拟 CSS Modules 的隔离效果
// 真实项目里：import styles from "./Button.module.css"
function Button({ variant = "primary", children }: { variant?: "primary" | "ghost"; children: React.ReactNode }) {
  // 模拟 CSS Modules：每个组件用 prefix 隔离
  const scoped = {
    base: { padding: "8px 16px", border: 0, borderRadius: 4, cursor: "pointer" as const, fontSize: 14 },
    primary: { background: "#2563eb", color: "#fff" },
    ghost: { background: "transparent", color: "#374151", border: "1px solid #d1d5db" },
  };

  return (
    <button style={{ ...scoped.base, ...scoped[variant] }}>
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16, display: "flex", gap: 8 }}>
      <Button>主按钮</Button>
      <Button variant="ghost">次按钮</Button>
    </div>
  );
}
\`\`\`

---

## 五、composition：组合其他类

\`\`\`css
/* base.module.css */
.base { padding: 8px; border-radius: 4px; }

/* Button.module.css */
.button {
  composes: base;                          /* 继承 base 的样式 */
  background: #2563eb;
  color: #fff;
}
.danger {
  composes: button;                        /* 继承 button */
  background: #dc2626;
}
\`\`\`

\`\`\`tsx
import styles from "./Button.module.css";
<button className={styles.danger}>删除</button>
\`\`\`

**迷你 composition 模拟**：
\`\`\`tsx
// 模拟 composes：把多个样式对象合并
const baseStyle = { padding: "8px 16px", borderRadius: 4 };
const primaryStyle = { background: "#2563eb", color: "#fff" };
const dangerStyle = { background: "#dc2626", color: "#fff" };

// composes 链
const buttonStyle = { ...baseStyle, ...primaryStyle };
const dangerBtnStyle = { ...baseStyle, ...primaryStyle, ...dangerStyle };

<button style={dangerBtnStyle}>危险按钮</button>
\`\`\`

---

## 六、camelCase 转换

\`\`\`css
/* Foo.module.css */
.primary-color { color: #2563eb; }   /* 带横线 */
\`\`\`

\`\`\`tsx
import styles from "./Foo.module.css";
// 开启 localsConvention: "camelCase" 后可以这样：
<div className={styles.primaryColor} />     // styles["primary-color"] 等价
\`\`\`

---

## 七、与全局 CSS 混用

\`\`\`tsx
import styles from "./Button.module.css";
import "./global.css";   // 全局 reset

// 局部 + 全局
<button className={\`\${styles.btn} global-reset\`}>
  按钮
</button>
\`\`\`

---

## 八、决策

| 场景 | 推荐 |
| --- | --- |
| 简单项目、不想引入构建配置 | 普通 CSS |
| 多人协作、怕命名冲突 | CSS Modules |
| 想要 utility-first | Tailwind |
| 组件库要 props 动态样式 | CSS-in-JS |
| 已有设计系统（CSS 变量） | 原生 CSS + 变量 |

---

## 小结

1. **CSS Modules = 自动 hash 的局部 CSS**，天然防冲突
2. **Vite/Webpack 默认支持**，无需配置
3. **TypeScript 声明**：\`*.module.css\` 返回 \`{ [key: string]: string }\`
4. **composes** 实现样式继承
5. **localsConvention** 让 \`primary-color\` 可以写成 \`primaryColor\`
6. **命名习惯**：每个组件一个 \`Component.module.css\`，BEM 命名可选

---

## 九、实战：卡片组件

把上面所有点串起来，做一个可复用的 Card 组件。

\`\`\`css
/* Card.module.css */
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #111827;
}
.body {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}
.footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
\`\`\`

\`\`\`tsx
import { ReactNode } from "react";

// 真实项目用法：import styles from "./Card.module.css";
// 沙箱无 css loader，下面用对象模拟
const styles = {
  card:   "card_abc",
  title:  "title_abc",
  body:   "body_abc",
  footer: "footer_abc",
};

type CardProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
};

export function Card({ title, children, footer, onClick }: CardProps) {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16, display: "grid", gap: 12, background: "#f3f4f6", minHeight: "100vh" }}>
      <Card
        title="第一张卡片"
        footer={<button>操作</button>}
        onClick={() => alert("点击了卡片")}
      >
        这是卡片的描述文字
      </Card>
      <Card title="第二张卡片" footer={<button>详情</button>}>
        另一张
      </Card>
    </div>
  );
}
\`\`\`

**开发约定**：
- 组件文件 \`Card.tsx\` 和样式文件 \`Card.module.css\` 同目录
- className 一律走 \`styles.xxx\`，不写裸字符串
- 变体（hover/disabled）写在 CSS，组件只决定结构
- 复杂组件拆多个 className：\`styles.card\`、\`styles.title\`、\`styles.footer\`

---

## 十、常见坑

### 1. 类名未生效

\`\`\`tsx
// ❌ 写错：把"className"写成"class"
<div class={styles.card} />

// ❌ 写错：直接用 .module.css 里的 className 字面量
<div className="card" />   // 这是全局的，不是模块的

// ✅ 正确
<div className={styles.card} />
\`\`\`

### 2. 全局样式污染

\`\`\`css
/* Card.module.css */
.card { padding: 16px; }
.card .title { font-size: 20px; }   /* 子选择器在模块里也是 hash 的 */
\`\`\`

但**子组件**的 className 如果也在另一个 \`.module.css\` 里，是隔离的——所以子组件样式得自己写。

### 3. 动态类名

\`\`\`tsx
// ❌ 字符串拼接（不会被 hash，但能用）
<div className={\`\${styles.card} \${active ? styles.active : ""}\`} />

// ✅ classnames 库
import classNames from "classnames";
<div className={classNames(styles.card, { [styles.active]: active })} />
\`\`\`

### 4. 覆盖第三方样式

第三方库用全局类名（如 \`.ant-btn\`），模块里写 \`.ant-btn\` 是作用域内的不生效。

\`\`\`css
/* 解决方案：写 :global */
:global(.ant-btn) { padding: 4px 8px; }   /* 强制全局 */
\`\`\`

---

## 十一、对比其他方案

| 维度 | 普通 CSS | CSS Modules | Tailwind | CSS-in-JS |
| --- | --- | --- | --- | --- |
| 隔离 | ✗ | ✓ | utility 内 | ✓ |
| 学习曲线 | 低 | 低 | 中 | 中 |
| 动态样式 | 写 class | 拼接 | 拼接 | props 函数 |
| 体积 | 中 | 中 | 小 | 中 |
| 调试 | 容易 | 一般 | 容易 | 一般 |
| 适合 | 静态页 | 中后台 | 通用 | 设计系统 |

**经验**：CSS Modules 是"刚好够用"的方案——零额外心智、隔离够用、调试直观。中后台项目首推。
`,
  },

  // =========================================================
  // 第七十二章 Tailwind CSS 入门
  // =========================================================
  {
    id: "tsx2-ch72",
    group: "第十五部分 样式与 UI 库",
    icon: "💨",
    title: "第七十二章 Tailwind CSS 入门",
    content: `# 第七十二章 Tailwind CSS 入门

Tailwind 是"utility-first" CSS 框架的代表作：不用写 CSS，全靠组合 className。本章带你理解它的设计哲学、核心 API、响应式与暗色模式。

---

## 一、什么是 utility-first

传统 CSS：先想类名（\`card\`、\`card-title\`），再写样式。
Tailwind：直接用 className 表达样式，**类名即文档**。

\`\`\`html
<!-- 传统方式 -->
<div class="card">
  <h2 class="card-title">标题</h2>
  <p class="card-body">内容</p>
</div>
<style>
  .card { background: white; padding: 16px; border-radius: 8px; }
  .card-title { font-size: 20px; font-weight: 600; }
  .card-body { color: #6b7280; }
</style>

<!-- Tailwind 方式 -->
<div class="bg-white p-4 rounded-lg">
  <h2 class="text-xl font-semibold">标题</h2>
  <p class="text-gray-500">内容</p>
</div>
\`\`\`

**优势**：
- 不再想类名
- 不用跳转文件
- 删除组件时 CSS 一起被删（不像传统 CSS 那样"孤儿"）

**劣势**：
- className 长（\`class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"\`）
- 学习曲线（要记 utility 名）
- IDE 提示好的话效率高

---

## 二、核心 utility 速查

| 类别 | 示例 | 含义 |
| --- | --- | --- |
| 布局 | \`flex\`, \`grid\`, \`block\` | display |
| 间距 | \`p-4\`, \`m-2\`, \`px-6\`, \`py-2\` | padding/margin |
| 尺寸 | \`w-full\`, \`h-12\`, \`max-w-md\` | width/height |
| 颜色 | \`bg-blue-500\`, \`text-white\`, \`border-gray-200\` | 颜色 |
| 字体 | \`text-xl\`, \`font-bold\`, \`leading-tight\` | 字号/粗细 |
| 圆角 | \`rounded\`, \`rounded-lg\`, \`rounded-full\` | border-radius |
| 阴影 | \`shadow\`, \`shadow-lg\`, \`shadow-none\` | box-shadow |
| Flex | \`items-center\`, \`justify-between\`, \`gap-4\` | flex 属性 |

---

## 三、响应式前缀

\`\`\`html
<!-- 默认（手机）字号 14，md 以上（≥768px）字号 16，lg 以上（≥1024px）字号 18 -->
<p class="text-sm md:text-base lg:text-lg">响应式文字</p>

<!-- 默认纵向排列，md 横向 -->
<div class="flex flex-col md:flex-row">...</div>

<!-- 默认可见，md 隐藏 -->
<div class="block md:hidden">只手机显示</div>
<div class="hidden md:block">只桌面显示</div>
\`\`\`

**断点**：
- \`sm\`: 640px
- \`md\`: 768px
- \`lg\`: 1024px
- \`xl\`: 1280px
- \`2xl\`: 1536px

---

## 四、hover / focus 状态

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700">
  按钮
</button>

<input class="border border-gray-300 focus:border-blue-500 focus:outline-none" />
\`\`\`

状态前缀：\`hover:\`、\`focus:\`、\`active:\`、\`disabled:\`、\`group-hover:\`（父元素 hover 时子元素变化）。

---

## 五、暗色模式

\`\`\`html
<!-- 默认浅色，dark 模式下深色 -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p class="text-gray-600 dark:text-gray-300">自适应文字</p>
</div>
\`\`\`

**配置**：
\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: "class",  // 切换：darkMode: "class" 用 .dark 类；"media" 用系统设置
};
\`\`\`

---

## 六、自定义配置

\`\`\`js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{tsx,jsx,ts,js}"],   // 扫描这些文件以生成 CSS
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f9ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui"],
      },
    },
  },
  plugins: [],
};
\`\`\`

---

## 七、@apply：抽离可复用样式

\`\`\`css
/* styles/button.css */
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
\`\`\`

\`\`\`tsx
<button className="btn-primary">按钮</button>
\`\`\`

---

## 八、迷你模拟：utility 类的设计

\`\`\`tsx
// 模拟 Tailwind 的 utility class（简化版）
const tw = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className={tw(
      "bg-white",           // 背景白
      "p-4",                // padding 16
      "rounded-lg",         // 圆角
      "shadow",             // 阴影
      "border",             // 边框
      "border-gray-200",    // 边框色
      "max-w-sm"            // 最大宽度
    )}>
      <h2 className={tw("text-xl", "font-semibold", "mb-2")}>{title}</h2>
      <p className={tw("text-gray-600", "text-sm")}>{body}</p>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16, background: "#f3f4f6", minHeight: "100vh" }}>
      <Card title="标题 1" body="这是描述文字" />
      <div style={{ height: 12 }} />
      <Card title="标题 2" body="再来一张卡片" />
    </div>
  );
}
\`\`\`

---

## 九、响应式工具函数

\`\`\`tsx
// 用 window.matchMedia 做响应式
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const cb = () => setMatches(m.matches);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  }, [query]);
  return matches;
}

function Responsive() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return <div>{isDesktop ? "桌面布局" : "手机布局"}</div>;
}
\`\`\`

---

## 十、CSS 变量 + Tailwind

\`\`\`css
/* globals.css */
:root {
  --color-brand: #3b82f6;
}
\`\`\`

\`\`\`js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: "var(--color-brand)",
    },
  },
}
\`\`\`

\`\`\`tsx
<div className="bg-brand text-white">...</div>
\`\`\`

---

## 小结

1. **utility-first** = 类名即样式，不需要单独 CSS 文件
2. **响应式前缀** \`md:\` \`lg:\` 让同一组件自适应
3. **状态前缀** \`hover:\` \`focus:\` 让交互更直观
4. **暗色模式** \`dark:\` + \`darkMode: "class"\` 配置
5. **@apply** 把常用组合抽成可复用类（但不要滥用）
6. **自定义配置**：\`theme.extend\` 加品牌色、字体、断点
7. **类名长用工具函数** \`tw(...)\` 简化拼接

---

## 十一、实战：响应式 Dashboard 卡片

把响应式、暗色、状态全部用上。

\`\`\`tsx
// 模拟 Tailwind 工具函数（沙箱无 Tailwind 编译器）
const tw = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

function MetricCard({ label, value, trend }: { label: string; value: string; trend: "up" | "down" | "flat" }) {
  // 趋势颜色：up 绿、down 红、flat 灰
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-500";
  const trendIcon  = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className={tw(
      // 基础
      "bg-white", "dark:bg-gray-800",
      "p-4", "sm:p-6",
      "rounded-lg", "shadow", "hover:shadow-lg",
      "border", "border-gray-200", "dark:border-gray-700",
      "transition-shadow"
    )}>
      <p className={tw("text-xs", "sm:text-sm", "text-gray-500", "dark:text-gray-400", "font-medium", "uppercase", "tracking-wide")}>
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={tw("text-2xl", "sm:text-3xl", "font-bold", "text-gray-900", "dark:text-white")}>
          {value}
        </span>
        <span className={tw("text-sm", "font-medium", trendColor)}>
          {trendIcon}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    // 响应式：手机 1 列、平板 2 列、桌面 4 列
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">业务指标</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="日活用户"  value="12,345" trend="up" />
        <MetricCard label="订单数"    value="856"    trend="down" />
        <MetricCard label="GMV (万)"  value="98.5"   trend="up" />
        <MetricCard label="转化率"    value="3.2%"   trend="flat" />
      </div>
    </div>
  );
}
\`\`\`

**关键点**：
- \`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4\` = 1/2/4 列响应式
- \`bg-white dark:bg-gray-800\` = 暗色模式自动切换
- \`hover:shadow-lg\` = 交互反馈
- \`p-4 sm:p-6\` = 手机小间距，桌面大间距
- 类名长但不复杂——> 在 IDE 提示下写起来飞快

---

## 十二、@apply 与组件化的取舍

\`\`\`css
/* 把重复 utility 抽成类 */
.btn-base {
  @apply px-4 py-2 rounded font-medium transition-colors;
}
.btn-primary {
  @apply btn-base bg-blue-500 text-white hover:bg-blue-600;
}
.btn-ghost {
  @apply btn-base bg-transparent text-gray-700 border border-gray-300;
}
\`\`\`

\`\`\`html
<button class="btn-primary">主按钮</button>
<button class="btn-ghost">次按钮</button>
\`\`\`

**问题**：抽完之后本质上又回到"写类名"了。所以：

| 重复 utility 数 | 建议 |
| --- | --- |
| < 3 处 | 不抽 |
| 3-5 处 | 用 \`tw(...)\` 函数拼 |
| 5+ 处、变体多 | 抽组件或 @apply 类 |
| 全站统一 | 组件库 \`<Button variant>\` |

**经验**：Tailwind 的核心是 utility-first，不要回到"写 CSS 类"的老路。
`,
  },

  // =========================================================
  // 第七十三章 CSS-in-JS (styled-components/emotion)
  // =========================================================
  {
    id: "tsx2-ch73",
    group: "第十五部分 样式与 UI 库",
    icon: "💅",
    title: "第七十三章 CSS-in-JS (styled-components/emotion)",
    content: `# 第七十三章 CSS-in-JS (styled-components/emotion)

CSS-in-JS 把 CSS 写在 JS 里——可以用 props 动态生成样式、共享变量、作用域天然隔离。本章从手写实现讲起，覆盖 styled-components 和 emotion 的核心 API。

---

## 一、什么是 CSS-in-JS

\`\`\`tsx
// styled-components 风格
const Button = styled.button\`
  background: \${(props) => (props.primary ? "blue" : "white")};
  color: \${(props) => (props.primary ? "white" : "black")};
  padding: 8px 16px;
\`;

<Button primary>主按钮</Button>
<Button>次按钮</Button>
\`\`\`

**核心能力**：
- 用 props 动态生成样式
- 作用域自动隔离（hash 类名）
- 主题（Theme）共享
- 关键 CSS 自动注入到 \`<head>\`

---

## 二、迷你 styled-components 实现

\`\`\`tsx
import { useState, useEffect, useRef } from "react";

// ========== 哈希生成 ==========
function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return "sc-" + Math.abs(h).toString(36);
}

// ========== CSS 注入器 ==========
const injected = new Set<string>();
function injectCSS(className: string, css: string) {
  if (injected.has(className)) return;
  injected.add(className);
  const style = document.createElement("style");
  style.textContent = css.replace(/&/g, "." + className);
  document.head.appendChild(style);
}

// ========== styled 工厂 ==========
function styled(tag: string) {
  return (strings: TemplateStringsArray, ...interps: any[]) => {
    return (props: any) => {
      // 用 props 拼出 CSS
      const css = strings.reduce((acc, s, i) => {
        const v = i < interps.length ? interps[i](props) : "";
        return acc + s + v;
      }, "");
      const className = hash(css);
      // 注入到 head
      if (typeof document !== "undefined") injectCSS(className, css);
      return React.createElement(tag, { ...props, className: \`\${className} \${props.className ?? ""}\` });
    };
  };
}

// ========== 测试 ==========
const Button = styled("button")\`
  padding: 8px 16px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  background: \${(p: any) => (p.primary ? "#2563eb" : "#fff")};
  color: \${(p: any) => (p.primary ? "#fff" : "#374151")};
  border: \${(p: any) => (p.primary ? "0" : "1px solid #d1d5db")};
\`;

export default function App() {
  return (
    <div style={{ padding: 16, display: "flex", gap: 8 }}>
      <Button primary onClick={() => alert("主")}>主按钮</Button>
      <Button onClick={() => alert("次")}>次按钮</Button>
    </div>
  );
}
\`\`\`

---

## 三、真实 styled-components 写法

\`\`\`tsx
import styled from "styled-components";

// 基本用法
const Button = styled.button\`
  background: \${(props) => (props.primary ? "blue" : "white")};
  color: \${(props) => (props.primary ? "white" : "black")};
  padding: 8px 16px;
\`;

// 继承
const TomatoButton = styled(Button)\`
  background: tomato;
  border: 1px solid red;
\`;

// 任意标签
const Input = styled("input")\`
  border: 1px solid #d1d5db;
  padding: 8px;
  border-radius: 4px;
\`;

// as 属性：换标签
<Button as="a" href="/home">链接样式按钮</Button>

// 临时样式
<Button css=\`background: red;\`>red</Button>
\`\`\`

---

## 四、Theme：主题共享

\`\`\`tsx
import { ThemeProvider, useTheme } from "styled-components";

const theme = {
  colors: { primary: "#2563eb", danger: "#dc2626" },
  spacing: { sm: "8px", md: "16px" },
};

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>

// 组件内
const Button = styled.button\`
  background: \${(props) => props.theme.colors.primary};
  padding: \${(props) => props.theme.spacing.md};
\`;
\`\`\`

---

## 五、emotion

emotion 是另一主流 CSS-in-JS 库，API 类似，但支持 **css prop**。

\`\`\`tsx
/** @jsxImportSource @emotion/react */
import { css, styled } from "@emotion/styled";

const Button = styled.button\`
  background: blue;
  color: white;
\`;

// css prop（无需 styled）
function Card() {
  return (
    <div
      css={css\`
        padding: 16px;
        background: white;
        border-radius: 8px;
      \`}
    >
      card
    </div>
  );
}
\`\`\`

**emotion vs styled-components**：
- emotion 体积稍小、性能更好（编译时优化）
- styled-components API 更"优雅"
- 两者可互相替换

---

## 六、性能考量

CSS-in-JS 的争议点：**运行时**生成 CSS 有开销。

| 库 | 渲染时机 | 性能 |
| --- | --- | --- |
| styled-components | 运行时 | 中 |
| emotion | 运行时 | 中 |
| vanilla-extract | 编译时 | 优 |
| linaria | 编译时 | 优 |
| Tailwind | 编译时 | 优 |

**优化手段**：
1. \`shouldForwardProp\`：只把需要的 prop 透传给 DOM
2. 用 transient props（\`$\` 前缀）：\`$\` 开头的 prop 不传给 DOM
3. 静态样式写在外部

\`\`\`tsx
const Button = styled.button\`
  background: \${(props) => (props.$primary ? "blue" : "white")};
\`;

<Button $primary />   // 不会输出 primary="true" 到 DOM
\`\`\`

---

## 七、TypeScript 集成

\`\`\`tsx
import styled from "styled-components";

type ButtonProps = {
  $primary?: boolean;
  $size?: "sm" | "md";
};

const Button = styled.button<ButtonProps>\`
  background: \${(p) => (p.$primary ? "blue" : "white")};
  padding: \${(p) => (p.$size === "sm" ? "4px 8px" : "8px 16px")};
\`;

// 用 props 时类型安全
<Button $primary $size="md" />
\`\`\`

---

## 八、SSR 注意事项

服务端渲染时 styled-components 需要提取 CSS（避免 FOUC）：

\`\`\`tsx
// Next.js 示例
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { renderToString } from "react-dom/server";

const sheet = new ServerStyleSheet();
const html = renderToString(
  sheet.collectStyles(<App />)
);
const styleTags = sheet.getStyleTags();
\`\`\`

---

## 小结

1. **CSS-in-JS** = 用 JS 写 CSS，作用域天然隔离、可 props 驱动
2. **styled-components / emotion** 是两大主流，API 相似
3. **tagged template literal** \`styled.button\` \`...\`，props 函数插值
4. **ThemeProvider** 实现主题共享
5. **transient props**（\`$\` 前缀）避免污染 DOM 属性
6. **性能优化**：用 \`$prop\` 模式、分离静态样式
7. **TS 集成**：泛型 \`styled.button<Props>\` 提供类型检查
8. **新趋势**：编译时 CSS-in-JS（vanilla-extract、linaria）性能更好

---

## 九、迷你 styled-components 完整版

让我们手写一个更完整的 styled-components——支持 attrs、keyframes、全局样式。

\`\`\`tsx
import { useMemo } from "react";

// ========== keyframes ==========
function keyframes(strings: TemplateStringsArray) {
  const css = strings.join("");
  // 返回唯一名字（真实实现用计数器）
  return (props: { name?: string }) => {
    const name = props.name || "kf-" + Math.random().toString(36).slice(2, 7);
    return \`animation: \${name} 1s;\n@keyframes \${name} { \${css} }\`;
  };
}

// ========== css 辅助（生成 className） ==========
function css(strings: TemplateStringsArray, ...interps: any[]) {
  return (props: any) => {
    const body = strings.reduce((acc, s, i) => acc + s + (i < interps.length ? String(interps[i](props)) : ""), "");
    const name = "css-" + Math.abs(body.split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 0)).toString(36);
    return \`.\${name} { \${body} }\`;
  };
}

// ========== styled 工厂：支持 attrs ==========
function styled(tag: string) {
  return (strings: TemplateStringsArray, ...interps: any[]) => {
    // 处理 attrs：默认 props
    let attrs: any = {};
    const fn = (props: any) => {
      const merged = { ...attrs, ...props };
      const body = strings.reduce((acc, s, i) => acc + s + (i < interps.length ? String(interps[i](merged)) : ""), "");
      return { tag, className: "sc-" + Math.abs(body.length).toString(36), css: body };
    };
    // attrs 函数挂载
    (fn as any).attrs = (a: any) => {
      attrs = typeof a === "function" ? a() : a;
      return fn;
    };
    return fn;
  };
}

const spin = keyframes\`from { transform: rotate(0); } to { transform: rotate(360deg); }\`;

const Button = styled("button")\`
  background: \${(p: any) => (p.$primary ? "#2563eb" : "#fff")};
  color: \${(p: any) => (p.$primary ? "#fff" : "#374151")};
  padding: 8px 16px;
  border-radius: 4px;
  border: \${(p: any) => (p.$primary ? "0" : "1px solid #d1d5db")};
\`;

function Spinner() {
  return (
    <div
      style={{
        width: 24, height: 24, border: "3px solid #e5e7eb",
        borderTopColor: "#2563eb", borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    >
      <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
    </div>
  );
}

function Demo() {
  return (
    <div style={{ padding: 16, display: "flex", gap: 8, alignItems: "center" }}>
      <Button $primary>主按钮</Button>
      <Button>次按钮</Button>
      <Spinner />
    </div>
  );
}

export default function App() { return <Demo />; }
\`\`\`

---

## 十、emotion 完整写法

\`\`\`tsx
import { css, styled, keyframes } from "@emotion/react";

// css prop（无需 styled）
const card = css\`
  padding: 16px;
  border-radius: 8px;
  background: white;
  &:hover {
    transform: translateY(-2px);
    transition: transform 0.2s;
  }
\`;

// keyframes
const fadeIn = keyframes\`
  from { opacity: 0; }
  to   { opacity: 1; }
\`;

// styled with variants
const Button = styled("button", {
  shouldForwardProp: (prop) => !prop.startsWith("$"),  // $prop 不传 DOM
})\`
  background: \${(props: any) => (props.$primary ? "blue" : "white")};
  animation: \${fadeIn} 0.3s;
\`;

// 用法
function App() {
  return (
    <div css={card}>
      <Button $primary>主</Button>
    </div>
  );
}
\`\`\`

---

## 十一、迁移到编译时 CSS-in-JS

运行时 CSS-in-JS 有性能问题，新趋势是**编译时**：

| 库 | 思路 | 优点 |
| --- | --- | --- |
| **vanilla-extract** | CSS-in-TS，编译时生成 | 零运行时 |
| **linaria** | 编译时转 CSS | 兼容 styled API |
| **Stitches** | API 类似 styled | 可设计 token |

\`\`\`ts
// vanilla-extract 示例
// styles.css.ts
import { style, createTheme } from "@vanilla-extract/css";

export const button = style({
  padding: "8px 16px",
  borderRadius: 4,
  background: "blue",
});

export const [themeClass, vars] = createTheme({
  color: { primary: "blue" },
  space: { sm: 8, md: 16 },
});
\`\`\`

**vanilla-extract 优势**：
- 编译时生成 CSS，零运行时开销
- 完整的 TS 类型推导
- 主题用 CSS variables，SSR 友好
- 学习曲线略陡（要学 \`.css.ts\` 约定）

---

## 十二、决策

| 项目类型 | 推荐 |
| --- | --- |
| 快速原型 | inline style |
| 中后台 | CSS Modules / Tailwind |
| 设计系统 | vanilla-extract / stitches |
| 已有 styled 组件 | 继续用 |
| SSR 性能敏感 | 编译时方案 |
`,
  },

  // =========================================================
  // 第七十四章 UI 组件库选择
  // =========================================================
  {
    id: "tsx2-ch74",
    group: "第十五部分 样式与 UI 库",
    icon: "🧱",
    title: "第七十四章 UI 组件库选择",
    content: `# 第七十四章 UI 组件库选择

造轮子 vs 用现成组件库？本章对比 MUI、Ant Design、Chakra、Mantine、shadcn/ui，帮你按场景选型。

---

## 一、主流 UI 库横评

| 库 | 大小 | 风格 | 适合 |
| --- | --- | --- | --- |
| **MUI** | 大 | Material Design | 后台、企业级 |
| **Ant Design** | 大 | 中性、商务 | 中后台、表格多 |
| **Chakra UI** | 中 | 简洁、可组合 | 通用 |
| **Mantine** | 中 | 现代、丰富 | SaaS、Dashboard |
| **shadcn/ui** | 0（拷贝） | 极简、可定制 | 设计驱动项目 |
| **Headless UI / Radix** | 小 | 无样式 | 自定义设计 |

---

## 二、MUI（Material UI）

Google Material Design 实现，最成熟。

\`\`\`tsx
// npm install @mui/material @emotion/react @emotion/styled
import { Button, TextField, Stack, Box } from "@mui/material";

function Demo() {
  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <TextField label="姓名" variant="outlined" />
        <Button variant="contained" color="primary">提交</Button>
      </Stack>
    </Box>
  );
}
\`\`\`

**优势**：
- 组件极全（DataGrid、DatePicker、Charts）
- TypeScript 一流
- 主题系统强大

**劣势**：
- 体积大
- Material 风格重，二次改造难

---

## 三、Ant Design

阿里出品，国内后台首选。

\`\`\`tsx
import { Button, Form, Input, Table } from "antd";

const columns = [
  { title: "姓名", dataIndex: "name" },
  { title: "年龄", dataIndex: "age" },
];

function Demo() {
  return (
    <>
      <Form layout="vertical">
        <Form.Item label="姓名" name="name">
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form>
      <Table dataSource={[]} columns={columns} />
    </>
  );
}
\`\`\`

**优势**：
- 中后台组件极丰富（Table、Form、Tree 都很强）
- 中文文档、社区
- 企业级审美

**劣势**：
- 体积大
- 主题定制复杂
- 国际化需要单独配

---

## 四、Chakra UI

简洁、可组合的组件库。

\`\`\`tsx
import { Box, Button, Input, Stack, useToast } from "@chakra-ui/react";

function Demo() {
  const toast = useToast();
  return (
    <Stack p={4} spacing={3}>
      <Input placeholder="姓名" />
      <Button colorScheme="blue" onClick={() => toast({ title: "成功", status: "success" })}>
        提交
      </Button>
    </Stack>
  );
}
\`\`\`

**优势**：
- API 一致性好
- 主题系统好（基于 emotion）
- 文档优秀

**劣势**：
- 国内生态一般
- 复杂组件（如 Table）较弱

---

## 五、Mantine

功能全面的现代库。

\`\`\`tsx
import { Button, TextInput, Stack, Notification } from "@mantine/core";

function Demo() {
  return (
    <Stack p="md">
      <TextInput label="姓名" />
      <Button>提交</Button>
    </Stack>
  );
}
\`\`\`

**优势**：
- 组件丰富（含 DatePicker、Carousel、Dropzone）
- 内置 dark mode
- 体积可控（tree-shakable）

**劣势**：
- 国内知名度低

---

## 六、shadcn/ui

不是"库"，是一组**可拷贝的组件源码**。

\`\`\`bash
# 安装 CLI
npx shadcn@latest add button
# 把 Button.tsx 复制到你的项目
\`\`\`

\`\`\`tsx
// 你项目里 components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
);
\`\`\`

**优势**：
- 源码在你项目里，完全可控
- 基于 Tailwind + Radix UI
- 不增加运行时依赖

**劣势**：
- 自己维护（升级要手动）
- 初始搭建稍费劲

---

## 七、选型决策

| 场景 | 推荐 |
| --- | --- |
| 中后台、数据密集 | Ant Design / MUI |
| 设计驱动、要高度自定义 | shadcn/ui + Tailwind |
| 通用、SaaS | Mantine / Chakra |
| 想要 Headless 自己控样式 | Radix / Headless UI |
| 快速原型 | Chakra / Mantine |
| 国内企业项目 | Ant Design |

---

## 八、Tree Shaking 与按需加载

\`\`\`ts
// Vite 配置按需引入
// 多数 UI 库支持 ESM tree-shaking，直接 import { Button } from "antd" 即可
// 不需要额外 babel-plugin-import

// AntD 体积优化
import { Button } from "antd";                 // 默认会引入所有 icon
import Button from "antd/es/button";           // 只引 button
// 或用图标库分离
import { SearchOutlined } from "@ant-design/icons";
\`\`\`

---

## 九、主题定制对比

\`\`\`tsx
// MUI
const theme = createTheme({ palette: { primary: { main: "#3b82f6" } } });
<ThemeProvider theme={theme}>...</ThemeProvider>

// AntD
<ConfigProvider theme={{ token: { colorPrimary: "#3b82f6" } }}>...</ConfigProvider>

// Chakra
const theme = extendTheme({ colors: { brand: { 500: "#3b82f6" } } });

// Mantine
<MantineProvider theme={{ primaryColor: "blue" }}>...</MantineProvider>

// shadcn/ui：直接在 globals.css 改 CSS 变量
:root {
  --primary: 222.2 47.4% 11.2%;
}
\`\`\`

---

## 十、迷你 UI 库示例（手写 Button）

\`\`\`tsx
import { useState } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

// CVA 风格 variants
const variants = {
  primary: { background: "#2563eb", color: "#fff", border: "0" },
  ghost:   { background: "transparent", color: "#374151", border: "1px solid #d1d5db" },
  danger:  { background: "#dc2626", color: "#fff", border: "0" },
};
const sizes = {
  sm: { padding: "4px 8px", fontSize: 12 },
  md: { padding: "8px 16px", fontSize: 14 },
};

function MyButton({ variant = "primary", size = "md", style, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      style={{ borderRadius: 4, cursor: "pointer", ...variants[variant], ...sizes[size], ...style }}
    >
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16, display: "flex", gap: 8 }}>
      <MyButton>主按钮</MyButton>
      <MyButton variant="ghost">次按钮</MyButton>
      <MyButton variant="danger">删除</MyButton>
      <MyButton size="sm">小按钮</MyButton>
    </div>
  );
}
\`\`\`

---

## 小结

1. **MUI / AntD** 适合中后台，组件最全
2. **Chakra / Mantine** 现代、灵活，适合通用
3. **shadcn/ui** 源码在你项目里，可控性最强
4. **Radix / Headless UI** 只想拿行为逻辑，样式自己写
5. 选型考虑：体积、风格匹配度、主题可定制性、文档/社区
6. 按需引入 / tree-shaking 减少包体积
7. 二次封装常见：把 UI 库的组件包成项目自己的 \`<AppButton>\`
`,
  },

  // =========================================================
  // 第七十五章 Headless UI 组件
  // =========================================================
  {
    id: "tsx2-ch75",
    group: "第十五部分 样式与 UI 库",
    icon: "🎭",
    title: "第七十五章 Headless UI 组件",
    content: `# 第七十五章 Headless UI 组件

"Headless"（无头）UI 库只提供**行为与可访问性**，样式完全由你决定。本章讲解 Headless UI、Radix UI 的设计哲学，并手写一个迷你 Menu 组件。

---

## 一、什么是 Headless 组件

普通 UI 库 = 行为 + 样式。Headless = 只给你行为（如：开/关、键盘导航、ARIA 属性），样式你自己写。

\`\`\`tsx
// 传统 Select：自带样式
<Select options={["A", "B", "C"]} />

// Headless：只给行为，样式自己写
<Select>
  <Select.Trigger className="my-trigger">选择</Select.Trigger>
  <Select.Options className="my-options">
    <Select.Option value="A">A</Select.Option>
  </Select.Options>
</Select>
\`\`\`

**优势**：
- 完全控制样式
- 包体积小（没有 CSS 包袱）
- 跨项目复用行为
- 不会被库的设计风格"绑架"

---

## 二、Headless UI（Tailwind Labs 出品）

\`\`\`bash
npm install @headlessui/react
\`\`\`

### 1. Menu（下拉菜单）

\`\`\`tsx
import { Menu } from "@headlessui/react";

function MyMenu() {
  return (
    <Menu>
      <Menu.Button className="px-4 py-2 bg-blue-500 text-white rounded">
        选项
      </Menu.Button>
      <Menu.Items className="absolute mt-1 bg-white border rounded shadow-lg w-48">
        <Menu.Item>
          {({ active }) => (
            <a className={\`block px-4 py-2 \${active ? "bg-blue-100" : ""}\`} href="/profile">
              个人资料
            </a>
          )}
        </Menu.Item>
        <Menu.Item disabled>
          {({ active, disabled }) => (
            <span className={\`block px-4 py-2 \${disabled ? "opacity-50" : ""}\`}>
              不可选项
            </span>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
\`\`\`

### 2. Dialog（模态框）

\`\`\`tsx
import { Dialog } from "@headlessui/react";
import { useState } from "react";

function MyModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>打开</button>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-semibold">标题</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mt-1">
              描述
            </Dialog.Description>
            <p className="mt-4">模态框内容</p>
            <button onClick={() => setOpen(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              关闭
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
\`\`\`

### 3. Listbox（自定义 Select）

\`\`\`tsx
import { Listbox } from "@headlessui/react";
import { useState } from "react";

const people = [
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
  { id: 3, name: "王五" },
];

function MySelect() {
  const [selected, setSelected] = useState(people[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <Listbox.Button className="px-4 py-2 border rounded w-48 text-left">
        {selected.name}
      </Listbox.Button>
      <Listbox.Options className="absolute mt-1 bg-white border rounded shadow w-48">
        {people.map((p) => (
          <Listbox.Option
            key={p.id}
            value={p}
            className={({ active, selected }) =>
              \`px-4 py-2 cursor-pointer \${active ? "bg-blue-100" : ""} \${selected ? "font-semibold" : ""}\`
            }
          >
            {p.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
}
\`\`\`

### 4. Disclosure（手风琴）

\`\`\`tsx
import { Disclosure } from "@headlessui/react";

<Disclosure>
  {({ open }) => (
    <>
      <Disclosure.Button className="w-full text-left px-4 py-2 bg-gray-100">
        展开 / 收起 {open ? "▲" : "▼"}
      </Disclosure.Button>
      <Disclosure.Panel className="px-4 py-2 border">
        这里是折叠内容
      </Disclosure.Panel>
    </>
  )}
</Disclosure>
\`\`\`

---

## 三、Radix UI

另一主流 headless 库，组件更全（Tabs、Tooltip、Popover、DropdownMenu、Accordion、Toast 等）。

\`\`\`bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog
\`\`\`

\`\`\`tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

function RadixDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="px-4 py-2 bg-blue-500 text-white rounded">
        菜单
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-white border rounded shadow-lg p-1" sideOffset={5}>
          <DropdownMenu.Item className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none">
            个人资料
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none">
            退出
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
\`\`\`

**Headless UI vs Radix**：
- Headless UI：API 简洁、组件较少
- Radix：组件极全、组合 API（Root/Trigger/Content/Item）

---

## 四、手写迷你 Menu（headless 思想）

\`\`\`tsx
import { useState, useRef, useEffect, ReactNode } from "react";

// 简化版 headless Menu：提供开/关、点击外部关闭、键盘 Esc
function useMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

type MenuProps = { trigger: ReactNode; children: ReactNode };

function MyMenu({ trigger, children }: MenuProps) {
  const { open, setOpen, ref } = useMenu();
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "100%", left: 0, marginTop: 4,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 160, padding: 4, zIndex: 50,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div
      role="menuitem"
      onClick={onClick}
      style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 4 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <MyMenu trigger={<button style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 4 }}>选项 ▾</button>}>
        <MenuItem onClick={() => alert("个人资料")}>个人资料</MenuItem>
        <MenuItem onClick={() => alert("设置")}>设置</MenuItem>
        <MenuItem onClick={() => alert("退出")}>退出</MenuItem>
      </MyMenu>
    </div>
  );
}
\`\`\`

---

## 五、Headless 组件的核心关注点

写 headless 组件时需要考虑：

1. **键盘导航**：方向键切换、Enter 确认、Esc 关闭
2. **焦点管理**：开/关时正确移动焦点（焦点陷阱）
3. **ARIA 属性**：\`role="menu"\`、\`aria-expanded\`、\`aria-haspopup\`
4. **点击外部关闭**
5. **滚动锁定**（Modal 打开时）
6. **屏幕阅读器**可读

---

## 六、Headless 库对比

| 库 | 组件数 | 体积 | 特点 |
| --- | --- | --- | --- |
| Headless UI | 15+ | 8KB | 简洁、TS 友好 |
| Radix UI | 25+ | 30KB+ | 组件最全、组合 API |
| React Aria | 30+ | 大 | Adobe 出品、可访问性最强 |
| Ark UI | 20+ | 中 | 跨框架、State machine 驱动 |

---

## 七、与 Tailwind 配合

Headless 库 + Tailwind 是当下最主流的"自定义设计"组合：

\`\`\`tsx
import { Menu } from "@headlessui/react";

<Menu>
  <Menu.Button className="px-4 py-2 rounded-md bg-white border hover:bg-gray-50 text-sm font-medium">
    选项
  </Menu.Button>
  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border rounded-md shadow-lg focus:outline-none">
    <Menu.Item>
      {({ active }) => (
        <button className={\`\${active ? "bg-blue-50 text-blue-700" : ""} w-full text-left px-4 py-2\`}>
          个人资料
        </button>
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>
\`\`\`

---

## 小结

1. **Headless = 行为与样式分离**，样式自己控
2. **Headless UI** 简洁、TS 友好
3. **Radix UI** 组件最全、组合 API
4. 自己写 headless 组件要注意：键盘、焦点、ARIA、点击外部
5. **Headless + Tailwind** 是自定义设计项目的标配
6. 选型：组件少且简单 → Headless UI；要全 → Radix；要最强可访问性 → React Aria
`,
  },
];

export { chapters };
