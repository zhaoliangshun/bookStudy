export const chapters = [
  {
    id: "tsrx-env",
    group: "准备篇",
    icon: "🛠️",
    title: "环境搭建与工程化入门",
    content: `

# 环境搭建与工程化入门

在正式开始学习 TypeScript + React 之前，我们需要先搭建一套规范、高效的开发环境。本章将带你从零开始创建项目、配置 TypeScript、规划目录结构，并集成 ESLint、Prettier 等工程化工具，为后续的学习打下坚实基础。

## 一、使用 Vite 创建 TS + React 项目

Vite 是新一代前端构建工具，基于原生 ES Modules 和 esbuild/Rollup，启动速度和热更新速度远快于传统的 Webpack/CRA。创建 TypeScript + React 项目只需一条命令：

\`\`\`bash
# 使用 npm 创建项目
npm create vite@latest my-ts-react-app -- --template react-ts

# 进入项目目录
cd my-ts-react-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

如果你使用 pnpm 或 yarn，命令类似：

\`\`\`bash
# pnpm
pnpm create vite my-ts-react-app --template react-ts

# yarn
yarn create vite my-ts-react-app --template react-ts
\`\`\`

创建完成后，项目的 \`package.json\` 大致包含以下核心依赖：

\`\`\`json filename="package.json"
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
\`\`\`

## 二、tsconfig.json 核心配置详解

TypeScript 的行为由 \`tsconfig.json\` 控制。Vite 生成的默认配置已经不错，但我们需要调整几个关键选项来获得最佳开发体验。

\`\`\`json filename="tsconfig.json"
{
  "compilerOptions": {
    // 严格模式：开启所有严格类型检查，强烈建议必须开启
    "strict": true,
    // JSX 编译方式：react-jsx 使用新的 JSX 转换，无需手动 import React
    "jsx": "react-jsx",
    // 编译目标：输出 ES2020 语法，现代浏览器都支持
    "target": "ES2020",
    // 模块系统：使用 ESNext 模块语法（import/export）
    "module": "ESNext",
    // 模块解析策略：bundler 模式适配 Vite/Rollup 的解析方式
    "moduleResolution": "bundler",
    // 启用导入时省略扩展名（.ts/.tsx 可以不写后缀）
    "allowImportingTsExtensions": true,
    // 基础路径：用于配置路径别名
    "baseUrl": ".",
    // 路径别名：@ 指向 src 目录，避免深层嵌套的 ../../
    "paths": {
      "@/*": ["src/*"]
    },
    // 允许导入 JSON 文件
    "resolveJsonModule": true,
    // 隔离模块：确保每个文件可以被单独转译（Vite 要求）
    "isolatedModules": true,
    // 不生成编译产物，由 Vite 处理构建
    "noEmit": true,
    // 跳过库文件类型检查，加快编译速度
    "skipLibCheck": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
\`\`\`

重点配置解读：

- **strict: true**：开启 \`noImplicitAny\`、\`strictNullChecks\`、\`strictFunctionTypes\` 等一系列严格检查，这是 TypeScript 的灵魂所在，不要关闭。
- **jsx: "react-jsx"**：React 17+ 引入的新 JSX 转换，不需要在每个文件顶部写 \`import React from 'react'\`。
- **baseUrl + paths**：配置 \`@/*\` 别名后，\`@/components/Button\` 等价于 \`src/components/Button\`，再也不用数 \`../../\` 的层数了。

配置完路径别名后，还需要在 \`vite.config.ts\` 中同步配置，否则 Vite 无法识别别名：

\`\`\`typescript filename="vite.config.ts"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
\`\`\`

注意：需要安装 \`@types/node\` 才能获得 \`path\` 和 \`__dirname\` 的类型提示：

\`\`\`bash
npm install -D @types/node
\`\`\`

## 三、目录结构规范

良好的目录结构是项目可维护性的基础。推荐以下目录划分方式：

\`\`\`txt
src/
├── components/      # 可复用的通用组件（Button、Input、Modal 等）
│   ├── ui/          # 基础 UI 原子组件
│   └── layout/      # 布局组件（Header、Sidebar、Footer）
├── hooks/           # 自定义 Hooks（useFetch、useLocalStorage 等）
├── utils/           # 工具函数（format、validate、storage 等）
├── types/           # TypeScript 类型定义（全局类型、接口）
│   └── index.ts     # 类型统一导出
├── api/             # API 请求封装（axios 实例、接口函数）
├── store/           # 全局状态管理（Zustand、Redux、Context）
├── pages/           # 页面级组件（路由对应页面）
├── assets/          # 静态资源（图片、字体、全局样式）
├── App.tsx          # 根组件
└── main.tsx         # 应用入口
\`\`\`

## 四、ESLint + Prettier 配置

代码规范和格式化是团队协作的基石。ESLint 负责代码质量检查，Prettier 负责代码格式化。

首先安装必要的依赖：

\`\`\`bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh @typescript-eslint/eslint-plugin @typescript-eslint/parser
\`\`\`

创建 ESLint 配置文件：

\`\`\`javascript filename="eslint.config.js"
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
\`\`\`

创建 Prettier 配置文件：

\`\`\`json filename=".prettierrc"
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
\`\`\`

在 \`package.json\` 中添加脚本：

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  }
}
\`\`\`

## 五、VS Code 插件推荐

为了获得最佳开发体验，推荐安装以下 VS Code 插件：

1. **ESLint**：实时显示 ESLint 错误和警告
2. **Prettier - Code formatter**：保存时自动格式化代码
3. **Error Lens**：直接在代码行内显示错误信息
4. **Auto Rename Tag**：自动重命名配对的 HTML/JSX 标签
5. **Path Intellisense**：路径自动补全
6. **Todo Tree**：高亮显示 TODO、FIXME 等注释

同时在 VS Code 设置中开启「保存时格式化」和「保存时修复 ESLint 错误」：

\`\`\`json filename=".vscode/settings.json"
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
\`\`\`

## 六、小结

- 使用 Vite 创建 React + TypeScript 项目：\`npm create vite@latest my-app -- --template react-ts\`
- \`tsconfig.json\` 中务必开启 \`strict: true\`，使用 \`react-jsx\` 的 JSX 转换
- 配置 \`baseUrl\` 和 \`paths\` 别名 \`@/*\` 指向 \`src\`，同时在 \`vite.config.ts\` 中同步配置
- 按照 \`components/hooks/utils/types/api/store/pages\` 规范组织目录
- 集成 ESLint + Prettier 保证代码质量和风格统一
- 安装必要的 VS Code 插件提升开发效率

下一章我们将深入学习 JSX/TSX 的语法细节，理解它的本质以及在 TypeScript 中的特殊之处。
`,
  },
  {
    id: "tsrx-jsx",
    group: "准备篇",
    icon: "📝",
    title: "JSX/TSX语法深度解析",
    content: `

# JSX/TSX 语法深度解析

JSX 是 React 最具辨识度的特性之一，它让我们可以用类似 HTML 的语法在 JavaScript 中编写 UI。而 TSX 则是 JSX 在 TypeScript 中的超集，增加了类型检查能力。本章将深入剖析 JSX 的本质、TSX 与 JSX 的区别，以及各种语法细节和常见陷阱。

## 一、JSX 的本质：不是 HTML，是语法糖

很多初学者误以为 JSX 是 HTML，其实它只是 \`React.createElement\`（React 17+ 是 \`_jsx\`）的语法糖。Babel/SWC 等编译器会把 JSX 编译成普通的 JavaScript 函数调用。

看这段 JSX：

\`\`\`tsx
const element = <h1 className="title">Hello, World!</h1>
\`\`\`

编译后的结果（React 17+ 新 JSX 转换）：

\`\`\`javascript
import { jsx as _jsx } from 'react/jsx-runtime'
const element = _jsx('h1', { className: 'title', children: 'Hello, World!' })
\`\`\`

React 16 及更早版本的旧转换：

\`\`\`javascript
// 旧版转换：需要 import React
import React from 'react'
const element = React.createElement('h1', { className: 'title' }, 'Hello, World!')
\`\`\`

理解这一点非常重要：**你写的 JSX 最终都是 JS 对象**。这意味着 JSX 可以赋值给变量、作为函数参数传递、从函数返回，就像普通对象一样。

## 二、TSX vs JSX：类型带来的差异

TSX 在 JSX 基础上增加了静态类型检查，主要体现在：

1. **Props 类型检查**：组件接收的 props 必须符合类型定义
2. **children 类型**：children 的类型可以被精确约束
3. **原生元素属性检查**：\`<div>\`、\`<input>\` 等原生标签的属性会被类型检查

\`\`\`tsx
// ✅ TSX 会检查 props 类型
interface GreetingProps {
  name: string
  age?: number
}

function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <p>你好，{name}！</p>
      {age !== undefined && <p>年龄：{age}</p>}
    </div>
  )
}

// ❌ 错误：缺少必需的 name 属性
const bad = <Greeting />

// ❌ 错误：age 应该是 number，不是 string
const bad2 = <Greeting name="小明" age="18" />

// ✅ 正确
const good = <Greeting name="小明" age={18} />
\`\`\`

另外，TSX 文件的扩展名必须是 \`.tsx\` 而不是 \`.ts\`，否则 TypeScript 编译器无法识别 JSX 语法。

## 三、表达式嵌入：单大括号 {}

在 JSX 中，你可以用单大括号 \`{}\` 嵌入任何有效的 JavaScript 表达式：

\`\`\`tsx
function UserProfile() {
  const user = { name: '张三', age: 25 }
  const isAdmin = true

  return (
    <div>
      {/* 变量插值 */}
      <h2>{user.name}</h2>
      
      {/* 运算表达式 */}
      <p>明年{user.age + 1}岁</p>
      
      {/* 三元表达式 */}
      <p>角色：{isAdmin ? '管理员' : '普通用户'}</p>
      
      {/* 函数调用 */}
      <p>名字长度：{user.name.length}</p>
      
      {/* 模板字符串 */}
      <p>{\`\${user.name} - \${user.age}岁\`}</p>
    </div>
  )
}
\`\`\`

注意：\`{}\` 里只能放**表达式**，不能放语句（if、for、变量声明等）。但可以放 IIFE（立即执行函数）来实现复杂逻辑。

## 四、条件渲染：四种写法与陷阱

### 4.1 三元运算符：适合二选一

\`\`\`tsx
function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={isOnline ? 'badge-online' : 'badge-offline'}>
      {isOnline ? '在线' : '离线'}
    </span>
  )
}
\`\`\`

### 4.2 && 短路运算：适合显隐控制

\`\`\`tsx
function NotificationBadge({ count }: { count: number }) {
  return (
    <div>
      <span>消息</span>
      {/* count > 0 时显示徽标 */}
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  )
}
\`\`\`

⚠️ **经典陷阱**：\`{count && <Badge />}\` 当 \`count\` 是 0 时，React 会渲染出数字 0，而不是什么都不显示！这是因为 0 是 falsy 值但 React 会渲染它。

\`\`\`tsx
// ❌ 错误：list.length 为 0 时会显示 0
{list.length && <TodoList items={list} />}

// ✅ 正确：明确判断 > 0
{list.length > 0 && <TodoList items={list} />}

// ✅ 正确：用 !! 转为布尔值
{!!list.length && <TodoList items={list} />}

// ✅ 正确：用 Boolean() 转换
{Boolean(list.length) && <TodoList items={list} />}
\`\`\`

### 4.3 提前 return：适合多态渲染

\`\`\`tsx
type DataState<T> = 
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

function DataView<T>({ state }: { state: DataState<T> }) {
  // 提前返回 loading 状态
  if (state.status === 'loading') {
    return <div className="loading">加载中...</div>
  }
  // 提前返回 error 状态
  if (state.status === 'error') {
    return <div className="error">错误：{state.message}</div>
  }
  // 最后返回成功状态
  return <div className="success">数据：{JSON.stringify(state.data)}</div>
}
\`\`\`

### 4.4 IIFE（立即执行函数）：适合复杂分支逻辑

\`\`\`tsx
function ComplexCondition({ score }: { score: number }) {
  return (
    <div>
      <p>分数：{score}</p>
      {(() => {
        if (score >= 90) return <span className="grade-a">优秀</span>
        if (score >= 80) return <span className="grade-b">良好</span>
        if (score >= 60) return <span className="grade-c">及格</span>
        return <span className="grade-d">不及格</span>
      })()}
    </div>
  )
}
\`\`\`

## 五、列表渲染与 key 原则

渲染列表使用 \`map\`，每个列表项必须提供唯一的 \`key\` 属性：

\`\`\`tsx
interface Todo {
  id: number
  text: string
  completed: boolean
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className={todo.completed ? 'done' : ''}>
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
\`\`\`

**key 的重要原则**：

1. **key 必须是稳定且唯一的**：使用数据中的唯一 id（如数据库 id），不要用数组 index。
2. **不要用 index 作为 key**：当列表顺序变化（插入、删除、排序）时，index 会变，导致 React 无法正确复用组件，可能造成状态错乱。
3. **key 变化会重置组件状态**：如果 key 变了，React 会销毁旧组件、创建新组件，组件内部 state 会丢失（包括 input 输入值）。

\`\`\`tsx
// ❌ 反模式：用 index 作为 key
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}

// ✅ 正确：用数据中的唯一 id
{todos.map(todo => (
  <TodoItem key={todo.id} todo={todo} />
))}
\`\`\`

## 六、Fragment 与注释

### Fragment 短语法

当你需要返回多个元素但不想额外包裹 \`<div>\` 时，使用 Fragment：

\`\`\`tsx
import { Fragment } from 'react'

// 完整写法
function Columns() {
  return (
    <Fragment>
      <td>姓名</td>
      <td>年龄</td>
    </Fragment>
  )
}

// 短语法 <></>（常用）
function UserInfo() {
  return (
    <>
      <dt>姓名</dt>
      <dd>张三</dd>
      <dt>年龄</dt>
      <dd>25</dd>
    </>
  )
}
\`\`\`

注意：短语法 \`<></>\` 不能添加 key 或其他属性，如果需要 key，必须使用完整的 \`<Fragment key={id}>\`。

### JSX 中的注释

JSX 中的注释必须写在 \`{/* */}\` 里：

\`\`\`tsx
function Demo() {
  return (
    <div>
      {/* 这是 JSX 注释 */}
      <h1>标题</h1>
      {/* 多行
          注释 */}
      <p>内容</p>
    </div>
  )
}
\`\`\`

## 七、JSX.Element vs React.ReactElement vs React.ReactNode

这三个类型是 TSX 开发中最容易混淆的概念：

\`\`\`tsx
// JSX.Element：表示一个 JSX 元素，是 ReactElement<string | JSXElementConstructor<any>> 的别名
const element: JSX.Element = <div>Hello</div>

// React.ReactElement：更通用的 React 元素类型，可以指定 props 类型
const reactElement: React.ReactElement<{ title: string }> = <Modal title="提示" />

// React.ReactNode：最宽泛的类型，可以是元素、字符串、数字、布尔、null、undefined、数组
// 组件 children 的类型通常用这个
type ReactNode = 
  | React.ReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | React.ReactNodeArray
  | ReactPortal

// 示例：children 用 ReactNode
interface ContainerProps {
  children: React.ReactNode
  title?: string
}

function Container({ children, title }: ContainerProps) {
  return (
    <div className="container">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}

// 可以传任何内容作为 children
<Container title="测试">
  纯文本也可以
  <p>段落元素</p>
  {null}
  {false}
  {123}
</Container>
\`\`\`

简单记忆：
- **JSX.Element**：单个 JSX 标签
- **React.ReactElement**：带 props 类型的 JSX 元素
- **React.ReactNode**：任何可以渲染的内容（children 类型用这个）

## 八、小结

- JSX 本质是 \`React.createElement\` / \`_jsx\` 的语法糖，编译后是普通 JS 对象
- TSX 比 JSX 多了 props 类型检查和原生元素属性检查，文件扩展名必须是 \`.tsx\`
- 用 \`{}\` 嵌入 JS 表达式，不能嵌入语句
- 条件渲染四种方式：三元、\`&&\`、提前 return、IIFE；注意 0 渲染陷阱
- 列表渲染必须用稳定唯一的 key，不要用 index
- 用 \`<>\` Fragment 包裹多元素，避免多余 DOM 节点
- children 类型通常用 \`React.ReactNode\`

下一章我们将学习如何正确地定义组件和进行类型标注。
`,
  },
  {
    id: "tsrx-component",
    group: "准备篇",
    icon: "🧩",
    title: "组件定义与类型标注",
    content: `

# 组件定义与类型标注

组件是 React 应用的基本构建块。在 TypeScript + React 中，如何正确地定义组件、标注类型，直接影响到开发体验和代码质量。本章将详细讲解函数组件的类型标注方式、为什么不推荐使用 \`React.FC\`、组件组合模式以及组件拆分原则。

## 一、函数组件类型标注方式

在 TypeScript 中定义 React 函数组件，主要有以下几种方式：

### 1.1 推荐写法：直接标注 props 和返回值

\`\`\`tsx
// 定义 props 接口
interface GreetingProps {
  name: string
  message?: string
}

// 直接在参数中标注 props 类型，返回值标注为 JSX.Element
function Greeting({ name, message = '你好' }: GreetingProps): JSX.Element {
  return (
    <div className="greeting">
      <h2>{message}，{name}！</h2>
    </div>
  )
}

// 使用组件
function App() {
  return <Greeting name="张三" message="早上好" />
}
\`\`\`

这种写法最清晰、最灵活，也是社区和官方文档推荐的方式。

### 1.2 箭头函数写法

\`\`\`tsx
interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

// 箭头函数同样可以标注类型
const Button = ({ text, onClick, disabled = false }: ButtonProps): JSX.Element => {
  return (
    <button onClick={onClick} disabled={disabled} className="btn">
      {text}
    </button>
  )
}
\`\`\`

### 1.3 为什么不用 React.FC？

\`React.FC\`（Function Component）是早期 TypeScript + React 教程中常见的写法，但现在已不推荐使用。原因如下：

\`\`\`tsx
// ❌ 不推荐：React.FC 存在问题
interface BadExampleProps {
  name: string
}

const BadExample: React.FC<BadExampleProps> = ({ name }) => {
  return <div>Hello, {name}</div>
}

// 问题1：children 被隐式标注为可选，但类型是 ReactNode | undefined
// 这意味着即使你的组件不需要 children，TypeScript 也不会报错
<BadExample name="test">
  <p>意外传入的 children 不会报错</p>
</BadExample>

// 问题2：不支持泛型组件
// 无法写出这样的泛型组件: React.FC<ListProps<T>>

// 问题3：defaultProps 模式无法正常工作（虽然 defaultProps 本身已废弃）
\`\`\`

**总结：\`React.FC\` 带来的问题比解决的问题多，直接在参数上标注 props 类型是更好的选择。**

## 二、组件命名规范

React 组件必须使用 **PascalCase（大驼峰命名法）**：

\`\`\`tsx
// ✅ 正确：大驼峰
function UserProfile() { ... }
const LoginForm = () => { ... }

// ❌ 错误：小写开头会被当作原生 HTML 标签
function userProfile() { ... } // React 会尝试查找 <userprofile> 原生标签
const loginForm = () => { ... }
\`\`\`

文件命名也推荐使用 PascalCase：\`UserProfile.tsx\`、\`LoginForm.tsx\`。

## 三、组件组合 vs 继承

React 推崇**组合优于继承**的设计理念。组件之间通过 props 和 children 进行组合，而不是通过类继承来复用代码。

### 3.1 使用 children 组合

\`\`\`tsx
// 通用的卡片容器组件
interface CardProps {
  title?: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  )
}

// 使用组合
function UserCard() {
  return (
    <Card title="用户信息">
      <p>姓名：张三</p>
      <p>年龄：25</p>
      <button>编辑</button>
    </Card>
  )
}
\`\`\`

### 3.2 封装条件组件

我们可以封装通用的条件渲染组件，让 JSX 更具声明式：

\`\`\`tsx
// If 组件：条件为真时渲染 children
interface IfProps {
  condition: boolean
  children: React.ReactNode
}

function If({ condition, children }: IfProps) {
  return condition ? <>{children}</> : null
}

// Show 组件：类似 v-if，支持多状态
interface ShowProps {
  children: React.ReactNode
}

function Show({ children }: ShowProps) {
  return <>{children}</>
}

interface ShowWhenProps {
  isTrue: boolean
  children: React.ReactNode
}

Show.When = function ShowWhen({ isTrue, children }: ShowWhenProps) {
  return isTrue ? <>{children}</> : null
}

// 使用示例
function StatusMessage({ isLoading, isError, data }: {
  isLoading: boolean
  isError: boolean
  data: string | null
}) {
  return (
    <Show>
      <Show.When isTrue={isLoading}>
        <div>加载中...</div>
      </Show.When>
      <Show.When isTrue={isError}>
        <div>加载失败</div>
      </Show.When>
      <Show.When isTrue={!!data}>
        <div>数据：{data}</div>
      </Show.When>
    </Show>
  )
}
\`\`\`

## 四、默认 Props 处理

在现代 React + TypeScript 中，推荐使用**函数参数默认值**来处理默认 props，而不是使用已废弃的 \`defaultProps\` 属性：

\`\`\`tsx
interface ButtonProps {
  text: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
}

// ✅ 推荐：使用 ES6 默认参数值
function Button({
  text,
  size = 'medium',      // 默认值
  variant = 'primary',  // 默认值
  onClick,
}: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${size} btn-\${variant}\`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}

// 使用时不传 size 和 variant，会使用默认值
<Button text="提交" />
// 等价于 <Button text="提交" size="medium" variant="primary" />
\`\`\`

为什么不用 \`defaultProps\`？
1. \`defaultProps\` 在函数组件中已被标记为废弃
2. ES6 默认参数值是标准 JavaScript 语法，更直观
3. TypeScript 能更好地推断类型

## 五、组件拆分粒度原则：SRP 单一职责

一个组件应该只做一件事，这就是**单一职责原则（Single Responsibility Principle）**。如何判断组件是否需要拆分？

### 拆分信号：

1. **代码行数过多**：如果一个组件超过 200-300 行，考虑拆分
2. **JSX 嵌套过深**：如果 JSX 嵌套超过 4-5 层，考虑拆分子组件
3. **重复的 UI 模式**：如果相同的 JSX 结构出现两次以上，抽取为组件
4. **逻辑独立**：如果某块 UI 有自己独立的 state 和逻辑，应该拆分
5. **可复用**：如果某块 UI 可能在其他地方使用，抽取为通用组件

### 拆分示例：

\`\`\`tsx
// ❌ 不好：一个大组件做所有事情
function UserDashboard() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [notifications, setNotifications] = useState([])

  return (
    <div className="dashboard">
      {/* 用户信息区 */}
      <div className="user-section">
        <img src={user?.avatar} />
        <h2>{user?.name}</h2>
        <p>{user?.bio}</p>
        <button>编辑资料</button>
      </div>
      {/* 文章列表区 */}
      <div className="posts-section">
        <h3>我的文章</h3>
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h4>{post.title}</h4>
            <p>{post.excerpt}</p>
            <span>{post.date}</span>
          </div>
        ))}
      </div>
      {/* 通知区 */}
      <div className="notifications-section">
        <h3>通知</h3>
        {notifications.map(n => (
          <div key={n.id} className="notification-item">
            <span className={n.read ? 'read' : 'unread'}>{n.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
\`\`\`

\`\`\`tsx
// ✅ 好：拆分为多个职责单一的组件
function UserDashboard() {
  return (
    <div className="dashboard">
      <UserProfileSection />
      <UserPostsSection />
      <NotificationsSection />
    </div>
  )
}

// 用户信息区
function UserProfileSection() {
  const { user } = useUser()
  if (!user) return null
  return (
    <div className="user-section">
      <UserAvatar src={user.avatar} />
      <UserInfo name={user.name} bio={user.bio} />
      <EditProfileButton />
    </div>
  )
}

// 文章列表区
function UserPostsSection() {
  const { posts } = usePosts()
  return (
    <div className="posts-section">
      <SectionTitle>我的文章</SectionTitle>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}

// 通知区
function NotificationsSection() {
  const { notifications } = useNotifications()
  return (
    <div className="notifications-section">
      <SectionTitle>通知</SectionTitle>
      {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
    </div>
  )
}
\`\`\`

## 六、小结

- 推荐使用 \`function Component(props: Props): JSX.Element\` 方式标注组件类型
- 不要使用 \`React.FC\`，它存在 children 隐式 any、不支持泛型等问题
- 组件命名使用 PascalCase 大驼峰
- 使用组合而非继承来复用组件，通过 children 和 props 传递内容
- 使用 ES6 默认参数值处理默认 props，不用废弃的 defaultProps
- 遵循单一职责原则，大组件拆分为多个小组件

下一章我们将通过一个完整的计数器应用，把前面学到的知识点融会贯通。
`,
  },
  {
    id: "tsrx-first",
    group: "准备篇",
    icon: "🚀",
    title: "第一个TS+React应用：完整计数器",
    content: `

# 第一个 TS + React 应用：完整计数器

前面三章我们学习了环境搭建、JSX 语法和组件定义。本章将通过一个功能完整的计数器应用，把这些知识点串联起来，实践**类型驱动开发**的理念。我们将实现加/减、重置、设置步长、双击重置等功能，并严格按照类型优先的方式来编写代码。

## 一、类型驱动开发：先定义类型

类型驱动开发（Type-Driven Development）的核心思想是：**先定义类型，再实现逻辑**。类型是程序的蓝图，清晰的类型定义能让我们在写代码之前就理清数据结构和组件关系。

首先创建 \`src/types/counter.ts\` 定义我们需要的类型：

\`\`\`typescript filename="src/types/counter.ts"
// 计数器状态类型
export interface CounterState {
  // 当前计数值
  count: number
  // 步长：每次增减的数值
  step: number
  // 操作历史记录
  history: number[]
}

// 计数器操作类型
export type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; payload: number }
  | { type: 'doubleClickReset' }
\`\`\`

## 二、组件拆分设计

我们将计数器拆分为以下几个组件：

1. **Counter**：容器组件，管理状态和逻辑
2. **CounterDisplay**：显示当前数值的展示组件
3. **CounterButton**：可复用的按钮组件
4. **StepSelector**：步长选择组件
5. **HistoryPanel**：操作历史面板

目录结构：

\`\`\`txt
src/
├── components/
│   └── counter/
│       ├── Counter.tsx         # 主容器组件
│       ├── CounterDisplay.tsx  # 数值显示
│       ├── CounterButton.tsx   # 按钮组件
│       ├── StepSelector.tsx    # 步长选择
│       └── HistoryPanel.tsx    # 历史记录
└── types/
    └── counter.ts              # 类型定义
\`\`\`

## 三、完整实现代码

### 3.1 按钮组件 CounterButton

\`\`\`tsx filename="src/components/counter/CounterButton.tsx"
// 按钮组件的 Props 类型
interface CounterButtonProps {
  // 按钮显示文本
  label: string
  // 点击事件处理函数
  onClick: () => void
  // 按钮样式变体
  variant?: 'primary' | 'secondary' | 'danger'
  // 是否禁用
  disabled?: boolean
  // 双击事件（可选）
  onDoubleClick?: () => void
}

/**
 * 通用计数器按钮组件
 */
export function CounterButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  onDoubleClick,
}: CounterButtonProps): JSX.Element {
  // 根据变体计算样式类名
  const variantClass = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }[variant]

  return (
    <button
      className={\`px-4 py-2 rounded-lg font-medium transition-colors \${variantClass} disabled:opacity-50 disabled:cursor-not-allowed\`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
\`\`\`

### 3.2 数值显示组件 CounterDisplay

\`\`\`tsx filename="src/components/counter/CounterDisplay.tsx"
interface CounterDisplayProps {
  // 当前计数值
  value: number
  // 是否为初始状态（用于特殊样式）
  isZero?: boolean
}

/**
 * 计数器数值显示组件
 */
export function CounterDisplay({ value, isZero }: CounterDisplayProps): JSX.Element {
  return (
    <div className="text-center my-8">
      <div className="text-sm text-gray-500 mb-2">当前数值</div>
      <div
        className={\`text-6xl font-bold transition-colors \${
          isZero
            ? 'text-gray-400'
            : value > 0
            ? 'text-green-600'
            : 'text-red-600'
        }\`}
      >
        {value}
      </div>
    </div>
  )
}
\`\`\`

### 3.3 步长选择组件 StepSelector

\`\`\`tsx filename="src/components/counter/StepSelector.tsx"
interface StepSelectorProps {
  // 当前步长
  step: number
  // 步长变更回调
  onStepChange: (newStep: number) => void
}

// 预设步长选项
const STEP_OPTIONS = [1, 2, 5, 10] as const

/**
 * 步长选择组件
 */
export function StepSelector({ step, onStepChange }: StepSelectorProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 my-4">
      <span className="text-sm text-gray-600">步长：</span>
      <div className="flex gap-2">
        {STEP_OPTIONS.map(option => (
          <button
            key={option}
            className={\`w-10 h-10 rounded-lg font-medium transition-colors \${
              step === option
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }\`}
            onClick={() => onStepChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
\`\`\`

### 3.4 历史记录面板 HistoryPanel

\`\`\`tsx filename="src/components/counter/HistoryPanel.tsx"
interface HistoryPanelProps {
  // 历史记录数组
  history: number[]
  // 清空历史回调
  onClear: () => void
}

/**
 * 操作历史面板组件
 */
export function HistoryPanel({ history, onClear }: HistoryPanelProps): JSX.Element {
  // 只显示最近 10 条记录
  const recentHistory = history.slice(-10).reverse()

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">
          操作历史（共 {history.length} 条）
        </span>
        {history.length > 0 && (
          <button
            className="text-xs text-red-500 hover:text-red-600"
            onClick={onClear}
          >
            清空
          </button>
        )}
      </div>
      {recentHistory.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">暂无操作记录</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {recentHistory.map((value, index) => (
            <span
              key={\`\${value}-\${index}\`}
              className={\`px-2 py-1 rounded text-sm \${
                value > 0
                  ? 'bg-green-100 text-green-700'
                  : value < 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-200 text-gray-600'
              }\`}
            >
              {value > 0 ? '+' : ''}{value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
\`\`\`

### 3.5 主组件 Counter

\`\`\`tsx filename="src/components/counter/Counter.tsx"
import { useState, useCallback, type MouseEvent } from 'react'
import { CounterDisplay } from './CounterDisplay'
import { CounterButton } from './CounterButton'
import { StepSelector } from './StepSelector'
import { HistoryPanel } from './HistoryPanel'

/**
 * 计数器主组件
 * 功能：加/减、重置、设置步长、双击重置为0、操作历史
 */
export function Counter(): JSX.Element {
  // 当前计数值，初始为0，类型由初始值自动推断为 number
  const [count, setCount] = useState<number>(0)
  // 步长，初始为1
  const [step, setStep] = useState<number>(1)
  // 操作历史记录
  const [history, setHistory] = useState<number[]>([])

  // 添加历史记录的辅助函数
  const addHistory = useCallback((value: number) => {
    setHistory(prev => [...prev, value])
  }, [])

  // 增加：使用函数式更新避免闭包陈旧值问题
  const handleIncrement = useCallback(() => {
    setCount(prev => {
      const newValue = prev + step
      addHistory(step)
      return newValue
    })
  }, [step, addHistory])

  // 减少
  const handleDecrement = useCallback(() => {
    setCount(prev => {
      const newValue = prev - step
      addHistory(-step)
      return newValue
    })
  }, [step, addHistory])

  // 重置为0
  const handleReset = useCallback(() => {
    setCount(0)
    setHistory([])
  }, [])

  // 双击重置：双击任何按钮都可以快速重置为0
  const handleDoubleClickReset = useCallback(() => {
    setCount(0)
    addHistory(0)
  }, [addHistory])

  // 步长变更
  const handleStepChange = useCallback((newStep: number) => {
    setStep(newStep)
  }, [])

  // 清空历史
  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
        TypeScript 计数器
      </h1>
      <p className="text-center text-sm text-gray-500 mb-4">
        双击任意按钮快速重置为0
      </p>

      {/* 数值显示 */}
      <CounterDisplay value={count} isZero={count === 0} />

      {/* 步长选择 */}
      <StepSelector step={step} onStepChange={handleStepChange} />

      {/* 操作按钮组 */}
      <div className="flex gap-3 justify-center my-6">
        <CounterButton
          label="-"
          variant="danger"
          onClick={handleDecrement}
          onDoubleClick={handleDoubleClickReset}
        />
        <CounterButton
          label="重置"
          variant="secondary"
          onClick={handleReset}
          onDoubleClick={handleDoubleClickReset}
        />
        <CounterButton
          label="+"
          variant="primary"
          onClick={handleIncrement}
          onDoubleClick={handleDoubleClickReset}
        />
      </div>

      {/* 历史记录面板 */}
      <HistoryPanel history={history} onClear={handleClearHistory} />
    </div>
  )
}
\`\`\`

### 3.6 在 App.tsx 中使用

\`\`\`tsx filename="src/App.tsx"
import { Counter } from './components/counter/Counter'

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <Counter />
    </div>
  )
}

export default App
\`\`\`

## 四、知识点回顾

这个计数器应用涵盖了以下知识点：

1. **类型驱动开发**：先定义 \`CounterState\` 和组件 Props 类型，再实现逻辑
2. **组件拆分**：按照单一职责原则拆分为 5 个小组件
3. **useState 类型推断**：\`useState(0)\` 自动推断为 \`number\` 类型
4. **useCallback 缓存函数**：避免子组件不必要的重渲染
5. **函数式更新**：\`setCount(prev => prev + step)\` 获取最新状态
6. **事件类型标注**：\`onClick\` 事件处理器类型正确推断
7. **可选 Props 与默认值**：\`variant?: 'primary' | ...\` 配合默认参数值
8. **字面量联合类型**：\`'primary' | 'secondary' | 'danger'\` 限定可选值

## 五、小结

通过这个完整的计数器项目，我们实践了 TypeScript + React 开发的核心流程：
- 先定义类型，再实现逻辑（类型驱动开发）
- 合理拆分组件，每个组件职责单一
- Props 类型精确标注，使用联合类型、可选属性等类型特性
- 使用 useState、useCallback 等 Hooks 管理状态和回调
- 事件处理器的类型由 TypeScript 自动推断

下一章我们将系统学习 Props 的各种类型定义方式，掌握 interface 和 type 的高级用法。
`,
  },
  {
    id: "tsrx-props",
    group: "基础篇",
    icon: "📦",
    title: "Props类型定义大全",
    content: `

# Props 类型定义大全

Props 是组件之间通信的桥梁，精确地定义 Props 类型是 TypeScript + React 开发中最重要的技能之一。本章将全面讲解 Props 的各种定义方式和高级技巧，包括 type 与 interface 的选择、继承、原生属性提取、children 类型、可辨识联合等。

## 一、type 别名 vs interface 定义 Props

定义 Props 类型有两种主要方式：\`type\` 类型别名和 \`interface\` 接口。两者大部分场景可以互换，但各有特点。

### 1.1 基本用法

\`\`\`tsx
// 使用 interface 定义
interface UserCardProps {
  name: string
  age: number
  avatar?: string
}

// 使用 type 定义
type UserCardProps = {
  name: string
  age: number
  avatar?: string
}

function UserCard(props: UserCardProps): JSX.Element {
  const { name, age, avatar } = props
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} />}
      <h3>{name}</h3>
      <p>{age} 岁</p>
    </div>
  )
}
\`\`\`

### 1.2 如何选择？

| 特性 | interface | type |
|------|-----------|------|
| 对象类型 | ✅ | ✅ |
| 联合类型 | ❌ | ✅ |
| 交叉类型（继承）| ✅ extends | ✅ & |
| 声明合并（重复定义自动合并）| ✅ | ❌ |
| 映射类型 | ❌ | ✅ |
| 条件类型 | ❌ | ✅ |

**推荐**：定义 Props 时优先使用 \`interface\`，需要联合类型、映射类型等高级特性时改用 \`type\`。

## 二、interface extends 继承

可以通过 \`extends\` 继承其他 interface，实现 Props 的复用和扩展：

\`\`\`tsx
// 基础按钮 Props
interface BaseButtonProps {
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

// 主按钮继承基础 Props，添加自己的属性
interface PrimaryButtonProps extends BaseButtonProps {
  size?: 'small' | 'medium' | 'large'
  icon?: React.ReactNode
}

function PrimaryButton({
  children,
  disabled,
  loading,
  onClick,
  size = 'medium',
  icon,
}: PrimaryButtonProps): JSX.Element {
  return (
    <button
      className={\`btn-primary btn-\${size}\`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="spinner" />}
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}

// 还可以继承多个 interface
interface ActionButtonProps extends BaseButtonProps, TooltipProps {
  actionType: 'edit' | 'delete' | 'share'
}
\`\`\`

使用 \`type\` 时用交叉类型 \`&\` 实现类似效果：

\`\`\`tsx
type BaseButtonProps = {
  children: React.ReactNode
  disabled?: boolean
}

type PrimaryButtonProps = BaseButtonProps & {
  size?: 'small' | 'medium' | 'large'
}
\`\`\`

## 三、提取原生元素属性：React.ComponentProps

当你封装原生 HTML 元素（如 \`<button>\`、\`<input>\`）时，不需要手动重写所有原生属性，可以用 \`React.ComponentProps\` 直接提取：

\`\`\`tsx
// 提取 button 元素的所有原生属性
type NativeButtonProps = React.ComponentProps<'button'>

// 扩展原生 button，添加自定义属性
interface ButtonProps extends NativeButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  isFullWidth?: boolean
}

function Button({
  variant = 'primary',
  isFullWidth = false,
  children,
  className = '',
  // 用 rest 接收其他所有原生属性（onClick, disabled, type 等）
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      className={\`btn btn-\${variant} \${isFullWidth ? 'w-full' : ''} \${className}\`}
      {...rest} // 透传所有原生属性给底层 button
    >
      {children}
    </button>
  )
}

// ✅ 使用时可以传任何 button 原生属性
<Button
  variant="primary"
  type="submit"
  disabled={false}
  onClick={() => console.log('clicked')}
  onFocus={() => console.log('focused')}
  aria-label="提交表单"
>
  提交
</Button>
\`\`\`

常用的原生元素类型：
- \`React.ComponentProps<'button'>\` - button 元素
- \`React.ComponentProps<'input'>\` - input 元素
- \`React.ComponentProps<'a'>\` - a 链接
- \`React.ComponentProps<'div'>\` - div 元素
- \`React.ComponentProps<'form'>\` - form 表单

还可以提取自定义组件的 Props 类型：

\`\`\`tsx
// 假设已有一个 Button 组件
function Button(props: { variant: string; children: React.ReactNode }) {
  return <button>{children}</button>
}

// 提取 Button 组件的 Props 类型
type ButtonPropsType = React.ComponentProps<typeof Button>
// 等价于 { variant: string; children: React.ReactNode }
\`\`\`

## 四、children 的四种类型

children 是特殊的 prop，它的类型有多种选择：

\`\`\`tsx
// 1. React.ReactNode：最常用，可以是任何可渲染内容
interface Container1Props {
  children: React.ReactNode
}

// 2. React.ReactElement：只能是单个 React 元素（不能是字符串、数字等）
interface PanelProps {
  header: React.ReactElement // header 必须是一个 React 元素
  children: React.ReactNode
}

// 3. JSX.Element：类似 React.ReactElement，但类型更具体
interface IconWrapperProps {
  icon: JSX.Element // icon 必须是一个 JSX 元素
}

// 4. Render Props 模式：children 是一个函数，接收数据返回 ReactNode
interface DataProviderProps<T> {
  data: T
  children: (data: T) => React.ReactNode
}

// Render Props 示例
function DataProvider<T>({ data, children }: DataProviderProps<T>): JSX.Element {
  return <div className="data-provider">{children(data)}</div>
}

// 使用 Render Props
<DataProvider data={{ name: '张三', age: 25 }}>
  {(user) => (
    <div>
      <p>姓名：{user.name}</p>
      <p>年龄：{user.age}</p>
    </div>
  )}
</DataProvider>
\`\`\`

## 五、可选 Props 与默认值

用 \`?\` 标记可选属性，配合 ES6 默认参数值：

\`\`\`tsx
interface InputProps {
  // 必传属性
  value: string
  onChange: (value: string) => void
  // 可选属性（加 ?）
  placeholder?: string
  type?: 'text' | 'password' | 'email'
  maxLength?: number
  disabled?: boolean
  error?: string
}

function Input({
  value,
  onChange,
  placeholder = '请输入', // 默认值
  type = 'text',          // 默认值
  maxLength,
  disabled = false,       // 默认值
  error,
}: InputProps): JSX.Element {
  return (
    <div className="input-wrapper">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={\`input \${error ? 'input-error' : ''}\`}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}
\`\`\`

## 六、索引签名与 Record

当组件可以接收任意额外属性时，使用索引签名或 \`Record\`：

\`\`\`tsx
// 1. 索引签名：[key: string]: type
interface FlexibleProps {
  title: string // 明确的属性
  [key: string]: unknown // 其他任意属性，值类型 unknown（比 any 安全）
}

// 2. Record<K, V>：更简洁的方式
// Record<string, unknown> 等价于 { [key: string]: unknown }
interface FlexibleProps2 {
  title: string
  [key: string]: unknown
}

// 更具体的：data-* 属性
interface DivWithDataProps extends React.ComponentProps<'div'> {
  // 允许所有 data- 开头的自定义属性
  [dataAttribute: \`data-\${string}\`]: string | number | boolean
}

// 使用示例
function FlexibleComponent({ title, ...rest }: FlexibleProps): JSX.Element {
  return (
    <div {...rest}>
      <h2>{title}</h2>
    </div>
  )
}

<FlexibleComponent
  title="示例"
  data-id="123"
  data-active={true}
  aria-label="flexible"
/>
\`\`\`

## 七、Props 联合类型（可辨识联合）

可辨识联合（Discriminated Union）是 TypeScript 最强大的特性之一，非常适合根据某个字段的值来决定其他属性的类型：

\`\`\`tsx
// 定义不同类型的通知，通过 type 字段辨识
type NotificationProps =
  | {
      type: 'success'
      message: string
      duration?: number
    }
  | {
      type: 'error'
      message: string
      errorCode: number // error 类型必须传 errorCode
      onRetry?: () => void
    }
  | {
      type: 'warning'
      message: string
      confirmText?: string
      onConfirm: () => void // warning 类型必须传 onConfirm
    }
  | {
      type: 'info'
      message: string
    }

function Notification(props: NotificationProps): JSX.Element {
  const { type, message } = props

  // 根据 type  narrowing 类型，TypeScript 会自动推断可用属性
  const bgColor = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }[type]

  return (
    <div className={\`p-4 rounded-lg border \${bgColor}\`}>
      <p>{message}</p>
      {/* 在 narrowing 后可以安全访问各自的特有属性 */}
      {type === 'error' && (
        <button onClick={props.onRetry} className="text-sm underline mt-2">
          重试（错误码：{props.errorCode}）
        </button>
      )}
      {type === 'warning' && (
        <button onClick={props.onConfirm} className="text-sm underline mt-2">
          {props.confirmText ?? '确认'}
        </button>
      )}
    </div>
  )
}

// ✅ 正确使用
<Notification type="success" message="操作成功" />
<Notification type="error" message="加载失败" errorCode={500} />
<Notification type="warning" message="确定删除吗？" onConfirm={() => {}} />

// ❌ 错误：error 类型缺少必需的 errorCode
<Notification type="error" message="错误" />

// ❌ 错误：success 类型不能传 errorCode
<Notification type="success" message="成功" errorCode={200} />
\`\`\`

## 八、Omit/Pick 扩展原生 Props

使用 \`Omit\` 和 \`Pick\` 工具类型，可以从已有类型中排除或选取部分属性：

\`\`\`tsx
// Omit<Type, Keys>：从 Type 中排除 Keys 指定的属性
// 例如：我们想封装 button，但不想要原生的 type 属性，换成我们自己的
interface CustomButtonProps
  extends Omit<React.ComponentProps<'button'>, 'type'> {
  // 自定义 type，值更丰富
  type?: 'primary' | 'secondary' | 'text'
}

// Pick<Type, Keys>：从 Type 中只选取 Keys 指定的属性
// 例如：只选取 input 的 value 和 onChange，其他属性都不要
type ControlledInputProps = Pick<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'placeholder'
> & {
  label: string
}

// 示例：封装一个不带 type="button" 的自定义按钮
function CustomButton({
  type = 'primary',
  children,
  ...rest
}: CustomButtonProps): JSX.Element {
  const nativeType = 'button' as const // 固定原生 type 为 button
  return (
    <button type={nativeType} className={\`btn-\${type}\`} {...rest}>
      {children}
    </button>
  )
}
\`\`\`

常用工具类型总结：
- \`Partial<T>\`：所有属性变为可选
- \`Required<T>\`：所有属性变为必选
- \`Readonly<T>\`：所有属性变为只读
- \`Omit<T, K>\`：排除 K 指定的属性
- \`Pick<T, K>\`：只选取 K 指定的属性
- \`Record<K, V>\`：构造键类型为 K、值类型为 V 的对象类型

## 九、小结

- 定义 Props 优先用 \`interface\`，需要联合/映射/条件类型时用 \`type\`
- 用 \`extends\` 或 \`&\` 实现 Props 继承复用
- 封装原生元素时用 \`React.ComponentProps<'element'>\` 提取原生属性
- children 类型常用 \`React.ReactNode\`，Render Props 用函数类型
- 可选属性加 \`?\`，配合 ES6 默认参数值
- 可辨识联合（discriminated union）通过 type/kind 字段实现类型 narrowing
- 使用 \`Omit\`、\`Pick\`、\`Partial\`、\`Record\` 等工具类型灵活组合 Props

下一章我们将深入学习 useState，掌握 React 状态管理的方方面面。
`,
  },
  {
    id: "tsrx-usestate",
    group: "基础篇",
    icon: "🔄",
    title: "useState状态管理全解",
    content: `

# useState 状态管理全解

\`useState\` 是 React 最基础、最常用的 Hook，它让函数组件拥有了管理状态的能力。本章我们将深入学习 useState 的各种用法，包括类型推断、泛型指定、函数式更新、惰性初始化、不可变更新，以及数组和对象状态的操作技巧。

## 一、useState 基本用法与类型推断

\`useState\` 最基本的用法是传入初始值，TypeScript 会自动根据初始值推断 state 的类型：

\`\`\`tsx
import { useState } from 'react'

function Counter() {
  // 初始值是 0（number），count 自动推断为 number
  // setCount 自动推断为 (value: number | ((prev: number) => number)) => void
  const [count, setCount] = useState(0)

  // 初始值是字符串，name 自动推断为 string
  const [name, setName] = useState('')

  // 初始值是布尔值，isOpen 自动推断为 boolean
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setIsOpen(!isOpen)}>切换</button>
    </div>
  )
}
\`\`\`

## 二、泛型指定 state 类型

当初始值为 \`null\`、\`undefined\` 或者 state 可以是多种类型时，需要使用泛型手动指定类型：

\`\`\`tsx
import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
}

function UserProfile() {
  // user 初始值为 null，但加载完成后是 User 类型
  // 使用泛型 <User | null> 明确指定
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载数据
  useEffect(() => {
    fetchUser(123)
      .then(data => {
        setUser(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>
  if (!user) return <div>用户不存在</div>

  // 这里 TypeScript 知道 user 不是 null，可以安全访问属性
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

// 其他泛型指定示例
const [tags, setTags] = useState<string[]>([]) // 空数组初始值，指定元素类型
const [options, setOptions] = useState<Option[]>([]) // 对象数组
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
\`\`\`

**何时需要手动指定泛型？**
1. 初始值是 \`null\` 或 \`undefined\`，后续会赋值为其他类型
2. 初始值是空数组 \`[]\`，需要指定数组元素类型
3. state 是联合类型（如 \`'idle' | 'loading' | 'success'\`）

## 三、函数式更新：避免闭包陈旧值

当新的 state 依赖于之前的 state 时，使用**函数式更新**形式，传入 \`(prevState) => newState\`：

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0)

  // ❌ 问题：连续调用三次 setCount，每次都用当前 count
  // 由于闭包，三次调用看到的 count 都是 0
  const handleBadIncrement = () => {
    setCount(count + 1) // 0 + 1 = 1
    setCount(count + 1) // 0 + 1 = 1（闭包陈旧值！）
    setCount(count + 1) // 0 + 1 = 1（闭包陈旧值！）
    // 结果：count 只增加 1，不是预期的 3
  }

  // ✅ 正确：使用函数式更新，每次都能拿到最新的 prev 值
  const handleGoodIncrement = () => {
    setCount(prev => prev + 1) // 0 -> 1
    setCount(prev => prev + 1) // 1 -> 2
    setCount(prev => prev + 1) // 2 -> 3
    // 结果：count 正确增加 3
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleBadIncrement}>错误的+3</button>
      <button onClick={handleGoodIncrement}>正确的+3</button>
    </div>
  )
}
\`\`\`

**什么时候必须用函数式更新？**
- 在同一个事件处理中连续多次更新同一个 state
- 更新逻辑在 setTimeout、setInterval 等异步回调中（闭包陷阱）
- 更新逻辑被 useCallback/useMemo 包裹，不想把 state 加到依赖数组中

## 四、惰性初始化：昂贵计算只执行一次

如果初始 state 需要通过复杂计算获得，可以传入一个**初始化函数**，这个函数只在组件首次渲染时执行一次：

\`\`\`tsx
function TodoList() {
  // ❌ 不好：每次渲染都会执行 localStorage.getItem 和 JSON.parse
  // 即使只有第一次渲染需要初始值
  const [todos, setTodos] = useState(
    JSON.parse(localStorage.getItem('todos') || '[]')
  )

  // ✅ 好：惰性初始化，函数只在首次渲染时执行一次
  const [todos, setTodos] = useState(() => {
    console.log('初始化 todos...') // 只打印一次
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })

  // 另一个示例：初始值是计算得到的
  const [fibonacci] = useState(() => {
    // 斐波那契数列计算很昂贵，只在首次渲染时计算
    const fib = [0, 1]
    for (let i = 2; i < 1000; i++) {
      fib[i] = fib[i - 1] + fib[i - 2]
    }
    return fib
  })

  return <ul>{todos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>
}
\`\`\`

## 五、React 18 自动批处理

React 18 引入了自动批处理（Automatic Batching）：在同一个事件处理、Promise 回调、setTimeout 等中多次调用 setState，React 会将它们合并为一次重渲染：

\`\`\`tsx
function BatchingDemo() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState(0)

  const handleClick = () => {
    // React 18：这三个 setState 会被批处理，只触发一次重渲染
    setCount(c => c + 1)
    setName('张三')
    setAge(25)
    // 结果：组件只重新渲染 1 次，不是 3 次
    console.log('handleClick 执行')
  }

  const handleAsyncClick = () => {
    // 在 Promise.then 中也会自动批处理（React 18 新增）
    fetch('/api/user').then(() => {
      setCount(c => c + 1)
      setName('李四')
      // 同样只触发一次重渲染
    })
  }

  console.log('组件渲染') // 观察打印次数

  return <button onClick={handleClick}>点击</button>
}
\`\`\`

React 18 之前只在 React 事件处理中批处理，Promise、setTimeout、原生事件中不会批处理。React 18 之后所有更新都会自动批处理。

## 六、对象 state：不可变更新

React 中更新 state 必须遵循**不可变原则**：永远不要直接修改（mutate）原来的 state 对象，而是创建一个新对象。

\`\`\`tsx
interface UserForm {
  name: string
  email: string
  age: number
  address: {
    city: string
    street: string
  }
}

function UserForm() {
  const [form, setForm] = useState<UserForm>({
    name: '',
    email: '',
    age: 0,
    address: {
      city: '',
      street: '',
    },
  })

  // ❌ 错误：直接修改 state，React 检测不到变化，不会重渲染
  const badUpdateName = () => {
    form.name = '张三' // 直接 mutate！
    setForm(form) // 引用没变，React 可能跳过更新
  }

  // ✅ 正确：使用 ...spread 创建新对象
  const updateName = (name: string) => {
    setForm(prev => ({
      ...prev, // 复制原有字段
      name,    // 覆盖要更新的字段
    }))
  }

  // 更新嵌套对象：需要逐层复制
  const updateCity = (city: string) => {
    setForm(prev => ({
      ...prev,
      address: {
        ...prev.address, // 复制 address 里的其他字段
        city,            // 更新 city
      },
    }))
  }

  return (
    <form>
      <input
        value={form.name}
        onChange={e => updateName(e.target.value)}
        placeholder="姓名"
      />
      <input
        value={form.address.city}
        onChange={e => updateCity(e.target.value)}
        placeholder="城市"
      />
    </form>
  )
}
\`\`\`

**如果对象嵌套很深，spread 写起来很麻烦**，有几种解决方案：
1. 使用 Immer 库（\`produce\` 函数）可以直接写 mutate 风格代码
2. 尽量扁平化 state 结构，减少嵌套
3. 将复杂 state 拆分为多个独立的 useState

## 七、数组 state CRUD 操作

数组是最常见的 state 类型之一。以下是数组的增删改查（CRUD）正确写法：

\`\`\`tsx
interface Todo {
  id: number
  text: string
  completed: boolean
}

function TodoListDemo() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习 React', completed: false },
    { id: 2, text: '学习 TypeScript', completed: true },
  ])

  // Create：添加新项
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(), // 用时间戳作为简单 id
      text,
      completed: false,
    }
    // ✅ 创建新数组，把新项加进去
    setTodos(prev => [...prev, newTodo])
    // 或者加在开头：setTodos(prev => [newTodo, ...prev])
  }

  // Read：直接通过 todos.map/filter/find 渲染或查询
  const completedCount = todos.filter(t => t.completed).length

  // Update：更新某一项
  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed } // ✅ 创建新对象，复制并覆盖字段
          : todo // 其他项保持不变
      )
    )
  }

  // 更新：编辑文本
  const updateTodoText = (id: number, text: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text } : todo
      )
    )
  }

  // Delete：删除某一项（用 filter）
  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  // Insert：在指定位置插入
  const insertAfter = (afterId: number, newTodo: Todo) => {
    setTodos(prev => {
      const index = prev.findIndex(t => t.id === afterId)
      if (index === -1) return prev
      return [
        ...prev.slice(0, index + 1), // 前面的项
        newTodo,                     // 新项
        ...prev.slice(index + 1),    // 后面的项
      ]
    })
  }

  // 清空数组
  const clearAll = () => {
    setTodos([])
  }

  return (
    <div>
      <p>已完成：{completedCount} / {todos.length}</p>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo('新任务')}>添加任务</button>
      <button onClick={clearAll}>清空</button>
    </div>
  )
}
\`\`\`

## 八、State 放置原则：Colocate State

**State 应该放在哪里？** 遵循最小化原则（Colocate State）：

1. **哪个组件用，哪个组件声明**：state 应该放在最先需要它的组件中
2. **不要过早提升 state**：不要一开始就把所有 state 放到 App 或全局 store
3. **多个组件共用时，提升到最近的共同父组件**
4. **派生状态不存 state**：可以从现有 state/props 计算出来的值，不要单独存 state

\`\`\`tsx
// ❌ 反例：不需要的 state
function BadTodoList({ todos }: { todos: Todo[] }) {
  // completedCount 可以从 todos 计算出来，不需要单独存 state
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    setCompletedCount(todos.filter(t => t.completed).length)
  }, [todos])

  return <p>已完成：{completedCount}</p>
}

// ✅ 正确：派生状态直接计算
function GoodTodoList({ todos }: { todos: Todo[] }) {
  // 在渲染期间直接计算，不需要 state 和 effect
  const completedCount = todos.filter(t => t.completed).length

  return <p>已完成：{completedCount}</p>
}
\`\`\`

## 九、TodoList CRUD 完整 Demo

这里是一个功能完整的 TodoList 应用，综合运用了上述所有 useState 技巧：

\`\`\`tsx
interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })
  const [inputText, setInputText] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!inputText.trim()) return
    setTodos(prev => [
      ...prev,
      {
        id: Date.now(),
        text: inputText.trim(),
        completed: false,
        createdAt: new Date(),
      },
    ])
    setInputText('')
  }

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed))
  }

  // 派生状态：过滤后的列表
  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={addTodo} className="px-4 py-2 bg-blue-500 text-white rounded">
          添加
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={\`px-3 py-1 rounded \${
              filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }\`}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      <ul className="divide-y">
        {filteredTodos.map(todo => (
          <li key={todo.id} className="flex items-center gap-3 py-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'line-through text-gray-400' : ''}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="ml-auto text-red-500 text-sm"
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <span>{activeCount} 项待完成</span>
        <button onClick={clearCompleted} className="text-red-500">
          清除已完成
        </button>
      </div>
    </div>
  )
}
\`\`\`

## 十、小结

- useState 会根据初始值自动推断类型，必要时用泛型 \`<T | null>(null)\` 指定
- 新 state 依赖旧 state 时用函数式更新 \`setState(prev => new)\`
- 初始值计算昂贵时用惰性初始化 \`useState(() => compute())\`
- React 18 所有场景自动批处理多次 setState
- 对象和数组 state 必须不可变更新：用 \`...spread\`、\`map\`、\`filter\` 创建新引用
- 数组 CRUD：添加用 \`[...arr, new]\`、更新用 \`map\`、删除用 \`filter\`、插入用 \`slice\`
- State 遵循 colocate 原则，放在需要它的最小组件；派生状态不存 state

下一章我们将学习 React 中的事件处理和类型标注。
`,
  },
  {
    id: "tsrx-events",
    group: "基础篇",
    icon: "🎯",
    title: "事件处理与类型",
    content: `

# 事件处理与类型

事件处理是 React 交互的核心。在 TypeScript 中，正确标注事件类型不仅能获得自动补全，还能在编译时捕获错误。本章我们将学习常见事件类型、事件处理器类型推导、合成事件机制、防抖节流实现，以及事件传参技巧。

## 一、常见事件类型一览

React 中的事件是**合成事件（SyntheticEvent）**，是对原生 DOM 事件的跨浏览器封装。不同的事件有不同的类型参数，需要指定触发事件的 DOM 元素类型。

\`\`\`tsx
import {
  useState,
  type MouseEvent,      // 鼠标事件
  type ChangeEvent,     // 表单值变化事件
  type FormEvent,       // 表单提交事件
  type KeyboardEvent,   // 键盘事件
  type FocusEvent,      // 焦点事件
  type DragEvent,       // 拖拽事件
  type TouchEvent,      // 触摸事件
  type WheelEvent,      // 滚轮事件
  type PointerEvent,    // 指针事件（鼠标+触摸+笔触）
} from 'react'

function EventTypesDemo() {
  // 鼠标点击事件：MouseEvent<HTMLButtonElement>
  // 泛型参数是触发事件的元素类型
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log('按钮被点击', e.currentTarget) // currentTarget 类型是 HTMLButtonElement
  }

  // Input 值变化事件：ChangeEvent<HTMLInputElement>
  const [text, setText] = useState('')
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value) // e.target.value 类型是 string，有类型提示
  }

  // Select 变化事件：ChangeEvent<HTMLSelectElement>
  const [city, setCity] = useState('')
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value)
  }

  // Textarea 变化事件：ChangeEvent<HTMLTextAreaElement>
  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value)
  }

  // 表单提交事件：FormEvent<HTMLFormElement>
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault() // 阻止默认表单提交刷新页面
    console.log('表单提交', text)
  }

  // 键盘事件：KeyboardEvent<HTMLInputElement>
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('按下回车键')
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      console.log('Ctrl+S 保存')
    }
  }

  // 焦点事件：FocusEvent<HTMLInputElement>
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    console.log('获得焦点', e.target)
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    console.log('失去焦点')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="输入内容"
      />
      <select value={city} onChange={handleSelectChange}>
        <option value="beijing">北京</option>
        <option value="shanghai">上海</option>
      </select>
      <button type="submit" onClick={handleClick}>
        提交
      </button>
    </form>
  )
}
\`\`\`

常见元素类型对应表：
- \`HTMLButtonElement\` - \`<button>\`
- \`HTMLInputElement\` - \`<input>\`
- \`HTMLSelectElement\` - \`<select>\`
- \`HTMLTextAreaElement\` - \`<textarea>\`
- \`HTMLFormElement\` - \`<form>\`
- \`HTMLDivElement\` - \`<div>\`
- \`HTMLAnchorElement\` - \`<a>\`
- \`HTMLLabelElement\` - \`<label>\`
- \`HTMLElement\` - 通用元素类型

## 二、事件处理器类型推导

你不需要总是手动标注事件类型，TypeScript 可以根据上下文自动推导。分两种情况：

### 2.1 内联函数：自动推导

当事件处理函数直接写在 JSX 的 \`onClick={}\` 里面时，TypeScript 自动推导事件类型：

\`\`\`tsx
function InlineHandlers() {
  return (
    <button
      // ✅ 内联写法：e 的类型自动推导为 MouseEvent<HTMLButtonElement>
      onClick={e => {
        console.log(e.currentTarget) // 有完整类型提示
      }}
    >
      点击
    </button>
  )
}
\`\`\`

### 2.2 命名函数：需要手动标注

当处理函数提取到外面时，需要手动标注类型：

\`\`\`tsx
// ✅ 命名函数：手动标注事件类型
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  console.log('clicked', e.currentTarget)
}

function NamedHandlers() {
  return <button onClick={handleClick}>点击</button>
}
\`\`\`

### 2.3 不标注类型会怎样？

\`\`\`tsx
// ❌ 如果不标注类型，e 隐式为 any（strict 模式下会报错）
const badHandler = e => {
  console.log(e.target.value) // e 是 any，没有类型检查
}

// ✅ 也可以给 handler 变量标注类型，参数类型自动匹配
const goodHandler: React.MouseEventHandler<HTMLButtonElement> = e => {
  console.log(e.currentTarget) // e 类型正确推导
}
\`\`\`

事件处理器类型简写：
- \`React.MouseEventHandler<T>\` 等价于 \`(e: MouseEvent<T>) => void\`
- \`React.ChangeEventHandler<T>\` 等价于 \`(e: ChangeEvent<T>) => void\`
- \`React.FormEventHandler<T>\` 等价于 \`(e: FormEvent<T>) => void\`

## 三、SyntheticEvent 合成事件

React 事件不是原生 DOM 事件，而是 \`SyntheticEvent\` 合成事件。它是浏览器原生事件的跨浏览器包装，拥有和原生事件相同的接口（\`stopPropagation()\`、\`preventDefault()\` 等），但在所有浏览器中行为一致。

\`\`\`tsx
function SyntheticEventDemo() {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // e 是 SyntheticEvent<MouseEvent>，不是原生 MouseEvent
    console.log(e instanceof SyntheticEvent) // true

    // 阻止默认行为
    e.preventDefault()

    // 阻止事件冒泡
    e.stopPropagation()

    // 如果需要访问原生事件
    const nativeEvent = e.nativeEvent

    // currentTarget：绑定事件处理的元素（类型确定）
    console.log(e.currentTarget) // HTMLDivElement

    // target：实际触发事件的元素（类型可能是子元素，是 EventTarget | null）
    console.log(e.target) // EventTarget，可能需要类型断言
    if (e.target instanceof HTMLButtonElement) {
      console.log(e.target.textContent) // 类型 narrowing 后访问
    }
  }

  return (
    <div onClick={handleClick}>
      <button>点击我</button>
    </div>
  )
}
\`\`\`

⚠️ **React 17+ 事件委托变更**：React 17 之前，合成事件被委托到 \`document\` 上；React 17+ 委托到根容器（\`root\`）上，这样多个 React 版本共存时事件不会冲突。

⚠️ **事件池（已移除）**：React 17 之前合成事件会被对象池复用，异步回调中访问事件会失效。React 17+ 已移除事件池，不需要再 \`e.persist()\`。

## 四、stopPropagation 与 preventDefault

\`\`\`tsx
function EventPropagationDemo() {
  const handleOuterClick = () => {
    console.log('外层 div 被点击')
  }

  const handleInnerClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // ✅ 阻止冒泡，外层 div 的 onClick 不会触发
    console.log('内层按钮被点击')
  }

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault() // ✅ 阻止默认行为（链接跳转、表单提交等）
    console.log('链接被点击，但不跳转')
  }

  return (
    <div onClick={handleOuterClick} style={{ padding: 20, background: '#eee' }}>
      外层区域
      <button onClick={handleInnerClick}>点击（不冒泡）</button>
      <a href="https://example.com" onClick={handleLinkClick}>
        链接（不跳转）
      </a>
    </div>
  )
}
\`\`\`

## 五、防抖与节流

在处理频繁触发的事件（如搜索框输入、窗口 resize、滚动）时，需要使用防抖（debounce）或节流（throttle）来优化性能。

### 5.1 防抖实现

\`\`\`tsx
import { useState, useRef, useCallback, useEffect } from 'react'

// 自定义防抖 Hook
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  // 用 useRef 存储 timer ID，跨渲染保持稳定
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 用 useCallback 缓存防抖函数
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      // 每次调用清除之前的 timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      // 设置新的 timer
      timerRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  // 组件卸载时清除 timer，避免内存泄漏
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return debouncedFn
}

// 使用防抖搜索
function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])

  // 搜索函数
  const performSearch = useCallback((searchTerm: string) => {
    console.log('执行搜索：', searchTerm)
    // 模拟 API 调用
    setResults([\`结果1: \${searchTerm}\`, \`结果2: \${searchTerm}\`])
  }, [])

  // 创建防抖版本的搜索（300ms 内重复调用只执行最后一次）
  const debouncedSearch = useDebounce(performSearch, 300)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value) // 输入时调用防抖搜索
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="搜索..."
        className="px-3 py-2 border rounded w-full"
      />
      <ul>
        {results.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  )
}
\`\`\`

### 5.2 节流实现

\`\`\`tsx
// 自定义节流 Hook
function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  limit: number
): T {
  const inThrottleRef = useRef(false)
  const lastArgsRef = useRef<Parameters<T> | null>(null)

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callback(...args)
        inThrottleRef.current = true
        setTimeout(() => {
          inThrottleRef.current = false
          // 如果期间有调用，执行最后一次
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current)
            lastArgsRef.current = null
          }
        }, limit)
      } else {
        // 节流期间保存最后一次参数
        lastArgsRef.current = args
      }
    },
    [callback, limit]
  ) as T

  return throttledFn
}

// 节流使用示例：滚动加载
function ScrollDemo() {
  const [items, setItems] = useState<number[]>(Array.from({ length: 20 }, (_, i) => i))

  const loadMore = useCallback(() => {
    console.log('加载更多...')
    setItems(prev => [
      ...prev,
      ...Array.from({ length: 10 }, (_, i) => prev.length + i),
    ])
  }, [])

  const throttledLoadMore = useThrottle(loadMore, 1000) // 1秒内最多执行一次

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + document.documentElement.scrollTop
      const docHeight = document.documentElement.offsetHeight
      if (scrollBottom >= docHeight - 100) {
        throttledLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [throttledLoadMore])

  return (
    <div>
      {items.map(item => (
        <div key={item} className="p-4 border-b">Item {item}</div>
      ))}
    </div>
  )
}
\`\`\`

**防抖 vs 节流**：
- **防抖（debounce）**：事件触发后等待 delay 毫秒才执行，如果期间再次触发则重新计时。适合搜索框输入、窗口 resize。
- **节流（throttle）**：规定时间内最多执行一次。适合滚动事件、鼠标移动、按钮防抖点击。

## 六、事件传参技巧

### 6.1 箭头函数传参（最常用）

\`\`\`tsx
interface Item {
  id: number
  name: string
}

function ItemList() {
  const [items] = useState<Item[]>([
    { id: 1, name: '苹果' },
    { id: 2, name: '香蕉' },
    { id: 3, name: '橘子' },
  ])

  // 接收 id 参数
  const handleDelete = (id: number) => {
    console.log('删除 item', id)
  }

  // 接收事件和额外参数
  const handleItemClick = (item: Item, e: MouseEvent<HTMLLIElement>) => {
    console.log('点击 item', item.name, e.currentTarget)
  }

  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          {/* 箭头函数：接收事件对象 e，调用时传入 item */}
          onClick={e => handleItemClick(item, e)}
        >
          {item.name}
          {/* 传 id 参数 */}
          <button onClick={() => handleDelete(item.id)}>删除</button>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

### 6.2 data-* 属性传参

通过 \`data-*\` 自定义属性传递参数，在事件处理函数中通过 \`e.currentTarget.dataset\` 获取：

\`\`\`tsx
function DataAttrDemo() {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id // string | undefined
    const action = e.currentTarget.dataset.action // string | undefined
    console.log('点击按钮', id, action)
    if (id) {
      console.log('处理 id:', parseInt(id, 10))
    }
  }

  return (
    <div>
      {/* data-id 和 data-action 通过 dataset 访问 */}
      <button data-id="123" data-action="edit" onClick={handleClick}>
        编辑
      </button>
      <button data-id="456" data-action="delete" onClick={handleClick}>
        删除
      </button>
    </div>
  )
}
\`\`\`

**两种方式对比**：
- **箭头函数传参**：直接、类型安全（参数可以是任意类型，不限于字符串）；但每次渲染创建新函数，可能导致子组件重渲染。
- **data-* 属性传参**：函数引用稳定；但只能传字符串值，需要手动类型转换，类型安全性较弱。

一般场景推荐箭头函数传参，性能敏感的大量列表场景考虑 data-* 或 \`useCallback\` + 稳定函数。

## 七、小结

- 常见事件类型：\`MouseEvent\`、\`ChangeEvent\`、\`FormEvent\`、\`KeyboardEvent\`、\`FocusEvent\`
- 事件泛型参数是 DOM 元素类型：\`MouseEvent<HTMLButtonElement>\`
- 内联事件处理器类型自动推导，命名函数需要手动标注或用 \`*EventHandler\` 类型
- React 事件是 SyntheticEvent 合成事件，跨浏览器兼容
- 防抖用 \`useRef\` 存储 timer + \`useEffect\` 清理；节流用时间戳或 flag 控制频率
- 事件传参用箭头函数最常用；大量列表时可用 data-* 属性
- 注意 \`e.target\` 和 \`e.currentTarget\` 的区别，target 是触发元素，currentTarget 是绑定元素

下一章我们将学习条件渲染和列表渲染的更多模式。
`,
  },
  {
    id: "tsrx-conditional",
    group: "基础篇",
    icon: "🔀",
    title: "条件渲染与列表渲染模式",
    content: `

# 条件渲染与列表渲染模式

条件渲染和列表渲染是 React 开发中最常用的两种渲染模式。本章我们将系统总结各种条件渲染模式的适用场景，深入讲解列表渲染的高级技巧，以及枚举映射、数组操作等实用模式。

## 一、条件渲染模式对比

我们有多种方式实现条件渲染，每种方式有其适用场景：

### 1.1 三元运算符：二选一场景

三元运算符 \`condition ? a : b\` 适合简单的二选一渲染：

\`\`\`tsx
interface UserGreetingProps {
  isLoggedIn: boolean
  username?: string
}

function UserGreeting({ isLoggedIn, username }: UserGreetingProps): JSX.Element {
  return (
    <div>
      {/* 文本二选一 */}
      <p>{isLoggedIn ? \`欢迎回来，\${username}！\` : '请先登录'}</p>
      
      {/* 样式二选一 */}
      <span className={isLoggedIn ? 'text-green-600' : 'text-gray-400'}>
        {isLoggedIn ? '已登录' : '未登录'}
      </span>
      
      {/* 组件二选一 */}
      {isLoggedIn ? <UserMenu /> : <LoginButton />}
    </div>
  )
}
\`\`\`

三元可以嵌套，但嵌套超过两层可读性会变差，此时应考虑提前 return 或 IIFE：

\`\`\`tsx
// ❌ 不好：嵌套三元可读性差
{isLoading ? (
  <Spinner />
) : isError ? (
  <ErrorMessage />
) : isEmpty ? (
  <EmptyState />
) : (
  <DataList />
)}

// ✅ 好：多状态用提前 return 或枚举映射
\`\`\`

### 1.2 && 短路运算：显隐控制

\`&&\` 适合单个元素的显示/隐藏（没有"否则"分支）：

\`\`\`tsx
function Toolbar({ isAdmin, notifications }: {
  isAdmin: boolean
  notifications: number
}) {
  return (
    <div className="toolbar">
      {/* 管理员才显示的按钮 */}
      {isAdmin && <AdminPanelButton />}
      
      {/* ⚠️ 经典陷阱：数字 0 会被渲染！ */}
      {/* ❌ 错误：notifications 为 0 时页面会显示 0 */}
      {notifications && <NotificationBadge count={notifications} />}
      
      {/* ✅ 正确：明确判断 > 0 */}
      {notifications > 0 && <NotificationBadge count={notifications} />}
      
      {/* ✅ 正确：转换为布尔值 */}
      {!!notifications && <NotificationBadge count={notifications} />}
      {Boolean(notifications) && <NotificationBadge count={notifications} />}
      
      {/* 数组长度同理 */}
      {/* ❌ items.length 为 0 时显示 0 */}
      {items.length && <ItemList items={items} />}
      {/* ✅ */}
      {items.length > 0 && <ItemList items={items} />}
    </div>
  )
}
\`\`\`

**为什么 0 会被渲染？** 在 JavaScript 中，\`0 && 'x'\` 结果是 0（falsy 值），但 React 认为 0 是合法的可渲染值，会把它渲染成文本 0。而 \`false\`、\`null\`、\`undefined\`、\`true\` 不会被渲染。

### 1.3 提前 return：多态渲染（四态组件）

当组件有多个状态（加载中、错误、空、成功）时，提前 return 是最清晰的模式：

\`\`\`tsx
interface AsyncData<T> {
  isLoading: boolean
  error: Error | null
  data: T | null
}

function DataView<T>({ state }: { state: AsyncData<T> }) {
  // 1. 加载中：最先判断，骨架屏或 spinner
  if (state.isLoading) {
    return (
      <div className="skeleton-container">
        <div className="skeleton-line h-4 w-3/4 mb-2 animate-pulse bg-gray-200 rounded" />
        <div className="skeleton-line h-4 w-1/2 mb-2 animate-pulse bg-gray-200 rounded" />
        <div className="skeleton-line h-4 w-2/3 animate-pulse bg-gray-200 rounded" />
      </div>
    )
  }

  // 2. 错误态
  if (state.error) {
    return (
      <div className="error-state text-center py-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-red-700">加载失败</h3>
        <p className="text-sm text-red-500 mt-1">{state.error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          重试
        </button>
      </div>
    )
  }

  // 3. 空状态
  if (!state.data || (Array.isArray(state.data) && state.data.length === 0)) {
    return (
      <div className="empty-state text-center py-8">
        <div className="text-gray-300 text-6xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-gray-500">暂无数据</h3>
        <p className="text-sm text-gray-400 mt-1">还没有任何内容</p>
      </div>
    )
  }

  // 4. 成功状态（最终渲染）
  return (
    <div className="success-state">
      <pre>{JSON.stringify(state.data, null, 2)}</pre>
    </div>
  )
}
\`\`\`

**判断顺序很重要**：Loading → Error → Empty → Success，这个顺序能正确处理各种边界情况。

### 1.4 IIFE（立即执行函数）：复杂分支逻辑

当渲染逻辑比较复杂、需要多步计算时，可以在 JSX 中使用 IIFE：

\`\`\`tsx
function ComplexGreeting({ user, hour }: {
  user: { name: string; vipLevel: number }
  hour: number
}) {
  return (
    <div className="greeting">
      {(() => {
        // 这里可以写任意 JS 逻辑：变量声明、循环、多层判断等
        let greeting = ''
        let bgColor = ''
        let icon = ''

        if (hour < 6) {
          greeting = '夜深了'
          bgColor = 'bg-indigo-900 text-white'
          icon = '🌙'
        } else if (hour < 12) {
          greeting = '早上好'
          bgColor = 'bg-yellow-100 text-yellow-800'
          icon = '🌅'
        } else if (hour < 18) {
          greeting = '下午好'
          bgColor = 'bg-blue-100 text-blue-800'
          icon = '☀️'
        } else {
          greeting = '晚上好'
          bgColor = 'bg-purple-100 text-purple-800'
          icon = '🌆'
        }

        if (user.vipLevel >= 3) {
          greeting += '，尊敬的 VIP' + user.vipLevel + ' 用户'
        }

        return (
          <div className={\`p-4 rounded-lg \${bgColor}\`}>
            <span className="text-2xl mr-2">{icon}</span>
            <span className="font-medium">{greeting}，{user.name}！</span>
          </div>
        )
      })()}
    </div>
  )
}
\`\`\`

IIFE 适合在 JSX 中写临时的复杂逻辑，但要注意：
- 逻辑太长（超过20行）应该提取到组件函数体中，或者拆成独立组件
- 别忘了最后的 \`()\`，否则函数不会执行

### 1.5 枚举映射（Record 模式）：N 种状态

当状态种类较多（如表单步骤、通知类型、角色权限等），使用**枚举映射**比多个 if/else 或 switch 更优雅：

\`\`\`tsx
// 通知类型
type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationMessage {
  type: NotificationType
  title: string
  message: string
}

// 枚举映射：每种类型对应不同的样式配置
const NOTIFICATION_CONFIG: Record<NotificationType, {
  bgColor: string
  icon: string
  titleColor: string
}> = {
  success: { bgColor: 'bg-green-50', icon: '✅', titleColor: 'text-green-800' },
  error: { bgColor: 'bg-red-50', icon: '❌', titleColor: 'text-red-800' },
  warning: { bgColor: 'bg-yellow-50', icon: '⚠️', titleColor: 'text-yellow-800' },
  info: { bgColor: 'bg-blue-50', icon: 'ℹ️', titleColor: 'text-blue-800' },
}

function Notification({ type, title, message }: NotificationMessage): JSX.Element {
  const config = NOTIFICATION_CONFIG[type]

  return (
    <div className={\`p-4 rounded-lg border \${config.bgColor} border-current/20\`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{config.icon}</span>
        <div>
          <h4 className={\`font-semibold \${config.titleColor}\`}>{title}</h4>
          <p className="text-sm mt-1 text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  )
}

// 表单步骤示例
type Step = 'login' | 'verify' | 'profile' | 'complete'

const STEP_COMPONENTS: Record<Step, JSX.Element> = {
  login: <LoginForm />,
  verify: <VerifyCodeForm />,
  profile: <ProfileForm />,
  complete: <WelcomeScreen />,
}

function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('login')

  return (
    <div className="wizard">
      <Stepper current={currentStep} onChange={setCurrentStep} />
      {/* 根据当前步骤直接映射到对应组件 */}
      {STEP_COMPONENTS[currentStep]}
    </div>
  )
}
\`\`\`

**枚举映射的优点**：
1. 查找是 O(1)，比 if/else 或 switch 快
2. 配置集中，新增/修改类型只需要改一个地方
3. 类型安全：TypeScript 会检查 Record 的 key 是否覆盖所有情况

## 二、列表渲染进阶

### 2.1 key 的最佳原则回顾

- **key 必须是稳定的、唯一的**：使用数据项自带的唯一 id（数据库 id、uuid 等）
- **禁止使用数组 index 作为 key**：除非列表是静态的、不会重排/增删
- **key 变化会导致组件销毁重建**：key 改变 = 旧组件卸载 + 新组件挂载，state 会丢失

\`\`\`tsx
// ✅ 好：使用数据 id
{users.map(user => <UserRow key={user.id} user={user} />)}

// ⚠️ 只有在列表完全静态（不增删、不排序、无状态子组件）时才可用 index
{staticOptions.map((option, index) => (
  <option key={index} value={option.value}>{option.label}</option>
))}
\`\`\`

### 2.2 列表操作组合：filter + map + sort + reduce

列表渲染时经常需要先过滤、排序，再转换为 JSX：

\`\`\`tsx
interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
  rating: number
}

function ProductList({ products }: { products: Product[] }) {
  // 派生数据：先处理数据，再渲染
  const displayProducts = useMemo(() => {
    return products
      .filter(p => p.inStock)          // 1. 过滤：只显示有货的
      .filter(p => p.price < 1000)     // 2. 过滤：价格不超过1000
      .sort((a, b) => b.rating - a.rating) // 3. 排序：评分从高到低
  }, [products])

  // reduce 实现分组
  const groupedByCategory = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((groups, product) => {
      const category = product.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(product)
      return groups
    }, {})
  }, [products])

  return (
    <div>
      {/* 过滤排序后的列表 */}
      <h2>推荐商品</h2>
      <div className="grid grid-cols-3 gap-4">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 分组显示 */}
      <h2>分类浏览</h2>
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="font-bold text-lg mb-2">{category}</h3>
          <div className="flex gap-3 overflow-x-auto">
            {items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
\`\`\`

### 2.3 flatMap：嵌套数组展开

当数据有嵌套层级（如评论和回复），用 \`flatMap\` 可以在 map 同时展开嵌套：

\`\`\`tsx
interface Comment {
  id: number
  author: string
  content: string
  replies?: Comment[]
}

function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="comments">
      {comments
        // flatMap：可以返回数组，最终结果被扁平化为一维
        .flatMap(comment => [
          // 先渲染主评论
          <CommentItem key={comment.id} comment={comment} />,
          // 再渲染该评论的所有回复（如果有）
          ...(comment.replies?.map(reply => (
            <ReplyItem key={reply.id} reply={reply} className="ml-8" />
          )) ?? []),
        ])}
    </div>
  )
}
\`\`\`

### 2.4 Array.from 构造指定长度数组

当需要渲染 N 个重复元素（如骨架屏、分页器、星级评分）时，用 \`Array.from\`：

\`\`\`tsx
// 骨架屏：渲染 5 个占位条
function SkeletonList() {
  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-12 bg-gray-200 rounded mb-3 animate-pulse"
        />
      ))}
    </div>
  )
}

// 分页器：根据总页数渲染页码
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={\`w-8 h-8 rounded \${
            page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }\`}
        >
          {page}
        </button>
      ))}
    </div>
  )
}

// 星级评分
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}
\`\`\`

## 三、条件渲染 + 列表渲染组合 Demo

这是一个结合了多种条件渲染和列表渲染模式的完整任务看板：

\`\`\`tsx
type TaskStatus = 'todo' | 'in-progress' | 'done'

interface Task {
  id: number
  title: string
  status: TaskStatus
  assignee?: string
  priority: 'low' | 'medium' | 'high'
}

function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: '设计数据库Schema', status: 'done', assignee: '张三', priority: 'high' },
    { id: 2, title: '实现用户认证', status: 'in-progress', assignee: '李四', priority: 'high' },
    { id: 3, title: '编写API文档', status: 'todo', priority: 'medium' },
    { id: 4, title: '前端页面开发', status: 'todo', assignee: '王五', priority: 'medium' },
    { id: 5, title: '性能优化', status: 'todo', priority: 'low' },
  ])
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [loading] = useState(false)

  // 加载中骨架屏（提前 return）
  if (loading) {
    return (
      <div className="p-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg mb-4 animate-pulse" />
        ))}
      </div>
    )
  }

  // 按状态分组（reduce）
  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': [],
    }
    for (const task of tasks) {
      groups[task.status].push(task)
    }
    return groups
  }, [tasks])

  // 优先级映射（枚举映射）
  const PRIORITY_CONFIG = {
    high: { label: '高', color: 'bg-red-100 text-red-700' },
    medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
    low: { label: '低', color: 'bg-gray-100 text-gray-600' },
  } as const

  // 列配置
  const COLUMNS: Record<TaskStatus, { title: string; color: string }> = {
    'todo': { title: '待办', color: 'border-gray-300' },
    'in-progress': { title: '进行中', color: 'border-blue-400' },
    'done': { title: '已完成', color: 'border-green-400' },
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">任务看板</h1>

      {/* 筛选按钮（&& + 三元） */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={\`px-3 py-1 rounded \${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
        >
          全部
        </button>
        {(Object.keys(COLUMNS) as TaskStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={\`px-3 py-1 rounded \${filter === status ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
          >
            {COLUMNS[status].title}
          </button>
        ))}
      </div>

      {/* 看板列 */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(COLUMNS) as [TaskStatus, typeof COLUMNS[TaskStatus]][])
          // 根据 filter 过滤列
          .filter(([status]) => filter === 'all' || filter === status)
          .map(([status, config]) => {
            const columnTasks = tasksByStatus[status]

            return (
              <div key={status} className={\`border-t-4 \${config.color} bg-gray-50 rounded-lg p-4\`}>
                <h2 className="font-semibold mb-3 flex items-center justify-between">
                  {config.title}
                  <span className="text-sm text-gray-500 font-normal">
                    {columnTasks.length}
                  </span>
                </h2>

                {/* 空状态（提前 return 在 map 内不好用，用三元或&&） */}
                {columnTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">暂无任务</p>
                ) : (
                  <div className="space-y-2">
                    {columnTasks.map(task => (
                      <div key={task.id} className="bg-white p-3 rounded shadow-sm">
                        <p className="font-medium text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {/* 优先级标签（枚举映射） */}
                          <span className={\`text-xs px-2 py-0.5 rounded \${PRIORITY_CONFIG[task.priority].color}\`}>
                            {PRIORITY_CONFIG[task.priority].label}
                          </span>
                          {/* 负责人（&& 显隐） */}
                          {task.assignee && (
                            <span className="text-xs text-gray-500">
                              👤 {task.assignee}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
\`\`\`

## 四、小结

- 三元运算符适合二选一，嵌套超过两层考虑其他方式
- \`&&\` 适合显隐控制，**必须注意 0 渲染陷阱**，用 \`> 0\` 或 \`!!\`
- 提前 return 适合多状态（Loading/Error/Empty/Success），按优先级顺序判断
- IIFE 适合 JSX 中临时复杂逻辑，但不要写太长
- 枚举映射（\`Record<Status, ...>\`）适合 N 种状态映射，集中管理
- 列表 key 用稳定 id，不要用 index（静态列表除外）
- 熟练组合 \`filter\`、\`map\`、\`sort\`、\`reduce\`、\`flatMap\` 处理数组数据
- \`Array.from({ length: N }, (_, i) => ...)\` 构造指定长度数组

下一章我们将学习 useEffect 副作用管理。
`,
  },
  {
    id: "tsrx-useeffect",
    group: "基础篇",
    icon: "⚡",
    title: "useEffect副作用管理",
    content: `

# useEffect 副作用管理

\`useEffect\` 是 React Hooks 中最强大也最容易用错的 Hook。它让函数组件能够执行副作用操作：数据请求、订阅、DOM 操作、定时器等。本章我们将深入学习 useEffect 的依赖数组、清理函数、数据请求模式、生命周期映射，以及常见陷阱与最佳实践。

## 一、useEffect 基本结构

\`useEffect\` 接收两个参数：副作用函数和依赖数组。副作用函数可以返回一个清理函数。

\`\`\`tsx
import { useEffect, useState } from 'react'

function EffectDemo() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  // useEffect 的完整结构
  useEffect(() => {
    // 1. 这里是副作用逻辑：在渲染提交到 DOM 之后执行
    console.log('effect 执行：count 或 name 变化了', count, name)

    // 2. 可选的清理函数（cleanup）
    // 在组件卸载前，或下一次 effect 执行前调用
    return () => {
      console.log('cleanup 执行：清理上一次的副作用')
    }
  }, [count, name]) // 3. 依赖数组：控制 effect 何时重新执行

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <input value={name} onChange={e => setName(e.target.value)} />
    </div>
  )
}
\`\`\`

**执行时机**：
1. 组件首次渲染完成 → 执行 effect 函数
2. 依赖数组中的值发生变化 → 先执行上一次的 cleanup → 再执行新的 effect
3. 组件卸载 → 执行 cleanup

## 二、依赖数组的三种情况

依赖数组 \`deps\` 的不同写法决定了 effect 的执行时机：

### 2.1 不传依赖数组：每次渲染后都执行

\`\`\`tsx
// ❌ 几乎不用：不传第二个参数，每次组件渲染都执行
// 容易造成无限循环或性能问题
useEffect(() => {
  console.log('每次渲染后都执行')
})
\`\`\`

### 2.2 空数组 []：只在挂载和卸载时执行

\`\`\`tsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  // 空数组：挂载时启动定时器，卸载时清除
  useEffect(() => {
    console.log('组件挂载：启动定时器')
    const timer = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    // cleanup 在组件卸载时执行
    return () => {
      console.log('组件卸载：清除定时器')
      clearInterval(timer)
    }
  }, []) // 空数组，这个 effect 只执行一次

  return <p>已运行 {seconds} 秒</p>
}
\`\`\`

空数组的 effect 适合：
- 添加/移除全局事件监听
- 初始化定时器/interval
- 建立和断开 WebSocket 连接
- 只需要在组件挂载时执行一次的初始化逻辑

### 2.3 传入依赖 [a, b]：依赖变化时执行

\`\`\`tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)

  // userId 变化时重新请求用户数据
  useEffect(() => {
    console.log('userId 变化，重新请求用户数据：', userId)
    
    let cancelled = false

    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data)
      }
    })

    // cleanup：userId 再次变化或组件卸载时，取消上一次请求
    return () => {
      cancelled = true
    }
  }, [userId]) // 依赖 userId

  if (!user) return <div>加载中...</div>
  return <div>{user.name}</div>
}
\`\`\`

**依赖数组的比较是引用比较（Object.is）**：
- 原始类型（number、string、boolean）：比较值
- 对象、数组、函数：比较引用地址

这就是为什么把对象/函数直接作为依赖容易导致无限循环：每次渲染创建新引用。

## 三、cleanup 清理函数详解

cleanup 函数是 useEffect 最重要的部分之一，用于清除上一次 effect 产生的资源。常见的清理场景：

\`\`\`tsx
function CleanupDemo() {
  const [isSubscribed, setIsSubscribed] = useState(true)

  useEffect(() => {
    // 1. 清除定时器
    const timer = setTimeout(() => {
      console.log('timeout 执行')
    }, 1000)

    // 2. 移除 DOM 事件监听
    const handleResize = () => console.log('window resized')
    window.addEventListener('resize', handleResize)

    // 3. AbortController 取消 fetch 请求
    const controller = new AbortController()
    fetch('/api/data', { signal: controller.signal })

    // 4. WebSocket 断开连接
    const ws = new WebSocket('wss://example.com')
    ws.addEventListener('open', () => console.log('ws connected'))

    // 5. 发布订阅模式取消订阅
    const subscription = eventBus.subscribe('event', handler)

    // cleanup 函数
    return () => {
      clearTimeout(timer)                // 清除定时器
      window.removeEventListener('resize', handleResize) // 移除事件监听
      controller.abort()                 // 取消 fetch
      ws.close()                         // 关闭 WebSocket
      subscription.unsubscribe()         // 取消订阅
    }
  }, [isSubscribed])

  return <div>Cleanup Demo</div>
}
\`\`\`

**cleanup 执行时机**：
1. 组件卸载时（unmount）
2. 依赖变化导致 effect 重新执行前，先执行上一次的 cleanup
3. 开发环境下 React 18 Strict Mode 会额外执行一次 mount → unmount → mount 来帮助发现 cleanup 问题

## 四、数据请求模式

在 useEffect 中请求数据是最常见的场景之一。注意：**不要把 async 函数直接传给 useEffect**，因为 async 函数返回 Promise，而 useEffect 期望返回 cleanup 函数或 void。

\`\`\`tsx
interface User {
  id: number
  name: string
  email: string
}

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ✅ 正确：在 effect 内部定义 async 函数并调用
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(\`/api/users/\${userId}\`)
        if (!response.ok) {
          throw new Error('请求失败')
        }
        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  // 或者使用 IIFE 方式
  useEffect(() => {
    (async () => {
      const res = await fetch(\`/api/users/\${userId}\`)
      const data = await res.json()
      setUser(data)
    })()
  }, [userId])

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误：{error}</div>
  if (!user) return <div>用户不存在</div>

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
\`\`\`

⚠️ **竞态条件（Race Condition）问题**：如果快速切换 userId，前一个请求可能在后一个请求之后返回，导致显示错误的数据。用 cleanup 解决：

\`\`\`tsx
useEffect(() => {
  let cancelled = false

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(\`/api/users/\${userId}\`)
      const data = await res.json()
      // 只有当组件未卸载、userId 未变化时才更新状态
      if (!cancelled) {
        setUser(data)
        setError(null)
      }
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : '错误')
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  fetchData()

  // cleanup：设置标记，阻止过期请求更新状态
  return () => {
    cancelled = true
  }
}, [userId])
\`\`\`

更现代的方式是使用 AbortController：

\`\`\`tsx
useEffect(() => {
  const controller = new AbortController()

  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(err => {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    })
    .finally(() => setLoading(false))

  // cleanup：取消请求
  return () => controller.abort()
}, [userId])
\`\`\`

## 五、useEffect 生命周期映射

在类组件中我们熟悉 componentDidMount、componentDidUpdate、componentWillUnmount 生命周期。useEffect 通过依赖数组可以模拟这些生命周期，但心智模型不同：

\`\`\`tsx
// 1. componentDidMount：空数组依赖，只在挂载后执行一次
useEffect(() => {
  console.log('组件挂载完成')
  // 初始化操作：获取数据、添加事件监听等
}, [])

// 2. componentWillUnmount：cleanup 函数在空数组依赖时，卸载时执行
useEffect(() => {
  const handler = () => console.log('resize')
  window.addEventListener('resize', handler)
  return () => {
    console.log('组件卸载前清理')
    window.removeEventListener('resize', handler)
  }
}, [])

// 3. componentDidUpdate：带依赖的 effect，依赖变化时执行
// 注意：首次渲染也会执行，不像 componentDidUpdate 只在更新时执行
useEffect(() => {
  console.log('userId 变为：', userId)
  // 根据新 userId 加载数据
}, [userId])

// 4. 如果想跳过首次执行（只在更新时执行），用 useRef 标记
function useDidUpdate(effect: () => void, deps: any[]) {
  const isFirst = useRef(true)
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    return effect()
  }, deps)
}
\`\`\`

## 六、eslint-plugin-react-hooks 规则

ESLint 插件 \`eslint-plugin-react-hooks\` 提供两个重要规则：

1. **react-hooks/rules-of-hooks**：确保 Hook 在顶层调用，不在条件、循环、嵌套函数中调用
2. **react-hooks/exhaustive-deps**：确保 effect 中使用的所有响应式值都包含在依赖数组中

\`\`\`tsx
// ❌ exhaustive-deps 警告：effect 中使用了 userId 但没加到依赖数组
useEffect(() => {
  fetchUser(userId)
  // eslint-disable-next-line react-hooks/exhaustive-deps // 可以禁用但要知道原因
}, []) // 缺少 userId 依赖

// ✅ 正确：所有响应式值都在依赖数组中
useEffect(() => {
  fetchUser(userId)
}, [userId])
\`\`\`

**什么时候可以禁用 exhaustive-deps？**
- 你明确知道只想在挂载时执行一次，且引用的函数/值是稳定的
- 使用了 useCallback/useMemo 包裹依赖

但绝大多数情况，**应该遵循 exhaustive-deps 规则**，警告通常意味着你的代码有问题。

## 七、常见错误与陷阱

### 7.1 无限循环：缺少依赖或依赖引用变化

\`\`\`tsx
function InfiniteLoop() {
  const [count, setCount] = useState(0)

  // ❌ 无限循环：每次渲染创建新对象/函数作为依赖
  useEffect(() => {
    setCount(c => c + 1) // 触发重渲染
  }, [{}]) // {} 每次渲染都是新引用，effect 无限执行

  // ❌ 无限循环：函数作为依赖
  const handler = () => console.log('handler')
  useEffect(() => {
    handler()
  }, [handler]) // handler 每次渲染都是新函数

  // ✅ 用 useCallback 稳定函数引用
  const stableHandler = useCallback(() => {
    console.log('stable handler')
  }, [])
  useEffect(() => {
    stableHandler()
  }, [stableHandler])
}
\`\`\`

### 7.2 陈旧闭包（Stale Closure）

effect 中捕获的是定义时的 props/state，如果依赖没正确声明，会拿到旧值：

\`\`\`tsx
function StaleClosureDemo() {
  const [count, setCount] = useState(0)

  // ❌ 陈旧闭包：count 始终是初始值 0
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count) // 永远打印 0
      setCount(count + 1) // 永远 0 + 1 = 1
    }, 1000)
    return () => clearInterval(timer)
  }, []) // 缺少 count 依赖

  // ✅ 正确：用函数式更新 + 正确依赖
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1) // 函数式更新不依赖当前 count
    }, 1000)
    return () => clearInterval(timer)
  }, []) // 空数组也安全，因为使用了函数式更新
}
\`\`\`

### 7.3 滥用 useEffect：不要用 useEffect 处理所有事情

\`\`\`tsx
// ❌ 滥用 useEffect：可以在渲染期间直接计算的值，不需要 state + effect
function BadDerivedState({ todos }: { todos: Todo[] }) {
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    setCompletedCount(todos.filter(t => t.completed).length)
  }, [todos])

  return <p>已完成：{completedCount}</p>
}

// ✅ 正确：派生状态直接在渲染时计算
function GoodDerivedState({ todos }: { todos: Todo[] }) {
  const completedCount = todos.filter(t => t.completed).length
  return <p>已完成：{completedCount}</p>
}

// ❌ 滥用 useEffect：可以在事件处理中直接做的事，不需要 effect
function Form() {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // ❌ 不需要用 useEffect 来响应状态变化
  useEffect(() => {
    if (submitted) {
      console.log('表单提交，发送数据')
    }
  }, [submitted])

  const handleSubmit = () => {
    setSubmitted(true)
  }

  // ✅ 正确：直接在事件处理函数中执行
  const handleGoodSubmit = () => {
    console.log('表单提交，发送数据') // 直接执行
  }
}
\`\`\`

**useEffect 使用原则**：
- 只有当副作用需要与外部系统同步时才用（API 请求、订阅、DOM 操作）
- 可以在事件处理中做的事，不要用 useEffect
- 可以在渲染时计算的派生值，不要用 useState + useEffect

## 八、小结

- useEffect 结构：副作用函数 + 依赖数组 + 可选 cleanup
- 依赖数组三种情况：不传（每次渲染）、\`[]\`（只挂载一次）、\`[a, b]\`（a/b变化时）
- cleanup 在卸载前和下次 effect 执行前调用，用于清除定时器、取消请求等
- 数据请求在 effect 内定义 async 函数或用 IIFE，不要直接传 async 给 useEffect
- 用 AbortController 或 cancelled flag 解决竞态条件问题
- 遵循 exhaustive-deps 规则，不要随意禁用
- 避免无限循环：对象/函数作为依赖用 useMemo/useCallback 稳定引用
- 避免陈旧闭包：用函数式更新或正确声明依赖
- 不要滥用 useEffect：派生状态直接计算，事件逻辑在事件处理器中执行

下一章我们将学习 useRef 与 DOM 操作。
`,
  },
  {
    id: "tsrx-useref",
    group: "基础篇",
    icon: "📌",
    title: "useRef与DOM操作",
    content: `

# useRef 与 DOM 操作

\`useRef\` 是一个功能多样的 Hook，它不仅可以用来引用 DOM 元素，还可以作为跨渲染周期保存可变值的容器。本章我们将深入学习 useRef 的三种用途、DOM 操作技巧、forwardRef 转发、useImperativeHandle 暴露自定义 API，以及点击外部关闭弹窗等实战案例。

## 一、useRef 三种用途

\`useRef\` 返回一个可变的 ref 对象，其 \`.current\` 属性被初始化为传入的值。返回的对象在组件的整个生命周期内保持不变。

### 用途1：DOM 引用（最常见）

获取 DOM 元素的引用，直接调用 DOM 方法：

\`\`\`tsx
import { useRef, useEffect } from 'react'

function DOMRefDemo() {
  // 创建 ref，初始值为 null，泛型指定 DOM 元素类型
  const inputRef = useRef<HTMLInputElement>(null)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 组件挂载后自动聚焦 input
    // inputRef.current 类型是 HTMLInputElement | null
    if (inputRef.current) {
      inputRef.current.focus() // 有完整的 DOM API 类型提示
      inputRef.current.select()
    }
  }, [])

  const handleClick = () => {
    // 按钮点击时聚焦
    inputRef.current?.focus()
  }

  const handleScrollTo = () => {
    divRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="自动聚焦" />
      <button onClick={handleClick}>聚焦输入框</button>
      <div style={{ height: '100vh' }}>滚动区域</div>
      <div ref={divRef}>目标位置</div>
      <button onClick={handleScrollTo}>滚动到目标</button>
    </div>
  )
}
\`\`\`

常见 DOM ref 类型：
- \`useRef<HTMLInputElement>(null)\` - input
- \`useRef<HTMLDivElement>(null)\` - div
- \`useRef<HTMLButtonElement>(null)\` - button
- \`useRef<HTMLTextAreaElement>(null)\` - textarea
- \`useRef<HTMLFormElement>(null)\` - form
- \`useRef<HTMLCanvasElement>(null)\` - canvas

### 用途2：可变值容器（跨渲染保存值）

useRef 可以存储任意可变值，类似于类组件的实例属性。**修改 ref.current 不会触发重渲染**：

\`\`\`tsx
import { useRef, useState, useEffect } from 'react'

function MutableRefDemo() {
  const [count, setCount] = useState(0)
  // 存储定时器 ID
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // 记录前一个 count 值
  const prevCountRef = useRef<number>(0)
  // 记录渲染次数
  const renderCountRef = useRef(0)

  // 每次渲染更新渲染计数
  useEffect(() => {
    renderCountRef.current += 1
  })

  // 保存上一次的 count 值
  useEffect(() => {
    prevCountRef.current = count
  }, [count])

  const startTimer = () => {
    if (timerRef.current) return // 已存在则不重复创建
    timerRef.current = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div>
      <p>当前值：{count}</p>
      <p>前一次的值：{prevCountRef.current}</p>
      <p>渲染次数：{renderCountRef.current}</p>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
    </div>
  )
}
\`\`\`

**什么时候用 useRef 存值而不是 useState？**
- 存储的值不需要触发 UI 更新
- 需要在事件处理器或 effect 中访问最新值而不触发重渲染
- 存储定时器 ID、AbortController、上一个 props/state 值等

### 用途3：函数组件中的实例变量

在类组件中我们用 \`this.xxx\` 存储实例变量，在函数组件中用 useRef：

\`\`\`tsx
function InstanceVarDemo() {
  // 类似 this.isComponentMounted
  const isMountedRef = useRef(true)
  // 类似 this.eventHandler
  const handlerRef = useRef<((data: unknown) => void) | null>(null)

  useEffect(() => {
    handlerRef.current = (data) => {
      if (isMountedRef.current) {
        console.log('处理数据', data)
      }
    }

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return <div>Instance Variable Demo</div>
}
\`\`\`

## 二、DOM 操作常用场景

### 2.1 元素聚焦与滚动

\`\`\`tsx
function FocusAndScroll() {
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const scrollToItem = (index: number) => {
    const item = itemRefs.current[index]
    item?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    item?.focus()
  }

  // 获取元素尺寸
  const measureRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (measureRef.current) {
      const rect = measureRef.current.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
  }, [])

  return (
    <div>
      <div ref={measureRef}>测量我的尺寸</div>
      <p>宽：{size.width}px，高：{size.height}px</p>

      <button onClick={() => scrollToItem(5)}>滚动到第6项</button>
      <ul ref={listRef}>
        {Array.from({ length: 20 }, (_, i) => (
          <li
            key={i}
            ref={el => { itemRefs.current[i] = el }}
            tabIndex={0}
          >
            第 {i + 1} 项
          </li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

## 三、forwardRef：转发 ref 到子组件

默认情况下，函数组件不能接收 ref 属性。使用 \`forwardRef\` 可以将 ref 转发到组件内部的 DOM 元素：

\`\`\`tsx
import { forwardRef } from 'react'

// forwardRef 接收两个泛型参数：ref 类型、props 类型
const CustomInput = forwardRef<HTMLInputElement, {
  label: string
  value: string
  onChange: (value: string) => void
}>(({ label, value, onChange }, ref) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      {/* 将转发来的 ref 绑定到内部 input 上 */}
      <input
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-3 py-2"
      />
    </div>
  )
})

// 设置 displayName 便于调试
CustomInput.displayName = 'CustomInput'

// 使用转发的 ref
function ForwardRefDemo() {
  const inputRef = useRef<HTMLInputElement>(null)

  const focusInput = () => {
    // 直接访问子组件内部的 input DOM
    inputRef.current?.focus()
  }

  const [text, setText] = useState('')

  return (
    <div>
      <CustomInput
        ref={inputRef}
        label="用户名"
        value={text}
        onChange={setText}
      />
      <button onClick={focusInput}>聚焦输入框</button>
    </div>
  )
}
\`\`\`

## 四、useImperativeHandle：暴露自定义 API

\`useImperativeHandle\` 配合 \`forwardRef\` 使用，可以自定义暴露给父组件的 ref 值，而不是直接暴露整个 DOM 节点：

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

// 定义暴露给父组件的 API 类型
interface CustomInputHandle {
  focus: () => void
  blur: () => void
  reset: () => void
  scrollIntoView: () => void
  getValue: () => string
}

const AdvancedInput = forwardRef<CustomInputHandle, {
  placeholder?: string
}>(({ placeholder }, ref) => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 自定义暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    reset: () => setValue(''),
    scrollIntoView: () => inputRef.current?.scrollIntoView(),
    getValue: () => value,
  }), [value]) // 依赖数组，value 变化时更新 getValue

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder={placeholder}
    />
  )
})

AdvancedInput.displayName = 'AdvancedInput'

// 使用自定义 API
function ImperativeHandleDemo() {
  const inputRef = useRef<CustomInputHandle>(null)

  return (
    <div>
      <AdvancedInput ref={inputRef} placeholder="测试输入" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.reset()}>重置</button>
      <button onClick={() => alert(inputRef.current?.getValue())}>获取值</button>
    </div>
  )
}
\`\`\`

## 五、ref callback 模式

除了 useRef 创建的 ref 对象，ref 还可以接收一个回调函数：

\`\`\`tsx
function CallbackRefDemo() {
  const [height, setHeight] = useState(0)

  // ref callback：DOM 挂载时调用（参数是 DOM 元素），卸载时调用（参数是 null）
  const measureRef = (node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height)
    }
  }

  // 动态设置多个 ref
  const items = ['A', 'B', 'C']
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  return (
    <div>
      <div ref={measureRef}>
        测量我的高度
        <p>一些内容</p>
        <p>更多内容</p>
      </div>
      <p>高度：{height}px</p>

      <ul>
        {items.map(item => (
          <li
            key={item}
            ref={node => {
              if (node) {
                itemRefs.current.set(item, node)
              } else {
                itemRefs.current.delete(item)
              }
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

## 六、useRef vs useState 选择

| 特性 | useState | useRef |
|------|----------|--------|
| 修改值触发重渲染 | ✅ 是 | ❌ 否 |
| 值在渲染之间保持 | ✅ 是 | ✅ 是 |
| 可以在渲染期间读取最新值 | ✅ 是 | ⚠️ 不应在渲染期间读写 current |
| 适合存储 | UI 状态（影响渲染）| 不影响 UI 的可变值、DOM 引用、定时器 ID |

\`\`\`tsx
function RefVsState() {
  // ✅ 用 useState：值变化需要更新 UI
  const [count, setCount] = useState(0)

  // ✅ 用 useRef：值变化不需要更新 UI
  const timerIdRef = useRef<number | null>(null)
  const clickCountRef = useRef(0) // 仅用于日志/统计，不直接显示

  const handleClick = () => {
    clickCountRef.current += 1
    console.log('点击次数：', clickCountRef.current)
    setCount(c => c + 1) // UI 更新
  }

  return <button onClick={handleClick}>点击：{count}</button>
}
\`\`\`

## 七、实战：点击外部关闭弹窗（useOnClickOutside）

这是 useRef 最经典的实战场景之一：

\`\`\`tsx
import { useEffect, useRef, useState } from 'react'

// 自定义 Hook：点击元素外部时触发回调
function useOnClickOutside<T extends HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      // 如果点击发生在 ref 元素内部，不处理
      if (!ref.current || ref.current.contains(e.target as Node)) {
        return
      }
      // 点击外部，执行回调
      handler()
    }

    // mousedown 比 click 更早触发，体验更好
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [handler])

  return ref
}

// 弹窗组件
function Modal({ isOpen, onClose, children }: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  // 使用 hook，点击外部时关闭弹窗
  const modalRef = useOnClickOutside<HTMLDivElement>(onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

// 使用示例
function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        打开弹窗
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-bold mb-4">弹窗标题</h2>
        <p>点击弹窗外的区域可以关闭弹窗</p>
      </Modal>
    </div>
  )
}
\`\`\`

## 八、小结

- useRef 三种用途：DOM 引用、可变值容器、函数组件实例变量
- 修改 ref.current 不会触发重渲染，适合存储不影响 UI 的值
- 用泛型参数指定 ref 类型：\`useRef<HTMLInputElement>(null)\`
- forwardRef 转发 ref 到子组件内部的 DOM 元素
- useImperativeHandle 自定义暴露给父组件的命令式 API
- ref callback 在 DOM 挂载/卸载时调用，适合动态测量
- 选择原则：需要渲染更新用 useState，不需要更新用 useRef
- useOnClickOutside 是经典的 ref 实战：监听文档点击判断是否在外部

到此我们完成了 TypeScript + React 基础篇的学习，掌握了环境搭建、JSX 语法、组件定义、Props 类型、useState、事件处理、条件/列表渲染、useEffect、useRef 等核心知识。
`,
  },
];