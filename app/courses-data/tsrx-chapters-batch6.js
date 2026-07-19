export const chapters = [
  {
    id: "tsrx-vitest",
    icon: "🧪",
    group: "测试篇",
    title: "Vitest测试环境配置",
    content: `## Vitest测试环境配置

测试是保障代码质量的重要手段。Vitest 是由 Vite 团队开发的新一代测试框架，专为 Vite 项目设计，具有极快的运行速度和原生 ESM 支持。本章将带你从零开始搭建完整的 React + TypeScript 测试环境。

### 一、Vitest vs Jest 对比

在选择测试框架时，Vitest 相比 Jest 有以下显著优势：

- **极速运行**：基于 Vite 的即时模块热替换，启动速度比 Jest 快数倍
- **Vite 原生支持**：无需额外配置即可与 Vite 项目无缝集成，共享配置文件
- **原生 ESM**：开箱即用支持 ES Modules，不需要 Babel 转译
- **兼容 Jest API**：几乎 100% 兼容 Jest 的 API，迁移成本极低
- **内置 TypeScript**：原生支持 TypeScript，无需额外配置
- **智能监视模式**：只重新运行变更相关的测试
- **内置覆盖率**：内置 c8 覆盖率报告，无需额外安装

### 二、安装必要依赖

首先安装 Vitest 及 React Testing Library 相关依赖：

\`\`\`bash
# 安装核心测试依赖
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 或者使用 pnpm
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
\`\`\`

依赖说明：
- **vitest**：核心测试框架
- **@testing-library/react**：React 组件测试工具，以用户为中心的测试方式
- **@testing-library/jest-dom**：扩展 Jest 断言，添加 DOM 相关匹配器
- **@testing-library/user-event**：模拟真实用户交互（点击、输入等）
- **jsdom**：在 Node.js 环境中模拟浏览器 DOM 环境

### 三、Vite 配置文件设置

在 \`vite.config.ts\` 中添加 test 配置：

\`\`\`ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 模拟浏览器环境
    environment: 'jsdom',
    // 在测试文件中全局使用 describe/it/expect 等 API，无需导入
    globals: true,
    // 测试启动前的 setup 文件
    setupFiles: './src/test/setup.ts',
    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    // 排除 node_modules
    exclude: ['node_modules', 'dist'],
    // CSS 处理（避免测试时报错）
    css: false,
  },
})
\`\`\`

如果你的 tsconfig 中没有配置 Vitest 全局类型，还需要在 \`tsconfig.json\` 的 compilerOptions.types 数组中添加 \`"vitest/globals"\`。

### 四、创建 Setup 文件

创建 \`src/test/setup.ts\` 文件，用于配置测试环境：

\`\`\`ts
// 导入 @testing-library/jest-dom，扩展断言
import '@testing-library/jest-dom'

// 可选：Mock matchMedia（一些组件库会用到）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 可选：Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// 可选：Mock scrollTo
window.scrollTo = vi.fn()
\`\`\`

### 五、配置 package.json 脚本

在 \`package.json\` 中添加测试相关脚本：

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

脚本说明：
- **test**：启动监视模式，文件变更时自动重跑测试
- **test:run**：单次运行所有测试并退出（适合 CI 环境）
- **test:ui**：打开美观的 Web UI 界面查看测试结果
- **test:coverage**：生成测试覆盖率报告

### 六、第一个组件测试

让我们创建一个简单的组件并编写第一个测试：

首先创建一个简单的 Greeting 组件 \`src/components/Greeting.tsx\`：

\`\`\`tsx
type GreetingProps = {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>
}
\`\`\`

然后创建测试文件 \`src/components/Greeting.test.tsx\`：

\`\`\`tsx
import { render, screen } from '@testing-library/react'
import { Greeting } from './Greeting'

describe('Greeting 组件', () => {
  it('应该正确渲染传入的 name', () => {
    // 1. 渲染组件
    render(<Greeting name="World" />)

    // 2. 查询元素
    const heading = screen.getByText('Hello, World!')

    // 3. 断言：元素应该在文档中
    expect(heading).toBeInTheDocument()
  })

  it('应该渲染不同的名字', () => {
    render(<Greeting name="React" />)
    expect(screen.getByText('Hello, React!')).toBeInTheDocument()
  })
})
\`\`\`

运行 \`npm test\` 即可看到测试通过！

### 七、测试文件命名规范

Vitest 支持以下测试文件命名约定：

1. **同目录下的 .test.tsx 文件**：\`Component.test.tsx\` 放在组件同目录（推荐）
2. **__tests__ 目录**：\`__tests__/Component.test.tsx\`（集中管理）
3. **.spec.tsx 后缀**：\`Component.spec.tsx\`（也很常用）
4. **test 目录**：所有测试文件放在 \`src/test/\` 或 \`src/__tests__/\` 目录

推荐第一种方式：测试文件与组件放在同一目录，便于查找和维护。

### 八、常见问题排查

1. **"document is not defined"**：检查是否配置了 \`environment: 'jsdom'\`
2. **"expect(...).toBeInTheDocument is not a function"**：检查 setup.ts 是否正确导入了 \`@testing-library/jest-dom\`
3. **CSS/SCSS 导入报错**：在 vite.config.ts 的 test 配置中添加 \`css: false\` 或 mock CSS 模块
4. **路径别名不生效**：在 vite.config.ts 中配置 resolve.alias，与应用配置保持一致

至此，你已经完成了完整的 Vitest + React Testing Library 测试环境搭建！接下来我们将深入学习 React Testing Library 的核心用法。
`,
  },
  {
    id: "tsrx-rtl-basic",
    icon: "🔍",
    group: "测试篇",
    title: "React Testing Library(RTL)基础",
    content: `## React Testing Library(RTL)基础

React Testing Library（简称 RTL）是 React 官方推荐的组件测试库，它的核心理念是：**测试软件的使用方式，而不是实现细节**。这意味着你的测试应该关注用户能看到什么、能做什么，而不是组件内部的 state 或 props。

### 一、核心：render() 渲染组件

\`render\` 是 RTL 最基础的 API，用于在测试环境中渲染 React 组件：

\`\`\`tsx
import { render, screen } from '@testing-library/react'
import Button from './Button'

test('渲染按钮', () => {
  // render 会将组件渲染到 jsdom 中
  const { container } = render(<Button>点击我</Button>)
  
  // container 是渲染结果的 DOM 容器
  console.log(container.innerHTML)
})
\`\`\`

\`render\` 返回一个对象，包含多个实用工具：
- **container**：包裹组件的 DOM 元素
- **rerender**：用新 props 重新渲染组件
- **unmount**：卸载组件
- **debug()**：打印当前 DOM 结构，方便调试
- **...queries**：绑定到 container 的查询函数

### 二、screen 查询优先级

RTL 提供了多种查询元素的方式，**有明确的优先级顺序**，越靠前越推荐使用：

| 优先级 | 查询方法 | 使用场景 |
|--------|----------|----------|
| 1️⃣ 最推荐 | getByRole | 按可访问性角色查询，符合无障碍最佳实践 |
| 2️⃣ | getByLabelText | 表单元素，通过关联的 label 文本查询 |
| 3️⃣ | getByPlaceholderText | 通过 placeholder 查询输入框 |
| 4️⃣ | getByText | 通过显示的文本查询非交互元素 |
| 5️⃣ | getByDisplayValue | 表单元素的当前值 |
| 6️⃣ | getByAltText | 通过 alt 属性查询图片 |
| 7️⃣ | getByTitle | 通过 title 属性查询 |
| ⚠️ 最后手段 | getByTestId | 通过 data-testid 查询，仅在以上方法都不可用时使用 |

\`\`\`tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function LoginForm() {
  return (
    <form>
      <label htmlFor="username">用户名</label>
      <input id="username" placeholder="请输入用户名" />
      
      <label htmlFor="password">密码</label>
      <input id="password" type="password" placeholder="请输入密码" />
      
      <button type="submit">登录</button>
    </form>
  )
}

test('使用不同方式查询元素', () => {
  render(<LoginForm />)
  
  // ✅ 推荐：通过 role 查询
  const submitBtn = screen.getByRole('button', { name: /登录/ })
  
  // ✅ 推荐：通过 label 查询表单元素
  const usernameInput = screen.getByLabelText('用户名')
  
  // ✅ 可以用：通过 placeholder
  const passwordInput = screen.getByPlaceholderText('请输入密码')
  
  // ✅ 可以用：通过文本
  const heading = screen.getByText('登录')
  
  // ⚠️ 仅在必要时用：通过 testid
  // <div data-testid="custom-element">...</div>
  const custom = screen.getByTestId('custom-element')
})
\`\`\`

### 三、查询类型：getBy / queryBy / findBy

除了查询方法不同，RTL 还提供三种查询类型，决定了查询失败时的行为：

| 类型 | 找不到元素时 | 找到多个时 | 支持异步 |
|------|-------------|-----------|---------|
| **getBy** | 抛出错误（测试失败） | 抛出错误 | ❌ 同步 |
| **queryBy** | 返回 null | 抛出错误 | ❌ 同步 |
| **findBy** | 等待一段时间后抛出错误 | 抛出错误 | ✅ 异步（返回 Promise） |

每种类型都有对应的复数形式用于查询多个元素：**getAllBy**、**queryAllBy**、**findAllBy**。

\`\`\`tsx
import { render, screen } from '@testing-library/react'

function TodoList({ todos }: { todos: string[] }) {
  return (
    <ul>
      {todos.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
  )
}

test('查询类型演示', () => {
  render(<TodoList todos={['吃饭', '睡觉', '写代码']} />)
  
  // getBy：期望元素存在
  const firstTodo = screen.getByText('吃饭')
  
  // queryBy：验证元素不存在
  const nonExistent = screen.queryByText('不存在的任务')
  expect(nonExistent).not.toBeInTheDocument()
  
  // getAllBy：查询多个元素
  const allTodos = screen.getAllByRole('listitem')
  expect(allTodos).toHaveLength(3)
})
\`\`\`

### 四、userEvent 模拟真实用户交互

\`@testing-library/user-event\` 比 \`fireEvent\` 更推荐使用，因为它能模拟真实的浏览器交互（比如点击会触发 mouseDown、mouseUp、click 等一连串事件）：

\`\`\`tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>加一</button>
      <button onClick={() => setCount(c => c - 1)}>减一</button>
    </div>
  )
}

test('用户交互测试', async () => {
  // 注意：userEvent.setup() 是 v14 推荐的用法
  const user = userEvent.setup()
  
  render(<Counter />)
  
  // 初始状态
  expect(screen.getByText('Count: 0')).toBeInTheDocument()
  
  // 模拟点击
  await user.click(screen.getByRole('button', { name: '加一' }))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
  
  // 点击两次
  await user.click(screen.getByRole('button', { name: '加一' }))
  expect(screen.getByText('Count: 2')).toBeInTheDocument()
  
  // 点击减一
  await user.click(screen.getByRole('button', { name: '减一' }))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})

test('表单输入测试', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  
  render(
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(new FormData(e.currentTarget).get('username'))
    }}>
      <label htmlFor="name">姓名</label>
      <input id="name" name="username" />
      <button type="submit">提交</button>
    </form>
  )
  
  // userEvent.type：模拟逐字输入
  await user.type(screen.getByLabelText('姓名'), '张三')
  await user.click(screen.getByRole('button', { name: '提交' }))
  
  expect(onSubmit).toHaveBeenCalledWith('张三')
})
\`\`\`

userEvent 常用 API：
- **user.click()**：点击
- **user.type()**：在输入框中输入文本
- **user.keyboard()**：模拟键盘按键
- **user.clear()**：清空输入框
- **user.selectOptions()**：选择下拉选项
- **user.hover()**：鼠标悬停
- **user.tab()**：Tab 键切换焦点

### 五、常用断言扩展

\`@testing-library/jest-dom\` 提供了很多实用的 DOM 断言匹配器：

\`\`\`tsx
// 存在性
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// 可见性
expect(element).toBeVisible()

// 状态
expect(button).toBeDisabled()
expect(button).toBeEnabled()
expect(checkbox).toBeChecked()
expect(checkbox).not.toBeChecked()

// 内容
expect(element).toHaveTextContent('Hello')
expect(element).toHaveTextContent(/hello/i) // 正则

// 表单
expect(input).toHaveValue('some value')
expect(input).toBeRequired()
expect(input).toHaveDisplayValue('显示值')

// 样式/类名
expect(element).toHaveClass('active')
expect(element).toHaveStyle({ color: 'red' })

// 属性
expect(link).toHaveAttribute('href', '/home')

// 表单验证
expect(input).toBeInvalid()
expect(input).toBeValid()
\`\`\`

### 六、异步测试：waitFor 和 findBy

测试异步组件（数据获取、动画等）时，需要等待元素出现：

\`\`\`tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// 模拟一个异步加载用户数据的组件
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
  }, [userId])
  
  if (loading) return <div>加载中...</div>
  return <div>用户：{user?.name}</div>
}

test('异步数据加载测试', async () => {
  // Mock fetch 返回数据
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ name: '李四' }),
  })
  
  render(<UserProfile userId="1" />)
  
  // 1. 初始显示加载中
  expect(screen.getByText('加载中...')).toBeInTheDocument()
  
  // 2. 方式一：使用 findBy（推荐，是 getBy + waitFor 的语法糖）
  const userName = await screen.findByText('用户：李四')
  expect(userName).toBeInTheDocument()
  
  // 3. 方式二：使用 waitFor
  await waitFor(() => {
    expect(screen.getByText('用户：李四')).toBeInTheDocument()
  })
})
\`\`\`

使用 \`waitFor\` 时可以指定超时时间和轮询间隔：

\`\`\`ts
await waitFor(() => {
  expect(screen.getByText('加载完成')).toBeInTheDocument()
}, {
  timeout: 3000, // 默认 1000ms
  interval: 100, // 默认 50ms
})
\`\`\`

### 七、测试哲学：关注用户行为而非实现

最后也是最重要的一点：**RTL 的核心哲学是测试用户能看到和做什么**。

❌ **错误做法**（测试实现细节）：
\`\`\`tsx
test('点击按钮 setCount 被调用', () => {
  const setState = vi.fn()
  useStateMock.mockReturnValue([0, setState])
  render(<Counter />)
  fireEvent.click(screen.getByText('加一'))
  expect(setState).toHaveBeenCalled() // ❌ 测试内部实现
})
\`\`\`

✅ **正确做法**（测试用户可见的结果）：
\`\`\`tsx
test('点击加一按钮后计数增加', async () => {
  render(<Counter />)
  await user.click(screen.getByText('加一'))
  expect(screen.getByText('Count: 1')).toBeInTheDocument() // ✅ 用户看到的结果
})
\`\`\`

记住：你的测试不应该关心组件内部用的是 useState 还是 useReducer，不应该关心组件有没有调用某个方法，只需要关心——用户看到了什么？用户操作后发生了什么？这样当你重构组件内部实现而不改变功能时，测试仍然能通过。
`,
  },
  {
    id: "tsrx-test-patterns",
    icon: "🎯",
    group: "测试篇",
    title: "常见组件测试模式",
    content: `## 常见组件测试模式

掌握了 RTL 基础后，本章我们来学习实际项目中常见的组件测试模式，包括表单、API Mock、Context、路由、Hook 等场景的最佳测试实践。

### 一、表单提交测试

表单是最常见的交互组件，测试时需要模拟用户填写和提交的完整流程：

\`\`\`tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// 登录表单组件
function LoginForm({ onSuccess }: { onSuccess: (user: { email: string }) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}
    
    // 验证
    if (!email) newErrors.email = '请输入邮箱'
    else if (!email.includes('@')) newErrors.email = '邮箱格式不正确'
    if (!password) newErrors.password = '请输入密码'
    else if (password.length < 6) newErrors.password = '密码至少6位'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    setSubmitting(true)
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 100))
    setSubmitting(false)
    onSuccess({ email })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">邮箱</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        {errors.email && <span role="alert">{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">密码</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {errors.password && <span role="alert">{errors.password}</span>}
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? '登录中...' : '登录'}
      </button>
    </form>
  )
}

test('表单验证：空字段显示错误提示', async () => {
  const user = userEvent.setup()
  render(<LoginForm onSuccess={vi.fn()} />)
  
  // 直接点击提交
  await user.click(screen.getByRole('button', { name: '登录' }))
  
  // 检查错误提示
  expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
  expect(screen.getByText('请输入密码')).toBeInTheDocument()
})

test('表单提交成功回调', async () => {
  const user = userEvent.setup()
  const onSuccess = vi.fn()
  render(<LoginForm onSuccess={onSuccess} />)
  
  // 填写正确的表单
  await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
  await user.type(screen.getByLabelText('密码'), '123456')
  
  // 提交
  await user.click(screen.getByRole('button', { name: '登录' }))
  
  // 按钮变为加载状态
  expect(screen.getByRole('button', { name: '登录中...' })).toBeDisabled()
  
  // 等待成功回调
  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledWith({ email: 'test@example.com' })
  })
})
\`\`\`

### 二、Mock API 请求：MSW

Mock Service Worker (MSW) 是拦截 HTTP 请求的标准方案，它在网络层面拦截请求，你的代码完全不需要修改，更接近真实场景：

首先安装：
\`\`\`bash
pnpm add -D msw
\`\`\`

创建 Mock 处理器 \`src/test/handlers.ts\`：

\`\`\`ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET 请求 Mock
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: '测试用户',
      email: 'test@example.com',
    })
  }),
  
  // POST 请求 Mock
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'test@example.com' && body.password === '123456') {
      return HttpResponse.json({
        token: 'fake-jwt-token',
        user: { id: '1', name: '测试用户' },
      })
    }
    return new HttpResponse(null, { status: 401 })
  }),
  
  // 模拟 500 错误
  http.get('/api/error', () => {
    return new HttpResponse(null, { status: 500 })
  }),
]
\`\`\`

在 setup.ts 中配置测试用的 server：

\`\`\`ts
import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// 创建测试 server
export const server = setupServer(...handlers)

// 所有测试前启动 server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 每个测试后重置 handlers（避免测试间影响）
afterEach(() => server.resetHandlers())

// 所有测试后关闭 server
afterAll(() => server.close())
\`\`\`

在测试中使用：

\`\`\`tsx
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'

function UserProfile() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  useEffect(() => {
    fetch('/api/users/1').then(res => res.json()).then(setUser)
  }, [])
  return <div>{user ? `欢迎，${user.name}` : '加载中...'}</div>
}

test('使用 MSW Mock API 请求', async () => {
  render(<UserProfile />)
  expect(screen.getByText('加载中...')).toBeInTheDocument()
  
  // 等待 MSW 返回 Mock 数据
  expect(await screen.findByText('欢迎，测试用户')).toBeInTheDocument()
})

test('覆盖特定测试的 Mock 响应', async () => {
  // 临时覆盖这个测试的响应
  server.use(
    http.get('/api/users/1', () => {
      return HttpResponse.json({ name: '临时用户' })
    })
  )
  
  render(<UserProfile />)
  expect(await screen.findByText('欢迎，临时用户')).toBeInTheDocument()
})
\`\`\`

### 三、Context 组件测试

依赖 Context 的组件需要在测试中包裹对应的 Provider：

\`\`\`tsx
import { createContext, useContext, useState } from 'react'

// 示例 ThemeContext
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggle: () => void
}>({ theme: 'light', toggle: () => {} })

function ThemeButton() {
  const { theme, toggle } = useContext(ThemeContext)
  return (
    <button onClick={toggle} style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
      当前主题：{theme}
    </button>
  )
}

// 自定义 render 函数（推荐，避免每个测试重复写 Provider）
const renderWithTheme = (ui: React.ReactElement, { theme = 'light' as const } = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentTheme] = useState(theme)
    return (
      <ThemeContext.Provider value={{
        theme: currentTheme,
        toggle: () => setCurrentTheme(t => t === 'light' ? 'dark' : 'light')
      }}>
        {children}
      </ThemeContext.Provider>
    )
  }
  return render(ui, { wrapper: Wrapper })
}

test('Context 组件测试', async () => {
  const user = userEvent.setup()
  renderWithTheme(<ThemeButton />, { theme: 'light' })
  
  const button = screen.getByRole('button')
  expect(button).toHaveTextContent('当前主题：light')
  
  await user.click(button)
  expect(button).toHaveTextContent('当前主题：dark')
})
\`\`\`

### 四、路由组件测试

使用 React Router 的组件需要包裹 Router，测试时用 MemoryRouter 很方便：

\`\`\`tsx
import { MemoryRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'

function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div>
      <h1>用户 {id}</h1>
      <button onClick={() => navigate('/users')}>返回列表</button>
    </div>
  )
}

// 自定义 render 包含路由
const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/users/:id" element={ui} />
        <Route path="/users" element={<div>用户列表</div>} />
      </Routes>
    </MemoryRouter>
  )
}

test('路由参数测试', async () => {
  const user = userEvent.setup()
  renderWithRouter(<UserDetail />, { initialEntries: ['/users/123'] })
  
  expect(screen.getByText('用户 123')).toBeInTheDocument()
  
  await user.click(screen.getByRole('button', { name: '返回列表' }))
  expect(screen.getByText('用户列表')).toBeInTheDocument()
})
\`\`\`

### 五、自定义 Hook 测试

使用 \`renderHook\` 测试自定义 Hook：

\`\`\`tsx
import { renderHook, act, waitFor } from '@testing-library/react'

// 示例自定义 Hook
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initial)
  return { count, increment, decrement, reset }
}

test('useCounter Hook 测试', () => {
  // renderHook 返回 result，result.current 是 Hook 的返回值
  const { result } = renderHook(() => useCounter(10))
  
  expect(result.current.count).toBe(10)
  
  // ⚠️ 注意：更新 state 需要用 act 包裹
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(11)
  
  act(() => {
    result.current.decrement()
  })
  expect(result.current.count).toBe(10)
  
  act(() => {
    result.current.reset()
  })
  expect(result.current.count).toBe(10)
})

// 带 Provider 的 Hook
function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

test('带 Context 的 Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={{ user: { name: '测试' }, login: vi.fn(), logout: vi.fn() }}>
      {children}
    </AuthContext.Provider>
  )
  
  const { result } = renderHook(() => useAuth(), { wrapper })
  expect(result.current.user.name).toBe('测试')
})
\`\`\`

### 六、Mock 模块

使用 \`vi.mock\` 来 mock 整个模块：

\`\`\`ts
// mock 完整模块
vi.mock('../api', () => ({
  fetchUsers: vi.fn().mockResolvedValue([{ id: '1', name: '张三' }]),
  createUser: vi.fn().mockResolvedValue({ id: '2', name: '李四' }),
}))

// mock 默认导出
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn(),
  },
}))

// mock 部分，保留其他实现
vi.mock('../utils', async () => {
  const actual = await vi.importActual('../utils')
  return {
    ...actual,
    expensiveFunction: vi.fn(), // 只 mock 这个函数
  }
})
\`\`\`

### 七、快照测试（谨慎使用）

快照测试会记录组件渲染结果，下次运行时对比，但**很容易过时**：

\`\`\`tsx
test('快照测试', () => {
  const { container } = render(<Greeting name="World" />)
  expect(container).toMatchSnapshot()
  // 第一次运行生成 __snapshots__/xxx.snap 文件
  // 后续运行对比快照，不匹配时测试失败
  // 当确实需要更新快照时，运行 vitest -u
})
\`\`\`

**⚠️ 快照测试注意事项**：
- 不要过度依赖快照，它不能代替行为测试
- 快照变更时一定要人工审查，不要盲目 \`-u\` 更新
- 大组件的快照没有意义，尽量给小的展示组件用快照

记住：好的测试应该像用户使用你的应用一样去操作和断言，不要测试实现细节！
`,
  },
  {
    id: "tsrx-tdd",
    icon: "🔴",
    group: "测试篇",
    title: "TDD测试驱动开发实战",
    content: `## TDD测试驱动开发实战

测试驱动开发（Test-Driven Development，TDD）是一种先写测试再写实现代码的开发方法论。它不是一种测试技术，而是一种开发流程和设计方法。本章我们将通过一个完整的 Todo 组件例子，手把手体验 TDD 的完整流程。

### 一、TDD 三循环：Red → Green → Refactor

TDD 的核心是一个不断重复的短周期循环：

1. **🔴 Red（红）**：先写一个失败的测试。你还没有写实现代码，所以测试肯定不通过。
2. **🟢 Green（绿）**：写**最少量**的代码让测试通过。不管代码多丑多笨，只要能让测试通过就行。
3. **🔵 Refactor（重构）**：在测试保护下重构代码，优化设计、消除重复，同时保证测试始终通过。

然后重复这个循环，每一步都只做一件事，每一步都快速验证。

**TDD 的核心原则**：
- 除非是为了让一个失败的测试通过，否则不写任何产品代码
- 只写刚好足以导致测试失败的测试（编译失败也算失败）
- 只写刚好足以让一个失败测试通过的产品代码

### 二、我们要做什么：Todo 组件

我们用 TDD 的方式来实现一个经典的 Todo 组件，功能包括：
- 显示输入框让用户添加新 todo
- 输入文字后点击添加按钮创建 todo
- 列表显示所有 todo
- 点击 todo 可以切换完成状态（划线）
- 点击删除按钮移除 todo

让我们开始！

### 三、第一步：先写失败的测试（Red）

首先创建测试文件 \`Todo.test.tsx\`，注意：**我们还没有写 Todo.tsx 组件**！

\`\`\`tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Todo from './Todo'

const user = userEvent.setup()

describe('Todo 组件 TDD', () => {
  // 测试1：渲染输入框和添加按钮
  it('应该渲染输入框和添加按钮', () => {
    render(<Todo />)
    
    // 输入框存在
    expect(screen.getByPlaceholderText('添加新任务...')).toBeInTheDocument()
    // 添加按钮存在
    expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument()
  })
})
\`\`\`

运行测试 \`npm test\`，测试**失败**了——因为 Todo.tsx 还不存在！这就是 Red 阶段。

现在创建最简单的 Todo.tsx 让测试通过（Green 阶段）：

\`\`\`tsx
function Todo() {
  return (
    <div>
      <input placeholder="添加新任务..." />
      <button>添加</button>
    </div>
  )
}

export default Todo
\`\`\`

测试通过了！🟢 第一个循环完成。

### 四、添加新 todo 测试

继续 Red 阶段，添加下一个测试：输入文字点添加，todo 应该出现在列表中。

\`\`\`tsx
it('输入文字点击添加后，新任务应该出现在列表中', async () => {
  render(<Todo />)
  
  // 输入文字
  await user.type(screen.getByPlaceholderText('添加新任务...'), '学习 TDD')
  // 点击添加
  await user.click(screen.getByRole('button', { name: '添加' }))
  
  // 列表中应该出现这个任务
  expect(screen.getByText('学习 TDD')).toBeInTheDocument()
})
\`\`\`

测试失败了，因为现在还没有列表和添加逻辑。现在写最少代码让测试通过：

\`\`\`tsx
import { useState } from 'react'

function Todo() {
  const [todos, setTodos] = useState<string[]>([])
  const [input, setInput] = useState('')
  
  const handleAdd = () => {
    if (input.trim()) {
      setTodos([...todos, input])
      setInput('')
    }
  }
  
  return (
    <div>
      <input
        placeholder="添加新任务..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={handleAdd}>添加</button>
      <ul>
        {todos.map((todo, i) => <li key={i}>{todo}</li>)}
      </ul>
    </div>
  )
}

export default Todo
\`\`\`

测试通过了！🟢

### 五、切换完成状态测试

继续 Red，添加下一个测试：点击 todo 应该添加划线样式（完成状态）。

\`\`\`tsx
it('点击任务应该切换完成状态（划线）', async () => {
  render(<Todo />)
  
  // 添加一个任务
  await user.type(screen.getByPlaceholderText('添加新任务...'), '点击我')
  await user.click(screen.getByRole('button', { name: '添加' }))
  
  // 获取任务项
  const todoItem = screen.getByText('点击我')
  
  // 初始没有划线
  expect(todoItem).not.toHaveStyle('text-decoration: line-through')
  
  // 点击切换完成
  await user.click(todoItem)
  expect(todoItem).toHaveStyle('text-decoration: line-through')
  
  // 再次点击，取消完成
  await user.click(todoItem)
  expect(todoItem).not.toHaveStyle('text-decoration: line-through')
})
\`\`\`

测试失败，因为现在的 todo 是 string，没有完成状态。修改代码（Green）：

\`\`\`tsx
type TodoItem = { id: number; text: string; completed: boolean }

function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')
  
  const handleAdd = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }])
      setInput('')
    }
  }
  
  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }
  
  return (
    <div>
      <input
        placeholder="添加新任务..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={handleAdd}>添加</button>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

测试通过！🟢

### 六、删除功能测试

继续 Red，添加删除测试：

\`\`\`tsx
it('点击删除按钮应该移除任务', async () => {
  render(<Todo />)
  
  await user.type(screen.getByPlaceholderText('添加新任务...'), '删除我')
  await user.click(screen.getByRole('button', { name: '添加' }))
  
  // 任务存在
  expect(screen.getByText('删除我')).toBeInTheDocument()
  
  // 点击删除按钮
  await user.click(screen.getByRole('button', { name: '删除' }))
  
  // 任务消失了
  expect(screen.queryByText('删除我')).not.toBeInTheDocument()
})
\`\`\`

测试失败，添加删除功能让它通过：

\`\`\`tsx
// 在 toggleTodo 后添加
const deleteTodo = (id: number) => {
  setTodos(todos.filter(t => t.id !== id))
}

// 在 li 中添加删除按钮
<li key={todo.id} ...>
  {todo.text}
  <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}>删除</button>
</li>
\`\`\`

所有测试都通过了！🟢

### 七、Refactor 重构阶段

现在所有测试都绿了，我们可以放心重构代码。比如可以把 TodoItem 提取成单独的组件，优化代码结构：

\`\`\`tsx
// 提取 TodoItem 组件
type TodoItemViewProps = {
  todo: TodoItem
  onToggle: () => void
  onDelete: () => void
}

function TodoItemView({ todo, onToggle, onDelete }: TodoItemViewProps) {
  return (
    <li
      onClick={onToggle}
      style={{
        textDecoration: todo.completed ? 'line-through' : 'none',
        cursor: 'pointer',
        padding: '8px 0',
      }}
    >
      <span>{todo.text}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{ marginLeft: '8px' }}
      >
        删除
      </button>
    </li>
  )
}

// Todo 主组件
function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')
  
  const handleAdd = () => {
    if (!input.trim()) return
    setTodos(prev => [...prev, { id: Date.now(), text: input.trim(), completed: false }])
    setInput('')
  }
  
  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }
  
  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }
  
  return (
    <div style={{ maxWidth: '400px', margin: '20px auto' }}>
      <h1>Todo List</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          placeholder="添加新任务..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={handleAdd} style={{ padding: '8px 16px' }}>添加</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <TodoItemView
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
      {todos.length === 0 && <p style={{ color: '#999' }}>暂无任务，添加一个吧！</p>}
    </div>
  )
}
\`\`\`

重构完成后，**重新运行所有测试**。如果测试都通过，说明重构没有破坏功能！这就是测试给你的信心。🔵

### 八、完整测试文件一览

\`\`\`tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Todo from './Todo'

describe('Todo 组件 (TDD)', () => {
  const user = userEvent.setup()
  
  // 每个测试前重新渲染，避免测试间影响
  beforeEach(() => {
    render(<Todo />)
  })
  
  it('应该渲染输入框和添加按钮', () => {
    expect(screen.getByPlaceholderText('添加新任务...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument()
  })
  
  it('输入文字点击添加后，新任务应该出现在列表中', async () => {
    await user.type(screen.getByPlaceholderText('添加新任务...'), '学习 TDD')
    await user.click(screen.getByRole('button', { name: '添加' }))
    expect(screen.getByText('学习 TDD')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('添加新任务...')).toHaveValue('') // 添加后清空输入
  })
  
  it('点击任务应该切换完成状态', async () => {
    await user.type(screen.getByPlaceholderText('添加新任务...'), '点击我')
    await user.click(screen.getByRole('button', { name: '添加' }))
    
    const todoItem = screen.getByText('点击我')
    expect(todoItem).not.toHaveStyle('text-decoration: line-through')
    
    await user.click(todoItem)
    expect(todoItem).toHaveStyle('text-decoration: line-through')
    
    await user.click(todoItem)
    expect(todoItem).not.toHaveStyle('text-decoration: line-through')
  })
  
  it('点击删除按钮应该移除任务', async () => {
    await user.type(screen.getByPlaceholderText('添加新任务...'), '删除我')
    await user.click(screen.getByRole('button', { name: '添加' }))
    
    expect(screen.getByText('删除我')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '删除' }))
    expect(screen.queryByText('删除我')).not.toBeInTheDocument()
  })
  
  it('空输入不能添加任务', async () => {
    await user.click(screen.getByRole('button', { name: '添加' }))
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
  
  it('按回车键也能添加任务', async () => {
    await user.type(screen.getByPlaceholderText('添加新任务...'), '回车添加{Enter}')
    expect(screen.getByText('回车添加')).toBeInTheDocument()
  })
})
\`\`\`

### 九、TDD 的价值 vs 何时不该用 TDD

**✅ TDD 的价值**：
1. **活文档**：测试就是最好的文档，准确描述了代码应该做什么
2. **安全重构**：有测试保护，你可以大胆重构而不担心破坏功能
3. **设计驱动**：先写测试迫使你思考 API 设计和组件边界，写出更好解耦的代码
4. **调试时间少**：问题在写代码时就发现了，而不是 QA 阶段
5. **减少回归 bug**：改代码时如果破坏了什么，测试立刻报警

**❌ 何时 TDD 可能不值得**：
1. **快速 UI 探索阶段**：你还不知道 UI 长什么样，需求还在变
2. **非常简单的静态页面**：纯展示无交互的页面
3. **一次性 demo 或原型**：写完就扔的代码
4. **你完全不了解的领域**：先写个 spike 探索，再扔掉重写用 TDD

### 十、测试覆盖率

Vitest 内置了覆盖率报告：
\`\`\`bash
npx vitest run --coverage
\`\`\`

**记住**：100% 测试覆盖率不等于没有 bug，覆盖率只是个参考指标。写出有意义的测试比追求 100% 覆盖率重要得多。一些简单的纯展示组件可能不需要测试，而一些核心业务逻辑需要更全面的测试。

TDD 是一种需要练习的技能，刚开始你可能觉得很慢，但熟练之后你会发现它反而让你开发更快——因为你花在调试上的时间大大减少了。
`,
  },
  {
    id: "tsrx-error-boundary",
    icon: "💥",
    group: "实战篇",
    title: "Error Boundary错误边界",
    content: `## Error Boundary错误边界

JavaScript 错误是不可避免的，但在 React 应用中，一个组件的 JavaScript 错误不应该导致整个应用白屏崩溃。Error Boundary（错误边界）是 React 提供的一种机制，可以捕获子组件树中的 JavaScript 错误，记录错误并显示降级 UI，而不是整个页面崩溃。

### 一、什么是错误边界

错误边界是一种 React 组件，它**只能是 Class 组件**（函数组件目前还不能成为错误边界），它可以捕获并打印发生在其子组件树任何位置的 JavaScript 错误，并渲染出备用 UI。

错误边界可以捕获以下错误：
- ✅ 渲染过程中的错误（render 函数）
- ✅ 生命周期方法中的错误
- ✅ 构造函数中的错误
- ❌ **事件处理中的错误**（需要自己 try/catch）
- ❌ **异步代码中的错误**（setTimeout、Promise、useEffect）
- ❌ **服务端渲染错误**
- ❌ **错误边界自身抛出的错误**（它只能捕获子组件的）

### 二、Class 组件实现错误边界

一个类组件要成为错误边界，只需要实现以下两个生命周期方法中的一个或两个：

1. **static getDerivedStateFromError(error)**：渲染降级 UI，在错误抛出后调用
2. **componentDidCatch(error, errorInfo)**：记录错误信息，用于错误上报

\`\`\`tsx
import { Component, ErrorInfo, ReactNode } from 'react'

// 定义 Props 和 State 类型
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode // 自定义降级 UI
  onError?: (error: Error, errorInfo: ErrorInfo) => void // 错误回调
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  // 子组件抛出错误时调用，返回值更新 state
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state，下一次渲染显示降级 UI
    return { hasError: true, error }
  }
  
  // 捕获错误后调用，可以在这里做错误上报
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('错误边界捕获到错误：', error, errorInfo)
    
    // 如果有自定义错误回调，调用它
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // 这里可以集成错误上报服务
    // 例如 Sentry.captureException(error, { extra: errorInfo })
  }
  
  // 重置错误状态的方法
  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }
  
  render() {
    if (this.state.hasError) {
      // 如果有自定义 fallback，渲染自定义的
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // 默认降级 UI
      return (
        <div style={{
          padding: '24px',
          margin: '16px',
          border: '1px solid #ff4d4f',
          borderRadius: '8px',
          background: '#fff2f0',
        }}>
          <h2 style={{ color: '#ff4d4f', marginTop: 0 }}>😵 出问题了</h2>
          <p>组件渲染时发生错误，我们已经记录了这个问题。</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', margin: '12px 0' }}>
              <summary>错误详情</summary>
              <p style={{ color: '#cf1322' }}>{this.state.error.toString()}</p>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px',
            }}
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              background: '#fff',
              color: '#333',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            返回首页
          </button>
        </div>
      )
    }
    
    // 没有错误，正常渲染子组件
    return this.props.children
  }
}

export default ErrorBoundary
\`\`\`

### 三、使用错误边界

\`\`\`tsx
import ErrorBoundary from './ErrorBoundary'

// 一个会抛出错误的组件，用于演示
function BuggyComponent({ name }: { name: string }) {
  if (name === 'error') {
    // 模拟一个渲染错误
    throw new Error('我是一个故意抛出的错误！')
  }
  return <div>Hello, {name}</div>
}

function App() {
  return (
    <div>
      <h1>错误边界演示</h1>
      
      {/* 把可能出错的组件包裹在 ErrorBoundary 中 */}
      <ErrorBoundary
        onError={(error, info) => {
          console.log('上报错误到监控系统...')
          // Sentry.captureException(error)
        }}
      >
        <BuggyComponent name="正常组件" />
      </ErrorBoundary>
      
      {/* 另一个独立的错误边界，一个出错不影响另一个 */}
      <ErrorBoundary
        fallback={
          <div>用户信息加载失败，请刷新重试</div>
        }
      >
        <BuggyComponent name="error" />
      </ErrorBoundary>
      
      {/* 上面的组件出错了，但这部分仍然能正常显示 */}
      <div>这里的内容不受影响</div>
    </div>
  )
}
\`\`\`

**重要**：错误边界的粒度需要你自己控制。你可以：
- **包裹整个路由页面**：一个页面崩溃了，其他页面还能访问
- **包裹单个组件**：一个小部件崩溃了，页面其他部分正常
- **包裹整个应用**：最外层兜底，至少不会白屏

通常建议**多层嵌套使用**：关键组件单独包裹，外层有个全局兜底。

### 四、withErrorBoundary HOC

可以写一个高阶组件（HOC）让用法更简洁：

\`\`\`tsx
import { ComponentType, ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'

function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  // 设置 displayName 方便调试
  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`
  
  return Wrapped
}

// 使用方法
const SafeBuggyComponent = withErrorBoundary(BuggyComponent, <div>组件加载失败</div>)

function App() {
  return (
    <SafeBuggyComponent name="error" />
  )
}
\`\`\`

### 五、处理异步错误和事件错误

⚠️ **错误边界捕获不到这些错误**，需要自己处理：

1. **事件处理器中的错误**（onClick 等）
2. **异步代码**（setTimeout、Promise.then、useEffect 里的错误）

\`\`\`tsx
import { useState, useEffect } from 'react'

// ❌ 错误边界捕获不到事件错误
function EventErrorDemo() {
  const handleClick = () => {
    // 这个 throw 错误边界捕获不到！
    throw new Error('事件处理中的错误')
  }
  return <button onClick={handleClick}>点我抛错</button>
}

// ❌ useEffect 里的异步错误也捕获不到
function AsyncErrorDemo() {
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(() => {
        throw new Error('Promise 里的错误')
      })
  }, [])
  return <div>异步组件</div>
}
\`\`\`

**处理方案**：用 try/catch 或 .catch()，自己处理错误，或者配合错误上报，也可以用 state 把错误抛到渲染层让边界捕获：

\`\`\`tsx
import { useState, useEffect } from 'react'

// ✅ 把错误存到 state，渲染时 throw 就能让边界捕获了
function AsyncComponent() {
  const [data, setData] = useState(null)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err)) // 捕获错误存到 state
  }, [])
  
  // 如果有错误，在渲染时 throw，就能被错误边界捕获
  if (error) throw error
  
  return <div>{/* 渲染数据 */}</div>
}

// ✅ 事件处理器里也可以自己 try/catch，或者用 state 处理
function EventComponent() {
  const [error, setError] = useState<Error | null>(null)
  
  const handleClick = () => {
    try {
      // 可能出错的逻辑
      riskyOperation()
    } catch (err) {
      setError(err as Error)
      // 或者错误上报
      console.error(err)
    }
  }
  
  if (error) return <div>操作失败：{error.message}</div>
  return <button onClick={handleClick}>操作</button>
}
\`\`\`

### 六、react-error-boundary 库

社区有一个成熟的库 **react-error-boundary**，提供了更强大的错误边界和 Hook 支持：

\`\`\`bash
pnpm add react-error-boundary
\`\`\`

使用方式：

\`\`\`tsx
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary'

// Fallback 组件可以接收错误和重置函数
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert">
      <p>出错了：{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 重置时做一些清理工作
        console.log('重置错误状态')
      }}
      resetKeys={['someKey']} // 这些 key 变化时自动重置
    >
      <MyComponent />
    </ErrorBoundary>
  )
}

// ✨ useErrorBoundary Hook：函数组件也能主动触发错误边界
function AsyncComponent() {
  const { showBoundary } = useErrorBoundary()
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('请求失败')
        return res.json()
      })
      .catch(err => showBoundary(err)) // 直接触发最近的错误边界
  }, [])
  
  return <div>异步组件</div>
}
\`\`\`

### 七、错误上报

错误边界是错误上报的绝佳位置。推荐接入专业的错误监控服务如 Sentry：

\`\`\`tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: '你的 Sentry DSN',
  environment: process.env.NODE_ENV,
})

// 在 componentDidCatch 中上报
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack,
    },
  })
}

// 或者 react-error-boundary
<ErrorBoundary
  onError={(error, info) => {
    Sentry.captureException(error, { extra: info })
  }}
  FallbackComponent={ErrorFallback}
>
  {children}
</ErrorBoundary>
\`\`\`

### 八、生产环境最佳实践

在生产环境中，错误边界是必备的：

1. **多层错误边界**：全局兜底 + 关键组件单独包裹
2. **友好的用户提示**：不要把错误栈直接展示给用户（开发环境可以），给用户有意义的提示和操作选项（重试、返回首页）
3. **错误上报**：所有错误都要上报，方便定位问题
4. **自动重试逻辑**：网络错误可以自动重试，代码错误重试可能还是会错
5. **开发环境显示详情**：开发环境可以显示完整的错误信息和堆栈，生产环境给友好提示

\`\`\`tsx
const isProd = process.env.NODE_ENV === 'production'

<ErrorBoundary
  fallback={isProd ? (
    <div>
      <h3>页面出错了</h3>
      <p>抱歉给您带来不便，我们已经收到通知。</p>
      <button onClick={() => window.location.reload()}>刷新页面</button>
    </div>
  ) : undefined} // 开发环境用默认的显示错误详情
>
  {children}
</ErrorBoundary>
\`\`\`

总结：错误边界不是万能的，但没有它是万万不能的。任何一个稍有规模的 React 应用，都应该有错误边界兜底，避免一个小错误导致整个应用白屏。
`,
  },
  {
    id: "tsrx-accessibility",
    icon: "♿",
    group: "实战篇",
    title: "无障碍访问(a11y)",
    content: `## 无障碍访问(a11y)

无障碍访问（Accessibility，简称 a11y）是指让你的网站能够被所有人使用，包括视力障碍、听力障碍、运动障碍等残障人士。这不仅是社会责任，在很多国家也是法律要求，同时也能提升所有用户的体验。

### 一、语义化 HTML 是基础

很多人一提到无障碍就想到 ARIA，其实**正确使用原生 HTML 元素**是无障碍最简单也最有效的方式。原生语义化元素自带无障碍特性，不需要额外工作。

❌ **不好的做法**：
\`\`\`tsx
{/* 用 div 做按钮，没有键盘支持、没有语义、屏幕阅读器不认 */}
<div onClick={handleSubmit} className="btn">提交</div>
\`\`\`

✅ **好的做法**：
\`\`\`tsx
{/* 原生 button 自带：可聚焦、可键盘点击（Enter/Space）、屏幕阅读器识别为按钮 */}
<button onClick={handleSubmit}>提交</button>
\`\`\`

**常见语义化元素对比**：

| 场景 | ❌ 不要用 | ✅ 应该用 |
|------|-----------|-----------|
| 按钮 | div/span | button |
| 链接 | span onClick | a href |
| 导航 | div class="nav" | nav |
| 主要内容 | div id="main" | main |
| 标题 | div class="h1" | h1-h6（按层级） |
| 表单 | div + onClick | form + label + input/button |
| 列表 | div 套 div | ul/ol + li |
| 强调 | span style bold | strong/em |

\`\`\`tsx
{/* 完整的语义化页面结构 */}
function SemanticPage() {
  return (
    <>
      <header>
        <nav>
          {/* 导航链接用 a 标签 */}
          <a href="/">首页</a>
          <a href="/about">关于</a>
        </nav>
      </header>
      
      <main>
        <h1>页面主标题（每个页面应该只有一个 h1）</h1>
        
        <article>
          <h2>文章标题</h2>
          <p>段落内容...</p>
          
          <section>
            <h3>小节标题</h3>
            {/* 内容 */}
          </section>
        </article>
        
        <aside>侧边栏</aside>
      </main>
      
      <footer>页脚版权信息</footer>
    </>
  )
}
\`\`\`

**注意**：
- 不要跳级使用标题（h1 直接到 h3），保持正确层级
- 每个页面应该只有一个 h1
- label 一定要关联对应的 input
- 图片必须有 alt 属性（纯装饰图片 alt=""）

### 二、ARIA 属性

当原生 HTML 语义不够用时（比如自定义组件），使用 ARIA（Accessible Rich Internet Applications）来补充。

**第一规则**：能用原生 HTML 就不要用 ARIA。

常用 ARIA 属性：

\`\`\`tsx
// 1. aria-label：给没有文字的元素添加可访问名称
<button aria-label="关闭弹窗">
  <XIcon /> {/* 只有图标没有文字 */}
</button>

// 2. aria-labelledby：通过其他元素的 ID 作为标签
<h2 id="dialog-title">确认删除</h2>
<div role="dialog" aria-labelledby="dialog-title">
  弹窗内容
</div>

// 3. aria-expanded：表示可展开元素的状态
<button aria-expanded={isOpen} onClick={toggle}>
  菜单
</button>
{isOpen && <ul>展开的菜单项</ul>}

// 4. aria-live：动态内容区域，变化时屏幕阅读器会朗读
// polit: polite（礼貌，用户空闲时读）/ assertive（立即打断读）
<div aria-live="polite">
  {successMessage && '操作成功！'}
  {errorMessage && '出错了'}
</div>

// 5. aria-modal + role="dialog"：模态框
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">弹窗标题</h2>
  内容
</div>

// 6. aria-current：当前页/当前项
<nav>
  <a href="/" aria-current="page">首页</a> {/* 当前页 */}
  <a href="/about">关于</a>
</nav>

// 7. aria-hidden：对屏幕阅读器隐藏（纯装饰元素）
<span aria-hidden="true">🎨</span> 装饰性图标，不需要读

// 8. role 属性：给元素添加语义（万不得已才用，优先原生元素）
<div role="alert">重要错误通知</div>
<div role="tablist">
  <button role="tab" aria-selected={true}>标签1</button>
  <button role="tab" aria-selected={false}>标签2</button>
</div>
\`\`\`

### 三、键盘导航完整支持

很多用户（包括部分运动障碍用户和高级用户）只用键盘操作网站。你的网站必须能用 **Tab 键完整导航和操作**。

**核心键盘操作**：
- **Tab / Shift+Tab**：在可聚焦元素间切换
- **Enter**：激活链接/按钮
- **Space**：激活按钮、切换复选框
- **Esc**：关闭弹窗、菜单
- **方向键**：菜单内导航、单选框组切换

**可聚焦元素**：a、button、input、select、textarea、以及带 tabIndex 的元素

\`\`\`tsx
import { useEffect, useRef } from 'react'

// 自定义弹窗组件的键盘处理
function Modal({ isOpen, onClose, children, titleId }) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    if (!isOpen) return
    
    // 打开弹窗时：保存之前的焦点，把焦点移到弹窗内
    previousFocusRef.current = document.activeElement as HTMLElement
    modalRef.current?.focus()
    
    // 焦点陷阱：Tab 不能跑到弹窗外面（Tab Trap）
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements || focusableElements.length === 0) return
        
        const first = focusableElements[0] as HTMLElement
        const last = focusableElements[focusableElements.length - 1] as HTMLElement
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // 关闭弹窗时：把焦点还回去
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1} // 可以被编程聚焦，但不在 Tab 序列里
      style={{ position: 'fixed', inset: 0, background: 'white' }}
    >
      {children}
      <button onClick={onClose}>关闭</button>
    </div>
  )
}
\`\`\`

### 四、焦点管理

焦点管理是无障碍的重要环节：

1. **autoFocus**：页面加载或弹窗打开时自动聚焦到第一个交互元素
2. **tabIndex**：
   - `tabIndex="0"`：让元素可聚焦，按 DOM 顺序
   - `tabIndex="-1"`：只能通过 JS 编程聚焦，不在 Tab 序列中
   - ⚠️ **永远不要用 tabIndex > 0**，会打乱自然 tab 顺序

\`\`\`tsx
import { useRef, useEffect } from 'react'

function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#000',
        color: 'white',
        padding: '8px',
        zIndex: 100,
        // 聚焦时才显示出来
        ':focus': { top: '0' },
      }}
    >
      跳转到主要内容
    </a>
  )
}

function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 按 / 键聚焦搜索框（类似 GitHub 的快捷键）
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])
  
  return (
    <input ref={inputRef} type="search" placeholder="搜索... (按 / 聚焦)" />
  )
}
\`\`\`

### 五、Skip Link 跳过导航

键盘用户每次打开页面都要按很多次 Tab 才能到内容区，skip link（跳过导航链接）可以解决这个问题：

\`\`\`tsx
function Layout({ children }) {
  return (
    <>
      {/* 这个链接默认隐藏，只有键盘聚焦时才显示 */}
      <a href="#main" className="skip-link">
        跳过导航，直接到内容
      </a>
      
      <nav>
        {/* 很多导航链接... */}
      </nav>
      
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      
      <style>{`
        .skip-link {
          position: absolute;
          top: -100%;
          left: 0;
          padding: 8px 16px;
          background: #005fcc;
          color: white;
          z-index: 1000;
        }
        .skip-link:focus {
          top: 0;
        }
      `}</style>
    </>
  )
}
\`\`\`

### 六、自动化检查工具

好消息是很多无障碍问题可以自动检查出来：

1. **eslint-plugin-jsx-a11y**：ESLint 插件，写代码时就提示问题

\`\`\`bash
pnpm add -D eslint-plugin-jsx-a11y
\`\`\`

在 .eslintrc 中配置：
\`\`\`json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"]
}
\`\`\`

2. **jest-axe**：测试中做无障碍检查

\`\`\`bash
pnpm add -D jest-axe
\`\`\`

\`\`\`tsx
import { axe, toHaveNoViolations } from 'jest-axe'
import { render } from '@testing-library/react'

expect.extend(toHaveNoViolations)

it('组件没有无障碍违规', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
\`\`\`

3. **Lighthouse**：Chrome 开发者工具内置，a11y 审计

4. **axe DevTools**：浏览器扩展，实时检查页面无障碍问题

### 七、屏幕阅读器测试

自动化工具不能检测所有问题，建议实际用屏幕阅读器测试：
- **macOS**：VoiceOver（Cmd+F5 开启）
- **Windows**：NVDA（免费）、JAWS
- **iOS**：VoiceOver
- **Android**：TalkBack

### 八、色彩和对比度

- 文本和背景的对比度至少要达到 **WCAG AA 标准**：普通文本 4.5:1，大文本 3:1
- 不要只用颜色传达信息（比如成功只显示绿色文字，还要加图标或文字说明）
- 测试对比度工具：[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

\`\`\`tsx
{/* ❌ 不好：红色太浅，对比度不够 */}
<div style={{ color: '#ff9999', background: 'white' }}>错误提示</div>

{/* ✅ 好：对比度符合标准，而且不仅靠颜色传达 */}
<div style={{ color: '#cc0000' }}>
  <span aria-hidden="true">❌</span> 错误提示
</div>
\`\`\`

### 九、总结检查清单

- [ ] 用了语义化 HTML（button 不是 div，a 不是 span）
- [ ] 图片都有 alt 属性
- [ ] form 控件都有关联的 label
- [ ] 只用键盘可以操作网站所有功能
- [ ] 弹窗有焦点陷阱和 Esc 关闭
- [ ] 有 skip link 跳过导航
- [ ] 颜色对比度达标
- [ ] 不是只靠颜色传达信息
- [ ] 动态内容有 aria-live 通知
- [ ] 跑过 eslint-plugin-jsx-a11y 和 Lighthouse 没有严重问题

无障碍不是一次性工作，而是开发时就需要注意的习惯。一开始可能觉得麻烦，但养成习惯后会成为开发的直觉，最终让所有人都能更好地使用你的产品。
`,
  },
  {
    id: "tsrx-i18n",
    icon: "🌍",
    group: "实战篇",
    title: "国际化i18n方案",
    content: `## 国际化i18n方案

国际化（Internationalization，简称 i18n）是让你的应用能够适配不同语言和地区的过程。React 生态中最成熟的方案是 **react-i18next**，它功能强大、文档完善，是业界标准选择。

### 一、安装和基础配置

首先安装依赖：

\`\`\`bash
pnpm add react-i18next i18next i18next-browser-languagedetector
\`\`\`

- **i18next**：核心 i18n 框架
- **react-i18next**：React 绑定
- **i18next-browser-languagedetector**：自动检测浏览器语言

创建配置文件 \`src/i18n/config.ts\`：

\`\`\`ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言资源文件
import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 把 i18n 实例传给 react-i18next
  .use(initReactI18next)
  // 初始化
  .init({
    // 默认语言
    fallbackLng: 'zh',
    // 调试模式（开发环境开启）
    debug: process.env.NODE_ENV === 'development',
    // 默认命名空间
    defaultNS: 'translation',
    // 语言资源
    resources: {
      zh: { translation: zh },
      en: { translation: en },
      ja: { translation: ja },
    },
    // 插值配置
    interpolation: {
      escapeValue: false, // React 默认已经转义了，不需要 i18next 再转义
    },
    // 语言检测配置
    detection: {
      // 检测顺序：cookie > localStorage > 浏览器语言
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n
\`\`\`

在 \`main.tsx\` 中导入配置：

\`\`\`tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n/config' // 导入 i18n 配置

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
\`\`\`

### 二、创建语言资源文件

创建 JSON 文件存放翻译文本，推荐放在 \`src/i18n/locales/\` 目录：

\`src/i18n/locales/zh.json\`:
\`\`\`json
{
  "app": {
    "title": "Todo 应用",
    "welcome": "欢迎回来，{{name}}！"
  },
  "nav": {
    "home": "首页",
    "about": "关于",
    "settings": "设置"
  },
  "todo": {
    "addPlaceholder": "添加新任务...",
    "addButton": "添加",
    "empty": "暂无任务",
    "delete": "删除",
    "complete": "完成",
    "itemsCount": "{{count}} 个任务",
    "itemsCount_plural": "{{count}} 个任务",
    "filter": {
      "all": "全部",
      "active": "进行中",
      "completed": "已完成"
    }
  },
  "common": {
    "save": "保存",
    "cancel": "取消",
    "confirm": "确认",
    "loading": "加载中...",
    "error": "出错了",
    "retry": "重试"
  }
}
\`\`\`

\`src/i18n/locales/en.json\`:
\`\`\`json
{
  "app": {
    "title": "Todo App",
    "welcome": "Welcome back, {{name}}!"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "settings": "Settings"
  },
  "todo": {
    "addPlaceholder": "Add a new task...",
    "addButton": "Add",
    "empty": "No tasks yet",
    "delete": "Delete",
    "complete": "Complete",
    "itemsCount": "{{count}} item",
    "itemsCount_plural": "{{count}} items",
    "filter": {
      "all": "All",
      "active": "Active",
      "completed": "Completed"
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry"
  }
}
\`\`\`

**命名建议**：用嵌套结构按模块分组，key 用层级结构组织清晰。

### 三、useTranslation Hook 使用

在组件中使用 \`useTranslation\` Hook：

\`\`\`tsx
import { useTranslation } from 'react-i18next'

function TodoHeader() {
  // t 是翻译函数，i18n 是 i18next 实例
  const { t, i18n } = useTranslation()
  
  const userName = '张三'
  
  return (
    <header>
      <h1>{t('app.title')}</h1>
      
      {/* 插值：替换变量 */}
      <p>{t('app.welcome', { name: userName })}</p>
      
      <nav>
        <a href="/">{t('nav.home')}</a>
        <a href="/about">{t('nav.about')}</a>
      </nav>
    </header>
  )
}
\`\`\`

### 四、插值、复数、上下文

1. **插值（Interpolation）**：动态值插入翻译

\`\`\`tsx
// JSON
// "greeting": "你好，{{name}}！今天是 {{date}}"

t('greeting', {
  name: '李四',
  date: new Date().toLocaleDateString()
})
// 输出：你好，李四！今天是 2024/1/15
\`\`\`

2. **复数（Plurals）**：根据数量自动选择正确的形式

\`\`\`tsx
// JSON：
// "itemsCount": "{{count}} 个任务",
// "itemsCount_plural": "{{count}} 个任务"
// （中文单复数一样，但英语等语言不一样）

t('todo.itemsCount', { count: 0 }) // 0 个任务
t('todo.itemsCount', { count: 1 }) // 1 个任务
t('todo.itemsCount', { count: 5 }) // 5 个任务
\`\`\`

3. **Trans 组件处理包含 JSX 的复杂翻译**

当翻译内容中包含链接、加粗等 JSX 元素时，用 Trans 组件：

\`\`\`tsx
import { Trans, useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer>
      {/* 简单文本用 t */}
      <p>{t('common.copyright')}</p>
      
      {/* 包含 JSX/链接的用 Trans */}
      <p>
        <Trans i18nKey="footer.privacy">
          查看我们的 <a href="/privacy">隐私政策</a> 和 <a href="/terms">服务条款</a>
        </Trans>
      </p>
      
      {/* JSON: "footer": { "privacy": "查看我们的 <1>隐私政策</1> 和 <3>服务条款</3>" } */}
      
      {/* 可以传组件 */}
      <Trans
        i18nKey="welcome"
        values={{ name: '用户' }}
        components={{
          bold: <strong />,
          link: <a href="/profile" />,
        }}
      >
        你好，<bold>{{ name }}</bold>！去你的<link>个人主页</link>看看吧。
      </Trans>
    </footer>
  )
}
\`\`\`

### 五、语言切换

用户主动切换语言：

\`\`\`tsx
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language
  
  const handleChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    // 因为配置了 detection.caches 包含 localStorage，语言会自动持久化
  }
  
  return (
    <div>
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          style={{ fontWeight: currentLang.startsWith(lang.code) ? 'bold' : 'normal' }}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )
}
\`\`\`

### 六、日期、数字、货币格式化

**不要自己写日期/数字格式化！** 使用浏览器内置的 \`Intl\` API，专业且支持所有语言：

\`\`\`ts
// 日期格式化
const formatDate = (date: Date, locale = i18n.language) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

// 使用
formatDate(new Date(), 'zh') // "2024年1月15日星期一"
formatDate(new Date(), 'en-US') // "Monday, January 15, 2024"
formatDate(new Date(), 'ja') // "2024年1月15日月曜日"

// 数字格式化
const formatNumber = (num: number, locale = i18n.language) => {
  return new Intl.NumberFormat(locale).format(num)
}
formatNumber(1234567.89, 'zh') // "1,234,567.89"
formatNumber(1234567.89, 'de') // "1.234.567,89"（德国用逗号做小数点）

// 货币格式化
const formatCurrency = (amount: number, currency: string, locale = i18n.language) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
formatCurrency(99.9, 'CNY', 'zh') // "¥99.90"
formatCurrency(99.9, 'USD', 'en-US') // "$99.90"
formatCurrency(99.9, 'EUR', 'de') // "99,90 €"

// 相对时间（"3 分钟前"、"2 天后"）
const formatRelativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit, locale = i18n.language) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  return rtf.format(value, unit)
}
formatRelativeTime(-3, 'minute', 'zh') // "3 分钟前"
formatRelativeTime(-3, 'minute', 'en') // "3 minutes ago"
formatRelativeTime(2, 'day', 'zh') // "后天"
formatRelativeTime(2, 'day', 'en') // "in 2 days"
\`\`\`

封装成自定义 Hook 更方便：

\`\`\`tsx
import { useTranslation } from 'react-i18next'

export function useIntl() {
  const { i18n } = useTranslation()
  const locale = i18n.language
  
  return {
    formatDate: (date: Date, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, opts).format(date),
    formatNumber: (num: number, opts?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, opts).format(num),
    formatCurrency: (num: number, currency: string) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num),
    formatRelative: (value: number, unit: Intl.RelativeTimeFormatUnit) =>
      new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit),
  }
}

// 使用
function TodoItem({ todo }) {
  const { formatRelative } = useIntl()
  return (
    <div>
      {todo.text}
      <span>{formatRelative(-5, 'minute')}</span>
    </div>
  )
}
\`\`\`

### 七、RTL（从右到左）语言支持

阿拉伯语、希伯来语等语言是从右到左书写的，需要处理：

1. 设置 \`dir\` 属性
2. 翻转 CSS 布局

\`\`\`tsx
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const rtlLanguages = ['ar', 'he', 'fa', 'ur']

function App() {
  const { i18n } = useTranslation()
  const isRTL = rtlLanguages.some(l => i18n.language.startsWith(l))
  
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language, isRTL])
  
  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <AppContent />
    </div>
  )
}
\`\`\`

CSS 中用逻辑属性代替物理方向：
\`\`\`css
/* ❌ 不支持 RTL：左外边距在 RTL 语言中应该在右边 */
.element { margin-left: 16px; }

/* ✅ 逻辑属性：自动适配方向 */
.element { margin-inline-start: 16px; } /* 开头边距 */
.element { padding-inline-end: 8px; } /* 结尾内边距 */
.element { border-inline-start: 2px solid blue; } /* 开头边框 */
\`\`\`

### 八、最佳实践和注意事项

1. **Key 命名规范**：按模块层级命名，不要用中文或英文原句做 key
   - ✅ `todo.addButton`
   - ❌ `add`、`添加`、`Add Button`

2. **不要拼接字符串**：用插值，不要 \`t('hello') + name\`
   - ✅ \`t('hello', { name })\`
   - ❌ \`t('hello') + ' ' + name\`（不同语法语序不同）

3. **始终提供 fallbackLng**：防止缺少翻译时显示 key

4. **懒加载大语言包**：如果语言很多，可以按需加载：

\`\`\`ts
// 懒加载语言包
i18n.addResourceBundle('zh', 'translation', zh, true, true)

// 或者用 i18next-http-backend 从 public 目录加载
import HttpBackend from 'i18next-http-backend'
i18n.use(HttpBackend) // 会自动请求 /locales/{{lng}}/{{ns}}.json
\`\`\`

5. **类型安全（TypeScript）**：可以定义类型确保 key 存在：

\`\`\`ts
// src/i18n/types.ts
import 'i18next'
import zh from './locales/zh.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof zh
    }
  }
}
\`\`\`

配置后，\`t('不存在的key')\` 会有 TypeScript 报错！

6. **翻译文件不要放在 public 目录**：放在 src 中可以被打包处理，未使用的 key 可以被 tree-shaking（或者你也可以放 public 做懒加载）

i18n 是产品走向国际化的第一步，react-i18next 足够应对绝大多数场景，记住：不要硬编码用户可见的字符串，始终用 t() 函数！
`,
  },
  {
    id: "tsrx-tree-master",
    icon: "🌳",
    group: "实战篇",
    title: "递归组件实战：Tree树形控件",
    content: `## 递归组件实战：Tree树形控件

树形控件（Tree）是展示层级结构数据的常用组件，比如文件目录、组织架构、分类菜单等。Tree 组件是递归组件的经典应用场景——每个节点可能包含子节点，子节点又包含子节点，天然适合用递归渲染。

### 一、Tree 数据结构定义

首先定义 Tree 节点的 TypeScript 类型：

\`\`\`ts
// 泛型 TreeNode，T 是节点附加数据的类型
type TreeNode<T = Record<string, unknown>> = {
  id: string
  label: string
  icon?: string
  children?: TreeNode<T>[]
  // 可以扩展任意自定义数据
} & T

// 示例：文件系统节点
type FileNode = TreeNode<{
  type: 'file' | 'folder'
  size?: number
  modifiedAt?: string
}>

// 示例数据
const fileTreeData: FileNode[] = [
  {
    id: '1',
    label: 'src',
    type: 'folder',
    children: [
      {
        id: '1-1',
        label: 'components',
        type: 'folder',
        children: [
          { id: '1-1-1', label: 'Button.tsx', type: 'file', size: 1200 },
          { id: '1-1-2', label: 'Input.tsx', type: 'file', size: 900 },
          { id: '1-1-3', label: 'Tree', type: 'folder', children: [
            { id: '1-1-3-1', label: 'TreeNode.tsx', type: 'file' },
            { id: '1-1-3-2', label: 'Tree.tsx', type: 'file' },
          ]},
        ],
      },
      { id: '1-2', label: 'App.tsx', type: 'file', size: 2000 },
      { id: '1-3', label: 'main.tsx', type: 'file', size: 300 },
    ],
  },
  {
    id: '2',
    label: 'public',
    type: 'folder',
    children: [
      { id: '2-1', label: 'index.html', type: 'file' },
      { id: '2-2', label: 'favicon.ico', type: 'file' },
    ],
  },
  { id: '3', label: 'package.json', type: 'file', size: 1500 },
  { id: '4', label: 'tsconfig.json', type: 'file' },
]
\`\`\`

### 二、基础递归 TreeNode 组件

核心是递归：如果节点有 children，就再次渲染 TreeNode 组件本身：

\`\`\`tsx
import { useState } from 'react'

// TreeNode 组件 Props
type TreeNodeProps<T extends Record<string, unknown> = Record<string, unknown>> = {
  node: TreeNode<T>
  level: number // 缩进层级
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  selectedId?: string | null
  onSelect?: (node: TreeNode<T>) => void
}

function TreeNodeComponent<T extends Record<string, unknown>>({
  node,
  level,
  expandedIds,
  onToggleExpand,
  selectedId,
  onSelect,
}: TreeNodeProps<T>) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const isFolder = (node as any).type === 'folder'
  
  return (
    <div>
      {/* 节点本身 */}
      <div
        onClick={() => onSelect?.(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          paddingLeft: \`\${level * 20 + 8}px\`,
          cursor: 'pointer',
          background: isSelected ? '#e6f4ff' : 'transparent',
          borderRadius: '4px',
          userSelect: 'none',
        }}
      >
        {/* 展开/折叠箭头 */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
            style={{
              width: '20px',
              display: 'inline-flex',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              color: '#666',
              fontSize: '10px',
            }}
          >
            ▶
          </span>
        ) : (
          <span style={{ width: '20px' }} />
        )}
        
        {/* 图标 */}
        <span style={{ marginRight: '6px' }}>
          {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        
        {/* 文字标签 */}
        <span>{node.label}</span>
      </div>
      
      {/* 递归渲染子节点：只有展开时才渲染 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
\`\`\`

### 三、Tree 主组件

主组件管理展开状态、选中状态等：

\`\`\`tsx
import { useState, useCallback } from 'react'

type TreeProps<T extends Record<string, unknown>> = {
  data: TreeNode<T>[]
  defaultExpandAll?: boolean
  defaultExpandedIds?: string[]
  onSelect?: (node: TreeNode<T>) => void
}

function Tree<T extends Record<string, unknown>>({
  data,
  defaultExpandAll = false,
  defaultExpandedIds = [],
  onSelect,
}: TreeProps<T>) {
  // 默认展开的节点
  const getDefaultExpanded = () => {
    if (defaultExpandAll) {
      // 递归收集所有有子节点的 id
      const ids = new Set<string>()
      const collect = (nodes: TreeNode<T>[]) => {
        nodes.forEach(n => {
          if (n.children?.length) {
            ids.add(n.id)
            collect(n.children)
          }
        })
      }
      collect(data)
      return ids
    }
    return new Set(defaultExpandedIds)
  }
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(getDefaultExpanded)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // 切换展开/折叠
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])
  
  // 选中节点
  const handleSelect = useCallback((node: TreeNode<T>) => {
    setSelectedId(node.id)
    onSelect?.(node)
  }, [onSelect])
  
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '8px',
      maxWidth: '400px',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
    }}>
      {data.map(node => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}

// 使用
function App() {
  return (
    <div style={{ padding: '24px' }}>
      <h2>文件浏览器</h2>
      <Tree
        data={fileTreeData}
        defaultExpandedIds={['1']}
        onSelect={(node) => console.log('选中了:', node.label)}
      />
    </div>
  )
}
\`\`\`

### 四、右键菜单（Context Menu）

给 Tree 添加右键菜单功能：

\`\`\`tsx
import { useState, useEffect, useRef } from 'react'

type ContextMenuState = {
  x: number
  y: number
  nodeId: string
} | null

function TreeWithContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // 点击其他地方关闭菜单
  useEffect(() => {
    if (!contextMenu) return
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])
  
  const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: node.id,
    })
  }
  
  return (
    <Tree
      data={fileTreeData}
      // 给每个节点添加右键事件（这里可以通过 props 传递，或者修改 TreeNode）
    >
      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          {[
            { label: '打开', icon: '📂', action: () => {} },
            { label: '重命名', icon: '✏️', action: () => {} },
            { label: '复制', icon: '📋', action: () => {} },
            { label: '删除', icon: '🗑️', danger: true, action: () => {} },
          ].map(item => (
            <div
              key={item.label}
              onClick={item.action}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: item.danger ? '#ef4444' : 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f3f4f6'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </Tree>
  )
}
\`\`\`

### 五、搜索高亮功能

实现搜索过滤功能，匹配的节点高亮显示，并且自动展开父节点：

\`\`\`tsx
function TreeWithSearch() {
  const [searchText, setSearchText] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  
  // 搜索时自动展开包含匹配节点的所有父节点
  useEffect(() => {
    if (!searchText.trim()) {
      setMatchedIds(new Set())
      return
    }
    
    const matched = new Set<string>()
    const parentsToExpand = new Set<string>()
    
    const search = (nodes: TreeNode[], parentPath: string[] = []): boolean => {
      let hasMatchInSubtree = false
      
      for (const node of nodes) {
        const isMatch = node.label.toLowerCase().includes(searchText.toLowerCase())
        const childrenMatch = node.children ? search(node.children, [...parentPath, node.id]) : false
        
        if (isMatch) {
          matched.add(node.id)
        }
        
        if (isMatch || childrenMatch) {
          hasMatchInSubtree = true
          // 把所有祖先节点都加入展开集合
          parentPath.forEach(id => parentsToExpand.add(id))
        }
      }
      
      return hasMatchInSubtree
    }
    
    search(fileTreeData)
    setMatchedIds(matched)
    setExpandedIds(prev => new Set([...prev, ...parentsToExpand]))
  }, [searchText])
  
  return (
    <div>
      <input
        type="search"
        placeholder="搜索文件..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          marginBottom: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxSizing: 'border-box',
        }}
      />
      
      <Tree
        data={fileTreeData}
        expandedIds={expandedIds}
        // 传递 matchedIds，渲染时高亮匹配的文字
        renderNode={(node) => {
          const isMatched = matchedIds.has(node.id)
          if (!isMatched || !searchText) return node.label
          
          // 高亮匹配部分
          const regex = new RegExp(\`(\${searchText.replace(/[.*+?^${}()|[\]\\\\]/g, '\\\\$&')})\`, 'gi')
          const parts = node.label.split(regex)
          
          return (
            <span>
              {parts.map((part, i) =>
                part.toLowerCase() === searchText.toLowerCase() ? (
                  <mark key={i} style={{ background: '#fef08a', padding: '0 2px', borderRadius: '2px' }}>
                    {part}
                  </mark>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </span>
          )
        }}
      />
    </div>
  )
}
\`\`\`

### 六、带复选框和半选状态

支持复选框勾选、半选（indeterminate）状态：

\`\`\`tsx
function TreeNodeWithCheckbox({ node, checkedIds, onCheck }) {
  const hasChildren = node.children?.length > 0
  
  // 计算当前节点的状态：checked / unchecked / indeterminate
  const getCheckState = (): 'checked' | 'unchecked' | 'indeterminate' => {
    if (!hasChildren) {
      return checkedIds.has(node.id) ? 'checked' : 'unchecked'
    }
    
    const children = getAllChildIds(node)
    const checkedCount = children.filter(id => checkedIds.has(id)).length
    
    if (checkedCount === 0) return 'unchecked'
    if (checkedCount === children.length) return 'checked'
    return 'indeterminate'
  }
  
  const checkState = getCheckState()
  
  const handleCheck = () => {
    const allChildIds = getAllChildIds(node)
    
    if (checkState === 'checked') {
      // 取消：移除自己和所有子节点
      onCheck(new Set([...checkedIds].filter(id => id !== node.id && !allChildIds.includes(id))))
    } else {
      // 选中：添加自己和所有子节点
      onCheck(new Set([...checkedIds, node.id, ...allChildIds]))
    }
  }
  
  // 递归获取所有子节点 id
  const getAllChildIds = (n: TreeNode): string[] => {
    const ids: string[] = []
    n.children?.forEach(child => {
      ids.push(child.id)
      ids.push(...getAllChildIds(child))
    })
    return ids
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <input
        type="checkbox"
        checked={checkState === 'checked'}
        ref={el => {
          if (el) el.indeterminate = checkState === 'indeterminate'
        }}
        onChange={handleCheck}
        onClick={e => e.stopPropagation()}
      />
      {/* ... 节点其他内容 */}
    </div>
  )
}
\`\`\`

### 七、大数据 Tree 虚拟滚动（可选）

如果 Tree 有成千上万个节点，一次性渲染会卡顿，需要虚拟滚动。可以用 react-window：

\`\`\`tsx
// 思路：先把递归树打平成一个一维数组，包含每个节点的 level
// 然后用 FixedSizeList 虚拟滚动
type FlatNode = { node: TreeNode; level: number }

function flattenTree(nodes: TreeNode[], level = 0): FlatNode[] {
  const result: FlatNode[] = []
  for (const node of nodes) {
    result.push({ node, level })
    if (node.children && expandedIds.has(node.id)) {
      result.push(...flattenTree(node.children, level + 1))
    }
  }
  return result
}

function VirtualTree({ data }) {
  const flatList = flattenTree(data)
  
  return (
    <FixedSizeList
      height={500}
      width={400}
      itemCount={flatList.length}
      itemSize={32}
    >
      {({ index, style }) => {
        const { node, level } = flatList[index]
        return (
          <div style={style}>
            <TreeNodeRow node={node} level={level} />
          </div>
        )
      }}
    </FixedSizeList>
  )
}
\`\`\`

至此，你已经掌握了递归 Tree 组件的核心实现：递归渲染、展开折叠、选中、右键菜单、搜索高亮、复选框半选、虚拟滚动。递归组件的关键就是：组件里调用自己，处理好终止条件（没有 children 时停止递归）和状态传递。
`,
  },
  {
    id: "tsrx-drag-kanban",
    icon: "📋",
    group: "实战篇",
    title: "拖拽看板(Drag and Drop)",
    content: `## 拖拽看板(Drag and Drop)

拖拽功能是现代 Web 应用中常见的交互，看板（Kanban）、列表排序、文件上传、拖拽调整大小等都离不开它。React 生态中现在最推荐的拖拽库是 **@dnd-kit**，它轻量、现代、对 TypeScript 友好，完全支持 Hooks，比老的 react-dnd 简单很多。

### 一、@dnd-kit 简介和安装

@dnd-kit 是一组 React Hooks 组合，特点：
- 🚀 优秀的性能
- 🎣 完全基于 Hooks，没有类组件
- 📱 支持触摸屏、键盘操作（无障碍友好）
- 🎨 完全可控的 UI，没有预设样式
- 🦺 强类型支持 TypeScript
- 🔌 支持传感器（Pointer、Mouse、Touch、Keyboard）
- ✨ 内置动画

安装：
\`\`\`bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
\`\`\`

- **@dnd-kit/core**：核心功能
- **@dnd-kit/sortable**：排序预设（列表重排用）
- **@dnd-kit/utilities**：CSS 工具函数

### 二、基础概念：DndContext、Sensor、Draggable、Droppable

核心概念：
- **DndContext**：拖拽上下文，包裹整个可拖拽区域
- **Sensor**：传感器，决定如何触发拖拽（鼠标、触摸、键盘）
- **useDraggable**：让元素可拖拽
- **useDroppable**：让元素可放置
- **DragOverlay**：拖拽时显示在光标下的"幽灵"元素

### 三、简单的拖拽示例

先做一个简单的：把卡片拖到区域里：

\`\`\`tsx
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// 可拖拽卡片
function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    padding: '16px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'grab',
    marginBottom: '8px',
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
    transition: isDragging ? 'none' : 'box-shadow 0.2s',
  }
  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

// 可放置区域
function DroppableArea({ id, items }: { id: string; items: string[] }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: '200px',
        padding: '16px',
        background: isOver ? '#dbeafe' : '#f3f4f6',
        borderRadius: '8px',
        border: \`2px dashed \${isOver ? '#3b82f6' : '#d1d5db'}\`,
        transition: 'all 0.2s',
      }}
    >
      {items.length === 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af', margin: 0 }}>拖到这里</p>
      )}
      {items.map(item => (
        <DraggableCard key={item} id={item}>{item}</DraggableCard>
      ))}
    </div>
  )
}

function BasicDragDemo() {
  // 初始时卡片在 "pool" 区域
  const [containers, setContainers] = useState({
    pool: ['卡片1', '卡片2', '卡片3'],
    target: [] as string[],
  })
  
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // 配置传感器：支持鼠标/触摸 + 键盘
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 移动8px才触发拖拽，避免误触
    }),
    useSensor(KeyboardSensor)
  )
  
  // 拖拽开始
  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string)
  }
  
  // 拖拽结束：核心逻辑，处理卡片移动
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    
    if (!over) return // 没有放到可放置区域
    
    const activeId = active.id as string
    const overId = over.id as string
    
    // 找到 activeId 原来在哪个容器
    let sourceContainer: keyof typeof containers | null = null
    for (const [key, items] of Object.entries(containers)) {
      if (items.includes(activeId)) {
        sourceContainer = key as keyof typeof containers
        break
      }
    }
    
    if (!sourceContainer) return
    const targetContainer = overId as keyof typeof containers
    
    if (sourceContainer === targetContainer) return
    
    // 移动元素
    setContainers(prev => ({
      ...prev,
      [sourceContainer]: prev[sourceContainer].filter(id => id !== activeId),
      [targetContainer]: [...prev[targetContainer], activeId],
    }))
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // 碰撞检测算法
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }}>
        <div>
          <h3>待拖入</h3>
          <DroppableArea id="pool" items={containers.pool} />
        </div>
        <div>
          <h3>目标区域</h3>
          <DroppableArea id="target" items={containers.target} />
        </div>
      </div>
      
      {/* DragOverlay：拖拽时光标下显示的元素 */}
      <DragOverlay>
        {activeId ? (
          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
            cursor: 'grabbing',
          }}>
            {activeId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
\`\`\`

### 四、Kanban 看板（跨列拖拽排序）

@dnd-kit/sortable 提供了排序功能，我们来实现一个三列看板：待办、进行中、已完成，卡片可以跨列拖拽和排序。

\`\`\`tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 卡片类型
type Card = {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
}

type Column = {
  id: string
  title: string
  cardIds: string[]
}

// 初始数据
const initialCards: Record<string, Card> = {
  'card-1': { id: 'card-1', title: '设计新功能', priority: 'high' },
  'card-2': { id: 'card-2', title: '写文档', priority: 'medium' },
  'card-3': { id: 'card-3', title: '修复登录 bug', priority: 'high' },
  'card-4': { id: 'card-4', title: '代码审查', priority: 'medium' },
  'card-5': { id: 'card-5', title: '部署到生产', priority: 'low' },
}

const initialColumns: Column[] = [
  { id: 'todo', title: '📝 待办', cardIds: ['card-1', 'card-2'] },
  { id: 'doing', title: '🔄 进行中', cardIds: ['card-3'] },
  { id: 'done', title: '✅ 已完成', cardIds: ['card-4', 'card-5'] },
]

// 可排序卡片组件
function SortableCard({ card }: { card: Card }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })
  
  const priorityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  }
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // 拖拽时原位置透明，DragOverlay 显示副本
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    marginBottom: '8px',
    borderLeft: \`3px solid \${priorityColors[card.priority]}\`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'grab',
  }
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ fontSize: '14px', fontWeight: 500 }}>{card.title}</div>
      {card.description && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          {card.description}
        </div>
      )}
    </div>
  )
}

// 看板列组件
function KanbanColumn({ column, cards, children }: {
  column: Column
  cards: Card[]
  children: React.ReactNode
}) {
  // 列本身也是一个 droppable
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minWidth: '280px',
        background: isOver ? '#e0e7ff' : '#f3f4f6',
        borderRadius: '8px',
        padding: '12px',
        transition: 'background 0.2s',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        {column.title}
        <span style={{ marginLeft: '8px', color: '#9ca3af', fontWeight: 400 }}>
          ({cards.length})
        </span>
      </h3>
      <SortableContext
        items={column.cardIds}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </div>
  )
}

// 完整 Kanban 看板
function KanbanBoard() {
  const [cards, setCards] = useState(initialCards)
  const [columns, setColumns] = useState(initialColumns)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  
  // 找到卡片所在的列
  const findColumnForCard = (cardId: string) => {
    return columns.find(col => col.cardIds.includes(cardId))
  }
  
  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }
  
  // 拖拽过程中处理跨列
  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    const activeColumn = findColumnForCard(activeId)
    // over 可能是卡片 id，也可能是列 id（空列）
    let overColumn = findColumnForCard(overId)
    if (!overColumn) {
      overColumn = columns.find(c => c.id === overId)
    }
    
    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return
    
    // 跨列移动
    setColumns(cols => {
      const activeColIndex = cols.findIndex(c => c.id === activeColumn.id)
      const overColIndex = cols.findIndex(c => c.id === overColumn!.id)
      
      const activeCardIds = [...cols[activeColIndex].cardIds]
      const overCardIds = [...cols[overColIndex].cardIds]
      
      const activeIndex = activeCardIds.indexOf(activeId)
      activeCardIds.splice(activeIndex, 1)
      
      // 插入到 over 位置，或者末尾
      const overIndex = overCardIds.indexOf(overId)
      if (overIndex >= 0) {
        overCardIds.splice(overIndex, 0, activeId)
      } else {
        overCardIds.push(activeId)
      }
      
      const newCols = [...cols]
      newCols[activeColIndex] = { ...cols[activeColIndex], cardIds: activeCardIds }
      newCols[overColIndex] = { ...cols[overColIndex], cardIds: overCardIds }
      return newCols
    })
  }
  
  // 拖拽结束：处理同列排序
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    if (activeId === overId) return
    
    const column = findColumnForCard(activeId)
    if (!column) return
    
    // 同列内排序
    setColumns(cols => {
      const colIndex = cols.findIndex(c => c.id === column.id)
      const cardIds = [...cols[colIndex].cardIds]
      const oldIndex = cardIds.indexOf(activeId)
      const newIndex = cardIds.indexOf(overId)
      
      if (oldIndex === -1 || newIndex === -1) return cols
      
      cardIds.splice(oldIndex, 1)
      cardIds.splice(newIndex, 0, activeId)
      
      const newCols = [...cols]
      newCols[colIndex] = { ...cols[colIndex], cardIds }
      return newCols
    })
  }
  
  const activeCard = activeId ? cards[activeId] : null
  
  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f9fafb' }}>
      <h1 style={{ marginBottom: '24px' }}>📋 看板</h1>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          {columns.map(column => (
            <KanbanColumn key={column.id} column={column} cards={column.cardIds.map(id => cards[id])}>
              {column.cardIds.map(cardId => (
                <SortableCard key={cardId} card={cards[cardId]} />
              ))}
            </KanbanColumn>
          ))}
        </div>
        
        {/* 拖拽时的视觉反馈 */}
        <DragOverlay>
          {activeCard ? (
            <div style={{
              padding: '12px',
              background: 'white',
              borderRadius: '6px',
              boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              borderLeft: '3px solid #3b82f6',
              width: '280px',
              cursor: 'grabbing',
              transform: 'rotate(3deg)',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{activeCard.title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
\`\`\`

### 五、持久化到 localStorage

数据持久化很简单，加个自定义 Hook：

\`\`\`ts
import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore
