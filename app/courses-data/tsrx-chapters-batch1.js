export const chapters = [
  {
    id: "tsrx-env",
    icon: "🛠️",
    group: "准备篇",
    title: "环境搭建与工程化入门",
    content: `## 环境搭建与工程化入门

在开始 TypeScript + React 开发之前，我们需要搭建一个规范、高效的开发环境。本章将带你从零开始完成项目创建、TypeScript 配置、代码规范工具配置等全套工程化准备工作。

### 一、使用 Vite 创建 TS + React 项目

Vite 是新一代前端构建工具，由 Vue 作者尤雨溪开发，相比传统的 webpack，它具有极快的冷启动速度和热更新速度。

\`\`\`bash
# 使用 npm 创建项目
npm create vite@latest my-tsx-app -- --template react-ts

# 或者使用 pnpm（推荐）
pnpm create vite@latest my-tsx-app -- --template react-ts

# 进入项目目录
cd my-tsx-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
\`\`\`

执行完上述命令后，Vite 会在 http://localhost:5173 启动开发服务器。

### 二、tsconfig.json 核心配置详解

tsconfig.json 是 TypeScript 项目的核心配置文件，它决定了 TypeScript 编译器的行为。以下是一份生产级别的配置：

\`\`\`json
{
  "compilerOptions": {
    // 启用所有严格类型检查选项
    "strict": true,
    
    // 编译目标：ES2020 支持现代浏览器的所有特性
    "target": "ES2020",
    
    // 使用的 JSX 模式：react-jsx 是 React 17+ 推荐的模式，不需要手动 import React
    "jsx": "react-jsx",
    
    // 模块解析策略：bundler 配合 Vite/Rollup/Webpack 等打包工具使用
    "moduleResolution": "bundler",
    
    // 基础路径：用于配置非相对路径导入
    "baseUrl": ".",
    
    // 路径别名：配置后可以用 @/ 代替 src/
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/api/*": ["src/api/*"],
      "@/store/*": ["src/store/*"]
    },
    
    // 允许导入 JSON 文件
    "resolveJsonModule": true,
    
    // 允许从没有默认导出的模块中默认导入
    "allowSyntheticDefaultImports": true,
    
    // 确保导入的一致性
    "esModuleInterop": true,
    
    // 跳过库文件的类型检查，加快编译速度
    "skipLibCheck": true,
    
    // 强制文件名大小写一致
    "forceConsistentCasingInFileNames": true,
    
    // 不生成编译输出文件（由 Vite 处理）
    "noEmit": true,
    
    // 报告未使用的局部变量
    "noUnusedLocals": true,
    
    // 报告未使用的函数参数
    "noUnusedParameters": true,
    
    // 报告 switch 语句中遗漏的 break
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
\`\`\`

### 三、推荐目录结构规范

良好的目录结构是项目可维护性的基础。以下是推荐的 React + TS 项目目录组织方式：

\`\`\`
src/
├── components/          # 通用可复用组件
│   ├── ui/             # 基础UI组件（Button、Input、Modal等）
│   └── layout/         # 布局组件（Header、Sidebar、Footer等）
├── hooks/              # 自定义Hooks
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── utils/              # 工具函数
│   ├── format.ts
│   └── validate.ts
├── types/              # TypeScript类型定义
│   ├── api.ts          # API相关类型
│   └── common.ts       # 通用类型
├── api/                # API请求封装
│   └── request.ts
├── store/              # 状态管理（Zustand/Redux等）
│   └── userStore.ts
├── pages/              # 页面组件
│   ├── Home/
│   └── About/
├── assets/             # 静态资源
│   ├── images/
│   └── styles/
├── App.tsx             # 根组件
└── main.tsx            # 应用入口
\`\`\`

### 四、ESLint + Prettier 配置

代码规范是团队协作的基石。ESLint 负责代码质量检查，Prettier 负责代码格式化。

首先安装必要的依赖：

\`\`\`bash
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh
\`\`\`

然后创建 .eslintrc.cjs 配置文件：

\`\`\`javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
\`\`\`

创建 .prettierrc 配置文件：

\`\`\`json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
\`\`\`

### 五、VS Code 推荐插件

为了获得最佳开发体验，推荐安装以下 VS Code 插件：

1. **ESLint** - 实时显示代码规范问题
2. **Prettier - Code formatter** - 保存时自动格式化代码
3. **TypeScript Vue Plugin (Volar)** - 更好的TS类型提示
4. **Error Lens** - 直接在代码行内显示错误信息
5. **Auto Rename Tag** - 自动重命名配对的HTML/JSX标签
6. **Path Intellisense** - 路径自动补全
7. **Tailwind CSS IntelliSense**（如果使用Tailwind）- Tailwind类名提示
8. **GitLens** - Git增强工具

在 .vscode/settings.json 中配置保存时自动格式化：

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
\`\`\`

完成以上配置后，你的开发环境就具备了专业级别的工程化基础，可以高效地进行 TypeScript + React 开发了！`,
  },
  {
    id: "tsrx-jsx",
    icon: "📝",
    group: "准备篇",
    title: "JSX/TSX语法深度解析",
    content: `## JSX/TSX语法深度解析

JSX 是 React 的核心语法，它让我们可以在 JavaScript 中编写类似 HTML 的标记代码。TSX 则是 JSX 的 TypeScript 版本，增加了类型检查能力。本章我们将深入理解 JSX 的本质和各种语法细节。

### 一、JSX 的本质：不是模板，是语法糖

很多人误以为 JSX 是模板语言，但实际上它只是 React.createElement（React 17+ 是 _jsx）的语法糖。

来看 Babel 是如何编译 JSX 的：

\`\`\`tsx
// 你写的 JSX 代码
const element = <h1 className="greeting">Hello, World!</h1>;

// React 17 之前，编译后是这样的：
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, World!'
);

// React 17+ 使用新的 JSX 转换，编译后：
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', {
  className: 'greeting',
  children: 'Hello, World!'
});
\`\`\`

这就是为什么 JSX 比传统模板引擎更灵活——它本质上就是 JavaScript 函数调用。

### 二、TSX vs JSX：类型检查的区别

TSX 和 JSX 的语法基本相同，唯一的区别是 TSX 在 TypeScript 环境中运行，会进行类型检查。

\`\`\`tsx
// ❌ JSX 中不会报错，但 TSX 中会报类型错误
const Button = () => {
  return <button onClick="notAFunction">Click me</button>;
  // 错误：类型 'string' 不能赋值给类型 'MouseEventHandler<HTMLButtonElement>'
};

// ✅ 正确的写法
const Button = () => {
  return <button onClick={() => console.log('clicked')}>Click me</button>;
};

// ❌ TSX 会检查 props 是否存在
const UserCard = ({ name, age }: { name: string; age: number }) => {
  return <div>{name} - {age}</div>;
};

<UserCard name="Tom" age={25} email="tom@example.com" />;
// 错误："email" 属性不存在于类型 'IntrinsicAttributes & { name: string; age: number; }'
\`\`\`

类型检查是 TSX 最大的优势，它能在编译时就发现很多潜在的 bug。

### 三、表达式嵌入：{} 的用法

在 JSX 中，你可以使用花括号 {} 嵌入任何有效的 JavaScript 表达式：

\`\`\`tsx
const UserProfile = () => {
  const user = { name: 'Alice', age: 28, isVip: true };
  const formatName = (name: string) => name.toUpperCase();

  return (
    <div>
      {/* 1. 变量引用 */}
      <h2>用户名: {user.name}</h2>
      
      {/* 2. 运算表达式 */}
      <p>明年年龄: {user.age + 1}</p>
      
      {/* 3. 函数调用 */}
      <p>格式化名字: {formatName(user.name)}</p>
      
      {/* 4. 三元表达式 */}
      <p>会员状态: {user.isVip ? 'VIP用户' : '普通用户'}</p>
      
      {/* 5. 模板字符串 */}
      <p>{`${user.name}今年${user.age}岁`}</p>
      
      {/* ❌ 注意：if/for 等语句不能直接在 {} 中使用 */}
      {/* { if (user.isVip) { return <span>VIP</span> } } */}
      {/* 需要用三元或 && 替代 */}
    </div>
  );
};
\`\`\`

### 四、条件渲染的四种写法及陷阱

条件渲染是 React 中最常用的模式之一，有四种常见写法，每种都有适用场景和需要注意的陷阱。

\`\`\`tsx
const ConditionalDemo = ({ isLoggedIn, user, count }: {
  isLoggedIn: boolean;
  user: { name: string } | null;
  count: number;
}) => {
  return (
    <div>
      {/* 1. 三元运算符：适合二选一的场景 */}
      <div>
        {isLoggedIn ? <span>欢迎, {user?.name}</span> : <button>登录</button>}
      </div>

      {/* 2. && 短路：适合只显示/隐藏，没有else分支 */}
      {/* ⚠️ 陷阱：如果左边是 0，会渲染出 0 而不是什么都不显示 */}
      <div>
        {isLoggedIn && <span>已登录</span>}
        {/* ❌ 错误写法：count 为 0 时会显示 0 */}
        {count && <p>有 {count} 条消息</p>}
        {/* ✅ 正确写法：用 !! 或 Boolean() 转成布尔值 */}
        {!!count && <p>有 {count} 条消息</p>}
        {count > 0 && <p>有 {count} 条消息</p>}
      </div>

      {/* 3. 提前 return：适合多态组件（多分支条件） */}
      {/* 这部分写在组件函数体中 */}
    </div>
  );
};

// 提前 return 示例
const StatusMessage = ({ loading, error, data }: {
  loading: boolean;
  error: Error | null;
  data: string | null;
}) => {
  // 按优先级依次判断，提前 return
  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error.message}</div>;
  if (!data) return <div className="empty">暂无数据</div>;
  return <div className="success">{data}</div>;
};

// 4. IIFE（立即执行函数）：适合复杂的条件逻辑
const ComplexConditional = ({ status }: { status: 'a' | 'b' | 'c' | 'd' }) => {
  return (
    <div>
      {(() => {
        switch (status) {
          case 'a': return <div>状态A</div>;
          case 'b': return <div>状态B</div>;
          case 'c': return <div>状态C</div>;
          default: return <div>未知状态</div>;
        }
      })()}
    </div>
  );
};
\`\`\`

### 五、列表渲染与 key 的原则

渲染列表时，key 是一个非常重要的属性，它帮助 React 识别哪些元素改变了。

\`\`\`tsx
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习React', completed: true },
    { id: 2, text: '学习TypeScript', completed: false },
    { id: 3, text: '写项目', completed: false },
  ]);

  return (
    <ul>
      {todos.map((todo) => (
        // ✅ 正确：使用稳定唯一的 id 作为 key
        <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
          {todo.text}
        </li>
        // ❌ 错误：不要使用数组 index 作为 key（列表会动态变化时）
        // <li key={index}>...</li>
      ))}
    </ul>
  );
};
\`\`\`

**为什么不能随便用 index 作为 key？** 当列表项顺序变化（插入、删除、排序）时，index 会变，导致 React 错误地复用组件状态，造成难以调试的 bug。只有当列表是静态的、不会重新排序时，才可以用 index。

**key 变化会重置组件状态：** 这是一个有用的特性，比如你想让一个表单组件在切换用户时重置，只要给它设置 key={userId} 即可。

### 六、其他常用语法

\`\`\`tsx
// Fragment 短语法：<>...</> 用来包裹多个元素，不产生额外DOM节点
const Layout = () => {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
};

// JSX 注释写法：单行注释和多行注释都要放在 {} 里
const CommentDemo = () => {
  return (
    <div>
      {/* 这是单行注释 */}
      <span>Hello</span>
      {/* 
        这是
        多行注释
      */}
    </div>
  );
};

// JSX.Element 类型：组件返回的类型
const MyComponent = (): JSX.Element => {
  return <div>Hello</div>;
};
// 实际上现在可以不写返回类型，TypeScript 会自动推断
\`\`\`

掌握这些 JSX/TSX 语法细节，你就能写出更规范、更安全的 React 代码了！`,
  },
  {
    id: "tsrx-component",
    icon: "🧩",
    group: "准备篇",
    title: "组件定义与类型标注",
    content: `## 组件定义与类型标注

组件是 React 应用的基本构建块。在 TypeScript 中，如何正确地定义组件和标注类型，是每个开发者必须掌握的基础技能。

### 一、函数组件的类型标注：React.FC 的争议

在 TypeScript + React 开发中，有两种常见的函数组件定义方式：使用 React.FC，或者直接写函数。

\`\`\`tsx
import React, { useState } from 'react';

// 方式1：使用 React.FC（不推荐）
// React.FC 是 React.FunctionComponent 的别名
interface GreetingProps {
  name: string;
}

const Greeting1: React.FC<GreetingProps> = ({ name }) => {
  return <div>Hello, {name}!</div>;
};

/*
❌ 为什么不推荐 React.FC？
1. 它隐式包含了 children 属性，但很多组件并不需要 children
2. 它不支持泛型组件（Generic Components）
3. 它默认对 props 做了类型断言，可能掩盖某些类型错误
4. 代码看起来更冗长
*/

// 方式2：直接定义函数（推荐写法）
// 明确标注 props 类型，返回类型可以让 TS 自动推断，或者显式写 JSX.Element
interface GreetingProps {
  name: string;
  age?: number;
}

function Greeting2({ name, age }: GreetingProps): JSX.Element {
  return (
    <div>
      <p>Hello, {name}!</p>
      {age && <p>年龄: {age}</p>}
    </div>
  );
}

// 箭头函数写法同样推荐
const Greeting3 = ({ name, age }: GreetingProps) => {
  return (
    <div>
      <p>Hello, {name}!</p>
      {age && <p>年龄: {age}</p>}
    </div>
  );
};
\`\`\`

**最佳实践：** 直接声明 props 类型，不要用 React.FC。这样更简洁、更灵活，也避免了 React.FC 带来的问题。

### 二、组件命名规范：PascalCase

React 组件必须使用 PascalCase（大驼峰命名法），这是硬性规定：

\`\`\`tsx
// ✅ 正确：组件名大写开头
function UserProfile() {
  return <div>用户资料</div>;
}

const Button = () => {
  return <button>按钮</button>;
}

// ❌ 错误：小写开头会被 React 当作原生 HTML 标签
// function userProfile() { ... }  // 这不是组件
// const button = () => { ... }   // 这也不是组件

// 使用时也是 PascalCase
function App() {
  return (
    <div>
      <UserProfile />
      <Button />
    </div>
  );
}
\`\`\`

### 三、组件组合 vs 继承

React 有一个非常重要的设计哲学：**组合优于继承**。在 React 中，几乎不需要用到类继承，所有的代码复用都通过组合实现。

\`\`\`tsx
// 例子：通过 children 实现"槽位"组合
// 这相当于 Vue 的 slot，Angular 的内容投影
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Card({ title, children, footer }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        {children} {/* 这里放任意内容 */}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

// 使用 Card 组件，通过组合定制内容
function UserCardDemo() {
  return (
    <Card
      title="用户信息"
      footer={<button>编辑</button>}
    >
      <img src="avatar.jpg" alt="头像" />
      <p>姓名: 张三</p>
      <p>邮箱: zhangsan@example.com</p>
    </Card>
  );
}
\`\`\`

**为什么不用继承？** 继承会带来"强耦合"问题：父类改动会影响所有子类，层级过深时代码难以理解。组合则是"即插即用"的，组件之间耦合度低，更灵活，更容易测试和维护。

### 四、封装条件组件：If/Show 包装器

在 JSX 中写条件渲染有时候略显繁琐，我们可以封装简单的工具组件来让代码更清晰：

\`\`\`tsx
// If 组件：条件渲染封装
interface IfProps {
  condition: boolean;
  children: React.ReactNode;
}

function If({ condition, children }: IfProps) {
  return condition ? <>{children}</> : null;
}

// Show 组件：支持多分支，类似 v-if/v-else-if/v-else
interface ShowProps {
  children: React.ReactNode;
}

interface ShowWhenProps {
  isTrue: boolean;
  children: React.ReactNode;
}

interface ShowElseProps {
  children: React.ReactNode;
}

function Show({ children }: ShowProps) {
  let when: React.ReactNode = null;
  let otherwise: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if ((child.props as ShowWhenProps).isTrue !== undefined) {
      if (!when && (child.props as ShowWhenProps).isTrue) {
        when = child;
      }
    } else {
      otherwise = child;
    }
  });

  return when || otherwise || null;
}

Show.When = function ShowWhen({ isTrue, children }: ShowWhenProps) {
  return isTrue ? <>{children}</> : null;
};

Show.Else = function ShowElse({ children }: ShowElseProps) {
  return <>{children}</>;
};

// 使用示例
function ConditionDemo({ user, loading }: { user: any; loading: boolean }) {
  return (
    <div>
      {/* 使用 If 组件 */}
      <If condition={loading}>
        <div>加载中...</div>
      </If>

      {/* 使用 Show 组件 */}
      <Show>
        <Show.When isTrue={loading}>
          <div>Loading...</div>
        </Show.When>
        <Show.When isTrue={!user}>
          <div>请登录</div>
        </Show.When>
        <Show.Else>
          <div>欢迎, {user.name}</div>
        </Show.Else>
      </Show>
    </div>
  );
}
\`\`\`

### 五、默认 Props：两种方式

在 React 中给 props 设置默认值，有两种方式。注意：旧的 defaultProps API 已经被标记为 deprecated，推荐使用 ES6 默认参数值。

\`\`\`tsx
// 方式1（推荐）：使用 ES6 默认参数值
interface ButtonProps {
  text?: string;
  color?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

function Button({
  text = '按钮',
  color = 'primary',
  size = 'md',
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${color} btn-${size}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

// 使用：不传递的 props 会使用默认值
<Button />  {/* 渲染默认的 primary 中号按钮 */}
<Button color="danger" size="lg" text="删除" />

// 方式2（不推荐）：使用 defaultProps（已废弃）
Button.defaultProps = {
  text: '按钮',
  color: 'primary',
  size: 'md',
};
// 这种方式在函数组件中类型推断有问题，不推荐使用
\`\`\`

### 六、组件拆分粒度原则

什么时候应该把代码拆分成新组件？这是初学者常问的问题。以下是几个实用的判断原则：

1. **单一职责原则**：如果一个组件做了太多事情（比如既展示数据，又处理表单，又发请求），就应该拆分
2. **UI 独立性**：如果某部分 UI 在多个地方被使用，应该抽成独立组件
3. **代码行数**：如果一个组件超过 200-300 行，考虑拆分
4. **状态复杂度**：如果某块逻辑有自己独立的状态，应该抽成组件

\`\`\`tsx
// ❌ 不好：一个大组件做所有事
function ArticlePage() {
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  // ... 几十个状态和函数

  return (
    <div>
      {/* 几百行 JSX */}
    </div>
  );
}

// ✅ 好：拆分成职责清晰的小组件
function ArticlePage() {
  return (
    <div>
      <ArticleHeader />
      <ArticleContent />
      <ArticleActions />
      <CommentList />
      <CommentForm />
      <RelatedArticles />
    </div>
  );
}
\`\`\`

记住：**过早拆分和过度拆分也不好**。刚开始写代码时可以先写在一个组件里，等它变大了、逻辑变复杂了，再自然地拆分出去。`,
  },
  {
    id: "tsrx-first",
    icon: "🚀",
    group: "准备篇",
    title: "第一个TS+React应用：完整计数器",
    content: `## 第一个TS+React应用：完整计数器

纸上得来终觉浅，绝知此事要躬行。本章我们将从零开始构建一个功能完整的计数器应用，把前面学到的环境配置、JSX、组件等知识全部应用起来，体验类型驱动开发的完整流程。

### 一、类型驱动开发：先定义类型

类型驱动开发（Type-Driven Development）的思想是：先定义好数据结构和类型，再开始写业务逻辑。类型就像"设计图纸"，能帮我们理清思路。

\`\`\`tsx
// src/types/counter.ts
// 第一步：定义所有类型

// 计数器状态
export interface CounterState {
  count: number;
  step: number;
}

// Counter 组件 Props
export interface CounterProps {
  initialCount?: number;
  initialStep?: number;
}

// CounterDisplay 组件 Props
export interface CounterDisplayProps {
  count: number;
}

// CounterButton 组件 Props
export interface CounterButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}
\`\`\`

### 二、组件拆分：三个组件各司其职

我们把计数器拆分成三个组件：
- **Counter**：容器组件，管理状态和业务逻辑
- **CounterDisplay**：展示组件，只负责显示数字
- **CounterButton**：按钮组件，可复用

先写展示组件：

\`\`\`tsx
// src/components/CounterDisplay.tsx
import type { CounterDisplayProps } from '@/types/counter';

// 纯展示组件：接收 props，渲染 UI，没有自己的状态
export function CounterDisplay({ count }: CounterDisplayProps) {
  // 根据数值大小显示不同颜色
  const getColor = () => {
    if (count > 0) return '#22c55e'; // 绿色
    if (count < 0) return '#ef4444'; // 红色
    return '#1f2937'; // 黑色
  };

  return (
    <div className="counter-display" style={{ textAlign: 'center', margin: '2rem 0' }}>
      <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '0.5rem' }}>
        当前数值
      </div>
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: getColor(),
          transition: 'color 0.3s',
          userSelect: 'none',
        }}
      >
        {count}
      </div>
    </div>
  );
}
\`\`\`

接下来写可复用的按钮组件：

\`\`\`tsx
// src/components/CounterButton.tsx
import type { CounterButtonProps } from '@/types/counter';

// 可复用按钮组件：通过 variant 控制样式
export function CounterButton({
  onClick,
  label,
  variant = 'primary',
  disabled = false,
}: CounterButtonProps) {
  // 根据 variant 生成样式
  const getStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: 600,
      border: 'none',
      borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      minWidth: '80px',
    };

    const variants = {
      primary: {
        backgroundColor: '#3b82f6',
        color: 'white',
      },
      secondary: {
        backgroundColor: '#6b7280',
        color: 'white',
      },
      danger: {
        backgroundColor: '#ef4444',
        color: 'white',
      },
    };

    return {
      ...baseStyles,
      ...variants[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={getStyles()}
      onMouseOver={(e) => {
        if (!disabled) {
          (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
        }
      }}
      onMouseOut={(e) => {
        (e.target as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      {label}
    </button>
  );
}
\`\`\`

### 三、事件处理类型：onClick 与 MouseEvent

在 CounterButton 组件中，我们看到了事件处理。让我们仔细看一下事件类型：

\`\`\`tsx
// 事件处理函数的类型
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // e 是合成事件对象
  // e.currentTarget 是绑定事件的元素（这里是 button）
  // e.target 是触发事件的元素（可能是子元素）
  console.log('按钮被点击了', e.currentTarget);
  
  // 可以调用 preventDefault 和 stopPropagation
  // e.preventDefault();
  // e.stopPropagation();
};

// 也可以让 TS 自动推断事件类型
<button
  onClick={(e) => {
    // 这里 e 的类型会被自动推断为 React.MouseEvent<HTMLButtonElement>
    console.log('clicked', e);
  }}
>
  点击
</button>
\`\`\`

### 四、容器组件：状态管理与业务逻辑

现在写主组件 Counter，它负责管理状态和业务逻辑：

\`\`\`tsx
// src/components/Counter.tsx
import { useState } from 'react';
import { CounterDisplay } from './CounterDisplay';
import { CounterButton } from './CounterButton';
import type { CounterProps } from '@/types/counter';

export function Counter({ initialCount = 0, initialStep = 1 }: CounterProps) {
  // useState 的类型可以自动推断，也可以显式指定
  // 这里 count 自动推断为 number 类型
  const [count, setCount] = useState(initialCount);
  const [step, setStep] = useState(initialStep);

  // 增加
  const handleIncrement = () => {
    setCount((prev) => prev + step);
  };

  // 减少
  const handleDecrement = () => {
    setCount((prev) => prev - step);
  };

  // 重置
  const handleReset = () => {
    setCount(initialCount);
  };

  // 双击重置为0
  const handleDoubleClick = () => {
    setCount(0);
  };

  // 步长变化处理，注意 ChangeEvent 类型
  const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // 确保步长至少为1
    setStep(isNaN(value) || value < 1 ? 1 : value);
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '3rem auto',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: 'white',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '1rem' }}>
        🧮 TSX 计数器
      </h1>
      
      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        双击卡片区域快速归零
      </p>

      {/* 数字显示 */}
      <CounterDisplay count={count} />

      {/* 步长设置 */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '0.5rem', color: '#374151' }}>
          步长:
          <input
            type="number"
            min="1"
            value={step}
            onChange={handleStepChange}
            style={{
              marginLeft: '0.5rem',
              padding: '0.5rem',
              width: '60px',
              textAlign: 'center',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
            }}
          />
        </label>
      </div>

      {/* 按钮区域 */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <CounterButton
          onClick={handleDecrement}
          label={`-${step}`}
          variant="danger"
        />
        <CounterButton
          onClick={handleReset}
          label="重置"
          variant="secondary"
        />
        <CounterButton
          onClick={handleIncrement}
          label={`+${step}`}
          variant="primary"
        />
      </div>
    </div>
  );
}
\`\`\`

### 五、样式：inline style 与 CSS Modules

上面的例子用了 inline style，简单直接。在实际项目中，我们更常用 CSS Modules：

\`\`\`tsx
// 创建 Counter.module.css 文件
/*
.counter {
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  background: white;
}

.display {
  text-align: center;
  margin: 2rem 0;
}

.count {
  font-size: 4rem;
  font-weight: bold;
  transition: color 0.3s;
}
*/

// 在组件中使用 CSS Modules
// import styles from './Counter.module.css';
// <div className={styles.counter}>...</div>
\`\`\`

### 六、完整的 App.tsx

最后在 App.tsx 中使用我们的 Counter 组件：

\`\`\`tsx
// src/App.tsx
import { Counter } from './components/Counter';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '1rem' }}>
      <Counter initialCount={10} initialStep={5} />
    </div>
  );
}

export default App;
\`\`\`

### 七、运行效果总结

现在运行 `pnpm dev`，你应该能看到一个功能完整的计数器：
- ✅ 支持加/减操作
- ✅ 支持自定义步长
- ✅ 支持重置
- ✅ 双击卡片快速归零
- ✅ 数字根据正负显示不同颜色
- ✅ 按钮有 hover 效果
- ✅ 完整的 TypeScript 类型安全

恭喜你！你已经完成了第一个 TypeScript + React 应用。这个小例子涵盖了组件定义、props 类型、useState、事件处理、样式等核心概念，是后续学习的坚实基础。接下来我们将深入学习 React 的各个核心 Hook 和高级模式。`,
  },
  {
    id: "tsrx-props",
    icon: "📦",
    group: "基础篇",
    title: "Props类型定义大全",
    content: `## Props类型定义大全

Props 是组件之间通信的桥梁。在 TypeScript 中，灵活准确地定义 Props 类型，是写出高质量 React 组件的关键。本章我们将系统学习 Props 类型定义的各种技巧。

### 一、type 别名 vs interface：用哪个？

定义 Props 类型时，有两种选择：type 别名和 interface。它们大部分情况下可以互换，但有细微区别。

\`\`\`tsx
// 方式1：interface（推荐用于对象类型，特别是Props）
interface ButtonProps {
  text: string;
  onClick: () => void;
  color?: 'primary' | 'secondary';
}

// 方式2：type 别名
type ButtonProps2 = {
  text: string;
  onClick: () => void;
  color?: 'primary' | 'secondary';
};

// 两者主要区别：
// 1. interface 可以声明合并（declaration merging），type 不行
interface User {
  name: string;
}
interface User {
  age: number;
}
// User 现在有 name 和 age 两个属性

// 2. type 可以定义联合类型、交叉类型、元组等，interface 不行
type Status = 'loading' | 'success' | 'error';
type NumberOrString = number | string;
type Point = [number, number];

// 实际项目中的建议：
// - 定义 Props、State 等对象类型，优先用 interface（更可读，错误信息更友好）
// - 需要联合类型、工具类型时，用 type
// - 个人或团队保持统一风格即可
\`\`\`

### 二、interface extends：继承与扩展

interface 可以通过 extends 继承其他类型，实现类型复用：

\`\`\`tsx
// 基础属性
interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

// Button 继承基础属性
interface ButtonProps extends BaseProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Input 也继承基础属性
interface InputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
}

// 可以同时继承多个接口
interface Clickable {
  onClick: (e: React.MouseEvent) => void;
}
interface Disableable {
  disabled?: boolean;
}
interface ActionButtonProps extends BaseProps, Clickable, Disableable {
  label: string;
}
\`\`\`

### 三、提取原生属性：React.ComponentProps

封装原生 HTML 元素时，我们希望组件能接受所有原生属性，而不用一个个写。React.ComponentProps 可以帮我们提取原生元素的 Props 类型。

\`\`\`tsx
// 提取 button 元素的所有原生属性
type NativeButtonProps = React.ComponentProps<'button'>;

// 然后扩展我们自己的属性，用 Omit 排除要覆盖的
interface ButtonProps extends Omit<NativeButtonProps, 'type'> {
  variant?: 'primary' | 'secondary' | 'danger';
  // 覆盖原生 type，改成我们自定义的
  type?: 'button' | 'submit' | 'reset';
}

// 这样 Button 组件就能接受所有原生 button 属性了
function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest} // 把所有原生属性透传下去
      className={`btn btn-${variant} ${rest.className || ''}`}
    >
      {children}
    </button>
  );
}

// 使用时，可以传 onClick、disabled、form、name 等任何原生属性
<Button
  variant="primary"
  disabled={false}
  onClick={() => console.log('clicked')}
  type="submit"
  form="my-form"
  name="submit-btn"
>
  提交
</Button>

// 同样可以提取其他原生元素
type InputProps = React.ComponentProps<'input'>;
type DivProps = React.ComponentProps<'div'>;
type SelectProps = React.ComponentProps<'select'>;

// 也可以提取自定义组件的 Props
type MyComponentProps = React.ComponentProps<typeof MyComponent>;
\`\`\`

### 四、children 类型的四种写法

children 是特殊的 prop，它有多种类型，根据不同场景选择：

\`\`\`tsx
// 1. React.ReactNode：最常用，表示任意可以渲染的内容
// 这是最宽松的类型，包括：string、number、JSX元素、数组、null/undefined/bool
interface ContainerProps {
  children: React.ReactNode;
}
function Container({ children }: ContainerProps) {
  return <div className="container">{children}</div>;
}
// 可以传任何东西
<Container>
  Hello World
  <span>标签</span>
  {123}
  {null}
</Container>

// 2. React.ReactElement：只能传单个 React 元素（不能传字符串/数字）
interface SingleChildProps {
  children: React.ReactElement;
}
function Wrapper({ children }: SingleChildProps) {
  // 这里可以安全地读取 children.props
  return <div className="wrapper">{children}</div>;
}
// <Wrapper>Hello</Wrapper>  ❌ 错误：字符串不是 ReactElement
<Wrapper><span>Hello</span></Wrapper>  ✅ 正确

// 3. JSX.Element：和 React.ReactElement 基本一样
// 这是组件返回值的类型，用于 children 时和 ReactElement 类似

// 4. Render function：children 是一个函数（render props 模式）
interface DataConsumerProps<T> {
  children: (data: T) => React.ReactNode;
  data: T;
}
function DataConsumer<T>({ children, data }: DataConsumerProps<T>) {
  return <div>{children(data)}</div>;
}

// 使用
<DataConsumer data={{ name: 'Tom', age: 25 }}>
  {(user) => (
    <div>
      {user.name} - {user.age}
    </div>
  )}
</DataConsumer>
\`\`\`

### 五、可选 Props 与默认值

通过 ? 标记可选 prop，然后用 ES6 默认参数值设置默认值：

\`\`\`tsx
interface ConfigurableButtonProps {
  text: string;
  // 以下都是可选的
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

function ConfigurableButton({
  text,
  size = 'md',       // 默认值
  color = 'blue',    // 默认值
  disabled = false,  // 默认值
  loading = false,   // 默认值
  icon,              // 可选，没有默认值就是 undefined
}: ConfigurableButtonProps) {
  return (
    <button disabled={disabled || loading}>
      {loading && <Spinner />}
      {icon && <span className="icon">{icon}</span>}
      {text}
    </button>
  );
}
\`\`\`

### 六、索引签名与 Record<string, unknown>

当你需要接受任意额外属性时，可以用索引签名或 Record：

\`\`\`tsx
// 索引签名：可以接受任意 string key 的属性
interface AnyProps {
  name: string;
  age: number;
  [key: string]: any; // 允许任意其他属性
}

// 更好的方式是用 Record<string, unknown> 配合类型收窄
interface FlexibleProps {
  title: string;
  data?: Record<string, unknown>; // 任意键值对
}

function DataDisplay({ title, data }: FlexibleProps) {
  return (
    <div>
      <h3>{title}</h3>
      {data && Object.entries(data).map(([key, value]) => (
        <div key={key}>
          {key}: {String(value)}
        </div>
      ))}
    </div>
  );
}
\`\`\`

### 七、可辨识联合类型（Discriminated Unions）

这是 TypeScript 最强大的特性之一！当组件有多种"状态"或"类型"时，用可辨识联合可以让类型更安全：

\`\`\`tsx
// 定义一个"判别属性"，这里是 type
type AlertProps =
  | {
      type: 'success';
      message: string;
      duration?: number;
    }
  | {
      type: 'error';
      message: string;
      errorCode: number; // error 类型必须传 errorCode
    }
  | {
      type: 'warning';
      message: string;
      showIcon?: boolean;
    }
  | {
      type: 'info';
      message: string;
    };

// TS 会根据 type 自动缩小类型范围
function Alert(props: AlertProps) {
  const { type, message } = props;
  
  const colors = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
  };

  return (
    <div className={`alert alert-${type}`} style={{ color: colors[type] }}>
      {type === 'error' && <strong>错误码: {props.errorCode}</strong>}
      {/* 这里 TS 知道：只有 type 是 'error' 时才有 errorCode */}
      <p>{message}</p>
    </div>
  );
}

// 使用
<Alert type="success" message="操作成功" />  ✅
<Alert type="error" message="失败了" errorCode={500} />  ✅
// <Alert type="error" message="失败" />  ❌ 错误：缺少 errorCode
\`\`\`

### 八、Omit/Pick：类型剪裁工具

TypeScript 内置的工具类型 Omit 和 Pick，可以用来从已有类型中"选"或"排除"某些属性：

\`\`\`tsx
import { ComponentProps } from 'react';

// 假设我们要封装一个自定义 Input
// 先取原生 input 的所有属性
type NativeInputProps = ComponentProps<'input'>;

// Pick：只选取我们需要的属性
type PickedInputProps = Pick<NativeInputProps, 'value' | 'onChange' | 'placeholder' | 'type'>;

// Omit：排除我们不需要或要覆盖的属性
type CustomInputProps = Omit<NativeInputProps, 'type'> & {
  // 覆盖原生 type，我们只支持这三种
  type?: 'text' | 'password' | 'email';
  label?: string;
  error?: string;
};

function CustomInput({ label, error, ...rest }: CustomInputProps) {
  return (
    <div className="input-wrapper">
      {label && <label>{label}</label>}
      <input {...rest} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
\`\`\`

掌握了这些 Props 类型定义技巧，你就能写出类型安全、灵活可复用的 React 组件了！`,
  },
  {
    id: "tsrx-usestate",
    icon: "🔄",
    group: "基础篇",
    title: "useState状态管理全解",
    content: `## useState状态管理全解

useState 是 React 最基础也是最重要的 Hook，它让函数组件拥有了状态管理能力。本章我们将深入学习 useState 的各种用法、类型推断和最佳实践。

### 一、useState 基本用法与类型推断

useState 是一个泛型函数，大多数情况下 TypeScript 能根据初始值自动推断出 state 的类型：

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  // 初始值是 0（number），count 自动推断为 number
  // setCount 自动推断为 (value: number | ((prev: number) => number)) => void
  const [count, setCount] = useState(0);

  // 初始值是字符串，推断为 string
  const [name, setName] = useState('Tom');

  // 初始值是布尔值，推断为 boolean
  const [isOpen, setIsOpen] = useState(false);

  // 初始值是数组，推断为 never[] 或具体类型
  // ❌ 不好：TS 不知道数组里放什么，会推断为 never[]
  // const [items, setItems] = useState([]);
  
  // ✅ 好：要么给个初始值
  // const [items, setItems] = useState<string[]>([]); // 显式指定泛型
  // 要么初始值包含元素让 TS 推断
  const [items, setItems] = useState(['apple', 'banana']); // 推断为 string[]

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
\`\`\`

### 二、泛型指定 state 类型：useState<T>

当初始值是 null 或 undefined，或者 state 是复杂对象时，需要显式指定泛型类型：

\`\`\`tsx
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

function UserProfile() {
  // 用户信息可能还没加载出来，初始值是 null
  // 这里必须显式指定类型，否则会推断为 null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载用户数据
  useEffect(() => {
    fetchUser(123).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  // 这里 TS 知道 user 不为 null，可以安全访问属性
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 对象类型 state
interface FormState {
  username: string;
  password: string;
  rememberMe: boolean;
}

function LoginForm() {
  // 初始值符合 FormState 类型，TS 也能自动推断
  // 但显式写出来更清晰，特别是当有可选属性时
  const [form, setForm] = useState<FormState>({
    username: '',
    password: '',
    rememberMe: false,
  });

  return <form>{/* ... */}</form>;
}
\`\`\`

### 三、函数式更新：避免闭包陈旧值

当新的 state 依赖于之前的 state 时，一定要用函数式更新。这是 useState 最容易出错的地方之一！

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 错误：连续调用三次，实际只加1
  // 因为这三次调用都引用了同一个 count 值
  const handleIncrementBad = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // 结果还是 count + 1，不是 +3
  };

  // ✅ 正确：使用函数式更新，prev 永远是最新的状态
  const handleIncrementGood = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    // 结果是 +3，正确
  };

  // 更常见的场景：在异步回调或 useEffect 中更新状态
  const handleAsyncIncrement = () => {
    setTimeout(() => {
      // ❌ 这里的 count 可能是旧值！
      // setCount(count + 1);
      
      // ✅ 用函数式更新就没问题
      setCount((prev) => prev + 1);
    }, 1000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleIncrementGood}>+3</button>
    </div>
  );
}
\`\`\`

**为什么会有陈旧闭包问题？** 因为每次渲染，组件函数都会重新执行，形成新的闭包。如果在异步回调中引用了 state，可能引用的是之前渲染的旧值。函数式更新通过 prev 参数拿到的永远是最新值，可以避免这个问题。

### 四、惰性初始化：useState(() => init)

如果初始 state 需要经过复杂计算才能得到，应该传一个函数给 useState，这个函数只会在首次渲染时执行一次：

\`\`\`tsx
function TodoList() {
  // ❌ 不好：每次渲染都会执行 localStorage.getItem 和 JSON.parse
  // 即使只在首次渲染需要初始值
  // const [todos, setTodos] = useState<Todo[]>(
  //   JSON.parse(localStorage.getItem('todos') || '[]')
  // );

  // ✅ 好：惰性初始化，函数只执行一次
  const [todos, setTodos] = useState<Todo[]>(() => {
    console.log('初始化 todos，只执行一次');
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 另一个例子：复杂计算的初始值
  const [fibonacci, setFibonacci] = useState(() => {
    // 斐波那契数列计算很耗时，只在首次渲染算一次
    const fib = [0, 1];
    for (let i = 2; i < 100; i++) {
      fib[i] = fib[i - 1] + fib[i - 2];
    }
    return fib;
  });

  return <div>{/* ... */}</div>;
}
\`\`\`

### 五、React 18 自动批处理

React 18 引入了自动批处理（Automatic Batching）：在同一个事件循环中的多个 setState 调用会被合并，只触发一次重渲染：

\`\`\`tsx
function BatchedDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [text, setText] = useState('');

  const handleClick = () => {
    // React 18 中，这三次 setState 会批处理，只重渲染一次
    setCount(c => c + 1);
    setFlag(f => !f);
    setText('hello');
    
    // React 17 及以前：React 事件中批处理，但 setTimeout/Promise 中不批处理
    // React 18+：所有场景都会自动批处理
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // 这里也会批处理！只渲染一次
    }, 100);
  };

  console.log('组件渲染了'); // 点击一次只会打一次 log

  return <button onClick={handleClick}>点击</button>;
}

// 如果需要在 setState 后立即拿到 DOM 更新，可以用 flushSync
// import { flushSync } from 'react-dom';
// flushSync(() => {
//   setCount(c => c + 1);
// });
// 这里 DOM 已经更新了
\`\`\`

### 六、对象 state：不可变更新

React 的状态更新是"不可变"的——永远不要直接修改 state 对象，而是创建一个新对象：

\`\`\`tsx
function FormDemo() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  // ❌ 错误：直接修改原对象，React 检测不到变化，不会重渲染
  // const badUpdate = () => {
  //   form.username = 'new name';
  //   setForm(form); // 引用没变，React 可能跳过更新
  // };

  // ✅ 正确：用 ... 展开运算符创建新对象
  const updateUsername = (username: string) => {
    setForm((prev) => ({
      ...prev,           // 复制原来的所有属性
      username,          // 覆盖要更新的属性
    }));
  };

  // 嵌套对象更新：要逐层展开
  const [user, setUser] = useState({
    name: 'Tom',
    address: {
      city: 'Beijing',
      street: 'Main St',
    },
  });

  const updateCity = (city: string) => {
    setUser((prev) => ({
      ...prev,
      address: {
        ...prev.address, // 嵌套对象也要展开复制
        city,            // 只更新 city
      },
    }));
  };

  return <div>{/* ... */}</div>;
}
\`\`\`

### 七、数组 state：CRUD 操作

数组更新同样遵循不可变原则，不要直接 push/splice/pop，而是返回新数组：

\`\`\`tsx
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoListCrud() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习 React', completed: false },
  ]);

  // 新增
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    // ✅ 用展开运算符创建新数组
    setTodos((prev) => [...prev, newTodo]);
    // 或者用 concat
    // setTodos((prev) => prev.concat(newTodo));
  };

  // 删除
  const deleteTodo = (id: number) => {
    // ✅ filter 返回新数组
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 修改（切换完成状态）
  const toggleTodo = (id: number) => {
    // ✅ map 返回新数组
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 在开头插入
  const addToTop = (text: string) => {
    setTodos((prev) => [{ id: Date.now(), text, completed: false }, ...prev]);
  };

  return (
    <div>
      {/* 渲染 todos */}
      {todos.map((todo) => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span>{todo.text}</span>
          <button onClick={() => deleteTodo(todo.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### 八、状态放置原则：谁用谁声明，最小化 state

最后是一个设计原则：状态应该放在哪里？

1. **谁用谁声明**：哪个组件需要用这个状态，就放在哪个组件里
2. **最小化原则**：能从 props 或其他 state 推导出来的，不要单独定义 state
3. **状态提升**：多个组件共享状态时，提升到它们最近的共同父组件
4. **不要冗余**：不要定义可以计算出来的 state

\`\`\`tsx
// ❌ 不好：冗余 state
function BadExample({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [fullName, setFullName] = useState(`${firstName} ${lastName}`);
  // fullName 完全可以从 props 计算出来，不需要单独的 state
  return <div>{fullName}</div>;
}

// ✅ 好：直接计算，或者用 useMemo
function GoodExample({ firstName, lastName }: { firstName: string; lastName: string }) {
  const fullName = `${firstName} ${lastName}`;
  return <div>{fullName}</div>;
}
\`\`\`

掌握 useState 的这些用法和原则，你就能写出更可靠、性能更好的 React 组件了。useState 看似简单，但里面的学问可不少！`,
  },
  {
    id: "tsrx-events",
    icon: "🎯",
    group: "基础篇",
    title: "事件处理与类型",
    content: `## 事件处理与类型

用户交互是前端应用的核心，而事件处理是交互的基础。在 TypeScript + React 中，正确地为事件标注类型，可以避免很多常见错误。

### 一、常见事件类型速查表

React 提供了完整的事件类型定义，不同的元素对应不同的事件类型，都需要指定元素类型作为泛型参数：

\`\`\`tsx
import { useState } from 'react';

function EventTypesDemo() {
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);

  // 1. 鼠标事件：点击、悬浮等
  // React.MouseEvent<T> T 是触发事件的元素类型
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('按钮被点击', e.currentTarget);
    // e.clientX/e.clientY 鼠标坐标
    console.log('鼠标位置:', e.clientX, e.clientY);
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('div 被点击');
  };

  // 2. 输入框 change 事件
  // React.ChangeEvent<T>
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value); // e.target.value 是输入的值
  };

  // textarea 和 select 也是 ChangeEvent
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('选中:', e.target.value);
  };

  // checkbox 处理
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked); // 注意是 checked 不是 value
  };

  // 3. 表单提交事件
  // React.FormEvent<T>
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认提交行为
    console.log('表单提交', { text, checked });
  };

  // 4. 键盘事件
  // React.KeyboardEvent<T>
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('按下键:', e.key);
    if (e.key === 'Enter') {
      console.log('按了回车！');
    }
    // e.ctrlKey / e.shiftKey / e.altKey 检测修饰键
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('Ctrl+S 保存');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="输入点什么"
      />
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
        />
        同意
      </label>
      <button type="submit" onClick={handleClick}>
        提交
      </button>
      <div onClick={handleDivClick} style={{ padding: '20px', background: '#f0f0f0' }}>
        点我
      </div>
    </form>
  );
}
\`\`\`

其他常用事件类型：
- `React.FocusEvent<T>`：聚焦/失焦事件
- `React.TouchEvent<T>`：触摸事件（移动端）
- `React.ScrollEvent<T>`：滚动事件
- `React.DragEvent<T>`：拖拽事件
- `React.WheelEvent<T>`：鼠标滚轮事件

### 二、事件处理器类型推导

事件类型可以让 TypeScript 自动推导，不用每次都手动写类型：

\`\`\`tsx
function AutoInferenceDemo() {
  const [count, setCount] = useState(0);

  // ✅ 内联写法：TS 自动推断 e 的类型，最方便
  return (
    <button
      onClick={(e) => {
        // 这里 e 自动推断为 React.MouseEvent<HTMLButtonElement>
        console.log(e.clientX);
        setCount((c) => c + 1);
      }}
    >
      点击次数: {count}
    </button>
  );
}

// 提取出来的函数，需要手动标注类型
function Button() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('clicked', e);
  };

  return <button onClick={handleClick}>点击</button>;
}

// 或者可以用 React.MouseEventHandler 类型别名
type ButtonClickHandler = React.MouseEventHandler<HTMLButtonElement>;

const handleClick: ButtonClickHandler = (e) => {
  // e 的类型自动推断好了
  console.log(e);
};
\`\`\`

**建议：**
- 内联事件处理：不用写类型，让 TS 自动推断
- 提取出来的处理函数：手动标注事件类型

### 三、合成事件 SyntheticEvent

你可能注意到了，React 的事件类型都叫 `React.XXXEvent`，而不是原生的 `MouseEvent` 等。这是因为 React 有自己的**合成事件**（SyntheticEvent）系统：

\`\`\`tsx
function SyntheticEventDemo() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // e 是 SyntheticEvent，不是原生事件
    // 它是对原生事件的跨浏览器包装，API 和原生事件一致

    // 访问原生事件：
    const nativeEvent = e.nativeEvent;
    console.log('原生事件:', nativeEvent);

    // currentTarget vs target:
    // e.currentTarget: 绑定事件处理函数的元素（这里是 button）
    // e.target: 触发事件的元素（可能是 button 的子元素）
  };

  return (
    <button onClick={handleClick}>
      <span>点我</span>
      {/* 点击 span 时，target 是 span，currentTarget 是 button */}
    </button>
  );
}
\`\`\`

**为什么用合成事件？**
1. **跨浏览器一致性**：屏蔽不同浏览器的事件差异
2. **事件委托**：React 把所有事件都委托到根节点，性能更好
3. **统一行为**：比如 React 17 后事件不再委托到 document，而是 root 节点

注意：React 事件是**冒泡**阶段触发的，如果要捕获阶段触发，用 `onClickCapture`。

### 四、事件冒泡：stopPropagation 和 preventDefault

\`\`\`tsx
function BubblingDemo() {
  const handleOuterClick = () => {
    console.log('外层 div 被点击');
  };

  const handleInnerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('内层按钮被点击');
    e.stopPropagation(); // 阻止冒泡，外层 div 不会收到事件
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认行为（表单提交、链接跳转等）
    console.log('表单提交');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // 阻止链接跳转
    console.log('链接被点击，但不跳转');
  };

  return (
    <div onClick={handleOuterClick} style={{ padding: '20px', background: '#eee' }}>
      外层 div
      <button onClick={handleInnerClick}>内层按钮（阻止冒泡）</button>
      
      <form onSubmit={handleSubmit}>
        <button type="submit">提交</button>
      </form>
      
      <a href="https://example.com" onClick={handleLinkClick}>
        点我不跳转
      </a>
    </div>
  );
}
\`\`\`

### 五、防抖与节流

实际项目中，经常需要对事件处理函数做防抖或节流，比如搜索输入、窗口 resize 等。

\`\`\`tsx
import { useState, useEffect, useRef, useCallback } from 'react';

// 防抖 Hook
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 用 useCallback 缓存函数，避免每次渲染创建新函数
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      // 每次调用都清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 设置新定时器
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

// 节流 Hook
function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
) {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}

// 使用示例
function SearchDemo() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<string[]>([]);

  // 防抖搜索：输入停止300ms后才搜索
  const debouncedSearch = useDebouncedCallback((value: string) => {
    console.log('搜索:', value);
    // 模拟搜索
    setResults([`${value} 结果1`, `${value} 结果2`]);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={keyword}
        onChange={handleChange}
        placeholder="输入关键词搜索"
      />
      <ul>
        {results.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

### 六、事件传参

给事件处理函数传参有两种常见方式：

\`\`\`tsx
interface Item {
  id: number;
  name: string;
}

function ParameterPassingDemo() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: '苹果' },
    { id: 2, name: '香蕉' },
    { id: 3, name: '橙子' },
  ]);

  // 方式1：箭头函数包裹，最直观常用
  // 注意：事件对象 e 要显式传递过去
  const handleDelete = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('删除 id:', id, e);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 方式2：使用 data-* 属性存参数
  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = Number(e.currentTarget.dataset.id);
    console.log('编辑 id:', id);
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name}
          {/* 方式1：箭头函数传参 */}
          <button onClick={(e) => handleDelete(item.id, e)}>删除</button>
          {/* 方式2：data-* 属性传参 */}
          <button data-id={item.id} onClick={handleEdit}>编辑</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

**性能注意：** 方式1的箭头函数每次渲染都会创建新函数，如果是在长列表里，可能会有性能问题（每次都给子组件传新函数，导致子组件重渲染）。这种情况下可以用方式2，或者用 useCallback 缓存函数。但大部分场景下，方式1就足够了，代码可读性更好。`,
  },
  {
    id: "tsrx-conditional",
    icon: "🔀",
    group: "基础篇",
    title: "条件渲染与列表渲染模式",
    content: `## 条件渲染与列表渲染模式

条件渲染和列表渲染是 React 开发中最常用的两种模式。本章我们系统学习各种条件渲染技巧，以及列表渲染的最佳实践和高级模式。

### 一、三元运算符：二选一的最佳选择

三元运算符是最简洁的二选一条件渲染方式，适合互斥的两种状态：

\`\`\`tsx
function TernaryDemo({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div>
      {/* 基础用法 */}
      <div>
        {isLoggedIn ? <UserMenu /> : <LoginButton />}
      </div>

      {/* 嵌套三元：不推荐，可读性差 */}
      {/* {a ? <A /> : b ? <B /> : <C />} */}

      {/* 可以嵌套标签 */}
      <div className="status">
        {isLoggedIn ? (
          <span className="text-green">
            <CheckIcon /> 已登录
          </span>
        ) : (
          <span className="text-red">
            <XIcon /> 未登录
          </span>
        )}
      </div>
    </div>
  );
}
\`\`\`

**适用场景：** 两种情况二选一，比如显示/隐藏按钮、登录/未登录状态、展开/折叠等。

### 二、&& 短路：显示/隐藏的简洁写法

&& 短路运算符适合"要么显示，要么什么都不显示"的场景。但一定要注意那个著名的"0渲染陷阱"！

\`\`\`tsx
function ShortCircuitDemo({ count, items, user }: {
  count: number;
  items: any[];
  user: { name: string } | null;
}) {
  return (
    <div>
      {/* ✅ 正确：布尔值控制 */}
      {user && <div>欢迎, {user.name}</div>}
      {items.length > 0 && <ItemList items={items} />}

      {/* ❌ 陷阱：count 为 0 时，会渲染出 "0" 而不是空白！ */}
      <div>消息数量: {count && <span>{count} 条新消息</span>}</div>
      {/* 当 count=0，页面上会显示 "消息数量: 0" */}

      {/* ✅ 修复方法1：用 !! 转成布尔值 */}
      <div>消息数量: {!!count && <span>{count} 条新消息</span>}</div>

      {/* ✅ 修复方法2：用比较表达式（最推荐，最清晰） */}
      <div>消息数量: {count > 0 && <span>{count} 条新消息</span>}</div>

      {/* ✅ 修复方法3：用 Boolean() 包裹 */}
      <div>消息数量: {Boolean(count) && <span>{count} 条新消息</span>}</div>

      {/* 同样的问题：空字符串 '' 不会渲染，NaN 会渲染 "NaN" */}
      {/* {NaN && <div>不会显示</div>} 会显示 NaN！*/}
    </div>
  );
}
\`\`\`

**核心原则：** && 左边一定要是真正的布尔值，用 `> 0`、`!!`、`Boolean()` 确保。

### 三、提前 return：多态组件的最佳实践

当组件有多种状态（加载中、错误、空数据、成功）时，提前 return（也叫 Early Return、Guard Clause）是最清晰的写法：

\`\`\`tsx
// 典型的四态组件
interface DataState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

function UserProfile({ state }: { state: DataState<{ name: string; avatar: string }> }) {
  // 1. 优先处理加载状态
  if (state.loading) {
    return (
      <div className="skeleton">
        <Skeleton width="60px" height="60px" circle />
        <Skeleton width="120px" height="20px" />
      </div>
    );
  }

  // 2. 然后处理错误状态
  if (state.error) {
    return (
      <div className="error-state">
        <ErrorIcon />
        <p>加载失败：{state.error.message}</p>
        <button onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  // 3. 然后处理空数据状态
  if (!state.data) {
    return (
      <div className="empty-state">
        <EmptyIcon />
        <p>用户不存在</p>
      </div>
    );
  }

  // 4. 最后是正常成功状态
  const user = state.data;
  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
    </div>
  );
}
\`\`\`

**优点：**
- 逻辑清晰，按优先级顺序排列
- 不用嵌套 if-else，代码扁平易读
- 正常状态在最后，不用包在 if 里
- 每个状态独立，容易维护

### 四、IIFE：复杂逻辑的立即执行函数

当 JSX 中需要写比较复杂的条件逻辑（比如多层 if-else、switch），可以用 IIFE（立即调用函数表达式）：

\`\`\`tsx
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <div className="order-status">
      {(() => {
        switch (status) {
          case 'pending':
            return <span className="badge badge-yellow">待付款</span>;
          case 'paid':
            return <span className="badge badge-blue">已付款</span>;
          case 'shipped':
            return <span className="badge badge-purple">已发货</span>;
          case 'delivered':
            return <span className="badge badge-green">已送达</span>;
          case 'cancelled':
            return <span className="badge badge-gray">已取消</span>;
          default:
            return <span className="badge badge-gray">未知状态</span>;
        }
      })()}
    </div>
  );
}

// 或者用 IIFE 写更复杂的逻辑
function PriceDisplay({ price, vip, coupon }: {
  price: number;
  vip: boolean;
  coupon: number | null;
}) {
  return (
    <div className="price">
      {(() => {
        let finalPrice = price;
        const discounts: string[] = [];

        if (vip) {
          finalPrice *= 0.9;
          discounts.push('VIP 9折');
        }

        if (coupon) {
          finalPrice = Math.max(0, finalPrice - coupon);
          discounts.push(`优惠券 -${coupon}元`);
        }

        return (
          <>
            <span className="original-price">¥{price}</span>
            <span className="final-price">¥{finalPrice.toFixed(2)}</span>
            {discounts.map((d, i) => (
              <span key={i} className="discount-tag">{d}</span>
            ))}
          </>
        );
      })()}
    </div>
  );
}
\`\`\`

不过要注意：IIFE 里的逻辑如果太复杂，最好还是抽到组件外面或者独立的函数里，保持 JSX 简洁。

### 五、枚举映射：N 种状态的优雅方案

对于固定 N 种状态的场景，用对象做"枚举映射"比 switch-case 更优雅、更易扩展：

\`\`\`tsx
type StatusType = 'success' | 'error' | 'warning' | 'info';

// 配置映射对象：配置和 UI 分离
const statusConfig: Record<StatusType, {
  color: string;
  icon: React.ReactNode;
  text: string;
}> = {
  success: {
    color: '#22c55e',
    icon: <CheckIcon />,
    text: '操作成功',
  },
  error: {
    color: '#ef4444',
    icon: <XIcon />,
    text: '操作失败',
  },
  warning: {
    color: '#f59e0b',
    icon: <WarningIcon />,
    text: '警告',
  },
  info: {
    color: '#3b82f6',
    icon: <InfoIcon />,
    text: '提示',
  },
};

function StatusBadge({ type }: { type: StatusType }) {
  const config = statusConfig[type];
  return (
    <div style={{ color: config.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

// 好处：
// 1. 新增状态只需在配置对象加一项，不用改组件逻辑
// 2. 配置集中管理，便于维护
// 3. 可以很方便地从外部数据源加载配置
\`\`\`

### 六、列表 key 最佳原则

key 是 React 列表渲染中最重要的概念，它帮助 React 高效更新 DOM：

\`\`\`tsx
interface Article {
  id: string; // 稳定唯一的 id，比如数据库 ID、UUID
  title: string;
}

function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ul>
      {/* ✅ 最佳：用稳定唯一的 ID 作为 key */}
      {articles.map((article) => (
        <li key={article.id}>
          <h3>{article.title}</h3>
        </li>
      ))}
    </ul>
  );
}

/*
❌ 什么时候不能用 index 作为 key？
- 列表会重新排序（比如排序、拖拽）
- 列表会在头部/中间插入或删除项目
- 列表项有自己的状态（比如 input、checkbox）

✅ 什么时候可以用 index？
- 列表是静态的，永远不会改变
- 列表项没有状态
- 列表只会在末尾追加（如分页加载更多）
*/

// ❌ 错误演示：用 index 导致状态错乱
function BadTodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '任务1' },
    { id: 2, text: '任务2' },
  ]);

  const addToTop = () => {
    setTodos([{ id: Date.now(), text: '新任务' }, ...todos]);
  };

  return (
    <>
      <button onClick={addToTop}>在顶部添加</button>
      <ul>
        {todos.map((todo, index) => (
          // ❌ 用 index 作为 key：新任务插入到顶部，
          // index 都变了，React 会错误地复用 DOM 和状态
          <li key={index}>
            <input /> {/* 如果第一个 input 输入了内容，添加新任务后内容会错位！*/}
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
\`\`\`

### 七、列表处理：过滤、排序、分组

在渲染前对列表数据进行转换，是非常常见的需求：

\`\`\`tsx
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

function ProductList({ products }: { products: Product[] }) {
  // 过滤：只显示有货的
  const inStockProducts = products.filter((p) => p.inStock);

  // 排序：按价格从低到高
  const sortedProducts = [...inStockProducts].sort((a, b) => a.price - b.price);
  // 注意：sort 会修改原数组，所以先 [...arr] 复制一份

  // 分组：按类别分组
  const groupedProducts = sortedProducts.reduce<Record<string, Product[]>>(
    (groups, product) => {
      const category = product.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    },
    {}
  );

  return (
    <div>
      {Object.entries(groupedProducts).map(([category, items]) => (
        <div key={category} className="category">
          <h2>{category}</h2>
          <div className="products">
            {items.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>¥{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### 八、Array.flatMap：嵌套展开

flatMap 是 map + flat(1) 的组合，可以在渲染嵌套列表时一步到位：

\`\`\`tsx
interface Author {
  id: number;
  name: string;
  books: { id: number; title: string }[];
}

function AuthorBookList({ authors }: { authors: Author[] }) {
  return (
    <div>
      {/* 方法1：嵌套 map */}
      {authors.map((author) => (
        <div key={author.id}>
          <h2>{author.name}</h2>
          <ul>
            {author.books.map((book) => (
              <li key={book.id}>{book.title}</li>
            ))}
          </ul>
        </div>
      ))}

      {/* 方法2：用 flatMap 拍平成一个列表 */}
      <ul>
        {authors.flatMap((author) =>
          author.books.map((book) => (
            <li key={book.id}>
              {author.name} - {book.title}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
\`\`\`

如果列表非常长（几百上千项），普通渲染会卡顿，这时候就需要**虚拟列表**（Virtual List / Windowing），只渲染可视区域的 DOM。可以使用 `react-window` 或 `react-virtualized` 库来实现。

掌握这些条件渲染和列表渲染模式，你就能写出清晰、高效、易维护的 React 代码了！`,
  },
  {
    id: "tsrx-useeffect",
    icon: "⚡",
    group: "基础篇",
    title: "useEffect副作用管理",
    content: `## useEffect副作用管理

useEffect 是 React 中最强大也最容易用错的 Hook。它让函数组件能够执行副作用：数据请求、订阅、DOM 操作等。理解 useEffect 的工作原理，是从 React 新手到高手的必经之路。

### 一、useEffect 的三个部分

每个 useEffect 包含三个部分：

1. **副作用函数**：要执行的副作用逻辑
2. **依赖数组**：决定什么时候执行副作用
3. **清理函数**（可选）：副作用退出时执行清理

\`\`\`tsx
import { useState, useEffect } from 'react';

function UseEffectAnatomy() {
  const [count, setCount] = useState(0);

  useEffect(
    // 1. 副作用函数
    () => {
      console.log('执行副作用，count =', count);
      document.title = `点击了 ${count} 次`;

      // 3. 清理函数（可选）
      return () => {
        console.log('清理上一次副作用');
      };
    },
    // 2. 依赖数组
    [count]
  );

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      点击 {count} 次
    </button>
  );
}
\`\`\`

### 二、依赖数组的三种情况

依赖数组的写法决定了副作用什么时候执行，一共有三种情况：

\`\`\`tsx
function DependencyArrayDemo() {
  const [count, setCount] = useState(0);

  // 情况1：不传依赖数组（不写第二个参数）
  // 👉 每次渲染后都执行！
  useEffect(() => {
    console.log('每次渲染后都执行');
  });
  // ⚠️ 容易造成无限循环，极少使用

  // 情况2：空依赖数组 []
  // 👉 只在组件挂载（mount）后执行一次
  // 👉 组件卸载（unmount）时执行清理
  useEffect(() => {
    console.log('组件挂载了，只执行一次');

    return () => {
      console.log('组件卸载了');
    };
  }, []); // 空数组
  // ✅ 常用于：初始化数据、添加全局事件监听、创建订阅

  // 情况3：有依赖 [a, b, c]
  // 👉 挂载时执行一次
  // 👉 之后每当 a/b/c 变化时，执行清理然后重新执行
  useEffect(() => {
    console.log('count 变化了：', count);
    document.title = `Count: ${count}`;

    return () => {
      console.log('count 从', count, '变化，先清理');
    };
  }, [count]); // 只有 count 变了才重新执行
  // ✅ 常用于：根据 props/state 变化执行副作用

  return <button onClick={() => setCount((c) => c + 1)}>+1</button>;
}
\`\`\`

### 三、cleanup 清理函数

清理函数在两种时候执行：
1. 组件卸载前
2. 下一次副作用执行之前（依赖变化时）

\`\`\`tsx
function CleanupDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // 定时器示例
  useEffect(() => {
    if (!running) return;

    console.log('设置定时器');
    const timerId = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // 清理函数：清除定时器
    return () => {
      console.log('清除定时器');
      clearInterval(timerId);
    };
  }, [running]);

  // DOM 事件监听示例
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小:', window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    console.log('添加 resize 监听');

    // 清理函数：移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('移除 resize 监听');
    };
  }, []); // 空数组，只加一次

  return (
    <div>
      <p>计时: {seconds}秒</p>
      <button onClick={() => setRunning((r) => !r)}>
        {running ? '暂停' : '开始'}
      </button>
    </div>
  );
}
\`\`\`

**一定要清理！** 不清理的副作用会造成：
- 内存泄漏（组件卸载了但定时器还在跑）
- 重复订阅（每次渲染都加一次监听）
- 重复请求（数据重复获取）

常见需要清理的资源：
- `setTimeout` / `setInterval` → `clearTimeout` / `clearInterval`
- DOM 事件监听 → `removeEventListener`
- 订阅（WebSocket、EventEmitter）→ `unsubscribe`
- 异步请求 → `AbortController.abort()`

### 四、数据请求模式

useEffect 最常见的用途就是发请求。注意：**async 函数不能直接传给 useEffect！**

\`\`\`tsx
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // ❌ 错误：useEffect 不能直接传 async 函数
    // useEffect(async () => {
    //   const res = await fetch(`/api/users/${userId}`);
    //   const data = await res.json();
    //   setUser(data);
    // }, [userId]);
    // 原因：async 函数返回 Promise，而 useEffect 期望返回清理函数或 void

    // ✅ 正确：在内部定义 async 函数，然后调用
    const fetchUser = async () => {
      // 每次请求前重置状态
      setLoading(true);
      setError(null);

      try {
        // 用 AbortController 处理竞态条件（组件卸载或 userId 变了，取消上一个请求）
        const controller = new AbortController();
        
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        // 忽略取消请求导致的错误
        if ((err as Error).name !== 'AbortError') {
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }

      // 清理函数：取消请求
      return () => controller.abort();
    };

    const cleanup = fetchUser();
    return cleanup;
  }, [userId]); // userId 变了，重新请求

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 写法2：用 IIFE（立即执行 async 函数）
useEffect(() => {
  let cancelled = false;

  (async () => {
    const res = await fetch(`/api/users/${userId}`);
    const data = await res.json();
    if (!cancelled) {
      setUser(data);
    }
  })();

  return () => {
    cancelled = true;
  };
}, [userId]);
\`\`\`

**竞态条件（Race Condition）问题：** 如果 userId 快速变化（比如从1变到2再变到3），请求1、2、3可能乱序返回，最后显示错误的数据。AbortController 或 cancelled 标志可以解决这个问题。

### 五、useEffect 生命周期映射

useEffect 可以映射传统类组件的生命周期方法：

\`\`\`tsx
function LifecycleDemo() {
  // componentDidMount（挂载后）
  useEffect(() => {
    console.log('componentDidMount: 组件挂载完成');
    // 适合：发请求、加监听、操作DOM
  }, []);

  // componentDidUpdate（更新后）：注意是所有更新都执行
  useEffect(() => {
    console.log('componentDidUpdate: 组件更新了');
  }); // 没有依赖数组

  // componentDidUpdate(prevProps/prevState)：特定数据更新时
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('count 更新了:', count);
    // 类似 componentDidUpdate 中 if (prevState.count !== this.state.count)
  }, [count]);

  // componentWillUnmount（卸载前）
  useEffect(() => {
    console.log('挂载');
    return () => {
      console.log('componentWillUnmount: 组件即将卸载');
      // 适合：清理定时器、移除监听、取消请求
    };
  }, []);

  return <div>生命周期演示</div>;
}
\`\`\`

注意：useEffect 和生命周期不是一一对应的，它的心智模型是**同步（synchronization）**——当依赖变化时，把副作用和状态同步起来，而不是"在某个生命周期执行"。

### 六、依赖 lint 规则

一定要启用 `eslint-plugin-react-hooks` 的 `exhaustive-deps` 规则！它能帮你发现 90% 的 useEffect 问题：

\`\`\`json
// .eslintrc.cjs
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn" // 不要关这个！
  }
}
\`\`\`

\`\`\`tsx
// 这个规则会警告你依赖不全
function EffectLintDemo() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  // ❌ 警告：React Hook useEffect has a missing dependency: 'step'
  // useEffect(() => {
  //   const id = setInterval(() => {
  //     setCount(count + step); // 这里用到了 step，但依赖数组里没有
  //   }, 1000);
  //   return () => clearInterval(id);
  // }, [count]); // 缺 step

  // ✅ 正确：把用到的所有响应式值都加到依赖数组
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + step); // 用函数式更新避免 count 依赖
    }, 1000);
    return () => clearInterval(id);
  }, [step]); // 只需要 step，因为 setCount 用了函数式

  return <div>{count}</div>;
}
\`\`\`

### 七、常见错误总结

\`\`\`tsx
function CommonMistakes() {
  const [count, setCount] = useState(0);

  // 错误1：无限循环
  // useEffect(() => {
  //   setCount(count + 1);
  // }); // 没有依赖数组，每次渲染都执行，执行了又 setCount 又渲染，无限循环！

  // 错误2：遗漏依赖导致陈旧闭包
  // useEffect(() => {
  //   const id = setInterval(() => {
  //     console.log(count); // 一直是 0，因为闭包捕获的是初始 count
  //   }, 1000);
  //   return () => clearInterval(id);
  // }, []); // 空数组，闭包里的 count 永远是第一次渲染的 0
  // ✅ 修复：要么把 count 加进依赖，要么用函数式更新 setCount(c => c + 1)

  // 错误3：在 useEffect 外声明的函数没加进依赖
  // const fetchData = () => {
  //   console.log('fetch', count);
  // };
  // useEffect(() => {
  //   fetchData();
  // }, []); // fetchData 是依赖，应该加进去，或者用 useCallback 包裹

  return <div>常见错误演示</div>;
}
\`\`\`

useEffect 的心智模型确实有点绕，但只要记住：
1. 把 useEffect 看作"同步"机制，而不是生命周期
2. 所有在effect中用到的响应式值（props/state/函数）都要加进依赖
3. 一定要清理副作用
4. 不要撒谎骗 exhaustive-deps 规则（比如随便加个 eslint-disable-next-line）

多写多练，慢慢就能掌握 useEffect 的正确用法了！`,
  },
  {
    id: "tsrx-useref",
    icon: "📌",
    group: "基础篇",
    title: "useRef与DOM操作",
    content: `## useRef与DOM操作

useRef 是一个非常"多才多艺"的 Hook。它有两大核心用途：操作 DOM 元素，以及跨渲染保持可变值。本章我们深入学习 useRef 的各种用法，以及 forwardRef 和 useImperativeHandle 等相关 API。

### 一、useRef 基础用法

useRef 返回一个可变的 ref 对象，它的 .current 属性被初始化为传入的值。返回的对象在组件整个生命周期中保持不变。

\`\`\`tsx
import { useRef } from 'react';

function UseRefBasic() {
  // 创建一个 ref，初始值为 null
  const refContainer = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // ref.current 指向真实 DOM 节点
    if (refContainer.current) {
      refContainer.current.focus(); // 聚焦输入框
      console.log('输入框的值:', refContainer.current.value);
      refContainer.current.style.borderColor = 'blue';
    }
  };

  return (
    <div>
      {/* 用 ref 属性把 DOM 节点绑定到 refContainer */}
      <input ref={refContainer} type="text" placeholder="点按钮聚焦我" />
      <button onClick={handleClick}>聚焦输入框</button>
    </div>
  );
}
\`\`\`

**关键点：**
- ref 不像 state，改变 .current 不会触发重渲染
- ref 对象在组件每次渲染时都是同一个引用
- DOM 渲染完成后，.current 才会指向真实 DOM

### 二、用途1：DOM 引用

这是 useRef 最常见的用途：获取 DOM 元素并操作它。

\`\`\`tsx
function DomRefDemos() {
  // 1. input 聚焦（最常见）
  const inputRef = useRef<HTMLInputElement>(null);
  const focusInput = () => inputRef.current?.focus();

  // 2. 滚动定位
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. 获取元素尺寸
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (boxRef.current) {
      const { width, height } = boxRef.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, []);

  // 4. video/audio 播放控制
  const videoRef = useRef<HTMLVideoElement>(null);
  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  return (
    <div>
      {/* 聚焦 */}
      <input ref={inputRef} />
      <button onClick={focusInput}>聚焦</button>

      {/* 滚动容器 */}
      <div
        ref={scrollContainerRef}
        style={{ height: '200px', overflow: 'auto', border: '1px solid' }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <p key={i}>第 {i} 行</p>
        ))}
        <div ref={bottomRef} />
      </div>
      <button onClick={scrollToTop}>回到顶部</button>
      <button onClick={scrollToBottom}>滚动到底部</button>

      {/* 获取尺寸 */}
      <div ref={boxRef} style={{ width: '200px', height: '100px', background: 'red' }}>
        宽: {size.width}, 高: {size.height}
      </div>

      {/* 视频控制 */}
      <video ref={videoRef} src="video.mp4" />
      <button onClick={togglePlay}>播放/暂停</button>
    </div>
  );
}
\`\`\`

常见的 DOM ref 类型：
- `HTMLInputElement` - input
- `HTMLButtonElement` - button
- `HTMLDivElement` - div
- `HTMLFormElement` - form
- `HTMLSelectElement` - select
- `HTMLTextAreaElement` - textarea
- `HTMLVideoElement` / `HTMLAudioElement` - video/audio
- `HTMLElement` - 通用类型

### 三、用途2：可变值容器（不触发重渲染）

这是很多新手不知道的 useRef 用法：它可以存储任意值，而且修改不触发重渲染。很适合存一些"渲染无关"的值。

\`\`\`tsx
function MutableRefDemo() {
  const [count, setCount] = useState(0);

  // 1. 存储 setTimeout/setInterval id
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 2. 存储上一个 state 的值
  const prevCountRef = useRef<number>(0);
  useEffect(() => {
    prevCountRef.current = count; // 渲染后更新
  }, [count]);
  const prevCount = prevCountRef.current; // 这里是上一次的值

  // 3. 存储组件内部"实例变量"（不需要触发UI更新）
  const renderCountRef = useRef(0);
  renderCountRef.current += 1; // 每次渲染都+1
  console.log('组件渲染了', renderCountRef.current, '次');

  // 4. 标志位：标记组件是否挂载（避免 setState 在卸载后调用）
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 5. 存储不需要渲染的缓存值
  const cacheRef = useRef<Map<string, any>>(new Map());
  const getData = (key: string) => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key);
    }
    // ... 从网络获取，然后存到 cacheRef
  };

  return (
    <div>
      <p>当前: {count}, 上一次: {prevCount}</p>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
      <p>渲染次数: {renderCountRef.current}</p>
    </div>
  );
}
\`\`\`

**useRef vs useState 怎么选？**
- 如果你需要值变化后**更新UI** → 用 `useState`
- 如果值变化**不需要重渲染**，只是给内部逻辑用 → 用 `useRef`

### 四、forwardRef：ref 转发

默认情况下，自定义组件不能直接接收 ref 属性。forwardRef 可以让父组件把 ref 转发到子组件内部的 DOM 元素上。

\`\`\`tsx
import { forwardRef } from 'react';

// forwardRef 接收两个参数：props 和 ref
const CustomInput = forwardRef<HTMLInputElement, { placeholder?: string }>(
  (props, ref) => {
    return (
      <input
        ref={ref} // 把 forwarded ref 绑定到内部 input 上
        type="text"
        placeholder={props.placeholder}
        style={{ padding: '8px', border: '2px solid blue', borderRadius: '4px' }}
      />
    );
  }
);

// 给组件设置 displayName（调试用）
CustomInput.displayName = 'CustomInput';

// 父组件使用
function ForwardRefDemo() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* 像原生元素一样给自定义组件传 ref */}
      <CustomInput ref={inputRef} placeholder="输入内容" />
      <button onClick={() => inputRef.current?.focus()}>
        聚焦到自定义输入框
      </button>
    </div>
  );
}
\`\`\`

**什么时候用 forwardRef？**
- 封装基础UI组件（Button、Input、Modal等）时，需要让使用者能拿到内部DOM
- 可复用组件库中常用
- 业务组件一般不需要

### 五、useImperativeHandle：暴露自定义 API

有时候你不想把整个 DOM 节点暴露给父组件，只想暴露几个自定义方法（比如 focus、scrollTo、reset）。这时候可以用 useImperativeHandle：

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// 定义暴露给父组件的 API 类型
export interface CountdownHandle {
  start: () => void;
  pause: () => void;
  reset: () => void;
  getCount: () => number;
}

interface CountdownProps {
  initialCount?: number;
}

// 倒计时组件
const Countdown = forwardRef<CountdownHandle, CountdownProps>(
  ({ initialCount = 10 }, ref) => {
    const [count, setCount] = useState(initialCount);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 用 useImperativeHandle 自定义暴露给父组件的内容
    useImperativeHandle(ref, () => ({
      // 暴露的方法
      start: () => {
        if (running || count === 0) return;
        setRunning(true);
        timerRef.current = setInterval(() => {
          setCount((c) => {
            if (c <= 1) {
              clearInterval(timerRef.current!);
              setRunning(false);
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      },
      pause: () => {
        setRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      },
      reset: () => {
        setRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setCount(initialCount);
      },
      getCount: () => count,
    }), [count, running, initialCount]);

    // 组件卸载时清理
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, []);

    return (
      <div style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center' }}>
        {count}
      </div>
    );
  }
);

Countdown.displayName = 'Countdown';

// 父组件使用
function CountdownApp() {
  const countdownRef = useRef<CountdownHandle>(null);

  return (
    <div style={{ maxWidth: '300px', margin: '2rem auto', textAlign: 'center' }}>
      <Countdown ref={countdownRef} initialCount={60} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button onClick={() => countdownRef.current?.start()}>开始</button>
        <button onClick={() => countdownRef.current?.pause()}>暂停</button>
        <button onClick={() => countdownRef.current?.reset()}>重置</button>
      </div>
    </div>
  );
}
\`\`\`

这是一种很有用的**命令式编程**模式，在某些场景（如表单重置、播放控制、模态框打开关闭）特别好用。但注意：大部分场景还是应该用**声明式**（通过 props 控制），只有当声明式很烦琐时，才考虑用 ref 暴露命令式 API。

### 六、ref 回调函数

除了 useRef 创建 ref 对象，ref 属性还能接收一个回调函数：

\`\`\`tsx
function CallbackRefDemo() {
  const [height, setHeight] = useState(0);

  // ref 回调：DOM 节点挂载时调用，参数是节点；卸载时调用，参数是 null
  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <div>
      <div ref={measuredRef} style={{ padding: '20px', background: '#f0f0f0' }}>
        这个 div 的高度是: {height}px
      </div>
    </div>
  );
}
\`\`\`

ref 回调的好处是可以在 DOM 挂载/卸载时立即执行回调，不需要等 useEffect。

### 七、实战 Demo：点击外部关闭弹窗

useRef 的经典应用场景：点击弹窗外部关闭弹窗。

\`\`\`tsx
import { useState, useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // 如果点击的元素不在 modal 内部，关闭弹窗
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // 用 mousedown 而不是 click，体验更好（点下再拖到外面松开不会关闭）
    document.addEventListener('mousedown', handleClickOutside);
    
    // 按 ESC 也关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div
        ref={modalRef}
        style={{
          background: 'white', padding: '2rem', borderRadius: '8px',
          minWidth: '300px', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '8px', right: '8px' }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// 使用
function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开弹窗</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>弹窗标题</h2>
        <p>点击外部或按ESC关闭我</p>
      </Modal>
    </div>
  );
}
\`\`\`

到这里，useRef 的核心用法就都讲完了。总结一下：
- 用 ref 操作 DOM（聚焦、滚动、测量）
- 用 ref 存跨渲染的可变值（定时器id、上一个状态、标志位），不触发重渲染
- 用 forwardRef 转发 ref 到子组件 DOM
- 用 useImperativeHandle 自定义暴露给父组件的 API
- 经典案例：点击外部关闭弹窗

useRef 是一个功能非常强大的 Hook，在实际开发中会经常用到！`,
  },
];
