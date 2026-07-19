// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十四批章节
// -------------------------------------------------------------
// 覆盖：第十部分 样式方案
// 包含 4 个章节：ch66 ~ ch69
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 所有 demo 都贴近真实业务场景，能直接迁移到项目
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch66: CSS Modules + TS
  // ============================================================
  {
    id: "tsx3-ch66",
    group: "第十部分 样式方案",
    icon: "🎨",
    title: "ch66 CSS Modules 与 TypeScript",
    content: `# ch66 CSS Modules 与 TypeScript

## 为什么讲这个

写到第十部分，我们终于来到"样式方案"——这是 React 项目里被严重低估的 TypeScript 应用场景。很多人以为"CSS 跟 TS 没什么关系"，其实不然。

**真实的痛点**：你写了一个 \`Button.module.css\`，里面定义了 \`.primary\` 类。然后在组件里写 \`className={styles.primary}\`——结果某天重构时改成了 \`.btn-primary\`，但 JSX 里忘改。运行时样式没生效，TS 没报错，调试半小时才发现。

CSS Modules 默认导入的对象是 \`any\` 类型，访问不存在的类名不会报错。**让 CSS 类名也有类型**，就是这一章要解决的问题。我们会顺带把 \`CSSProperties\`、\`clsx\`、\`cva\` 这些配套工具一次讲清楚。

## 1. CSS Modules 的导入与默认类型

在 Vite 或 Next.js 里，任何以 \`.module.css\` 结尾的文件都会被当成 CSS Modules 处理：

\`\`\`css
/* Button.module.css */
.primary {
  /* 主按钮样式 */
  background: blue;
  color: white;
  padding: 8px 16px;
}

.secondary {
  /* 次按钮样式 */
  background: gray;
  color: white;
}
\`\`\`

在组件里导入：

\`\`\`tsx
// Button.tsx
import styles from "./Button.module.css";
// ⚠️ 默认情况下 styles 的类型是 any 或 { readonly [key: string]: string }
// 这意味着 styles.notExist 不会报错——访问不存在的类名静默返回 undefined

function Button({ variant }: { variant: "primary" | "secondary" }) {
  // 错误写法：styles.primary 能跑通，但 styles.primay 拼错了也不会报错
  return <button className={styles[variant]}>点击</button>;
}
\`\`\`

Vite 默认提供了一个最小类型声明（在 \`vite/client.d.ts\` 里），让 \`*.module.css\` 的导入有 \`Record<string, string>\` 类型，但**它不会校验你访问的 key 是否真实存在**。

## 2. CSS Modules 类型声明文件

让 CSS Modules 真正"类型安全"的方法：写一个 \`*.d.ts\` 声明文件，让每个 module.css 文件都被推导成具体的字面量联合类型。

\`\`\`ts
// vite-env.d.ts 或者单独的 css-modules.d.ts
/// <reference types="vite/client" />

// 关键：声明 *.module.css 的导入类型
declare module "*.module.css" {
  // 用 const + Record<string, string>，让 styles 是只读的对象
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 如果用 SCSS，再加一个
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
\`\`\`

这个声明让 TS 至少知道 \`styles\` 是 \`Record<string, string>\`，但访问不存在的 key 仍然不报错。要做到真正的"类名拼写检查"，需要借助 \`typescript-plugin-css-modules\` 这类工具，或者用下面这种"运行时校验 + as const"的折中方案。

## 3. CSSProperties 类型：内联样式的类型安全

除了 \`className\`，React 还支持 \`style\` 内联样式。\`style\` 属性的类型是 \`React.CSSProperties\`，它会把所有合法的 CSS 属性都列出来，写错会直接报错：

\`\`\`tsx
// style 的类型是 React.CSSProperties
function Box({ color }: { color: string }) {
  return (
    <div
      style={{
        // ✅ 合法的 CSS 属性
        backgroundColor: color,
        // ✅ 数字会自动加 px
        padding: 16, // 等价于 "16px"
        // ✅ 字符串也行
        margin: "8px 16px",
        // ❌ 报错：pading 拼错了
        // pading: 16,
        // ❌ 报错：backgroundColor 不接受数字
        // backgroundColor: 0,
      }}
    >
      内容
    </div>
  );
}
\`\`\`

**实战技巧**：自定义一个带约束的 style 类型：

\`\`\`tsx
// 只允许特定几个 CSS 属性
type ButtonStyle = Pick<React.CSSProperties, "color" | "backgroundColor" | "borderColor">;

// 自定义 hook 返回带类型约束的样式
function useButtonStyle(disabled: boolean): ButtonStyle {
  return {
    color: disabled ? "gray" : "white",
    backgroundColor: disabled ? "#eee" : "blue",
    borderColor: "transparent",
  };
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const style = useButtonStyle(disabled);
  return <button style={style} disabled={disabled}>提交</button>;
}
\`\`\`

## 4. Record 类型推导：从 CSS 类名生成联合类型

让 CSS 类名变成 TS 联合类型的"穷办法"：手动维护一个 const 对象，让它和 CSS 文件保持同步。

\`\`\`ts
// buttonClasses.ts
// 用 as const 锁住字面量类型
export const buttonClasses = {
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
} as const;

// 推导出联合类型："primary" | "secondary" | "danger"
export type ButtonClass = keyof typeof buttonClasses;
\`\`\`

然后在组件里用这个联合类型约束 props：

\`\`\`tsx
import styles from "./Button.module.css";
import { buttonClasses, type ButtonClass } from "./buttonClasses";

interface ButtonProps {
  variant: ButtonClass; // 只能传 primary / secondary / danger
  children: React.ReactNode;
}

function Button({ variant, children }: ButtonProps) {
  // 用 buttonClasses 做一层校验：如果 CSS 里没有这个类，至少运行时能发现
  const className = styles[buttonClasses[variant]] ?? "";
  return <button className={className}>{children}</button>;
}

// ✅ 合法
<Button variant="primary">保存</Button>
// ❌ 报错：foo 不在 ButtonClass 联合里
// <Button variant="foo">保存</Button>
\`\`\`

**避坑**：这种写法依赖你手动同步 \`buttonClasses\` 和 CSS 文件，容易漏。如果团队有 CI，可以加一个测试用例扫描 CSS 类名和 \`buttonClasses\` 的差异。

## 5. clsx：条件类名合并的事实标准

写 React 时最常见的需求：根据条件组合多个类名。手写 \`[\`btn \${active ? "active" : ""} \${disabled ? "disabled" : ""}\`].filter(Boolean).join(" ")\` 太啰嗦。社区事实标准是 \`clsx\`：

\`\`\`bash
npm install clsx
\`\`\`

\`\`\`tsx
import clsx from "clsx";
// clsx 的类型签名：(...inputs: ClassValue[]) => string
//   ClassValue = string | number | null | undefined | boolean | object
// 它能处理对象、数组、嵌套等各种结构

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string; // 允许外部传入额外类名
}

function Button({ variant, size, disabled, className }: ButtonProps) {
  // clsx 把所有参数拼成一个字符串
  return (
    <button
      disabled={disabled}
      className={clsx(
        "btn", // 始终存在的基础类
        \`btn-\${variant}\`, // 模板拼出来的变体类
        \`btn-\${size}\`, // 模板拼出来的尺寸类
        {
          // 对象语法：值为 truthy 时才加 key 作为类名
          "btn-disabled": disabled,
        },
        className // 外部传入的额外类名放最后，优先级最高
      )}
    >
      按钮
    </button>
  );
}

// 输出：class="btn btn-primary btn-md btn-disabled extra-class"
<Button variant="primary" size="md" disabled className="extra-class" />
\`\`\`

\`clsx\` 的类型设计很简单但很巧妙——它不区分参数类型，靠重载和 \`ClassValue\` 联合类型让你怎么传都不报错。代价是它**不校验类名是否真实存在**。

## 6. cva：变体驱动的类名管理

\`cva\`（class variance authority）是另一个流行库，专门解决"组件变体 + 类名"问题，比 clsx 更结构化，**而且类型推导非常强**：

\`\`\`bash
npm install cva
# 注意 cva 2.x 改名为 class-variance-authority
\`\`\`

\`\`\`tsx
import { cva, type VariantProps } from "class-variance-authority";

// cva 接收基础类名 + 配置对象，返回一个函数
const button = cva("btn", {
  // variants 描述所有可变的维度
  variants: {
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-danger",
    },
    size: {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    },
    disabled: {
      true: "btn-disabled",
      false: "",
    },
  },
  // 默认值：不传时用这套
  defaultVariants: {
    variant: "primary",
    size: "md",
    disabled: false,
  },
});

// VariantProps 工具类型：从 cva 返回值反推出 props 类型
// 它会自动包含所有 variants 字段，且都是可选（因为有 defaultVariants）
type ButtonVariants = VariantProps<typeof button>;

interface ButtonProps extends ButtonVariants {
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ children, onClick, ...variants }: ButtonProps) {
  // button() 调用返回最终的 className 字符串
  return (
    <button className={button(variants)} onClick={onClick}>
      {children}
    </button>
  );
}

// ✅ 全部合法，TS 会校验 variant/size 的值
<Button variant="danger" size="lg">删除</Button>
<Button variant="secondary">取消</Button>
// ❌ 报错：foo 不是合法的 variant
// <Button variant="foo">x</Button>
\`\`\`

\`cva\` 的类型安全来自它的"配置驱动"——所有合法的变体值都在 \`variants\` 里列出来，TS 自然能推导出联合类型。这是**比 clsx 更优的"变体管理"方案**。

## 7. 实战：完整类型安全的 Button 组件

把上面所有工具组合起来，写一个生产级的 Button：

\`\`\`tsx
// Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import styles from "./Button.module.css";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// 1. 定义 cva 配置，类名走 CSS Modules
const buttonClasses = cva(styles.btn, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      danger: styles.danger,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
    block: {
      true: styles.block,
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    block: false,
  },
});

// 2. 提取变体类型
type ButtonVariants = VariantProps<typeof buttonClasses>;

// 3. 组合原生 button 的 props + 变体 props
interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  // 覆盖 children 类型，更严格
  children: ReactNode;
  // 自定义字段
  loading?: boolean;
}

// 4. 组件实现
export function Button({
  children,
  variant,
  size,
  block,
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      // 合并：cva 算出的变体类 + 外部传入的 className
      className={clsx(
        buttonClasses({ variant, size, block }),
        { [styles.loading]: loading },
        className
      )}
      // loading 时也禁用
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}

// 使用：
// <Button variant="danger" size="lg" block onClick={() => alert("del")}>
//   删除项目
// </Button>
\`\`\`

这个组件同时具备：
- 变体类型安全（cva 提供）
- 原生 props 透传（extends ButtonHTMLAttributes）
- 类名拼写检查（CSS Modules + 自定义 d.ts）
- 条件类名合并（clsx）

## 小结

- CSS Modules 默认导入是 \`Record<string, string>\`，访问不存在的类名不报错。
- 写 \`*.module.css\` 的 \`d.ts\` 声明能改善类型，真正的拼写检查需要插件。
- \`React.CSSProperties\` 让内联样式有完整类型校验，写错属性名立刻报错。
- \`clsx\` 解决条件类名合并，\`cva\` 解决变体管理，两者经常配合使用。
- \`VariantProps<typeof cva>\` 是从 cva 配置反推 props 类型的标准做法。

## 避坑清单

- ❌ 直接用 \`styles.foo\` 访问不存在的类名（应该写 d.ts + 同步 const 对象）
- ❌ 用模板字符串拼类名不带类型校验（应该用 cva 的 variants）
- ❌ 在 \`style\` 里写 \`padding\` 拼成 \`pading\`（应该靠 CSSProperties 拦截）
- ❌ 组件 props 用 \`string\` 接收 variant（应该用字面量联合或 cva）
- ❌ 外部传入的 \`className\` 没合并到根元素（应该用 clsx 拼到末尾）

下一章我们看 Tailwind CSS——同样是类名方案，但 Tailwind 的类型扩展方式完全不同。`
  },

  // ============================================================
  // ch67: Tailwind CSS + TS
  // ============================================================
  {
    id: "tsx3-ch67",
    group: "第十部分 样式方案",
    icon: "💨",
    title: "ch67 Tailwind CSS 与 TypeScript",
    content: `# ch67 Tailwind CSS 与 TypeScript

## 为什么讲这个

Tailwind 是当下最火的 utility-first CSS 框架。它的核心思路是"用预生成的原子类拼出任意样式"，让开发者不再写 CSS 文件。

但 Tailwind + TypeScript 的组合有几个独特的痛点：
1. **配置文件**：\`tailwind.config.js\` 默认是 JS，没有类型提示。
2. **自定义颜色 / 变体**：扩展后如何在 className 里获得自动补全？
3. **变体管理**：和上一章的 cva 类似，但要适配 Tailwind 的类名风格。
4. **类型安全**：能不能让 \`bg-primary-500\` 这种自定义类名有类型校验？

这一章把这些问题讲清楚。我们假设你已经熟悉 Tailwind 的基本用法（\`flex\`、\`p-4\`、\`text-sm\` 这些），重点放在 TS 集成上。

## 1. tailwind.config.ts：用 TS 写配置

Tailwind 3.3+ 原生支持 \`tailwind.config.ts\`，配置文件本身就有类型：

\`\`\`ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

// 显式标注 Config 类型，所有字段都有提示
const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      // 扩展颜色：新增 primary 色板
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
      // 扩展间距：新增业务常用的尺寸
      spacing: {
        18: "4.5rem", // Tailwind 默认没有 18
      },
      // 扩展字体
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
\`\`\`

写 \`tailwind.config.ts\` 的好处：
- 所有字段都有类型提示（VSCode 自动补全 \`theme.extend.colors\`）
- 写错字段名立刻报错（比如 \`them\` 拼错）
- 可以在配置里写复杂逻辑（条件、循环、函数）

## 2. 自定义颜色：让 className 有自动补全

\`tailwind.config.ts\` 里扩展的颜色，会自动生成对应的 utility 类，比如 \`bg-primary-500\`、\`text-primary-700\`、\`border-primary-100\`。

要让 VSCode 给这些自定义类自动补全，需要装 **Tailwind CSS IntelliSense** 扩展。它会读 \`tailwind.config.ts\`，把所有合法的类名做进自动补全。

\`\`\`tsx
// 业务组件
function Alert({ message }: { message: string }) {
  // 输入 bg-primary- 时，VSCode 会列出 50/100/500/600/700/900
  return (
    <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded">
      {message}
    </div>
  );
}
\`\`\`

**避坑**：如果 VSCode 不补全自定义颜色，检查：
1. \`tailwind.config.ts\` 里 \`content\` 是否覆盖了你的组件文件
2. 是否装了 Tailwind CSS IntelliSense 扩展
3. 扩展设置里 \`files.exclude\` 是否屏蔽了 \`tailwind.config.ts\`

## 3. 变体扩展：添加自定义 variants

Tailwind 的 \`variants\` 是"条件类"的开关，比如 \`hover:bg-blue-500\` 里的 \`hover\`。你可以扩展自己的 variants：

\`\`\`ts
// tailwind.config.ts
const config: Config = {
  // ...
  theme: {
    extend: {
      // 自定义变体：first-letter
      // 用法：first-letter:text-2xl
    },
  },
  plugins: [
    // 用 plugin 函数定义复杂变体
    function ({ addVariant }: any) {
      // 添加一个 disabeled: 变体（注意拼写错的版本，演示避坑）
      // 实际应该叫 disabled:
      addVariant("disabled", "&:disabled");
    },
  ],
};
export default config;
\`\`\`

在组件里用：

\`\`\`tsx
function SubmitButton({ disabled }: { disabled?: boolean }) {
  // disabled:bg-gray-300 表示 :disabled 时的背景色
  return (
    <button
      disabled={disabled}
      className="bg-primary-600 disabled:bg-gray-300 hover:bg-primary-700 text-white px-4 py-2 rounded"
    >
      提交
    </button>
  );
}
\`\`\`

## 4. 类型安全的 className：tailwind-merge + clsx

Tailwind 的痛点之一：\`p-4 p-8\` 同时存在时，后写的覆盖前写的，但 TS 不告诉你。要解决这个，社区出了 \`tailwind-merge\`：

\`\`\`bash
npm install tailwind-merge clsx
\`\`\`

\`\`\`tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 自定义 cn 函数：合并 clsx 和 tailwind-merge
// clsx 负责条件合并，tailwind-merge 负责解决冲突
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// 使用
function Card({ className }: { className?: string }) {
  // 如果外部传 "p-8"，会覆盖默认的 "p-4"
  return <div className={cn("p-4 bg-white rounded shadow", className)} />;
}

// <Card className="p-8" /> → "bg-white rounded shadow p-8"
// tailwind-merge 自动把 p-4 和 p-8 合并成 p-8
\`\`\`

\`cn\` 函数是 shadcn/ui 等组件库的标准做法。把它放在 \`src/lib/cn.ts\`，全项目复用。

## 5. Tailwind Variants：类型更强的 cva

\`tailwind-variants\`（简称 tv）是 Tailwind 生态的 cva 增强版，类型推导比 cva 更好：

\`\`\`bash
npm install tailwind-variants
\`\`\`

\`\`\`tsx
import { tv, type VariantProps } from "tailwind-variants";

// tv 的语法和 cva 类似，但专为 Tailwind 设计
const button = tv({
  base: "inline-flex items-center justify-center rounded font-medium transition-colors",
  variants: {
    variant: {
      primary: "bg-primary-600 hover:bg-primary-700 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg",
    },
    block: {
      true: "w-full",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    block: false,
  },
});

// 类型反推：VariantProps<typeof button>
type ButtonVariants = VariantProps<typeof button>;

interface ButtonProps extends ButtonVariants {
  children: React.ReactNode;
  className?: string;
}

function Button({ children, className, ...variants }: ButtonProps) {
  // tv 的函数调用，支持第二个参数传入 className，自动 merge
  return (
    <button className={button({ ...variants, className })}>
      {children}
    </button>
  );
}

// 使用：
// <Button variant="danger" size="lg" block>删除</Button>
// <Button variant="secondary" className="w-48">取消</Button>
\`\`\`

\`tv\` 相比 \`cva\` 的优势：
- 内置 \`tailwind-merge\`，自动解决类名冲突
- 类型推导更智能，不需要手动写 \`as const\`
- 支持 \`compoundVariants\`（组合变体）

## 6. 组合变体：compoundVariants

某些样式只在"多个变体同时满足"时才生效。比如 danger + lg 组合时加边框：

\`\`\`tsx
const button = tv({
  base: "rounded font-medium",
  variants: {
    variant: {
      primary: "bg-primary-600 text-white",
      danger: "bg-red-600 text-white",
    },
    size: {
      sm: "h-8 px-3",
      lg: "h-12 px-6",
    },
  },
  // compoundVariants：当 variant=danger 且 size=lg 时，额外加这些类
  compoundVariants: [
    {
      variant: "danger",
      size: "lg",
      class: "border-2 border-red-800",
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "sm",
  },
});

// <Button variant="danger" size="lg" />
// 输出：rounded font-medium bg-red-600 text-white h-12 px-6 border-2 border-red-800
\`\`\`

\`compoundVariants\` 的类型也是安全的——TS 会校验 \`variant\` 和 \`size\` 的值是否在 \`variants\` 里定义过。

## 7. 实战：完整的类型安全 Button 组件

\`\`\`tsx
// components/ui/Button.tsx
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

// 1. 定义变体
const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    variant: {
      primary: "bg-primary-600 text-white hover:bg-primary-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
      ghost: "bg-transparent hover:bg-gray-100",
      danger: "bg-red-600 text-white hover:bg-red-700",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10", // 图标按钮：固定尺寸
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// 2. 提取 props 类型
interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  loading?: boolean;
}

// 3. 用 forwardRef 包一层，让外部能拿到 button 元素
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, loading = false, disabled, children, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            // 省略 svg 路径
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

// 使用：
// <Button variant="danger" size="lg" loading onClick={...}>删除</Button>
// <Button variant="outline" size="icon">x</Button>
// <Button asChild /> // 不支持，需要额外做 asChild
\`\`\`

这是 shadcn/ui 的典型 Button 模式。学到这一步你已经能读懂市面上 80% 的 Tailwind 组件库源码。

## 小结

- 用 \`tailwind.config.ts\` 替代 \`.js\`，配置文件本身就有完整类型。
- 装 Tailwind CSS IntelliSense 扩展，自定义颜色 / 变体自动补全。
- \`tailwind-merge\` + \`clsx\` 组成 \`cn\` 函数，解决类名冲突。
- \`tailwind-variants\`（tv）是 Tailwind 生态的 cva，类型推导更强。
- \`compoundVariants\` 实现组合条件样式，shadcn/ui 等组件库常用。

## 避坑清单

- ❌ 用 \`tailwind.config.js\` 不带类型提示（应该改 \`.ts\`）
- ❌ 自定义颜色后 VSCode 不补全（应该检查 content 路径和扩展配置）
- ❌ 直接用模板字符串拼 Tailwind 类名（应该用 tv / cva 管理变体）
- ❌ 多个 \`p-*\` 类同时存在导致样式冲突（应该用 tailwind-merge）
- ❌ 组件用 \`string\` 接收 variant（应该用 VariantProps<typeof tv>）

下一章我们看 CSS-in-JS 方案：styled-components 和 Emotion。`
  },

  // ============================================================
  // ch68: styled-components 与 Emotion
  // ============================================================
  {
    id: "tsx3-ch68",
    group: "第十部分 样式方案",
    icon: "💅",
    title: "ch68 styled-components 与 Emotion",
    content: `# ch68 styled-components 与 Emotion

## 为什么讲这个

前两章讲的都是"类名方案"——CSS Modules、Tailwind。这一章讲另一类：**CSS-in-JS**，代表库是 \`styled-components\` 和 \`Emotion\`。

CSS-in-JS 的核心思路：把样式写成 JS 字符串/对象，运行时生成唯一的类名注入到 DOM。它的优点是"样式跟组件强绑定，能直接访问 props"，缺点是"运行时有性能开销"（虽然有零运行时方案，但主流用法仍然是运行时）。

在 TS 视角下，CSS-in-JS 的痛点是**类型推导**：\`styled.button\` 返回的组件 props 是什么类型？怎么让自定义的 props 也有类型？怎么扩展 theme？这一章把这些问题讲清楚。

> **避坑提示**：React Server Components 不支持运行时 CSS-in-JS，如果你用 Next.js 13+ App Router，要么用 \`@emotion/css\` 的零运行时方案，要么改用 CSS Modules / Tailwind。本章适合传统 CSR 项目或客户端组件。

## 1. styled-components 基础类型

\`\`\`bash
npm install styled-components
\`\`\`

\`\`\`tsx
import styled from "styled-components";

// styled.button 返回一个组件，props 类型继承自 button 原生属性
// 你可以直接传 onClick、disabled 等原生 props
const Button = styled.button\`
  background: blue;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: darkblue;
  }

  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
\`;

// 使用：原生 props 自动有类型
function App() {
  return (
    <Button onClick={() => alert("clicked")} disabled={false}>
      点击
    </Button>
  );
}
\`\`\`

\`styled.button\` 的类型签名（简化）：

\`\`\`ts
// styled.button 接收一个模板字符串，返回 React 组件
// 组件的 props 是 ButtonHTMLAttributes<HTMLButtonElement> 的扩展
function button(
  strings: TemplateStringsArray,
  ...interpolations: SimpleInterpolation[]
): StyledComponent<"button", any, {}, never>;
\`\`\`

注意类型参数 \`any, {}, never\`——这意味着默认情况下 \`styled.button\` **没有自定义 props 类型**。要加自定义 props，需要显式声明。

## 2. 自定义 props 类型

让 \`Button\` 接收自定义的 \`variant\` props：

\`\`\`tsx
import styled, { css } from "styled-components";

// 1. 定义 props 接口
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

// 2. 用泛型参数把 ButtonProps 传给 styled.button
const Button = styled.button<ButtonProps>\`
  // 通过 \${props => ...} 访问 props
  background: \${(props) => {
    // props 这里被推导为 ButtonProps & ButtonHTMLAttributes
    switch (props.variant) {
      case "primary":
        return "blue";
      case "secondary":
        return "gray";
      case "danger":
        return "red";
    }
  }};

  padding: \${(props) => {
    // size 是可选的，TS 会强制你处理 undefined
    switch (props.size) {
      case "sm":
        return "4px 8px";
      case "lg":
        return "12px 24px";
      default:
        return "8px 16px"; // md 或 undefined
    }
  }};

  color: white;
  border: none;
  border-radius: 4px;
\`;

// 3. 使用：variant 必填，size 可选
function App() {
  return (
    <>
      <Button variant="primary">保存</Button>
      <Button variant="danger" size="lg">删除</Button>
      {/* ❌ 报错：foo 不是合法 variant */}
      {/* <Button variant="foo">x</Button> */}
    </>
  );
}
\`\`\`

**关键点**：\`styled.button<ButtonProps>\` 这个泛型参数让所有 \`\${(props) => ...}\` 回调里的 \`props\` 都有类型。如果你忘写泛型，\`props.variant\` 会是 \`any\`，类型安全就破了。

## 3. 用 css 块组织复用样式

多个 styled 组件共享一段样式时，用 \`css\` 块抽出来：

\`\`\`tsx
import styled, { css } from "styled-components";

// css 块：可复用的样式片段
const flexCenter = css\`
  display: flex;
  align-items: center;
  justify-content: center;
\`;

// 第一个组件：复用 flexCenter
const Card = styled.div\`
  \${flexCenter}
  background: white;
  padding: 16px;
\`;

// 第二个组件：也复用 flexCenter
const Modal = styled.div\`
  \${flexCenter}
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
\`;
\`\`\`

\`css\` 块的类型是 \`FlattenSimpleInterpolation\`，可以直接插入到模板字符串里。

## 4. styled(组件)：包装自定义组件

\`styled()\` 不仅能包装原生标签，也能包装你自己的 React 组件：

\`\`\`tsx
import styled from "styled-components";

// 1. 自定义组件，接收 className 透传
interface CardProps {
  title: string;
  content: string;
}

function CardBase({ title, content, className }: CardProps & { className?: string }) {
  return (
    <div className={className}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}

// 2. 用 styled 包装，给它加样式
// 注意：必须把 className 透传给根元素（上面已经做了）
const StyledCard = styled(CardBase)\`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;

  h3 {
    margin: 0 0 8px;
    color: #333;
  }
\`;

// 3. 使用：props 类型来自 CardBase
function App() {
  return (
    <StyledCard
      title="标题"
      content="内容"
    />
  );
}
\`\`\`

**避坑**：包装自定义组件时，必须把 \`className\` 透传给根元素，否则样式不生效。如果根元素已经有 \`className\`，要用 \`clsx\` 合并。

## 5. theme 类型扩展

styled-components 内置 \`ThemeProvider\`，但默认情况下 \`props.theme\` 是 \`any\`。要让 theme 有类型，需要做"声明合并"：

\`\`\`tsx
import styled, { ThemeProvider } from "styled-components";

// 1. 定义 theme 类型
interface MyTheme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
}

// 2. 声明合并：扩展 styled-components 的 DefaultTheme
declare module "styled-components" {
  export interface DefaultTheme extends MyTheme {}
}

// 3. 创建 theme 对象（必须符合 MyTheme 类型）
const theme: MyTheme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#6b7280",
    danger: "#ef4444",
  },
  spacing: {
    sm: "4px",
    md: "8px",
    lg: "16px",
  },
};

// 4. 在组件里通过 props.theme 访问，有完整类型提示
const Button = styled.button\`
  background: \${(props) => props.theme.colors.primary};
  padding: \${(props) => props.theme.spacing.md};
  color: white;
\`;

// 5. 用 ThemeProvider 注入
function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button>主题按钮</Button>
    </ThemeProvider>
  );
}
\`\`\`

\`declare module "styled-components"\` 是关键——它把 \`DefaultTheme\` 接口替换成你的 \`MyTheme\`，所有 \`props.theme\` 都自动获得类型。

## 6. Emotion：另一个主流选择

\`Emotion\` 和 \`styled-components\` API 几乎一样，但更轻量、性能更好：

\`\`\`bash
npm install @emotion/styled @emotion/react
\`\`\`

\`\`\`tsx
import styled from "@emotion/styled";
import { css } from "@emotion/react";

// 用法和 styled-components 几乎完全一样
interface ButtonProps {
  variant: "primary" | "danger";
}

const Button = styled.button<ButtonProps>\`
  background: \${(props) => (props.variant === "primary" ? "blue" : "red")};
  color: white;
  padding: 8px 16px;
\`;

// theme 扩展：声明合并 @emotion/react 的 Theme 接口
declare module "@emotion/react" {
  export interface Theme {
    colors: {
      primary: string;
      danger: string;
    };
  }
}

const theme = {
  colors: {
    primary: "blue",
    danger: "red",
  },
};

// 用 ThemeProvider 注入
import { ThemeProvider } from "@emotion/react";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button variant="primary">点击</Button>
    </ThemeProvider>
  );
}
\`\`\`

## 7. css prop：Emotion 的特色

Emotion 支持 \`css\` prop，可以直接在 JSX 上写样式：

\`\`\`tsx
// 需要配置 babel/jsx preset，这里假设已配置
// 见 https://emotion.sh/docs/css-prop

function App() {
  return (
    <div
      // css prop 直接写样式
      css={css\`
        background: white;
        padding: 16px;
        border-radius: 8px;
      \`}
    >
      <h3
        // 也支持对象语法
        css={{
          color: "blue",
          fontSize: "18px",
        }}
      >
        标题
      </h3>
    </div>
  );
}
\`\`\`

\`css\` prop 的类型来自 \`@emotion/react\` 的 JSX 命名空间扩展，配置好 babel preset 后自动生效。

## 8. keyframes：动画类型

定义动画用 \`keyframes\`：

\`\`\`tsx
import styled, { keyframes } from "styled-components";

// keyframes 返回一个动画实例
const spin = keyframes\`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
\`;

// 在 styled 组件里引用
const Spinner = styled.div\`
  width: 24px;
  height: 24px;
  border: 3px solid #eee;
  border-top-color: blue;
  border-radius: 50%;
  animation: \${spin} 1s linear infinite;
\`;

function Loading() {
  return <Spinner />;
}
\`\`\`

\`keyframes\` 的类型是 \`Keyframes\`，可以直接插入到 \`animation\` 属性里。Emotion 的 \`keyframes\` API 完全一样。

## 9. 实战：类型安全的卡片组件

\`\`\`tsx
import styled, { css, keyframes } from "styled-components";

// 1. 主题类型
interface AppTheme {
  colors: {
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
  };
  radius: {
    sm: string;
    md: string;
  };
}

declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

// 2. 卡片 props
interface CardProps {
  title: string;
  highlighted?: boolean; // 高亮卡片
  loading?: boolean;
}

// 3. 加载动画
const pulse = keyframes\`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
\`;

// 4. styled 组件
const CardContainer = styled.article<CardProps>\`
  background: \${(props) => props.theme.colors.cardBg};
  border: 1px solid \${(props) => props.theme.colors.cardBorder};
  border-radius: \${(props) => props.theme.radius.md};
  padding: 16px;
  transition: all 0.2s;

  // highlighted 时加阴影
  \${(props) =>
    props.highlighted &&
    css\`
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: blue;
    \`}

  // loading 时加脉冲动画
  \${(props) =>
    props.loading &&
    css\`
      animation: \${pulse} 1.5s ease-in-out infinite;
      pointer-events: none;
    \`}

  h3 {
    margin: 0 0 8px;
    color: \${(props) => props.theme.colors.textPrimary};
  }

  p {
    margin: 0;
    color: #666;
  }
\`;

// 5. 业务组件
function Card({ title, content, highlighted, loading }: CardProps & { content: string }) {
  return (
    <CardContainer title={title} highlighted={highlighted} loading={loading}>
      <h3>{title}</h3>
      <p>{content}</p>
    </CardContainer>
  );
}

// 使用：
// <Card title="项目一" content="描述" highlighted />
// <Card title="加载中" content="..." loading />
\`\`\`

## 小结

- \`styled.button<T>\` 的泛型参数 \`T\` 决定自定义 props 的类型，必写。
- \`styled(自定义组件)\` 包装时，被包装组件必须透传 \`className\`。
- 通过 \`declare module "styled-components"\` 扩展 \`DefaultTheme\`，让 \`props.theme\` 有类型。
- Emotion 的 API 几乎一样，但 \`css\` prop 是它的特色。
- \`keyframes\` 返回 \`Keyframes\` 类型，可直接插入 \`animation\` 属性。

## 避坑清单

- ❌ \`styled.button\` 不写泛型参数，自定义 props 是 \`any\`（应该写 \`<ButtonProps>\`）
- ❌ 包装自定义组件时没透传 \`className\`（应该用 \`clsx\` 合并到根元素）
- ❌ theme 不做声明合并，\`props.theme\` 是 \`any\`（应该 \`declare module\`）
- ❌ 在 React Server Components 里用 styled-components（应该改用零运行时方案）
- ❌ keyframes 定义在外面但在组件里直接引用（应该插入到 \`animation\` 属性）

下一章我们看"UI 库类型扩展"——Mantine / Ant Design 这种第三方组件库怎么扩展类型。`
  },

  // ============================================================
  // ch69: UI 库类型扩展
  // ============================================================
  {
    id: "tsx3-ch69",
    group: "第十部分 样式方案",
    icon: "🧩",
    title: "ch69 UI 库类型扩展",
    content: `# ch69 UI 库类型扩展

## 为什么讲这个

真实项目里，我们很少从零写所有组件——通常是选一个 UI 库（Ant Design、Mantine、Material UI、Chakra UI…）做基础，再在上面包装业务组件。

但 UI 库的 props 类型怎么用？怎么扩展？怎么覆盖默认 props？这是新手最容易踩坑的地方。比如：

- 你想给 Ant Design 的 \`Button\` 加一个 \`loadingText\` props，怎么写类型？
- 你想拿到 \`Mantine\` 的 \`TextInput\` 的 props 类型，怎么提？
- 你想覆盖 Ant Design \`Modal\` 的 \`width\` 默认值，但保留所有其他 props 类型，怎么做？

这一章把这些问题讲清楚。我们以 Mantine 和 Ant Design 为例（其他库原理类似）。

## 1. ComponentProps 工具：提取组件 props 类型

React 自带一个工具类型 \`ComponentProps\`，能从组件本身反推出 props 类型：

\`\`\`tsx
import type { ComponentProps } from "react";

// 假设有一个组件
function MyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
}

// 用 ComponentProps 提取 props 类型
type MyButtonProps = ComponentProps<typeof MyButton>;
// 等价于 { label: string; onClick: () => void }

// 用法：在另一个地方复用这个类型
function Wrapper(props: MyButtonProps) {
  return <MyButton {...props} />;
}
\`\`\`

\`ComponentProps\` 有几个变种：

\`\`\`tsx
import type {
  ComponentProps,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
} from "react";

// ComponentProps：最常用，自动判断有没有 ref
type P1 = ComponentProps<typeof MyButton>;

// ComponentPropsWithRef：强制包含 ref
type P2 = ComponentPropsWithRef<typeof MyButton>;

// ComponentPropsWithoutRef：强制排除 ref
type P3 = ComponentPropsWithoutRef<typeof MyButton>;

// 还有两个针对元素的工具类型
type DivProps = React.HTMLAttributes<HTMLDivElement>; // div 的所有属性
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>; // button 的所有属性
\`\`\`

**避坑**：forwardRef 包裹的组件，要用 \`ComponentPropsWithRef\` 才能拿到 ref 的类型。

## 2. 扩展 Mantine 组件 props

Mantine 是一个对 TS 非常友好的 UI 库，所有组件都导出了 props 类型：

\`\`\`bash
npm install @mantine/core @mantine/hooks
\`\`\`

\`\`\`tsx
import { Button } from "@mantine/core";
import type { ButtonProps as MantineButtonProps } from "@mantine/core";
import { forwardRef } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";

// 1. 用 Mantine 的 ButtonProps 作为基础
interface BizButtonProps extends MantineButtonProps {
  // 业务字段
  loadingText?: string;
  confirmRequired?: boolean;
}

// 2. forwardRef 包装
export const BizButton = forwardRef<HTMLButtonElement, BizButtonProps>(
  function BizButton(
    { loadingText, confirmRequired, children, loading, onClick, ...rest },
    ref
  ) {
    // 业务逻辑：confirmRequired 时先弹确认
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmRequired && !window.confirm("确定操作？")) {
        return;
      }
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        loading={loading}
        onClick={handleClick}
        {...rest}
      >
        {/* loading 时显示 loadingText，否则显示 children */}
        {loading && loadingText ? loadingText : children}
      </Button>
    );
  }
);

// 使用：
// <BizButton variant="filled" color="blue" loadingText="保存中..." confirmRequired>
//   保存
// </BizButton>
\`\`\`

关键点：\`extends MantineButtonProps\` 让你的 props 继承所有 Mantine Button 的属性（\`variant\`、\`color\`、\`size\`、\`loading\` 等），不用手动复制。

## 3. 扩展 Ant Design 组件 props

Ant Design 也对 TS 友好，但 props 类型的导出习惯不同：

\`\`\`bash
npm install antd
\`\`\`

\`\`\`tsx
import { Button } from "antd";
import type { ButtonProps as AntdButtonProps } from "antd";
import { forwardRef } from "react";

// 1. 业务 props 接口
interface BizButtonProps extends AntdButtonProps {
  // 加业务字段
  permission?: string; // 权限标识
  // 覆盖 children 类型（Antd 默认是 ReactNode，我们收窄）
  children: React.ReactNode;
}

// 2. 组件实现
export const BizButton = forwardRef<HTMLButtonElement, BizButtonProps>(
  function BizButton({ permission, children, disabled, ...rest }, ref) {
    // 模拟权限检查
    const hasPermission = (perm?: string) => {
      if (!perm) return true;
      // 真实场景从 context / store 拿
      return perm === "admin";
    };

    const allowed = hasPermission(permission);

    return (
      <Button
        ref={ref}
        disabled={disabled || !allowed}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);

// 使用：
// <BizButton permission="admin" type="primary">删除</BizButton>
// <BizButton permission="user">查看</BizButton> {/* 普通用户能看 */}
\`\`\`

Ant Design 的 props 类型导出习惯：每个组件都 export 一个 \`XxxProps\`，直接 import 用就行。

## 4. 覆盖默认 props

有时你想给 Antd 组件设默认值，但保留所有 props 的可选性。用 \`Partial\` 或自定义工具类型：

\`\`\`tsx
import { Modal } from "antd";
import type { ModalProps } from "antd";
import { forwardRef } from "react";

// 工具类型：把指定字段从可选改为必填，并设置默认值
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 1. 强制 width 和 centered 必传
interface BizModalProps extends WithDefaults<ModalProps, "width" | "centered"> {
  // 业务字段
  onConfirm?: () => void;
}

// 2. 组件实现
export function BizModal({
  width,
  centered,
  onConfirm,
  children,
  ...rest
}: BizModalProps) {
  return (
    <Modal
      width={width}
      centered={centered}
      onOk={onConfirm}
      {...rest}
    >
      {children}
    </Modal>
  );
}

// 使用：
// <BizModal width={600} centered open onConfirm={() => alert("ok")}>
//   内容
// </BizModal>
\`\`\`

\`WithDefaults\` 这个工具类型很有用——它把原本"可选"的字段改成"必填"，强制调用方传入。

## 5. 自定义 theme 类型

UI 库都支持 theme 自定义。Mantine 的 theme 类型扩展方式：

\`\`\`tsx
import { MantineProvider, createTheme, type MantineTheme } from "@mantine/core";

// 1. 自定义主题颜色
const myTheme = createTheme({
  colors: {
    // 扩展颜色色板
    brand: [
      "#eff6ff", // 50
      "#dbeafe", // 100
      "#bfdbfe", // 200
      "#93c5fd", // 300
      "#60a5fa", // 400
      "#3b82f6", // 500
      "#2563eb", // 600
      "#1d4ed8", // 700
      "#1e40af", // 800
      "#1e3a8a", // 900
    ],
  },
  // 扩展组件默认 props
  components: {
    Button: {
      defaultProps: {
        color: "brand",
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        size: "md",
      },
    },
  },
});

// 2. 用 MantineProvider 注入
function App() {
  return (
    <MantineProvider theme={myTheme}>
      <MyComponent />
    </MantineProvider>
  );
}
\`\`\`

\`createTheme\` 的类型签名会校验你传入的配置是否合法——比如 \`colors\` 的值必须是长度为 10 的字符串数组（每个色板 10 阶）。

Ant Design v5 用 \`ConfigProvider\`：

\`\`\`tsx
import { ConfigProvider, theme } from "antd";

function App() {
  return (
    <ConfigProvider
      theme={{
        // 用预设算法
        algorithm: theme.defaultAlgorithm,
        // 自定义 token
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 6,
        },
        // 组件级 token
        components: {
          Button: {
            colorPrimary: "#2563eb",
            algorithm: true,
          },
        },
      }}
    >
      <MyComponent />
    </ConfigProvider>
  );
}
\`\`\`

Ant Design 的 \`theme\` 配置对象有完整的类型提示，VSCode 自动补全所有 token 名字。

## 6. 拿到第三方组件的 ref 类型

有时你想 forward 一个第三方组件的 ref，但不知道 ref 的类型。用 \`ElementRef\` 工具类型：

\`\`\`tsx
import { forwardRef } from "react";
import type { ElementRef, ComponentPropsWithoutRef } from "react";
import { Button as MantineButton } from "@mantine/core";

// ElementRef：从组件反推它内部元素的类型
type MantineButtonElement = ElementRef<typeof MantineButton>;
// 通常等于 HTMLButtonElement

// 用法：forwardRef 的 ref 类型
interface BizButtonProps extends ComponentPropsWithoutRef<typeof MantineButton> {
  bizField?: string;
}

export const BizButton = forwardRef<MantineButtonElement, BizButtonProps>(
  function BizButton({ bizField, ...rest }, ref) {
    // 业务逻辑...
    return <MantineButton ref={ref} {...rest} />;
  }
);
\`\`\`

\`ElementRef\` 比 \`HTMLButtonElement\` 更通用——你不假设第三方组件内部一定是 \`button\`，而是从组件本身推导。

## 7. 实战：包装一个业务表单组件

\`\`\`tsx
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { TextInput, Box, Text } from "@mantine/core";
import type { TextInputProps } from "@mantine/core";

// 1. 业务字段 props
interface BizInputProps extends ComponentPropsWithoutRef<typeof TextInput> {
  // 业务标签
  label: string; // 强制必填
  // 帮助文本
  helpText?: string;
  // 错误信息（业务层校验）
  errorMessage?: string;
  // 是否必填（影响 label 显示）
  required?: boolean;
}

// 2. 组件实现
export const BizInput = forwardRef<HTMLInputElement, BizInputProps>(
  function BizInput(
    { label, helpText, errorMessage, required, error, ...rest },
    ref
  ) {
    return (
      <Box>
        <Text component="label" size="sm" weight={500} mb={4}>
          {/* 必填标识 */}
          {required && <span style={{ color: "red", marginRight: 4 }}>*</span>}
          {label}
        </Text>
        <TextInput
          ref={ref}
          error={errorMessage ?? error}
          {...rest}
        />
        {/* 帮助文本 */}
        {helpText && !errorMessage && (
          <Text size="xs" color="gray" mt={4}>
            {helpText}
          </Text>
        )}
        {/* 错误信息 */}
        {errorMessage && (
          <Text size="xs" color="red" mt={4}>
            {errorMessage}
          </Text>
        )}
      </Box>
    );
  }
);

// 使用：
// <BizInput
//   label="用户名"
//   required
//   helpText="3-20 个字符"
//   errorMessage={errors.username}
//   {...register("username")}
// />
\`\`\`

这个模式是 React Hook Form + UI 库的标准用法——把库的 props 全部透传，叠加业务字段（label、helpText、errorMessage），让表单代码更清爽。

## 8. 多组件统一扩展：generic 工具

如果团队里大量组件都要加 \`permission\` 字段，写一个高阶工具：

\`\`\`tsx
import type { ComponentPropsWithoutRef, ElementType } from "react";

// 工具类型：给任意组件的 props 加上 permission 字段
type WithPermission<C extends ElementType> = ComponentPropsWithoutRef<C> & {
  permission?: string;
};

// 高阶组件：包装任意组件，加上权限检查
function withPermission<C extends ElementType>(Component: C) {
  const Wrapped = ({ permission, ...rest }: WithPermission<C>) => {
    const hasPermission = (perm?: string) => {
      if (!perm) return true;
      return perm === "admin"; // 简化
    };

    if (!hasPermission(permission)) {
      return null; // 没权限直接不渲染
    }

    // 注意：这里要 cast 一下，因为 TS 不知道 Component 的 props 类型
    const ComponentAny = Component as React.ComponentType<any>;
    return <ComponentAny {...rest} />;
  };

  return Wrapped;
}

// 使用：包装 Mantine Button
import { Button } from "@mantine/core";
const AuthButton = withPermission(Button);

// <AuthButton permission="admin" color="red">删除</AuthButton>
\`\`\`

\`WithPermission<C>\` 是一个泛型工具类型，它把任意组件的 props 加上 \`permission\` 字段。这种"类型工具 + 高阶组件"的组合，是大型项目复用类型逻辑的标准做法。

## 小结

- \`ComponentProps<typeof Component>\` 提取组件 props 类型，是包装第三方组件的基础。
- 扩展 Mantine / Antd 组件：\`interface BizProps extends LibProps\` 加业务字段。
- \`WithDefaults<T, K>\` 把可选字段改成必填，强制调用方传值。
- theme 配置：Mantine 用 \`createTheme\`，Antd 用 \`ConfigProvider\`，都有完整类型提示。
- \`ElementRef<typeof Component>\` 反推 ref 类型，比手写 \`HTMLButtonElement\` 更安全。
- 高阶组件配合泛型工具类型，能复用"权限 / 日志 / 性能监控"等横切逻辑。

## 避坑清单

- ❌ 手动复制第三方组件的所有 props（应该 \`extends LibProps\`）
- ❌ forwardRef 包裹第三方组件时用错 ref 类型（应该用 \`ElementRef<typeof C>\`）
- ❌ 改了默认 props 但没在类型上体现（应该用 \`WithDefaults\` 强制必填）
- ❌ 高阶组件丢失原组件 props 类型（应该用泛型 \`<C extends ElementType>\` 保留）
- ❌ 不看 UI 库自带的 \`*.d.ts\`，自己瞎猜 props 类型（应该直接 import 库导出的类型）

样式方案这一部分到这里结束。下一部分我们进入"测试"——Jest、RTL、Playwright。`
  },
];

export { chapters };
