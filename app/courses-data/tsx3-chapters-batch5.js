// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第五批章节
// -------------------------------------------------------------
// 覆盖：第三部分 React + TS 工程基础（上半）
// 包含 5 个章节：ch19 ~ ch23
//
// 章节范围：
//   - ch19 创建 Vite + React + TS 项目（脚手架、tsconfig、vite-env.d.ts）
//   - ch20 JSX 与类型系统（JSX 命名空间、ReactElement vs ReactNode）
//   - ch21 函数组件与 React.FC（React.FC 的利弊、返回类型）
//   - ch22 Props 类型设计模式（interface vs type、默认值、style/className）
//   - ch23 Children 与 ReactNode（ReactNode 全家族、嵌套 children）
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 语言简洁、直击要点，避免堆砌
//   - 每章至少 1 个 React 组件 demo
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch19: 创建 Vite + React + TS 项目
  // ============================================================
  {
    id: "tsx3-ch19",
    group: "第三部分 React + TS 工程基础",
    icon: "⚙️",
    title: "ch19 创建 Vite + React + TS 项目",
    content: `# ch19 创建 Vite + React + TS 项目

## 为什么从脚手架讲起

前 18 章我们一直在写零散的 TS 片段，从这章开始进入"真实项目"——你需要一个能跑起来的工程：编译、热更新、类型检查、环境变量、产物打包。Vite 是当下最快的 React 脚手架，本章把"从零到能开发"的所有配置讲透。

## 1. 创建项目

\`\`\`bash
# 使用 npm 7+ 创建 Vite + React + TS 项目
npm create vite@latest my-app -- --template react-ts

# 进入目录并安装依赖
cd my-app
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
\`\`\`

\`--template react-ts\` 这一段是关键，它告诉 Vite 用 React + TypeScript 模板。如果只写 \`react\` 会得到 JS 项目，后面改造 TS 很麻烦。

## 2. 目录结构详解

\`\`\`
my-app/
├── node_modules/         # 依赖（不要手改）
├── public/               # 静态资源（直接拷贝到产物，不经过编译）
│   └── vite.svg
├── src/                  # 源代码（你写代码的地方）
│   ├── assets/           # 会被 Vite 处理的资源（图片、字体）
│   ├── App.tsx           # 根组件
│   ├── App.css           # 根组件样式
│   ├── index.css         # 全局样式
│   ├── main.tsx          # 入口文件（挂载 React 到 DOM）
│   └── vite-env.d.ts     # Vite 类型声明文件
├── .eslintrc.cjs         # ESLint 配置
├── index.html            # HTML 模板（Vite 入口）
├── package.json          # 依赖与脚本
├── tsconfig.json         # TS 配置（应用代码）
├── tsconfig.node.json    # TS 配置（vite.config.ts 用）
└── vite.config.ts        # Vite 配置
\`\`\`

注意 \`public/\` 和 \`src/assets/\` 的区别：\`public/\` 里的文件**不经过编译**，引用时用绝对路径 \`/vite.svg\`；\`src/assets/\` 里的文件**会被 Vite 处理**（加 hash、转 base64），用 import 引入。

## 3. main.tsx 入口文件

\`\`\`tsx
// src/main.tsx
// 入口文件：把 React 应用挂载到 DOM 上

// 引入 React 18 的新 API：createRoot（替代了旧的 ReactDOM.render）
import { createRoot } from "react-dom/client";

// 引入根组件
import App from "./App";

// 引入全局样式（CSS 文件可以被 TS 当模块导入）
import "./index.css";

// 找到 #root 元素（在 index.html 里）
// ! 是非空断言：告诉 TS 这个元素一定存在
const rootElement = document.getElementById("root")!;

// 创建 React Root 并渲染 App
// StrictMode 是开发模式工具：会故意双调用函数组件来暴露副作用问题
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
\`\`\`

## 4. tsconfig.json 关键配置

\`\`\`json
// tsconfig.json（精简展示关键部分）
{
  "compilerOptions": {
    "target": "ES2020",              // 编译目标 JS 版本
    "useDefineForClassFields": true, // 类字段用 ES 标准 define 语义
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 启用的类型库
    "module": "ESNext",              // 模块系统（Vite 用 ESM）
    "skipLibCheck": true,            // 跳过 .d.ts 检查加速编译

    /* Bundler 模式 */
    "moduleResolution": "bundler",   // TS 5 新模式，配合 Vite
    "allowImportingTsExtensions": true, // 允许 import "./x.ts"
    "resolveJsonModule": true,       // 允许 import json 文件
    "isolatedModules": true,         // 每个文件独立编译（Vite 要求）
    "noEmit": true,                  // 不输出 JS（Vite 负责打包）
    "jsx": "react-jsx",              // JSX 编译模式：React 17+ 新模式

    /* 严格选项（全部开启） */
    "strict": true,
    "noUnusedLocals": true,          // 未使用的变量报错
    "noUnusedParameters": true,      // 未使用的参数报错
    "noFallthroughCasesInSwitch": true // switch 必须 break/return
  },
  "include": ["src"]                 // 只编译 src 目录
}
\`\`\`

重点关注：

- \`jsx: "react-jsx"\`：React 17+ 的新 JSX 转换，**不需要每个文件 import React**。
- \`moduleResolution: "bundler"\`：TS 5 的新模式，专为 Vite/webpack 这类打包器设计。
- \`noEmit: true\`：TS 只做类型检查，不输出 JS——打包由 Vite 负责。

## 5. vite-env.d.ts：Vite 的类型声明

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
\`\`\`

这一行三斜杠指令引入了 Vite 自带的类型声明。它做了两件事：

1. 声明 \`import.meta.env\` 的类型（环境变量访问）。
2. 声明 \`*.svg\`、\`*.png\` 等静态资源的 import 类型。

没有这个文件，你在代码里写 \`import logo from "./logo.svg"\` 会报"找不到模块"。

## 6. 环境变量类型扩展

Vite 把以 \`VITE_\` 开头的环境变量暴露给前端代码。在代码里用 \`import.meta.env.VITE_XXX\` 访问：

\`\`\`ts
// 默认情况下 import.meta.env 是个宽松的类型
// 任何 VITE_XXX 都返回 string | undefined
const apiKey = import.meta.env.VITE_API_KEY; // string | undefined
\`\`\`

但如果你想要**严格的类型提示**（避免拼写错误），可以扩展 Vite 的类型：

\`\`\`ts
// src/vite-env.d.ts（扩展后）
/// <reference types="vite/client" />

// 用 interface 合并到 ImportMetaEnv 上
interface ImportMetaEnv {
  // 列出所有你用到的环境变量
  readonly VITE_API_KEY: string;        // 后端 API 地址
  readonly VITE_APP_TITLE: string;      // 应用标题
  readonly VITE_ENABLE_MOCK?: boolean;  // 是否开启 mock
}

// 让 import.meta.env 的类型包含上面的字段
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
\`\`\`

现在写代码时：

\`\`\`tsx
// 现在有自动补全和拼写检查
function App() {
  // ✅ 有补全：VITE_API_KEY / VITE_APP_TITLE / VITE_ENABLE_MOCK
  const apiKey = import.meta.env.VITE_API_KEY;

  // ❌ 报错：VITE_APIKEY 拼错了
  // const bad = import.meta.env.VITE_APIKEY;

  return <div>{import.meta.env.VITE_APP_TITLE}</div>;
}
\`\`\`

## 7. 在 .env 文件里定义变量

\`\`\`bash
# .env（所有环境都加载）
VITE_APP_TITLE=我的应用

# .env.development（npm run dev 时加载）
VITE_API_KEY=dev-api-key-123

# .env.production（npm run build 时加载）
VITE_API_KEY=prod-api-key-456
\`\`\`

> **避坑**：\`VITE_\` 前缀的变量会被打包进产物，**任何能在浏览器看到的人都能看到**。绝不要把数据库密码、第三方服务的 secret 放在前端环境变量里。

## 8. 一个完整的最小 demo

\`\`\`tsx
// src/App.tsx
// 一个使用环境变量的最小 React 组件

// 定义 props 类型（第 22 章会详细讲）
interface AppProps {
  title?: string; // 可选 props，默认用环境变量里的标题
}

function App({ title }: AppProps) {
  // 从环境变量读取标题，如果传了 props 就用 props
  const finalTitle = title ?? import.meta.env.VITE_APP_TITLE;

  return (
    <div>
      <h1>{finalTitle}</h1>
      <p>API Key: {import.meta.env.VITE_API_KEY}</p>
    </div>
  );
}

export default App;
\`\`\`

## 小结

- 用 \`npm create vite@latest -- --template react-ts\` 一键创建 TS+React 项目。
- \`tsconfig.json\` 里 \`jsx: "react-jsx"\` 是 React 17+ 的新模式，不需要 import React。
- \`vite-env.d.ts\` 引入 Vite 类型声明，扩展 \`ImportMetaEnv\` 可以让环境变量有类型提示。
- 环境变量必须以 \`VITE_\` 开头才会暴露给前端，但**不要放敏感信息**。

## 避坑清单

- ❌ 创建项目时漏掉 \`--template react-ts\`（会得到 JS 项目）
- ❌ 在前端环境变量里放密钥（应该走后端代理）
- ❌ 删掉 \`vite-env.d.ts\`（会导致 import 静态资源报错）
- ❌ 改了 \`tsconfig.json\` 不重启 VSCode（应该重启 TS Server）
- ❌ 在 \`public/\` 里放需要被 import 的资源（应该放 \`src/assets/\`）

下一章我们深入 JSX 与类型系统——理解 \`JSX.Element\` 到底是什么。`
  },

  // ============================================================
  // ch20: JSX 与类型系统
  // ============================================================
  {
    id: "tsx3-ch20",
    group: "第三部分 React + TS 工程基础",
    icon: "🧬",
    title: "ch20 JSX 与类型系统",
    content: `# ch20 JSX 与类型系统

## 为什么讲 JSX 类型

你每天写 \`<div />\`、\`<App />\`，但有没有想过：**这些 JSX 在 TypeScript 眼里是什么类型？** 为什么函数组件返回 \`<div />\` 不报错，但返回 \`undefined\` 就报错？理解 JSX 的类型系统，能让你写出更精确的组件签名、看懂第三方库的类型定义。

## 1. JSX 在 TS 里到底是什么

TS 把 JSX 看成"调用 React.createElement 的语法糖"。下面两段代码等价：

\`\`\`tsx
// JSX 写法
const el = <div className="box">hello</div>;

// 等价的createElement 写法
const el = React.createElement(
  "div",
  { className: "box" },
  "hello"
);
\`\`\`

\`React.createElement\` 的返回值类型是 \`ReactElement\`。所以 \`<div />\` 的类型就是 \`ReactElement\`。

## 2. JSX.Element 是什么

\`\`\`ts
// React 类型定义里的大致结构（简化版）
namespace JSX {
  interface Element extends React.ReactElement<any, any> {
    // ...
  }
}
\`\`\`

简单说：

- \`React.ReactElement\` 是 React 内部的"虚拟 DOM 节点"类型。
- \`JSX.Element\` 是 JSX 表达式的类型，**默认等同于 \`ReactElement\`**。

为什么有两个名字？因为 JSX 是规范，React 是实现。理论上你可以让 Vue 也用 JSX，那 \`JSX.Element\` 就指向 Vue 的 VNode。

## 3. ReactElement vs ReactNode：最容易混淆的一对

\`\`\`ts
// React 内部类型定义（简化）
interface ReactElement {
  type: string | Function;  // 标签名或组件函数
  props: any;               // 属性对象
  key: Key | null;          // 列表 key
}

// ReactNode 是一个"宽松"的联合类型
type ReactNode =
  | ReactElement     // 一个 React 元素
  | string           // 文本
  | number           // 数字
  | ReactFragment    // Fragment
  | ReactPortal      // createPortal 的返回
  | null
  | undefined
  | boolean;         // React 18+ 支持
\`\`\`

**关键区别**：

- \`ReactElement\` 只指"一个 React 元素"（\`<div />\`、\`<App />\`）。
- \`ReactNode\` 涵盖"任何能被 React 渲染的东西"，包括字符串、数字、null。

记住这条规则：**函数组件返回 \`ReactElement\`，children 用 \`ReactNode\`**。

## 4. 函数组件的返回类型

\`\`\`tsx
// ✅ 正确：返回 ReactElement
function Header(): React.ReactElement {
  return <h1>Title</h1>;
}

// ✅ 也正确：返回 ReactNode（更宽松）
function Header2(): React.ReactNode {
  if (condition) return null; // 允许返回 null
  return <h1>Title</h1>;
}

// ❌ 报错：返回 undefined 不在 ReactElement 里
function Bad(): React.ReactElement {
  if (condition) return undefined; // ❌ undefined 不能赋给 ReactElement
  return <h1>Title</h1>;
}
\`\`\`

实际开发中你**很少需要显式标注返回类型**——TS 会自动推断。但在写公共组件库时，显式标注能让 API 更清晰。

## 5. children 的几种类型

\`\`\`tsx
// 1. 单个 ReactElement
function Card({ children }: { children: React.ReactElement }) {
  return <div className="card">{children}</div>;
}
// 使用：<Card><p>hello</p></Card>

// 2. ReactNode（最常用，什么都能塞）
function Card2({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
// 使用：<Card2>hello {count} {<span>x</span>}</Card2>

// 3. 数组（不推荐，更复杂）
function List({ children }: { children: React.ReactNode[] }) {
  return <ul>{children}</ul>;
}
\`\`\`

99% 的情况用 \`React.ReactNode\`——它最宽松，文本、元素、null 都能塞。

## 6. key 和 ref 的特殊性

\`\`\`tsx
// 你给组件传 key，但 props 里访问不到
function Item({ id }: { id: number }) {
  // console.log(props.key); // ❌ 报错：key 不在 props 里
  return <li>{id}</li>;
}

// 使用：
function App() {
  return (
    <ul>
      {[1, 2, 3].map(id => (
        // key 是 React 内部用的，不会传给 Item 的 props
        <Item key={id} id={id} />
      ))}
    </ul>
  );
}
\`\`\`

React 故意把 \`key\` 和 \`ref\` 从 props 里"剥离"出来。如果你在 props 类型里写 \`key?: any\`，TS 会警告：

\`\`\`tsx
// ❌ 不推荐：手动声明 key
interface BadProps {
  key?: string; // 警告：key 是内置属性，不要手动声明
  name: string;
}
\`\`\`

正确做法是**不要在 props 里写 key/ref**，它们由 React 自动处理。

## 7. 一个 demo：精确控制组件返回类型

\`\`\`tsx
// 一个只渲染文本的组件，返回类型严格限定为 ReactElement
function Text({ content }: { content: string }): React.ReactElement {
  // 必须返回一个元素，不能是 null/undefined
  return <span>{content}</span>;
}

// 一个条件渲染组件，返回类型用 ReactNode（允许 null）
function Maybe({ show, children }: {
  show: boolean;
  children: React.ReactNode;
}): React.ReactNode {
  if (!show) return null; // ReactNode 允许 null
  return <div>{children}</div>;
}

// 使用：
function App() {
  return (
    <>
      <Text content="hello" />
      <Maybe show={false}>hidden</Maybe>
    </>
  );
}
\`\`\`

## 8. JSX 命名空间扩展

你可以扩展 \`JSX\` 命名空间来给所有 JSX 元素加属性（少用，但有时有用）：

\`\`\`tsx
// 给所有 JSX 元素加一个自定义属性 data-testid
declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicAttributes {
      "data-testid"?: string;
    }
  }
}

// 现在所有元素都能用 data-testid
function App() {
  return <div data-testid="app-root">hello</div>;
}
\`\`\`

> **避坑**：这种全局扩展会影响所有 JSX 元素，慎用。多数情况下应该用 wrapper 组件。

## 小结

- JSX 在 TS 里被看作 \`React.createElement\` 的语法糖，表达式类型是 \`JSX.Element\`。
- \`ReactElement\` 只指"一个 React 元素"，\`ReactNode\` 涵盖"任何可渲染的值"。
- 函数组件返回 \`ReactElement\`（或靠推断），children 用 \`ReactNode\`。
- \`key\` 和 \`ref\` 是 React 内部属性，不要在 props 类型里手动声明。

## 避坑清单

- ❌ 在 props 类型里写 \`key?: string\`（应该让 React 自己处理）
- ❌ 函数组件返回 \`undefined\` 却标注 \`ReactElement\`（应该改成 \`ReactNode\` 或保证返回元素）
- ❌ children 用 \`ReactElement\`（应该用 \`ReactNode\`，因为可能传文本）
- ❌ 不区分 \`ReactElement\` 和 \`ReactNode\` 导致边界场景报错

下一章我们看函数组件的类型与 \`React.FC\` 的争议。`
  },

  // ============================================================
  // ch21: 函数组件与 React.FC
  // ============================================================
  {
    id: "tsx3-ch21",
    group: "第三部分 React + TS 工程基础",
    icon: "🧩",
    title: "ch21 函数组件与 React.FC",
    content: `# ch21 函数组件与 React.FC

## 为什么讲 React.FC

打开任何一个老一点的开源项目，你会看到大量 \`React.FC\`——它是 React 官方提供的"函数组件类型"。但**React 18 之后官方不再推荐它**，社区也分裂成两派。这一章把利弊讲清楚，让你有自己的判断。

## 1. 不用 React.FC 的最简写法

\`\`\`tsx
// 最朴素的写法：直接在参数里写 props 类型
function Button({ label, onClick }: {
  label: string;
  onClick: () => void;
}) {
  return <button onClick={onClick}>{label}</button>;
}

// 箭头函数写法（等价）
const Button2 = ({ label, onClick }: {
  label: string;
  onClick: () => void;
}) => {
  return <button onClick={onClick}>{label}</button>;
};
\`\`\`

这就是一个完整的函数组件。**不需要任何 React 提供的工具类型**——TS 自带的类型注解就够用。

## 2. React.FC 是什么

\`\`\`tsx
// React 类型定义里大致这样（简化版）
type FC<P = {}> = (props: P) => React.ReactElement | null;
\`\`\`

\`React.FC\` 是一个泛型类型，接收 props 类型 \`P\`，返回一个"返回 ReactElement 或 null 的函数"。

用法：

\`\`\`tsx
// 用 React.FC 标注
const Button: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => {
  return <button onClick={onClick}>{label}</button>;
};
\`\`\`

## 3. React.FC 自动带 children 吗

**React 18 之前**：\`React.FC\` 自动给 props 加 \`children?: ReactNode\`。
**React 18 之后**：不再自动加，必须显式声明。

\`\`\`tsx
// React 18：children 不会自动出现
const Card: React.FC<{ title: string }> = ({ title, children }) => {
  // ❌ 报错：children 不在 props 类型里
  return <div><h2>{title}</h2>{children}</div>;
};

// 正确写法：显式声明 children
const Card2: React.FC<{ title: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  return <div><h2>{title}</h2>{children}</div>;
};
\`\`\`

这是 React 18 故意改的——让 \`React.FC\` 更"诚实"，不再隐式注入。

## 4. 为什么不推荐 React.FC

社区主流观点反对 \`React.FC\`，原因有三个：

**1. 显式标注是冗余**

\`\`\`tsx
// ❌ 用 React.FC：写一遍类型，再标一遍 FC
const Button: React.FC<ButtonProps> = (props) => { ... };

// ✅ 不用：函数声明天然能推断
function Button(props: ButtonProps) { ... }
\`\`\`

**2. 泛型组件无法用 React.FC**

\`\`\`tsx
// 一个泛型 List 组件：接收任意类型的数组
// ❌ React.FC 不支持泛型
const List: React.FC<{ items: T[] }> = <T,>(props) => { ... }; // 报错

// ✅ 函数声明支持泛型
function List<T>({ items }: { items: T[] }) {
  return <ul>{items.map((item, i) => <li key={i}>{String(item)}</li>)}</ul>;
}
\`\`\`

**3. 默认参数与 defaultProps 不友好**

\`\`\`tsx
// 用 React.FC + defaultProps（React 18 已废弃 defaultProps 对函数组件的支持）
const Button: React.FC<ButtonProps> = (props) => { ... };
Button.defaultProps = { variant: "primary" }; // ❌ 已废弃

// 不用 React.FC，直接在参数里写默认值
function Button({ variant = "primary", ...rest }: ButtonProps) {
  return <button className={\`btn-\${variant}\`} {...rest} />;
}
\`\`\`

## 5. PFC（PropsOnly FC）变种

有些团队用 \`React.PFC\` 或自定义类型来表示"不带 children 的纯 props 组件"：

\`\`\`tsx
// 自己定义一个 PFC 类型（如果团队喜欢）
type PFC<P = {}> = (props: P) => React.ReactElement;

// 使用：保证一定返回元素，不能返回 null
const Header: PFC<{ title: string }> = ({ title }) => {
  return <h1>{title}</h1>;
};
\`\`\`

这种写法比 \`React.FC\` 更严格（不允许 null），但本质还是冗余标注。**不推荐新人使用**。

## 6. 推荐的写法：函数声明

\`\`\`tsx
// 推荐：函数声明 + interface 定义 props
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

function Button({ label, variant = "primary", onClick }: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
\`\`\`

为什么推荐函数声明？

1. **支持泛型**：能写 \`function List<T>(...)\`。
2. **支持默认值**：直接在参数解构里写 \`variant = "primary"\`。
3. **类型推断**：返回值类型自动推断为 \`ReactElement | null\`。
4. **可读性**：函数声明比箭头函数更"声明式"。

## 7. 显式标注返回值（公共组件才需要）

\`\`\`tsx
// 内部组件：靠推断就行
function InternalButton(props: ButtonProps) {
  return <button>{props.label}</button>;
}

// 公共组件库：建议显式标注返回类型
function PublicButton(props: ButtonProps): React.ReactElement {
  return <button>{props.label}</button>;
  // 如果哪天有人改成 return null，TS 会报错
}
\`\`\`

显式标注的好处：**防止实现意外改变返回类型**。当你写一个被外部依赖的组件库时，返回类型是 API 的一部分。

## 8. 一个完整 demo：对比三种写法

\`\`\`tsx
// 写法 1：函数声明（推荐）
function Card1({ title, children }: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// 写法 2：React.FC（不推荐，但能跑）
const Card2: React.FC<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
};

// 写法 3：interface + 函数声明（最推荐）
interface CardProps {
  title: string;
  children?: React.ReactNode;
}

function Card3({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// 三种使用方式完全一样
function App() {
  return (
    <>
      <Card1 title="A">content</Card1>
      <Card2 title="B">content</Card2>
      <Card3 title="C">content</Card3>
    </>
  );
}
\`\`\`

## 小结

- \`React.FC\` 是 React 提供的函数组件类型，但**官方不再推荐**。
- 不推荐原因：标注冗余、不支持泛型、与默认值/defaultProps 不友好。
- React 18 之后 \`React.FC\` 不再自动带 children，必须显式声明。
- 推荐：**函数声明 + interface 定义 props**，简单清晰、支持泛型。
- 公共组件库可以显式标注返回类型 \`React.ReactElement\`。

## 避坑清单

- ❌ 在函数组件上用 \`defaultProps\`（React 18 已废弃，应在参数解构里写默认值）
- ❌ 给泛型组件用 \`React.FC\`（不支持泛型，应该用函数声明）
- ❌ 期待 \`React.FC\` 自动带 children（React 18 之后不会了）
- ❌ 内部组件也显式标注返回类型（推断就够了，公共组件才需要标注）

下一章我们看 Props 类型设计的几种模式。`
  },

  // ============================================================
  // ch22: Props 类型设计模式
  // ============================================================
  {
    id: "tsx3-ch22",
    group: "第三部分 React + TS 工程基础",
    icon: "🎨",
    title: "ch22 Props 类型设计模式",
    content: `# ch22 Props 类型设计模式

## 为什么讲 Props 设计

React 组件的 API 设计就是 Props 类型设计——好的 Props 让组件易用、难用错；坏的 Props 让人每次调用都要查文档。这一章把主流的 Props 类型模式过一遍，让你写组件时有"套路"可循。

## 1. inline 类型 vs interface vs type

\`\`\`tsx
// 写法 1：inline 类型（适合超简单组件）
function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}

// 写法 2：interface（适合被复用、被扩展的 props）
interface ButtonProps {
  label: string;
  onClick?: () => void;
}
function Button2({ label, onClick }: ButtonProps) { ... }

// 写法 3：type（适合联合类型、工具类型结果）
type ButtonProps2 = {
  label: string;
  variant?: "primary" | "secondary";
};
\`\`\`

选型规则：

- **单文件用一次**：inline 即可，省一层抽象。
- **会被复用/扩展**：用 interface（可被 extends）。
- **需要联合类型/工具类型**：用 type。

## 2. 可选 props：用 ?

\`\`\`tsx
interface UserCardProps {
  name: string;          // 必填
  age?: number;          // 可选
  avatar?: string;       // 可选
  bio?: string;          // 可选
}

function UserCard({ name, age, avatar, bio }: UserCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      {age && <p>年龄：{age}</p>}
      {avatar && <img src={avatar} alt={name} />}
      {bio && <p>{bio}</p>}
    </div>
  );
}

// 使用：可以只传 name
<UserCard name="Alice" />
\`\`\`

## 3. 默认值的两种写法

\`\`\`tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary"; // 可选
  size?: "sm" | "md" | "lg";         // 可选
}

// 写法 1：参数解构里直接赋默认值（推荐）
function Button({ label, variant = "primary", size = "md" }: ButtonProps) {
  return (
    <button className={\`btn btn-\${variant} btn-\${size}\`}>
      {label}
    </button>
  );
}

// 使用：
<Button label="保存" />              {/* variant="primary", size="md" */}
<Button label="取消" variant="secondary" />
\`\`\`

**为什么不在 interface 里写默认值？** 因为 TS 的 interface 只描述"类型"，不描述"值"。默认值是运行时行为，只能在函数参数里写。

## 4. children 的标准类型

\`\`\`tsx
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode; // 最常用：什么都能塞
}

function Layout({ children }: LayoutProps) {
  return <div className="layout">{children}</div>;
}

// 三种 children 类型选择：
// - ReactNode：最宽松，文本/元素/null 都行（默认推荐）
// - ReactElement：只允许一个 React 元素（严格场景）
// - ReactElement[]：允许元素数组（少见）
\`\`\`

## 5. style 和 className 的标准写法

\`\`\`tsx
import type { CSSProperties } from "react";

interface BoxProps {
  // className 用 string（不要用更复杂的类型）
  className?: string;

  // style 用 CSSProperties（React 内置类型，对应 CSS 属性）
  style?: CSSProperties;

  children?: ReactNode;
}

function Box({ className, style, children }: BoxProps) {
  return (
    <div
      // 拼接 className（如果团队用 clsx，这里换成 clsx(className)）
      className={\`box \${className ?? ""}\`}
      // 直接透传 style 对象
      style={style}
    >
      {children}
    </div>
  );
}

// 使用：
<Box
  className="highlight"
  style={{ padding: 16, backgroundColor: "#f0f0f0" }}
>
  内容
</Box>
\`\`\`

\`CSSProperties\` 会给你完整的属性补全（\`padding\`、\`margin\`、\`color\`…），还能检查值类型。

\`\`\`tsx
// CSSProperties 的好处：写错属性名会报错
const badStyle: React.CSSProperties = {
  // paddding: 16, // ❌ 报错：拼错了
  padding: 16,    // ✅
  color: "red",   // ✅
  // backgroundColor: "rad": // ❌ 报错：值类型不对
};
\`\`\`

## 6. 事件处理函数的类型

\`\`\`tsx
interface InputProps {
  // onChange 事件用 React.ChangeEvent
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onClick 事件用 React.MouseEvent
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function CustomInput({ onChange, onClick }: InputProps) {
  return (
    <div>
      <input onChange={onChange} />
      <button onClick={onClick}>提交</button>
    </div>
  );
}
\`\`\`

记住事件类型的命名规则：\`React.{事件名}Event<HTML元素类型>\`。

## 7. 继承原生 HTML 属性

\`\`\`tsx
// 让组件继承 button 的所有原生属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

function Button({ variant = "primary", size = "md", ...rest }: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      {...rest} // 透传所有原生属性（onClick、disabled、type 等）
    />
  );
}

// 使用：可以传任何 button 支持的属性
<Button variant="primary" onClick={() => {}} disabled type="submit">
  保存
</Button>
\`\`\`

这是写"基础组件库"的标准模式。\`React.ButtonHTMLAttributes\`、\`React.InputHTMLAttributes\`、\`React.DivHTMLAttributes\` 等覆盖所有原生元素。

## 8. 联合类型 + 字面量模式

\`\`\`tsx
// 一个 Button 组件支持两种变体，每种变体的 props 不同
interface PrimaryButtonProps {
  variant: "primary";
  // primary 专属：链接跳转
  href: string;
}

interface SecondaryButtonProps {
  variant: "secondary";
  // secondary 专属：点击事件
  onClick: () => void;
}

// 联合类型：根据 variant 字段决定其他 props
type SmartButtonProps = PrimaryButtonProps | SecondaryButtonProps;

function SmartButton(props: SmartButtonProps) {
  if (props.variant === "primary") {
    // 这里 TS 知道 props 有 href
    return <a href={props.href} className="btn-primary">跳转</a>;
  }
  // 这里 TS 知道 props 有 onClick
  return <button onClick={props.onClick} className="btn-secondary">点击</button>;
}

// 使用：
<SmartButton variant="primary" href="/home" />
<SmartButton variant="secondary" onClick={() => alert("hi")} />
\`\`\`

这种"判别联合"模式在做复杂组件时非常有用，TS 能根据 \`variant\` 字段自动收窄类型。

## 9. 一个综合 demo：卡片组件

\`\`\`tsx
import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  variant?: "default" | "highlight" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: () => void;
}

function Card({
  title,
  description,
  image,
  variant = "default",
  size = "md",
  className,
  style,
  children,
  onClick,
}: CardProps) {
  const sizeMap = { sm: 8, md: 16, lg: 24 };

  return (
    <div
      className={\`card card-\${variant} \${className ?? ""}\`}
      style={{ padding: sizeMap[size], ...style }}
      onClick={onClick}
    >
      {image && <img src={image} alt={title} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

// 使用：
function App() {
  return (
    <Card
      title="React + TS"
      description="从入门到精通"
      variant="highlight"
      size="lg"
      onClick={() => console.log("clicked")}
    >
      <button>了解更多</button>
    </Card>
  );
}
\`\`\`

## 小结

- Props 类型三选一：inline（简单）、interface（可扩展）、type（联合/工具类型）。
- 可选用 \`?\`，默认值在参数解构里写（不要用 defaultProps）。
- children 用 \`ReactNode\`，style 用 \`CSSProperties\`，className 用 \`string\`。
- 基础组件库用 \`extends React.XxxHTMLAttributes\` 继承原生属性。
- 复杂组件用判别联合（tagged union）让 props 根据某个字段切换。

## 避坑清单

- ❌ 用 \`defaultProps\`（应该用参数默认值）
- ❌ style 用 \`object\` 类型（应该用 \`CSSProperties\` 才有补全和检查）
- ❌ className 用 \`string & {}\` 之类的奇怪类型（应该直接用 \`string\`）
- ❌ 不继承原生属性导致组件难用（应该 \`extends React.XxxHTMLAttributes\`）
- ❌ 把所有 props 都设可选（应该明确必填项）

下一章我们深入 \`ReactNode\` 全家族——理解 React 能渲染哪些东西。`
  },

  // ============================================================
  // ch23: Children 与 ReactNode
  // ============================================================
  {
    id: "tsx3-ch23",
    group: "第三部分 React + TS 工程基础",
    icon: "🌳",
    title: "ch23 Children 与 ReactNode",
    content: `# ch23 Children 与 ReactNode

## 为什么单独讲 Children

children 是 React 组件最特殊的 prop——它是"组件标签内部的内容"。理解 children 的类型家族，能让你写出能正确处理嵌套、列表、条件渲染的容器组件。这一章把 React 能渲染的所有值类型一次讲清。

## 1. ReactNode 全家族

\`\`\`ts
// React 内部类型定义（简化版）
type ReactNode =
  | ReactElement        // 一个 React 元素：<div />、<App />
  | string              // 文本："hello"
  | number              // 数字：42
  | Iterable<ReactNode> // 可迭代对象（数组、Set 等）
  | ReactPortal         // createPortal 的返回值
  | boolean             // true/false（true 渲染空，false 渲染空）
  | null                // 不渲染
  | undefined;          // 不渲染
\`\`\`

记住这条：**ReactNode 涵盖"任何 React 能渲染的东西"**。

## 2. ReactElement vs ReactNode

\`\`\`tsx
// ReactElement：只指"一个 React 元素对象"
const el: React.ReactElement = <div>hello</div>; // ✅

// ReactNode：什么都能塞
const n1: React.ReactNode = <div>hello</div>;   // ✅ 元素
const n2: React.ReactNode = "hello";            // ✅ 字符串
const n3: React.ReactNode = 42;                 // ✅ 数字
const n4: React.ReactNode = null;               // ✅ null
const n5: React.ReactNode = true;               // ✅ boolean

// ReactElement 不接受非元素
// const bad: React.ReactElement = "hello"; // ❌ 报错
\`\`\`

**判别规则**：

- 用 \`ReactElement\` 当你想"确保这是一个元素"（比如要 cloneElement）。
- 用 \`ReactNode\` 当你想"任何东西都能渲染"（children 的默认选择）。

## 3. children 类型选择

\`\`\`tsx
// 1. ReactNode（默认推荐）
interface CardProps {
  children?: React.ReactNode;
}
// 使用：<Card>文本 {count} {<span>x</span>}</Card>

// 2. ReactElement（严格场景，比如 Layout 组件）
interface SingleChildProps {
  children: React.ReactElement;
}
// 使用：<SingleChild><p>only one</p></SingleChild>
// ❌ 报错：<SingleChild>多个<span>元素</span></SingleChild>

// 3. ReactElement[]（允许多个元素）
interface ListProps {
  children: React.ReactElement[];
}
// 使用：<List><li>1</li><li>2</li></List>
\`\`\`

99% 场景用 \`ReactNode\`——它最宽松，不会有边界报错。

## 4. 嵌套 children 模式

\`\`\`tsx
import type { ReactNode } from "react";

// 一个 Dialog 组件：header / body / footer 都是 ReactNode
interface DialogProps {
  header: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
}

function Dialog({ header, body, footer }: DialogProps) {
  return (
    <div className="dialog">
      <div className="dialog-header">{header}</div>
      <div className="dialog-body">{body}</div>
      {footer && <div className="dialog-footer">{footer}</div>}
    </div>
  );
}

// 使用：每个 slot 都可以塞任意内容
function App() {
  return (
    <Dialog
      header={<h2>确认删除</h2>}
      body={
        <>
          <p>该操作不可撤销。</p>
          <p>确认要删除这条数据吗？</p>
        </>
      }
      footer={
        <>
          <button>取消</button>
          <button>确认</button>
        </>
      }
    />
  );
}
\`\`\`

这种"具名 children"模式比单一的 \`children\` prop 更适合复杂容器组件。

## 5. Children 数组的 key 警告

\`\`\`tsx
// ❌ 数组里渲染多个元素没有 key 会报警告
function BadList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map(item => (
        <li>{item}</li> // ⚠️ 警告：缺少 key
      ))}
    </ul>
  );
}

// ✅ 数组渲染必须加 key
function GoodList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li> // ✅ 有 key
      ))}
    </ul>
  );
}
\`\`\`

key 不是给开发者用的，是给 React diff 算法用的——它帮 React 识别"哪个元素变了"。

## 6. 用 React.Children 处理 children

\`\`\`tsx
import { Children } from "react";

// 统计 children 数量（兼容多种写法）
function Count({ children }: { children: React.ReactNode }) {
  // Children.count 能正确统计：单个元素算 1，数组算多个
  const count = Children.count(children);
  return <div>共有 {count} 个子元素</div>;
}

// 把 children 转成数组
function Group({ children }: { children: React.ReactNode }) {
  // Children.toArray 会过滤 null/undefined，并自动加 key
  const arr = Children.toArray(children);
  return (
    <div>
      {arr.map((child, i) => (
        <div key={i} className="item">{child}</div>
      ))}
    </div>
  );
}

// 使用：
<Group>
  <p>第一段</p>
  {false && <p>不会渲染</p>}
  <p>第二段</p>
</Group>
\`\`\`

\`React.Children\` 是处理 children 的安全工具——它能正确处理"嵌套数组"、"Fragment"等边界情况。

## 7. cloneElement 修改 children

\`\`\`tsx
import { cloneElement, Children, ReactElement } from "react";

// 给所有 children 加一个 className
interface StyledGroupProps {
  children: ReactElement | ReactElement[];
  className?: string;
}

function StyledGroup({ children, className }: StyledGroupProps) {
  return (
    <>
      {Children.map(children, child => (
        // cloneElement：复制元素并覆盖 props
        cloneElement(child, { className: \`\${child.props.className ?? ""} \${className}\` })
      ))}
    </>
  );
}

// 使用：
<StyledGroup className="highlight">
  <div>1</div>
  <div>2</div>
</StyledGroup>
\`\`\`

> **避坑**：\`cloneElement\` 在 React 19 后被标记为"不推荐"。新项目应优先用 render props 或 context 替代。

## 8. 一个综合 demo：可折叠面板

\`\`\`tsx
import { useState } from "react";
import type { ReactNode } from "react";

interface PanelProps {
  title: ReactNode;       // 标题可以是文本也可以是元素
  children?: ReactNode;   // 内容任意
  defaultOpen?: boolean;  // 默认是否展开
}

function Panel({ title, children, defaultOpen = false }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="panel">
      <button
        className="panel-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span>{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="panel-body">
          {children}
        </div>
      )}
    </div>
  );
}

// 使用：title 可以是字符串，也可以是 JSX
function App() {
  return (
    <>
      <Panel title="基本信息">
        <p>姓名：Alice</p>
        <p>年龄：18</p>
      </Panel>

      <Panel
        title={<strong style={{ color: "blue" }}>高级设置</strong>}
        defaultOpen
      >
        <p>这里配置高级选项</p>
      </Panel>
    </>
  );
}
\`\`\`

注意 \`title: ReactNode\` 让标题既能传字符串又能传 JSX，灵活性高。

## 小结

- \`ReactNode\` 涵盖所有可渲染的值：元素、文本、数字、null、boolean、数组、Portal。
- \`ReactElement\` 只指"一个 React 元素对象"，比 \`ReactNode\` 严格。
- children 默认用 \`ReactNode\`，需要"确保单个元素"时才用 \`ReactElement\`。
- 复杂容器用"具名 children"（header/body/footer 三个 slot）比单一 children 更清晰。
- 处理 children 数组用 \`React.Children\` 工具，能正确处理嵌套和 Fragment。

## 避坑清单

- ❌ children 用 \`ReactElement\` 后传文本报错（应该用 \`ReactNode\`）
- ❌ 数组渲染不加 key（应该每个元素加唯一 key）
- ❌ 用 \`props.children.map\` 处理 children（应该用 \`React.Children.map\`，兼容单元素和数组）
- ❌ 在 props 类型里写 \`key?: string\`（key 由 React 处理，不要手动声明）
- ❌ 用 \`any\` 表示 children（应该用 \`ReactNode\` 才有类型安全）

下一章我们看 forwardRef 与 ref 的类型——这是 React 高级组件的核心模式。`
  },
];

export { chapters };
