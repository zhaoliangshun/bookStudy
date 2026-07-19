export const chapters = [
  {
    id: "tsrx-vitest",
    group: "测试篇",
    icon: "🧪",
    title: "Vitest测试环境配置",
    content: `## Vitest测试环境配置

测试是现代前端开发不可或缺的一环。Vitest 是由 Vite 团队开发的新一代测试框架，专为 Vite 项目设计，原生支持 ESM、速度极快、兼容 Jest API、内置 watch 模式和覆盖率报告，是 TypeScript + React 项目的最佳测试搭档。

### Vitest vs Jest 对比

为什么选择 Vitest 而不是 Jest？

| 特性 | Vitest | Jest |
|------|--------|------|
| 架构 | 原生 ESM，基于 Vite/esbuild/Rollup | CommonJS，基于 Node.js VM |
| 启动速度 | 极快（毫秒级，复用 Vite 缓存） | 较慢（需要转换 ESM→CJS） |
| watch 模式 | 内置，热更新级别的响应速度 | 内置，但相对较慢 |
| TypeScript | 开箱即用，无需额外配置 | 需要 ts-jest/babel 转换 |
| 兼容性 | 兼容 Jest 大部分 API（describe/it/expect） | - |
| 覆盖率 | 内置 v8/istanbul provider | 需要 jest-c8 或 istanbul |
| UI 界面 | 内置 vitest --ui 美观界面 | 需要额外插件 |
| 配置 | 复用 vite.config.ts，无需重复配置 | 需要 jest.config.js 独立配置 |

对于使用 Vite + React + TypeScript 的项目，Vitest 是零成本接入的最佳选择。

### 第一步：安装依赖

在 Vite + React + TS 项目中安装完整的测试依赖：

\`\`\`bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
\`\`\`

各依赖包的作用：
- **vitest**：测试框架核心，提供 describe/it/expect/test 等 API 和运行器
- **@testing-library/react**：React 组件测试工具，提供 render/screen 等 API
- **@testing-library/jest-dom**：扩展 Jest/Vitest 断言，添加 toBeInTheDocument 等 DOM 相关 matcher
- **@testing-library/user-event**：模拟真实用户交互（点击、输入、键盘等），推荐代替 fireEvent
- **jsdom**：Node.js 环境下的 DOM 模拟实现，提供 window/document 等浏览器 API

### 第二步：配置 vite.config.ts

Vitest 最大的优势是可以直接在 \`vite.config.ts\` 中配置，复用 resolve.alias、plugins 等配置：

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
  },
  // Vitest 配置直接写在这里！
  test: {
    // 测试环境：jsdom 模拟浏览器 DOM
    environment: 'jsdom',
    // 全局 API：无需在每个文件 import describe/it/expect
    globals: true,
    //  setup 文件：测试启动前执行，用于配置 jest-dom 等扩展
    setupFiles: ['./src/test/setup.ts'],
    // 测试文件匹配模式
    include: ['**/*.test.tsx', '**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    // 排除 node_modules
    exclude: ['node_modules', 'dist'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 设定覆盖率阈值
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70
      }
    }
  }
})
\`\`\`

注意：需要在 \`tsconfig.json\` 中添加 \`"types": ["vitest/globals"]\` 才能让 TypeScript 识别全局的 describe/it/expect 等 API。

### 第三步：创建 setup 文件

创建测试环境启动文件，用于引入 jest-dom 的扩展断言：

\`\`\`typescript filename="src/test/setup.ts"
import '@testing-library/jest-dom'

// 可以在这里添加全局 mock，比如：
// - mock window.matchMedia (Ant Design/MUI 组件常用)
// - mock IntersectionObserver
// - mock resizeObserver

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver
\`\`\`

### 第四步：配置 package.json 脚本

\`\`\`json filename="package.json"
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
\`\`\`

脚本说明：
- **npm test**：启动 watch 模式，文件变化自动重跑相关测试，开发时最常用
- **npm run test:run**：单次运行所有测试（CI 环境使用）
- **npm run test:ui**：打开美观的 Web UI 界面查看测试结果
- **npm run coverage**：运行测试并生成覆盖率报告（html 报告在 coverage/ 目录）

### 第五步：编写第一个测试

测试文件命名规范：
- 与源文件同目录：\`Button.test.tsx\` 对应 \`Button.tsx\`
- 放在 \`__tests__\` 目录：\`__tests__/Button.test.tsx\`

\`\`\`tsx filename="src/components/Button.test.tsx"
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button 组件', () => {
  it('应该正确渲染按钮文字', () => {
    // 1. 渲染组件到 jsdom
    render(<Button>Click me</Button>)

    // 2. 通过 screen 查询元素并断言
    // getByRole 是最推荐的查询方式，模拟用户通过无障碍角色找元素
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('点击按钮应该触发 onClick 回调', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn() // vi.fn() 创建 mock 函数（等价 jest.fn()）

    render(<Button onClick={handleClick}>点击我</Button>)

    const button = screen.getByRole('button', { name: '点击我' })
    await user.click(button) // userEvent 是异步的，必须 await

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 状态下按钮不可点击', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick} disabled>不可点击</Button>)

    const button = screen.getByRole('button', { name: '不可点击' })
    expect(button).toBeDisabled() // 来自 @testing-library/jest-dom

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
\`\`\`

### 关键注意事项

1. **globals: true** 让你无需 import describe/it/expect/vi，但如果不开启则需要：\`import { describe, it, expect, vi } from 'vitest'\`
2. **userEvent** 必须 setup 并 await，fireEvent 是同步的但不推荐（不模拟真实用户行为）
3. **查询优先级**：getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId
4. **jsdom 不是完整浏览器**：canvas/webgl/导航/布局计算等 API 缺失，需要手动 mock

运行 \`npm test\`，你会看到 Vitest 极快的启动速度——这就是 Vite 生态的魅力！下一章我们将深入学习 React Testing Library 的核心查询和断言技巧。
`,
  },
  {
    id: "tsrx-rtl-basic",
    group: "测试篇",
    icon: "🔍",
    title: "React Testing Library(RTL)基础",
    content: `## React Testing Library(RTL)基础

React Testing Library（简称 RTL）是测试 React 组件的行业标准。它的核心理念是：**测试应用的方式应该和用户使用应用的方式一样**。也就是说，我们不应该测试组件的内部 state、props 传递、方法调用等实现细节，而应该测试用户能看到什么、能做什么——页面上有没有渲染出正确的文字、点击按钮后有没有发生对应的视觉变化。

### RTL 哲学：测试行为，不测试实现

\`\`\`tsx
// ❌ 反模式：测试实现细节（测试内部 state）
test('点击后 counter 变成 1', () => {
  const { result } = renderHook(() => useState(0))
  act(() => result.current[1](1))
  expect(result.current[0]).toBe(1)
  // 问题：如果重构把 useState 改成 useReducer，测试就挂了，但功能没变
})

// ✅ 正确模式：测试用户可见的行为
test('点击按钮后数字从0变成1', async () => {
  const user = userEvent.setup()
  render(<Counter />)

  // 用户看到屏幕上显示 0
  expect(screen.getByText('计数: 0')).toBeInTheDocument()

  // 用户点击按钮
  await user.click(screen.getByRole('button', { name: '加1' }))

  // 用户看到屏幕上变成 1
  expect(screen.getByText('计数: 1')).toBeInTheDocument()
  // 好处：不管内部用 useState/useReducer/Zustand/Redux，测试都能通过
})
\`\`\`

### render() 和 screen

\`render(<Component />)\` 把组件渲染到 jsdom 环境中，返回一组查询工具。但更推荐使用全局的 \`screen\` 对象来查询元素：

\`\`\`tsx
import { render, screen } from '@testing-library/react'

test('render 和 screen 基础用法', () => {
  // render 返回的 queries 绑定到渲染的容器
  const { container } = render(
    <div>
      <h1>标题</h1>
      <button type="submit">提交</button>
      <input aria-label="用户名" placeholder="请输入用户名" />
      <div data-testid="custom-element">自定义元素</div>
    </div>
  )

  // ✅ 推荐用 screen（自动绑定到最近一次 render）
  // 更简洁，不需要解构，代码更清爽
})
\`\`\`

### 查询优先级（从推荐到不推荐）

RTL 提供了多种查询方式，按照用户真实感知程度排序：

| 查询方法 | 适用场景 | 用户感知 |
|---------|---------|---------|
| **getByRole** | 按钮、链接、表单、heading、dialog 等可访问元素 | ⭐⭐⭐⭐⭐ 最强，模拟屏幕阅读器 |
| **getByLabelText** | 表单输入框（通过 label 关联） | ⭐⭐⭐⭐ 用户填写表单时看 label |
| **getByPlaceholderText** | 占位符提示的输入框 | ⭐⭐⭐ placeholder 不是好的替代 |
| **getByText** | 非交互元素（div/span/p）的文字内容 | ⭐⭐ 能看到但不是交互元素 |
| **getByDisplayValue** | 输入框当前值 | ⭐⭐ 用户看到填了什么 |
| **getByAltText** | img area input 的 alt 属性 | ⭐⭐ 图片的 alt 文本 |
| **getByTitle** | title 属性 | ⭐ 鼠标悬停才显示 |
| **getByTestId** | data-testid 属性 | ⚠️ 最后手段，用户看不到 |

\`\`\`tsx
test('各种查询方式示例', () => {
  render(
    <form>
      {/* getByRole：最推荐 */}
      <button>提交</button>
      <h2>表单标题</h2>
      <input type="checkbox" />

      {/* getByLabelText：表单标签 */}
      <label>用户名
        <input name="username" />
      </label>

      {/* getByPlaceholderText */}
      <input placeholder="搜索..." />

      {/* getByText */}
      <p>这是一段说明文字</p>

      {/* getByTestId：最后手段 */}
      <div data-testid="loading-spinner">加载中...</div>
    </form>
  )

  // getByRole - name 参数匹配可访问名称
  screen.getByRole('button', { name: '提交' })
  screen.getByRole('heading', { name: '表单标题', level: 2 })
  screen.getByRole('checkbox')

  // getByLabelText
  screen.getByLabelText('用户名')

  // getByPlaceholderText
  screen.getByPlaceholderText('搜索...')

  // getByText
  screen.getByText('这是一段说明文字')

  // getByTestId（实在找不到语义化查询时用）
  screen.getByTestId('loading-spinner')
})
\`\`\`

### 查询变体：getBy/queryBy/findBy

每种查询都有三种变体，决定了当元素找不到时的行为：

| 变体 | 找不到时 | 找到多个时 | 异步 |
|-----|---------|-----------|-----|
| **getBy** | 抛出错误（测试失败） | 抛出错误 | ❌ 同步 |
| **queryBy** | 返回 null | 抛出错误 | ❌ 同步 |
| **findBy** |  reject/promise reject | 抛出错误 | ✅ 异步（默认1000ms超时） |
| **getAllBy** | 抛出错误 | 返回数组 | ❌ |
| **queryAllBy** | 返回空数组 [] | 返回数组 | ❌ |
| **findAllBy** | reject | 返回数组 | ✅ |

\`\`\`tsx
test('getBy queryBy findBy 的区别', async () => {
  render(<Toast message="操作成功" />)

  // 1. getBy：元素必须存在，否则测试直接失败
  // 用于"元素应该存在"的断言
  expect(screen.getByText('操作成功')).toBeInTheDocument()

  // 2. queryBy：元素不存在时返回 null，不抛错
  // 专门用于"元素不应该存在"的断言
  expect(screen.queryByText('错误信息')).not.toBeInTheDocument()
  // ❌ 不要用 getBy 断言不存在，因为会抛错
  // expect(screen.getByText('错误信息')).not.toBeInTheDocument() // 错误！

  // 3. findBy：异步等待元素出现（等价 waitFor + getBy）
  // 用于等待异步操作后的 UI 更新（API 请求返回后显示内容）
  render(<AsyncComponent />)
  // 初始状态加载中
  expect(screen.getByText('加载中...')).toBeInTheDocument()
  // 等待数据加载完成
  const dataElement = await screen.findByText('数据加载完成')
  expect(dataElement).toBeInTheDocument()
})
\`\`\`

### userEvent：模拟真实用户交互

@testing-library/user-event 比 fireEvent 更贴近真实用户行为——它会模拟焦点移动、键盘事件、输入延迟等真实细节：

\`\`\`tsx
import userEvent from '@testing-library/user-event'

test('userEvent 模拟各种用户交互', async () => {
  const user = userEvent.setup() // 必须先 setup
  render(<LoginForm />)

  // 1. click：点击元素（自动触发焦点、mouse 相关事件序列）
  const submitBtn = screen.getByRole('button', { name: '登录' })
  await user.click(submitBtn)

  // 2. dblClick：双击
  await user.dblClick(screen.getByText('双击编辑'))

  // 3. type：输入文字（模拟逐字符输入，会触发 input/change/key 事件）
  const usernameInput = screen.getByLabelText('用户名')
  await user.type(usernameInput, 'zhangsan')
  expect(usernameInput).toHaveValue('zhangsan')

  // 4. keyboard：底层键盘事件模拟
  await user.keyboard('{Enter}') // 按回车
  await user.keyboard('{Control>}a{/Control}') // Ctrl+A 全选
  await user.keyboard('{Tab}') // Tab 切换焦点

  // 5. clear：清空输入框
  await user.clear(usernameInput)
  expect(usernameInput).toHaveValue('')

  // 6. tab：模拟 Tab 键切换焦点
  await user.tab()
  await user.tab({ shift: true }) // Shift+Tab 反向

  // 7. hover/unhover：鼠标悬停
  await user.hover(screen.getByText('悬停显示提示'))
  expect(screen.getByRole('tooltip')).toBeVisible()
  await user.unhover(screen.getByText('悬停显示提示'))

  // 8. selectOptions：选择下拉框
  await user.selectOptions(
    screen.getByRole('combobox'),
    ['option1', 'option2']
  )
})
\`\`\`

### jest-dom 常用断言

@testing-library/jest-dom 提供了语义化的 DOM 断言：

\`\`\`tsx
// 存在性
expect(element).toBeInTheDocument() // 存在于 DOM
expect(element).not.toBeInTheDocument()

// 可见性
expect(element).toBeVisible() // display/visibility/opacity 不是隐藏
expect(element).toBeEmptyDOMElement() // 没有子内容

// 表单状态
expect(button).toBeDisabled()
expect(button).toBeEnabled()
expect(checkbox).toBeChecked()
expect(checkbox).not.toBeChecked()
expect(input).toBeRequired()
expect(input).toBeInvalid()
expect(input).toBeValid()

// 内容
expect(element).toHaveTextContent('hello')
expect(element).toHaveTextContent(/hello/i) // 正则
expect(input).toHaveValue('input value')
expect(select).toHaveDisplayValue('显示文本')

// 样式/属性
expect(element).toHaveClass('active')
expect(element).toHaveAttribute('href', '/home')
expect(element).toHaveStyle({ color: 'red' })
expect(element).toBeVisible()
\`\`\`

### waitFor 和 waitForElementToBeRemoved

对于复杂的异步场景，findBy 不够用时可以用 waitFor：

\`\`\`tsx
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react'

test('waitFor 等待异步更新', async () => {
  render(<AsyncData />)

  // waitFor：等待回调不抛错
  await waitFor(() => {
    // 会重复执行直到不抛错或超时
    expect(screen.getByTestId('result')).toHaveTextContent('成功')
  }, {
    timeout: 2000, // 超时时间，默认 1000ms
    interval: 50   // 重试间隔
  })

  // waitForElementToBeRemoved：等待元素从 DOM 消失
  // 常用于加载状态消失的场景
  const loading = screen.getByText('加载中...')
  await waitForElementToBeRemoved(loading)
  expect(screen.getByText('数据已加载')).toBeInTheDocument()
})
\`\`\`

### RTL 使用黄金法则

1. **优先用 getByRole**——如果你用的 query 不是 role，先想想能不能加 role 或者是否有更语义化的方式
2. **用 userEvent 不用 fireEvent**——userEvent 更贴近真实用户行为
3. **queryBy 只用于断言不存在**——其他场景用 getBy/findBy
4. **不要用 container.querySelector**——这是实现细节的直接访问，违反 RTL 哲学
5. **每个 test 独立**——RTL 会自动清理 DOM，不要在 test 之间共享状态

掌握了 RTL 的基础查询和交互，下一章我们将学习各种常见组件的测试模式，包括表单、API Mock、Context、路由等场景。
`,
  },
  {
    id: "tsrx-test-patterns",
    group: "测试篇",
    icon: "🎯",
    title: "常见组件测试模式",
    content: `## 常见组件测试模式

掌握了 Vitest 和 RTL 的基础 API 之后，本章我们来学习真实项目中各种组件场景的测试模式，包括表单测试、API Mock、Context、路由、自定义 Hook、异步组件、模块 Mock 等，形成一套完整的 React 组件测试方法论。

### 模式一：表单测试

表单是最常见的交互场景，需要测试用户填写、提交、错误提示等完整流程：

\`\`\`tsx filename="src/components/LoginForm.test.tsx"
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm 登录表单', () => {
  const user = userEvent.setup()

  it('填写正确信息后提交成功', async () => {
    const mockOnSuccess = vi.fn()
    render(<LoginForm onSuccess={mockOnSuccess} />)

    // 1. 填写用户名（通过 label 找到输入框）
    const usernameInput = screen.getByLabelText('用户名')
    await user.type(usernameInput, 'admin')

    // 2. 填写密码
    const passwordInput = screen.getByLabelText('密码')
    await user.type(passwordInput, '123456')

    // 3. 点击登录按钮
    const submitBtn = screen.getByRole('button', { name: '登录' })
    await user.click(submitBtn)

    // 4. 等待成功提示或回调被调用
    // 方式A：等待回调被调用
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        username: 'admin',
        password: '123456'
      })
    })

    // 方式B：等待成功消息出现
    expect(await screen.findByText('登录成功！')).toBeInTheDocument()
  })

  it('空表单提交应该显示验证错误', async () => {
    render(<LoginForm onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '登录' }))

    // 断言错误提示出现
    expect(await screen.findByText('请输入用户名')).toBeInTheDocument()
    expect(screen.getByText('请输入密码')).toBeInTheDocument()
  })

  it('密码少于6位应该显示错误', async () => {
    render(<LoginForm onSuccess={vi.fn()} />)

    await user.type(screen.getByLabelText('密码'), '123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByText('密码至少6位')).toBeInTheDocument()
  })
})
\`\`\`

### 模式二：用 MSW Mock API 请求

**MSW（Mock Service Worker）** 是目前最推荐的 API Mock 方案。它通过 Service Worker 拦截真实的网络请求，无需 mock fetch/axios 全局函数，测试代码更接近真实生产行为。

\`\`\`bash
npm install -D msw
\`\`\`

\`\`\`typescript filename="src/test/server.ts"
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// 定义 mock handlers
const handlers = [
  // Mock GET 请求
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ])
  }),

  // Mock POST 请求
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { username: string }
    if (body.username === 'admin') {
      return HttpResponse.json({ token: 'fake-token' })
    }
    return new HttpResponse(null, { status: 401 })
  }),
]

// 创建 server（Node.js 环境用 setupServer，浏览器用 setupWorker）
export const server = setupServer(...handlers)

// 全局 setup/teardown
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// 导出用于测试时覆盖 handler
export { http, HttpResponse }
\`\`\`

在 setup.ts 中引入 server：
\`\`\`typescript filename="src/test/setup.ts"
import '@testing-library/jest-dom'
import { server } from './server'

// MSW 已在上面的文件中配置了 beforeAll/afterEach/afterAll
\`\`\`

测试组件时，API 请求会被 MSW 自动拦截：
\`\`\`tsx
import { http, HttpResponse, server } from '@/test/server'

test('UserList 加载用户列表', async () => {
  render(<UserList />)

  // 初始显示加载中
  expect(screen.getByText('加载中...')).toBeInTheDocument()

  // 等待 API 返回后显示用户
  expect(await screen.findByText('张三')).toBeInTheDocument()
  expect(screen.getByText('李四')).toBeInTheDocument()
})

test('API 返回错误时显示错误信息', async () => {
  // 单个测试中覆盖 handler，返回错误
  server.use(
    http.get('/api/users', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(<UserList />)

  expect(await screen.findByText('加载失败，请重试')).toBeInTheDocument()
})
\`\`\`

### 模式三：Context 组件测试

依赖 Context 的组件，测试时需要用对应 Provider 包裹：

\`\`\`tsx
import { createContext, useContext, useState, ReactNode } from 'react'

// 主题 Context
type ThemeContextType = { theme: 'light' | 'dark'; toggleTheme: () => void }
const ThemeContext = createContext<ThemeContextType>(null!)

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 测试时自定义 wrapper 包裹
test('ThemeToggle 切换主题', async () => {
  const user = userEvent.setup()

  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )

  // 初始亮色主题
  expect(screen.getByText('当前: light')).toBeInTheDocument()

  // 点击切换
  await user.click(screen.getByRole('button', { name: '切换主题' }))
  expect(screen.getByText('当前: dark')).toBeInTheDocument()
})

// 也可以测试 Provider 传递自定义 value
test('ThemeToggle 在 dark 模式下正确显示', () => {
  render(
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: vi.fn() }}>
      <ThemeToggle />
    </ThemeContext.Provider>
  )
  expect(screen.getByText('当前: dark')).toBeInTheDocument()
})

// 通用 wrapper 辅助函数
const renderWithTheme = (ui: ReactNode, theme: 'light' | 'dark' = 'light') => {
  return render(
    <ThemeContext.Provider value={{ theme, toggleTheme: vi.fn() }}>
      {ui}
    </ThemeContext.Provider>
  )
}
\`\`\`

### 模式四：路由组件测试

使用 React Router 的组件需要在 Router 上下文中渲染，测试时用 MemoryRouter：

\`\`\`tsx
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('导航到关于页面', async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  )

  // 首页
  expect(screen.getByText('首页')).toBeInTheDocument()

  // 点击导航链接
  await user.click(screen.getByRole('link', { name: '关于' }))

  // 跳转到关于页
  expect(screen.getByText('关于我们')).toBeInTheDocument()
})

// 测试带参数的路由
test('用户详情页', async () => {
  render(
    <MemoryRouter initialEntries={['/users/123']}>
      <Routes>
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText('用户ID: 123')).toBeInTheDocument()
})
\`\`\`

### 模式五：自定义 Hook 测试

测试自定义 Hook 使用 \`renderHook\`，注意 Hook 必须在组件上下文中运行：

\`\`\`tsx
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('应该正确初始化计数', () => {
    // renderHook 渲染一个测试组件并调用 Hook
    const { result } = renderHook(() => useCounter(0))

    // result.current 访问 Hook 返回值
    expect(result.current.count).toBe(0)
  })

  it('increment/decrement 应该正确更新计数', () => {
    const { result } = renderHook(() => useCounter(10))

    // 🔴 状态更新必须包裹在 act 中（RTL 的 async utils 自动处理，但同步更新需要手动 act）
    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(11)

    act(() => {
      result.current.decrement()
      result.current.decrement()
    })
    expect(result.current.count).toBe(9)
  })

  // 带 wrapper 的 Hook（依赖 Context）
  it('useAuth 应该返回登录状态', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider initialUser={{ name: 'test' }}>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual({ name: 'test' })
  })
})
\`\`\`

### 模式六：模块 Mock

使用 \`vi.mock\` mock 整个模块（替代直接 import 的实现）：

\`\`\`tsx
// mock 整个 api 模块
vi.mock('@/api/user', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Mock用户' }),
  createUser: vi.fn()
}))

// mock 一个默认导出的模块
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => ['mockValue', vi.fn()]
}))

// mock 部分实现（保持其他真实）
vi.mock('@/utils/format', async () => {
  const actual = await vi.importActual('@/utils/format')
  return {
    ...actual,
    formatDate: vi.fn().mockReturnValue('2024-01-01') // 只 mock formatDate
  }
})

test('组件使用 mock 的 API', async () => {
  const { fetchUser } = await import('@/api/user')
  render(<UserProfile userId={1} />)

  expect(await screen.findByText('Mock用户')).toBeInTheDocument()
  expect(fetchUser).toHaveBeenCalledWith(1)
})
\`\`\`

### 模式七：快照测试

快照测试捕获组件渲染输出，用于意外变更检测：

\`\`\`tsx
// toMatchSnapshot：将快照写入 __snapshots__ 文件
test('Button 匹配快照', () => {
  const { asFragment } = render(<Button variant="primary">确定</Button>)
  expect(asFragment()).toMatchSnapshot()
})

// toMatchInlineSnapshot：快照直接写入测试文件中（更直观）
test('Alert 内联快照', () => {
  const { asFragment } = render(<Alert type="error" message="出错了" />)
  expect(asFragment()).toMatchInlineSnapshot(\`
    <DocumentFragment>
      <div
        class="alert alert-error"
        role="alert"
      >
        出错了
      </div>
    </DocumentFragment>
  \`)
})
\`\`\`

⚠️ 快照测试注意事项：
- 快照不是替代断言，它只在意外变更时报错
- 容易过时——组件微调时大家直接 \`-u\` 更新快照，导致快照失效
- 优先用具体断言，快照只用于稳定的展示型组件
- 不要给大组件或频繁变动的组件写快照

掌握了这七种测试模式，你就能应对 95% 的 React 组件测试场景。下一章我们将用 TDD 的方式从头开发一个 Todo 组件，体验测试驱动开发的完整流程。
`,
  },
  {
    id: "tsrx-tdd",
    group: "测试篇",
    icon: "🔴",
    title: "TDD测试驱动开发实战",
    content: `## TDD测试驱动开发实战

TDD（Test-Driven Development，测试驱动开发）是一种先写测试、再写实现代码的开发方法论。它不是一种测试策略，而是一种**设计方法论**——通过测试来引导你写出更清晰、更解耦、更可维护的代码。

### TDD 三循环：Red → Green → Refactor

TDD 的核心是一个不断重复的循环：

1. **🔴 Red（红）**：写一个失败的测试。先写测试用例描述你想要的行为，此时因为功能还没实现，测试运行必然失败。
2. **🟢 Green（绿）**：写最少的代码让测试通过。不要追求完美、不要提前设计，用最快最直接的方式让测试变绿。
3. **🔵 Refactor（重构）**：在测试保护下重构代码。消除重复、优化命名、拆分职责，此时测试保持绿色是安全网。

\`\`\`
    ┌─────────────┐
    │  写失败测试  │ ← Red
    └──────┬──────┘
           ↓
    ┌─────────────┐
    │ 写代码通过  │ ← Green（最少代码）
    └──────┬──────┘
           ↓
    ┌─────────────┐
    │   重构代码   │ ← Refactor（测试保持绿色）
    └──────┬──────┘
           │
           └────────→ 回到第一步写下一个测试
\`\`\`

TDD 的节奏非常重要：**一次只写一个测试**，让它失败，写最少代码让它通过，再重构。不要一次性写多个测试，也不要在写实现的时候提前写未来才需要的代码（YAGNI原则：You Ain't Gonna Need It）。

### 实战：Todo 组件 TDD 全程

我们来用 TDD 从零开发一个 TodoList 组件，完整走一遍 Red-Green-Refactor 流程。

#### Step 1：写测试（Red）

先写第一个测试：**应该渲染输入框和添加按钮**

\`\`\`tsx filename="src/components/Todo.test.tsx"
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Todo } from './Todo'

const user = userEvent.setup()

describe('Todo 组件', () => {
  // 测试1：初始渲染
  it('应该渲染输入框和添加按钮', () => {
    render(<Todo />)
    expect(screen.getByPlaceholderText('添加新任务...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument()
  })

  // 测试2：输入文字点添加，应该显示 todo
  it('输入文字点击添加按钮，应该显示新 todo', async () => {
    render(<Todo />)

    await user.type(screen.getByPlaceholderText('添加新任务...'), '学习 TDD')
    await user.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getByText('学习 TDD')).toBeInTheDocument()
    // 添加后输入框应该清空
    expect(screen.getByPlaceholderText('添加新任务...')).toHaveValue('')
  })

  // 测试3：点击 todo 项应该切换完成状态（划线）
  it('点击 todo 项应该切换完成状态', async () => {
    render(<Todo />)

    // 添加一个 todo
    await user.type(screen.getByPlaceholderText('添加新任务...'), '买牛奶')
    await user.click(screen.getByRole('button', { name: '添加' }))

    // 点击 todo 项
    const todoItem = screen.getByText('买牛奶')
    await user.click(todoItem)

    // 应该有划线样式（通过 class 或 style 判断）
    expect(todoItem).toHaveClass('line-through')
    // 再点击一次取消完成
    await user.click(todoItem)
    expect(todoItem).not.toHaveClass('line-through')
  })

  // 测试4：点击删除按钮应该移除 todo
  it('点击删除按钮应该移除 todo', async () => {
    render(<Todo />)

    await user.type(screen.getByPlaceholderText('添加新任务...'), '删除我')
    await user.click(screen.getByRole('button', { name: '添加' }))

    const deleteBtn = screen.getByRole('button', { name: '删除' })
    await user.click(deleteBtn)

    expect(screen.queryByText('删除我')).not.toBeInTheDocument()
  })

  // 测试5：空输入不能添加
  it('输入为空时点击添加不应该添加空 todo', async () => {
    render(<Todo />)

    const addBtn = screen.getByRole('button', { name: '添加' })
    await user.click(addBtn)

    // todo 列表不应该有任何项（除了空状态提示）
    const todoItems = screen.queryAllByRole('listitem')
    expect(todoItems).toHaveLength(0)
  })
})
\`\`\`

运行测试，全部失败——这是 Red 阶段，完美！

\`\`\`bash
npm test
# 所有测试 FAIL，因为 Todo 组件还不存在
\`\`\`

#### Step 2：写最少代码通过测试（Green）

现在写最简单的代码让所有测试通过，不要过度设计：

\`\`\`tsx filename="src/components/Todo.tsx"
import { useState } from 'react'

type TodoItem = {
  id: number
  text: string
  completed: boolean
}

export function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')

  const handleAdd = () => {
    if (!input.trim()) return // 空输入不添加
    setTodos([...todos, { id: Date.now(), text: input, completed: false }])
    setInput('')
  }

  const handleToggle = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const handleDelete = (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1>Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="添加新任务..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 text-white rounded">
          添加
        </button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2 py-2">
            <span
              onClick={() => handleToggle(todo.id)}
              className={todo.completed ? 'line-through cursor-pointer flex-1' : 'cursor-pointer flex-1'}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
              aria-label="删除"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

运行测试——全部变绿！🟢 这就是 Green 阶段，我们用最直接的方式让测试通过。此时所有功能都工作了，但代码可能不够优雅。

#### Step 3：重构（Refactor）

现在测试是绿色的，我们有安全网来重构。让我们把 Todo 拆分成更清晰的结构：

\`\`\`tsx filename="src/hooks/useTodo.ts"
import { useState } from 'react'

export type TodoItem = {
  id: number
  text: string
  completed: boolean
}

export function useTodo() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }])
    setInput('')
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return { todos, input, setInput, addTodo, toggleTodo, deleteTodo }
}
\`\`\`

\`\`\`tsx filename="src/components/TodoItem.tsx"
import type { TodoItem as TodoItemType } from '@/hooks/useTodo'

type Props = {
  todo: TodoItemType
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className="flex items-center gap-2 py-2 group">
      <span
        onClick={() => onToggle(todo.id)}
        className={\`cursor-pointer flex-1 \${todo.completed ? 'line-through text-gray-400' : ''}\`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="px-2 py-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
        aria-label="删除"
      >
        ✕
      </button>
    </li>
  )
}
\`\`\`

重构后的 Todo.tsx 更简洁：
\`\`\`tsx filename="src/components/Todo.tsx"
import { useTodo } from '@/hooks/useTodo'
import { TodoItem } from './TodoItem'

export function Todo() {
  const { todos, input, setInput, addTodo, toggleTodo, deleteTodo } = useTodo()

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="添加新任务..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          添加
        </button>
      </div>
      <ul className="divide-y">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  )
}
\`\`\`

重构后再次运行测试——仍然是绿色的！✅ 这就是测试作为安全网的价值：你可以大胆重构，不用担心改坏功能。

### TDD 的价值与争议

TDD 的支持者认为它带来以下好处：

1. **活文档**：测试是代码最好的文档，阅读测试就能知道组件应该做什么
2. **安全重构网**：有测试保护，可以放心重构而不担心回归
3. **更好的设计**：先写测试强迫你思考组件的 API 和边界，自然产生更解耦的设计
4. **调试时间减少**：bug 在写代码时就被发现，而不是 QA 阶段
5. **减少过度设计**：只为通过测试写代码，不会写没用的"未来功能"

TDD 不适用的场景：

- **UI 探索阶段**：当你还不确定 UI 长什么样时，写测试会拖慢节奏
- **一次性原型/Spike**：快速验证技术方案的 demo，不需要测试
- **简单展示组件**：纯静态展示组件，逻辑简单到肉眼可见
- **团队不熟悉**：TDD 需要练习，初期会明显拖慢速度

### 测试覆盖率

Vitest 内置覆盖率报告：

\`\`\`bash
npm run coverage
\`\`\`

覆盖率报告告诉你哪些代码行/函数/分支被测试覆盖了。但要记住：

- **80% 覆盖率 ≠ 没有 bug**——覆盖只说明代码被执行过，不说明被正确断言了
- **追求 100% 覆盖率通常是浪费**——配置代码、类型定义、简单的胶水代码不需要测试
- **关注关键路径覆盖率**——核心业务逻辑、复杂状态转换、边界条件要覆盖
- **不要为了覆盖率写无意义的测试**——只是执行代码不做断言的测试没有价值

一个健康的项目覆盖率通常在 70-90% 之间，核心逻辑达到 90%+，配置和简单页面低一些没关系。

### TDD 练习建议

如果你刚接触 TDD，建议从简单的功能开始练习：
1. FizzBuzz（输入输出，纯函数，最适合入门）
2. 计数器（简单 state）
3. TodoList（列表 CRUD）
4. 表单验证（多条件分支）
5. 购物车（复杂状态交互）

TDD 是一种需要练习的技能，初期你可能会觉得别扭、变慢，但坚持 2-3 个项目后，你会发现它改变了你写代码的思考方式——先想清楚"要什么"，再想"怎么实现"。
`,
  },
  {
    id: "tsrx-error-boundary",
    group: "实战篇",
    icon: "💥",
    title: "Error Boundary错误边界",
    content: `## Error Boundary错误边界

即使我们写了最严谨的 TypeScript 类型、做了最充分的测试，线上应用还是会出错。网络异常、数据格式异常、第三方库 bug、空指针引用……总有各种意料之外的错误会发生。Error Boundary（错误边界）是 React 提供的一种错误处理机制，让组件在子树抛出 JS 错误时能够优雅降级，而不是整个应用白屏崩溃。

### 为什么需要 Error Boundary

在 React 16 之前，组件内部的 JS 错误会导致整个 React 应用崩溃卸载，用户看到的是一片白屏。这是非常糟糕的用户体验——一个小组件的错误不应该让整个页面挂掉，就像 JavaScript 的 try/catch 可以局部捕获错误一样，Error Boundary 就是 React 组件树的 try/catch。

### Error Boundary 的限制

⚠️ **Error Boundary 只能捕获以下错误**：
- 渲染阶段（render 函数中）的错误
- 生命周期方法中的错误
- 子组件构造函数中的错误

❌ **Error Boundary 无法捕获**：
- 事件处理函数中的错误（用 try/catch）
- 异步代码中的错误（setTimeout/Promise/async-await，用 try/catch + state）
- 服务端渲染（SSR）错误
- 错误边界自身抛出的错误（错误边界不能 catch 自己的错）
- React 自身的错误（不是组件代码的问题）

### 只能用 Class 组件实现

截至 React 18，函数组件无法直接实现 Error Boundary，必须使用 Class 组件：

\`\`\`tsx filename="src/components/ErrorBoundary.tsx"
import { Component, ReactNode, ErrorInfo } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode // 自定义降级 UI
  onError?: (error: Error, errorInfo: ErrorInfo) => void // 错误上报回调
}

type State = {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  // 🔑 静态方法：捕获错误后更新 state，触发降级 UI 渲染
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  // 🔑 生命周期方法：捕获错误后执行副作用（日志上报）
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 上报错误到监控系统
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)

    // 实际项目中这里应该上报到 Sentry/自研监控
    // reportError(error, {
    //   componentStack: errorInfo.componentStack,
    //   url: window.location.href
    // })
  }

  // 提供重置方法，让用户可以重试
  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义 fallback，渲染自定义 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认降级 UI
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
          <div className="text-red-500 text-6xl mb-4">💥</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            哎呀，出了点问题
          </h2>
          <p className="text-gray-500 mb-4 text-center max-w-md">
            这个部分遇到了错误，但其他内容仍然可以正常使用。
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-4 bg-gray-100 rounded max-w-lg w-full overflow-auto">
              <summary className="cursor-pointer font-medium text-red-600">
                错误详情（开发环境）
              </summary>
              <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                {this.state.error.message}
                {'\\n\\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              重试
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              返回首页
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
\`\`\`

两个关键方法：
- **static getDerivedStateFromError(error)**：渲染阶段捕获错误，返回新的 state，必须是纯函数
- **componentDidCatch(error, errorInfo)**：提交阶段捕获，可以执行副作用（日志上报），errorInfo.componentStack 包含组件栈信息

### withErrorBoundary HOC

用高阶组件包裹任意组件，给它加上错误边界保护：

\`\`\`tsx filename="src/components/withErrorBoundary.tsx"
import { ComponentType, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorBoundary.displayName = \`withErrorBoundary(\${displayName})\`
  return WithErrorBoundary
}

// 使用方式
const SafeUserProfile = withErrorBoundary(
  UserProfile,
  <div>用户信息加载失败，请刷新重试</div>
)

// 或者直接在 JSX 中使用
function App() {
  return (
    <div>
      <Header />
      <ErrorBoundary fallback={<div>首页内容加载出错</div>}>
        <HomePage />
      </ErrorBoundary>
      <ErrorBoundary fallback={<div>侧边栏出错</div>}>
        <Sidebar />
      </ErrorBoundary>
      <Footer />
    </div>
  )
}
\`\`\`

### 错误边界的粒度

错误边界不应该只放一个在应用根部，应该分层级设置：

| 层级 | 位置 | 降级策略 |
|-----|------|---------|
| 应用级 | App.tsx 最外层 | 整页错误，显示"应用出错了"+刷新按钮 |
| 页面级 | 路由页面 | 当前页面错误，不影响导航和其他页 |
| 组件级 | 复杂组件（图表、富文本、第三方组件） | 单个组件替换为错误占位符，不影响页面其他内容 |

\`\`\`tsx
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// React Router v6+ 支持 errorElement
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<RootErrorPage />}>
      <Route index element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} errorElement={<DashboardError />} />
      <Route path="/users/:id" element={<UserProfile />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
)

// 页面级错误组件
function DashboardError() {
  const error = useRouteError()
  return (
    <div className="p-8">
      <h2>Dashboard 加载失败</h2>
      <p>{error instanceof Error ? error.message : '未知错误'}</p>
    </div>
  )
}
\`\`\`

### 处理异步错误和事件处理错误

Error Boundary 不捕获异步错误和事件处理函数错误，需要自己处理：

\`\`\`tsx
import { useState, useEffect } from 'react'

// 方式1：async/await + try/catch + state
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchUser(userId)
        setUser(data)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('加载失败'))
      }
    }
    loadUser()
  }, [userId])

  if (error) {
    return <div className="text-red-500">加载失败: {error.message}</div>
  }

  return <div>{/* 渲染 user */}</div>
}

// 方式2：使用 react-error-boundary 库的 useErrorHandler Hook
// npm install react-error-boundary
import { useErrorHandler, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

function AsyncData() {
  const handleError = useErrorHandler() // 获取 throwError 函数

  useEffect(() => {
    fetchData().catch(handleError) // 捕获异步错误并抛给最近的 ErrorBoundary
  }, [])

  return <div>异步数据</div>
}

// 事件处理中也可以使用
function ButtonThatMightError() {
  const handleError = useErrorHandler()

  const handleClick = () => {
    try {
      riskyOperation()
    } catch (e) {
      handleError(e) // 抛给 ErrorBoundary
    }
  }

  return <button onClick={handleClick}>点击</button>
}

// 使用 react-error-boundary 的 ErrorBoundary（功能更强大）
function App() {
  return (
    <ReactErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div>
          <p>出错了: {error.message}</p>
          <button onClick={resetErrorBoundary}>重试</button>
        </div>
      )}
      onReset={() => {
        // 重置时重新加载数据
      }}
      resetKeys={[userId]} // 这些 props 变化时自动重置
    >
      <AsyncData />
    </ReactErrorBoundary>
  )
}
\`\`\`

### 错误上报

生产环境必须把错误上报到监控系统，不能只是 console.error：

\`\`\`typescript
// src/utils/reportError.ts
type ErrorContext = {
  userId?: string
  url?: string
  userAgent?: string
  componentStack?: string
  extra?: Record<string, unknown>
}

export function reportError(error: Error, context: ErrorContext = {}) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context
  }

  // 开发环境只打日志
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported:', errorData)
    return
  }

  // 生产环境上报
  // 方式1：使用 sendBeacon（不阻塞页面卸载）
  const blob = new Blob([JSON.stringify(errorData)], { type: 'application/json' })
  navigator.sendBeacon('/api/errors', blob)

  // 方式2：Sentry
  // Sentry.captureException(error, { extra: context })

  // 方式3：自研/其他 APM 工具
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorData),
  //   keepalive: true
  // })
}
\`\`\`

在 ErrorBoundary 的 componentDidCatch 中调用 reportError：
\`\`\`tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  reportError(error, {
    componentStack: errorInfo.componentStack,
    // 可以从 Context 获取 userId 等信息
  })
}
\`\`\`

### 生产环境降级 UI 最佳实践

好的降级 UI 应该给用户明确的反馈和恢复路径：

1. **清晰的错误信息**：告诉用户"什么出错了"，不要只显示"Error"
2. **不要显示技术细节给用户**：stack trace 只在开发环境显示
3. **提供恢复路径**：重试按钮、返回首页、联系客服
4. **不要惊吓用户**：用友好的语气和图标，避免"致命错误"之类的措辞
5. **错误要被记录**：但不要反复弹窗打扰用户
6. **局部降级，不整页白屏**：一个组件挂了不应该影响整个应用

错误处理是成熟应用的标志。加入 ErrorBoundary 之后，你的 React 应用会从"一出 bug 就全白屏"变成"局部出错优雅降级"，用户体验和稳定性会上一个大台阶。下一章我们来学习无障碍访问（a11y），让你的应用能被所有人使用。
`,
  },
  {
    id: "tsrx-accessibility",
    group: "实战篇",
    icon: "♿",
    title: "无障碍访问(a11y)",
    content: `## 无障碍访问(a11y)

无障碍访问（Accessibility，简称 a11y，因为 a 和 y 之间有 11 个字母）是指让尽可能多的人能够使用你的网站，包括视力障碍、听力障碍、运动障碍、认知障碍的残障用户。全球超过 10 亿人有某种形式的残障，a11y 不是"锦上添花"，是 web 开发的基本要求，也是很多国家的法律要求（如美国 ADA、欧盟 EN 301 549）。

更重要的是：**做好 a11y 会让所有人的体验都更好**。语义化 HTML 让 SEO 更好，键盘支持让高级用户更高效，焦点管理对移动端体验也有帮助。

### 语义化 HTML 是 a11y 的基础

浏览器内置的语义化元素自带无障碍特性，不需要额外 ARIA 就能工作：

\`\`\`tsx
// ❌ 反模式：用 div 做一切
<div onClick={handleSubmit} className="btn">提交</div>
{/* 问题：无法用 Tab 聚焦、没有按钮 role、屏幕阅读器不认、Enter/Space 不触发 */}

// ✅ 正确：用语义化元素
<button onClick={handleSubmit} className="btn">提交</button>
{/* 自带：可聚焦、role="button"、Enter/Space 触发、屏幕阅读器读"按钮 提交" */}

// 常见语义化元素
<nav>导航栏</nav>           {/* role="navigation" */}
<main>主要内容</main>       {/* role="main"，页面唯一 */}
<header>页头</header>       {/* role="banner" */}
<footer>页脚</footer>       {/* role="contentinfo" */}
<aside>侧边栏</aside>       {/* role="complementary" */}
<h1>-<h6>标题</h1>          {/* 标题层级，屏幕阅读器可以跳标题 */}
<section>区块<section>      {/* 需要有 aria-labelledby 关联标题 */}
<article>独立文章</article> {/* role="article" */}
<label htmlFor="name">姓名</label>  {/* 点击 label 聚焦 input */}
<input id="name" />
<ul><li>列表项</li></ul>    {/* 屏幕阅读器会报"列表 3 项" */}
<form>表单</form>           {/* role="form" */}
<button>按钮</button>       {/* role="button" */}
<a href="/about">关于</a>   {/* role="link"，必须有 href 才是链接 */}
<table>表格</table>         {/* 需要 <thead><tbody> 才能被识别为表格 */}
\`\`\`

如果一个 \`<div>\` 点击后跳转到其他页面，它应该是 \`<a>\`；如果点击后触发动作，它应该是 \`<button>\`。记住这条规则，你就解决了 80% 的 a11y 问题。

### ARIA 属性

ARIA（Accessible Rich Internet Applications）是一组 HTML 属性，用于在语义化标签不足时补充无障碍信息。ARIA 可以修改 role、添加状态描述、创建可访问名称。

**ARIA 使用第一原则：能用原生 HTML 就不要用 ARIA。**

\`\`\`tsx
// ✅ 原生 HTML 最好（不需要 ARIA）
<button aria-label="关闭弹窗">✕</button>
<label>
  用户名
  <input type="text" required />
</label>

// ARIA 常用属性

// 1. aria-label：给没有文字的元素提供可访问名称
<button aria-label="关闭" onClick={onClose}>✕</button>
<button aria-label="搜索">🔍</button>
<nav aria-label="主导航">...</nav>
<nav aria-label="面包屑">...</nav>

// 2. aria-labelledby：关联其他元素作为 label（类似 label for）
<h2 id="dialog-title">确认删除</h2>
<div role="dialog" aria-labelledby="dialog-title">
  弹窗内容会被读为"确认删除 对话框"
</div>

// 3. aria-expanded：展开/折叠状态
<button aria-expanded={isOpen} aria-controls="menu-list">
  菜单
</button>
<ul id="menu-list" hidden={!isOpen}>...</ul>

// 4. aria-live：动态内容区域（屏幕阅读器自动朗读变化）
// polite：等用户空闲时读（推荐）
// assertive：立即打断朗读（紧急提示用）
<div aria-live="polite" className="toast-container">
  {/* 添加新消息时自动朗读 */}
  {toast && <p>{toast}</p>}
</div>

// 5. aria-hidden：对屏幕阅读器隐藏装饰性元素
<span aria-hidden="true">🎨</span>
{/* 屏幕阅读器跳过，不朗读 emoji */}

// 6. aria-current：当前项（导航、面包屑）
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li aria-current="page">当前产品名</li>
  </ol>
</nav>

// 7. aria-modal + role="dialog"：模态弹窗
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">弹窗标题</h2>
</div>

// 8. aria-describedby：关联描述文本
<input
  aria-describedby="password-hint"
  type="password"
/>
<p id="password-hint" className="text-sm text-gray-500">
  密码至少8位，包含字母和数字
</p>

// 9. aria-disabled vs disabled
// disabled：完全禁用，不可聚焦，表单不提交
// aria-disabled：看起来禁用，但可以聚焦（适用于需要解释为什么禁用）
<button aria-disabled={true} onClick={handleNeedLogin}>
  收藏（需要登录）
</button>
\`\`\`

### 键盘完整操作

很多用户（包括运动障碍用户和高级程序员）只用键盘操作。你的应用必须支持：

| 按键 | 功能 |
|-----|------|
| Tab | 移动焦点到下一个可聚焦元素 |
| Shift + Tab | 移动焦点到上一个可聚焦元素 |
| Enter | 激活链接/按钮 |
| Space | 激活按钮/切换复选框 |
| Esc | 关闭弹窗/菜单 |
| 方向键 | 在复合组件（菜单、tabs、列表）内导航 |
| Home/End | 跳到组件开头/末尾 |

\`\`\`tsx
// 焦点可见性：不要 outline: none !important
// ❌ 不要这样做！键盘用户看不到焦点在哪
button:focus {
  outline: none;
}

// ✅ 如果你不喜欢默认 outline，替换成自己的样式
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

// :focus-visible 只在键盘/辅助技术聚焦时显示，鼠标点击不显示
// 现代浏览器已经支持，完美解决"点击按钮有 outline 丑"的问题
\`\`\`

### 焦点管理

焦点管理是复杂组件 a11y 的关键：

\`\`\`tsx
import { useRef, useEffect, useCallback } from 'react'

// 1. autoFocus：渲染时自动聚焦
<input autoFocus type="text" />
{/* 注意：页面上只能有一个 autoFocus，模态弹窗打开时焦点要移到弹窗内 */}

// 2. useRef + focus()：编程式聚焦
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearchClick = () => {
    // 点击搜索按钮时聚焦到输入框
    inputRef.current?.focus()
  }

  return (
    <>
      <button onClick={handleSearchClick}>搜索</button>
      <input ref={inputRef} type="search" />
    </>
  )
}

// 3. tabIndex="-1"：让元素可编程式聚焦，但不在 Tab 序列中
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only"
      // sr-only 是视觉隐藏但屏幕阅读器可见的样式
    >
      跳到主要内容
    </a>
  )
}

// 4. Focus Trap：模态框焦点循环（焦点不能跳出弹窗）
// 使用 focus-trap-react 库，或者手动实现
import { useEffect, useRef } from 'react'

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // 打开弹窗时保存当前焦点位置
      previousFocusRef.current = document.activeElement as HTMLElement

      // 焦点移到弹窗内
      modalRef.current?.focus()

      // Focus Trap 实现（推荐直接用 focus-trap-react 库）
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
          return
        }
        if (e.key !== 'Tab') return

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

      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        // 关闭弹窗时把焦点还给之前的元素
        previousFocusRef.current?.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1} // 可以接收编程焦点
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      {children}
    </div>
  )
}

// npm install @radix-ui/react-focus-trap 或 focus-trap-react
\`\`\`

### Skip Link：跳过导航

键盘用户进入每页都要按很多次 Tab 才能到主要内容，Skip Link 解决这个问题：

\`\`\`tsx
// 在页面最顶部添加
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
>
  跳到主要内容
</a>

// main 内容区域添加 id
<main id="main-content" tabIndex={-1}>
  {/* tabIndex={-1} 让 jump link 聚焦时能正常工作 */}
</main>

// sr-only 的 CSS 类（Tailwind 内置，普通 CSS 写）
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border: 0;
// }
\`\`\`

### a11y 工具链

\`\`\`bash
# 1. ESLint 插件：写代码时实时提示 a11y 错误
npm install -D eslint-plugin-jsx-a11y
\`\`\`

\`\`\`javascript filename=".eslintrc.cjs"
module.exports = {
  plugins: ['jsx-a11y'],
  extends: [
    'plugin:jsx-a11y/recommended'
  ],
  rules: {
    // 自定义规则
    'jsx-a11y/click-events-have-key-events': 'error', // click 必须有键盘事件
    'jsx-a11y/no-noninteractive-element-interactions': 'error', // 不给 div/span 加点击
    'jsx-a11y/alt-text': 'error', // 图片必须有 alt
    'jsx-a11y/label-has-associated-control': 'error', // form control 必须有 label
    'jsx-a11y/aria-props': 'error', // ARIA 属性名正确
  }
}
\`\`\`

\`\`\`bash
# 2. 屏幕阅读器测试
# Mac：VoiceOver（Cmd+F5 开启，Cmd+F5 关闭）
#   - Ctrl+Option+左右箭头：导航
#   - Ctrl+Option+Space：点击
#   - Ctrl+Option+U：转子（快速跳标题/链接/表单元素）
# Windows：NVDA（免费）、JAWS（商业）
# 建议：至少用 VoiceOver 测试一遍关键流程

# 3. Lighthouse a11y 审计
# Chrome DevTools → Lighthouse → 勾选 Accessibility → 生成报告
# 给出分数和具体问题清单

# 4. axe DevTools
# Chrome 扩展，自动检测 a11y 问题，比 Lighthouse 更全面
\`\`\`

### 色彩对比度

视力障碍用户（包括很多老年人）需要足够的文字对比度：

- **WCAG AA 标准**：普通文本 4.5:1，大文本（18px+ 粗体或 24px+）3:1
- **WCAG AAA 标准**：普通文本 7:1，大文本 4.5:1
- 不要只用颜色传达信息（比如"红色表示错误"同时要加图标/文字）

\`\`\`tsx
// ❌ 对比度不足
<p style={{ color: '#aaa' }}>浅灰色文字在白色背景上</p> {/* 2.3:1 不达标 */}

// ✅ 符合 AA 标准
<p style={{ color: '#767676' }}>中灰色</p> {/* 4.5:1 达标 */}

// 检测工具：
// - Chrome DevTools → Elements → 点颜色块 → Contrast 会显示是否达标
// - WebAIM Contrast Checker：https://webaim.org/resources/contrastchecker/
// - Stark（Figma 插件/Sketch 插件）：设计阶段检测
\`\`\`

a11y 看起来有很多规则，但核心就是：**用语义化标签、支持键盘、给图片加 alt、给表单加 label、颜色对比足够**。做到这几点你就超过了 90% 的网站。eslint-plugin-jsx-a11y 会帮你检查大部分问题，把它加入项目规范是性价比最高的 a11y 改进。下一章我们来学习国际化 i18n，让你的应用服务全球用户。
`,
  },
  {
    id: "tsrx-i18n",
    group: "实战篇",
    icon: "🌍",
    title: "国际化i18n方案",
    content: `## 国际化i18n方案

国际化（Internationalization，简称 i18n）是让你的应用能够适配不同语言和地区的过程。本地化（Localization，简称 l10n）则是为特定地区添加翻译和格式的过程。React 生态中最成熟的 i18n 方案是 **react-i18next**，基于 i18next 核心库，功能强大、生态完善。

### 安装与初始化

\`\`\`bash
npm install i18next react-i18next i18next-browser-languagedetector
\`\`\`

- **i18next**：核心库，提供翻译、插值、复数等功能
- **react-i18next**：React 绑定，提供 useTranslation/Translation/withTranslation
- **i18next-browser-languagedetector**：自动检测浏览器语言

创建 i18n 配置文件：

\`\`\`typescript filename="src/i18n/index.ts"
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言资源
import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

i18n
  .use(LanguageDetector) // 自动检测语言
  .use(initReactI18next) // 绑定 React
  .init({
    // 默认语言
    fallbackLng: 'zh',
    // 调试模式（开发环境）
    debug: process.env.NODE_ENV === 'development',
    // 语言资源
    resources: {
      zh: { translation: zh },
      en: { translation: en },
      ja: { translation: ja },
    },
    interpolation: {
      // React 默认转义，不需要 i18next 再转义
      escapeValue: false,
    },
    // 检测配置
    detection: {
      // 检测顺序：querystring → localStorage → cookie → navigator → html标签
      order: ['querystring', 'localStorage', 'cookie', 'navigator', 'htmlTag'],
      // localStorage 存储 key
      lookupLocalStorage: 'i18nextLng',
      // 缓存用户选择的语言
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n
\`\`\`

在 main.tsx 中导入（确保在 App 之前初始化）：
\`\`\`tsx filename="src/main.tsx"
import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n' // 导入 i18n 配置
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
\`\`\`

### 创建语言资源文件

\`\`\`json filename="src/i18n/locales/zh.json"
{
  "common": {
    "loading": "加载中...",
    "save": "保存",
    "cancel": "取消",
    "confirm": "确认",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "noData": "暂无数据",
    "success": "操作成功",
    "error": "操作失败"
  },
  "nav": {
    "home": "首页",
    "about": "关于我们",
    "products": "产品",
    "contact": "联系我们",
    "login": "登录",
    "logout": "退出登录"
  },
  "home": {
    "welcome": "欢迎使用我们的应用",
    "subtitle": "构建下一代 React 应用",
    "getStarted": "立即开始",
    "learnMore": "了解更多"
  },
  "user": {
    "greeting": "你好，{{name}}！",
    "profile": "个人资料",
    "settings": "设置",
    "messageCount": "你有 {{count}} 条消息",
    "messageCount_plural": "你有 {{count}} 条消息"
  }
}
\`\`\`

\`\`\`json filename="src/i18n/locales/en.json"
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "noData": "No data available",
    "success": "Success",
    "error": "Error"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "products": "Products",
    "contact": "Contact",
    "login": "Login",
    "logout": "Logout"
  },
  "home": {
    "welcome": "Welcome to our app",
    "subtitle": "Build next-generation React applications",
    "getStarted": "Get Started",
    "learnMore": "Learn More"
  },
  "user": {
    "greeting": "Hello, {{name}}!",
    "profile": "Profile",
    "settings": "Settings",
    "messageCount": "You have {{count}} message",
    "messageCount_plural": "You have {{count}} messages"
  }
}
\`\`\`

### useTranslation Hook

在组件中使用翻译：

\`\`\`tsx
import { useTranslation } from 'react-i18next'

function Header() {
  // t 是翻译函数，i18n 是 i18next 实例
  const { t, i18n } = useTranslation()

  return (
    <header className="bg-white shadow">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-bold">
          {t('nav.home')}
        </div>
        <div className="flex gap-6">
          <a href="/">{t('nav.home')}</a>
          <a href="/products">{t('nav.products')}</a>
          <a href="/about">{t('nav.about')}</a>
          <a href="/contact">{t('nav.contact')}</a>
        </div>
        <LanguageSwitcher />
      </nav>
    </header>
  )
}

// 插值：传递变量
function Greeting({ userName }: { userName: string }) {
  const { t } = useTranslation()
  return <h1>{t('user.greeting', { name: userName })}</h1>
  // zh: 你好，小明！
  // en: Hello, John!
}

// 指定命名空间（如果分多个 JSON 文件）
function UserProfile() {
  const { t } = useTranslation('user') // 只加载 user 命名空间
  return <div>{t('profile')}</div>
}
\`\`\`

### Trans 组件：包含 JSX 的复杂翻译

简单的文字用 t() 函数，但翻译中包含链接、加粗标签等 JSX 时用 <Trans> 组件：

\`\`\`tsx
import { Trans, useTranslation } from 'react-i18next'

function TermsAgreement() {
  const { t } = useTranslation()

  return (
    <p className="text-sm text-gray-600">
      {/* Trans 组件处理包含 JSX 的翻译 */}
      <Trans i18nKey="agreement">
        我已阅读并同意
        <a href="/terms" className="text-blue-600 underline">服务条款</a>
        和
        <a href="/privacy" className="text-blue-600 underline">隐私政策</a>
      </Trans>
      {/* JSON: "agreement": "我已阅读并同意<1>服务条款</1>和<3>隐私政策</3>" */}
      {/* 英文: "agreement": "I have read and agree to the <1>Terms of Service</1> and <3>Privacy Policy</3>" */}
    </p>
  )
}

// 更复杂的插值 + JSX
function Welcome({ name, unreadCount }: { name: string; unreadCount: number }) {
  return (
    <Trans i18nKey="welcomeMessage" values={{ name }} count={unreadCount}>
      你好 <strong>{{ name }}</strong>，你有
      <span className="text-red-500 font-bold">{{ unreadCount }}</span>
      条新消息，<a href="/messages">点击查看</a>
    </Trans>
  )
}
\`\`\`

### 语言切换

\`\`\`tsx
function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng) // 切换语言并自动保存到 localStorage
    // 可选：设置 html 标签 lang 属性
    document.documentElement.lang = lng
    // 可选：RTL 语言处理
    document.documentElement.dir = isRTL(lng) ? 'rtl' : 'ltr'
  }

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
  ]

  return (
    <div className="flex gap-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={\`px-3 py-1 rounded \${
            i18n.language.startsWith(lang.code)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }\`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )
}
\`\`\`

### 日期、数字、货币格式化

**不要自己手写日期格式化！** 使用浏览器原生的 Intl API：

\`\`\`typescript filename="src/i18n/formatters.ts"
import i18n from 'i18next'

// 日期格式化
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  const d = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat(i18n.language, { ...defaultOptions, ...options }).format(d)
}

// 相对时间（5分钟前、3天前）
export function formatRelativeTime(date: Date | string | number) {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' })

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second')
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 604800), 'week')
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
}

// 数字格式化
export function formatNumber(num: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(i18n.language, options).format(num)
}

// 货币格式化
export function formatCurrency(amount: number, currency: string = 'CNY') {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
  }).format(amount)
}

// 使用示例
// zh: formatDate(new Date()) → "2024年1月15日"
// en: formatDate(new Date()) → "January 15, 2024"
// zh: formatCurrency(99.9) → "¥99.90"
// en-US: formatCurrency(99.9, 'USD') → "$99.90"
// zh: formatRelativeTime(subMinutes(new Date(), 5)) → "5分钟前"
// en: formatRelativeTime(subMinutes(new Date(), 5)) → "5 minutes ago"
\`\`\`

### 复数处理

i18next 内置复数支持，通过在 key 后加 \`_zero\`/\`_one\`/\`_other\` 等后缀：

\`\`\`json
{
  "items": "{{count}} 个项目",
  "items_zero": "没有项目",
  "items_one": "{{count}} 个项目"
}
\`\`\`

\`\`\`tsx
function CartBadge({ count }: { count: number }) {
  const { t } = useTranslation()
  return (
    <span>
      {t('items', { count })}
      {/* count=0 → "没有项目" */}
      {/* count=1 → "1 个项目" */}
      {/* count=5 → "5 个项目" */}
    </span>
  )
}
\`\`\`

### RTL（从右到左）语言支持

阿拉伯语、希伯来语等语言是 RTL 的，需要自动翻转样式：

\`\`\`tsx
// 在切换语言时设置 dir
function changeLanguage(lng: string) {
  i18n.changeLanguage(lng)
  const isRTL = ['ar', 'he', 'fa'].includes(lng)
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
}

// CSS 逻辑属性（推荐，自动适配 RTL）
// ❌ 不要用物理属性
.card {
  margin-left: 16px;
  padding-right: 8px;
  border-left: 2px solid blue;
}

// ✅ 用逻辑属性（RTL 自动翻转）
.card {
  margin-inline-start: 16px; /* LTR = margin-left, RTL = margin-right */
  padding-inline-end: 8px;  /* LTR = padding-right, RTL = padding-left */
  border-inline-start: 2px solid blue;
}

// Tailwind 也有逻辑属性工具类
// ms-4 = margin-inline-start: 1rem
// pe-2 = padding-inline-end: 0.5rem
// border-s-2 = border-inline-start-width: 2px
\`\`\`

### i18n 最佳实践

1. **key 用层级结构**：\`common.save\`、\`user.profile.edit\`，便于维护
2. **不要硬编码字符串**：所有用户可见的文字都走 t()
3. **不要拼接字符串**：用插值 \`t('greeting', { name })\`，不同语言语序不同
4. **英文作为 key**：可以考虑直接用英文作为 key（\`t('Welcome')\` 而不是 \`home.welcome\`），但中文团队用中文 key 维护性更好
5. **懒加载语言包**：大项目用 i18next-http-backend 按需加载语言包
6. **避免在 key 中包含动态内容**：\`t(\`btn.\${action}\`)\` 很难维护，用 \`t('btn.action', { context: action })\`
7. **图片和图标也要本地化**：有些文化对颜色/符号/手势的理解不同

i18n 是产品走向国际市场的必经之路。react-i18next 足够应对从小型应用到大型产品的所有 i18n 需求，提前规划好 i18n 架构远比后期硬改要轻松。下一章我们来学习递归组件，实现功能强大的 Tree 树形控件。
`,
  },
  {
    id: "tsrx-tree-master",
    group: "实战篇",
    icon: "🌳",
    title: "递归组件实战Tree树形控件",
    content: `## 递归组件实战Tree树形控件

树形控件（Tree）是后台管理系统中最常见的组件之一——文件目录、组织架构、分类菜单、权限配置都用到它。Tree 的核心在于**递归**：数据结构是递归的，组件渲染也是递归的。掌握递归组件，你就能从"只会用现成 UI 库"进化到"能自己实现复杂交互组件"。

### 递归数据类型定义

Tree 数据的本质是**节点可能包含子节点**，这天然是递归结构：

\`\`\`typescript
// 基础树节点类型
type TreeNode<T = {}> = T & {
  id: string
  label: string
  children?: TreeNode<T>[]
}

// 文件系统示例节点
type FileNode = TreeNode<{
  type: 'file' | 'folder'
  size?: number
  icon?: string
}>

const fileTree: FileNode[] = [
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
          { id: '1-1-1', label: 'Button.tsx', type: 'file', size: 2048 },
          { id: '1-1-2', label: 'Input.tsx', type: 'file', size: 1536 },
        ]
      },
      { id: '1-2', label: 'App.tsx', type: 'file', size: 1024 },
      { id: '1-3', label: 'main.tsx', type: 'file', size: 512 },
    ]
  },
  { id: '2', label: 'package.json', type: 'file', size: 890 },
  { id: '3', label: 'README.md', type: 'file', size: 4096 },
]
\`\`\`

### 基础递归 TreeNode 组件

递归组件的核心：**组件渲染自己**。如果节点有 children，就为每个 child 再渲染一个自己：

\`\`\`tsx filename="src/components/Tree/TreeNode.tsx"
import { useState } from 'react'
import type { TreeNode as TreeNodeType } from '@/types/tree'

type Props = {
  node: TreeNodeType
  depth: number // 缩进层级
  defaultExpanded?: boolean
}

export function TreeNodeComponent({ node, depth, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      {/* 节点行 */}
      <div
        className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer select-none"
        style={{ paddingLeft: \`\${depth * 20 + 8}px\` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* 展开/折叠箭头 */}
        {hasChildren ? (
          <span className={\`w-4 text-gray-400 transition-transform \${expanded ? 'rotate-90' : ''}\`}>
            ▶
          </span>
        ) : (
          <span className="w-4" />
        )}

        {/* 图标 */}
        <span className="text-lg">
          {hasChildren ? (expanded ? '📂' : '📁') : '📄'}
        </span>

        {/* 节点文字 */}
        <span className="flex-1">{node.label}</span>
      </div>

      {/* 🔑 递归：有 children 且展开时，递归渲染每个子节点 */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
\`\`\`

使用 Tree 组件：
\`\`\`tsx filename="src/components/Tree/Tree.tsx"
import type { TreeNode } from '@/types/tree'
import { TreeNodeComponent } from './TreeNode'

type TreeProps = {
  data: TreeNode[]
  defaultExpandAll?: boolean
}

export function Tree({ data, defaultExpandAll = false }: TreeProps) {
  return (
    <div className="border rounded-lg p-2 bg-white">
      {data.map(node => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          depth={0}
          defaultExpanded={defaultExpandAll}
        />
      ))}
    </div>
  )
}

// 使用
function FileExplorer() {
  return <Tree data={fileTree} defaultExpandAll={false} />
}
\`\`\`

### 展开/折叠：受控模式

把展开状态提升到父组件，支持受控/非受控两种模式：

\`\`\`tsx
import { useState, useCallback } from 'react'

// 父组件管理 expandedIds
export function ControlledTree({ data }: { data: TreeNode[] }) {
  // 用 Set 存储展开的节点 ID
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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

  const expandAll = useCallback(() => {
    const allIds = new Set<string>()
    const collect = (nodes: TreeNode[]) => {
      nodes.forEach(n => {
        if (n.children?.length) {
          allIds.add(n.id)
          collect(n.children)
        }
      })
    }
    collect(data)
    setExpandedIds(allIds)
  }, [data])

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button onClick={expandAll} className="px-3 py-1 text-sm border rounded">
          全部展开
        </button>
        <button onClick={collapseAll} className="px-3 py-1 text-sm border rounded">
          全部折叠
        </button>
      </div>
      <TreeView
        data={data}
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
      />
    </div>
  )
}
\`\`\`

### 搜索高亮与父节点自动展开

搜索时需要过滤节点，同时让匹配节点的父节点自动展开：

\`\`\`tsx
// 递归过滤树节点，保留匹配项和其父链
function filterTree(
  nodes: TreeNode[],
  searchTerm: string,
  parents: TreeNode[] = []
): { filtered: TreeNode[]; expandedIds: Set<string> } {
  if (!searchTerm) return { filtered: nodes, expandedIds: new Set() }

  const filtered: TreeNode[] = []
  const expandedIds = new Set<string>()
  const term = searchTerm.toLowerCase()

  for (const node of nodes) {
    // 当前节点匹配
    const matchesSelf = node.label.toLowerCase().includes(term)

    // 递归检查子节点
    const { filtered: filteredChildren, expandedIds: childExpanded } = node.children
      ? filterTree(node.children, searchTerm, [...parents, node])
      : { filtered: [], expandedIds: new Set() }

    // 如果自己匹配或有匹配的子节点，保留这个节点
    if (matchesSelf || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: matchesSelf ? node.children : filteredChildren,
      })
      // 子节点匹配时，当前节点（父节点）需要展开
      if (filteredChildren.length > 0) {
        expandedIds.add(node.id)
      }
      // 所有祖先节点也要展开
      childExpanded.forEach(id => expandedIds.add(id))
    }
  }

  return { filtered, expandedIds }
}

// 搜索 Tree 组件
function SearchableTree({ data }: { data: TreeNode[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set())

  const { filtered, expandedIds: searchExpanded } = filterTree(data, searchTerm)

  // 搜索时用搜索结果的 expandedIds，否则用手动展开的
  const activeExpandedIds = searchTerm ? searchExpanded : manualExpanded

  const handleToggleExpand = (id: string) => {
    if (searchTerm) return // 搜索时不允许手动折叠
    setManualExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="搜索..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 pl-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <TreeView
        data={filtered}
        expandedIds={activeExpandedIds}
        onToggleExpand={handleToggleExpand}
        highlightText={searchTerm}
      />
    </div>
  )
}

// 高亮文字
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>
  const parts = text.split(new RegExp(\`(\${highlight.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')})\`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
\`\`\`

### Checkbox 层级选择

Tree 最复杂的交互是层级 checkbox：父节点选中/取消选中影响所有子节点，子节点部分选中时父节点显示半选状态（indeterminate）：

\`\`\`tsx
import { useState, useCallback, useEffect, useRef } from 'react'

// 获取节点所有后代 ID
function getAllDescendantIds(nodes: TreeNode[]): string[] {
  const ids: string[] = []
  const walk = (items: TreeNode[]) => {
    items.forEach(n => {
      ids.push(n.id)
      if (n.children) walk(n.children)
    })
  }
  walk(nodes)
  return ids
}

// 计算节点的选择状态
function getNodeCheckState(
  node: TreeNode,
  checkedIds: Set<string>
): 'checked' | 'unchecked' | 'indeterminate' {
  if (!node.children?.length) {
    return checkedIds.has(node.id) ? 'checked' : 'unchecked'
  }

  const childStates = node.children.map(child => getNodeCheckState(child, checkedIds))

  if (childStates.every(s => s === 'checked')) return 'checked'
  if (childStates.every(s => s === 'unchecked')) return 'unchecked'
  return 'indeterminate' // 部分选中
}

function CheckboxTree({ data, onCheckedChange }: {
  data: TreeNode[]
  onCheckedChange?: (ids: string[]) => void
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleCheck = useCallback((node: TreeNode) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      const descendantIds = getAllDescendantIds([node])
      const isCurrentlyChecked = next.has(node.id)

      if (isCurrentlyChecked) {
        // 取消选中：移除自己和所有后代
        descendantIds.forEach(id => next.delete(id))
      } else {
        // 选中：添加自己和所有后代
        descendantIds.forEach(id => next.add(id))
      }

      return next
    })
  }, [])

  useEffect(() => {
    onCheckedChange?.(Array.from(checkedIds))
  }, [checkedIds, onCheckedChange])

  return (
    <div className="border rounded-lg p-2 bg-white">
      {data.map(node => (
        <CheckableNode
          key={node.id}
          node={node}
          depth={0}
          checkedIds={checkedIds}
          expandedIds={expandedIds}
          onToggleCheck={toggleCheck}
          onToggleExpand={(id) => setExpandedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
          })}
        />
      ))}
    </div>
  )
}

function CheckableNode({ node, depth, checkedIds, expandedIds, onToggleCheck, onToggleExpand }: {
  node: TreeNode
  depth: number
  checkedIds: Set<string>
  expandedIds: Set<string>
  onToggleCheck: (node: TreeNode) => void
  onToggleExpand: (id: string) => void
}) {
  const checkboxRef = useRef<HTMLInputElement>(null)
  const hasChildren = node.children?.length > 0
  const expanded = expandedIds.has(node.id)
  const checkState = getNodeCheckState(node, checkedIds)

  // 用 ref 设置 indeterminate 状态（HTML 属性，不能通过 React 直接设置）
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = checkState === 'indeterminate'
      checkboxRef.current.checked = checkState === 'checked'
    }
  }, [checkState])

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 hover:bg-gray-50 rounded"
        style={{ paddingLeft: \`\${depth * 24 + 4}px\` }}
      >
        {/* 展开箭头 */}
        <button
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          {hasChildren && (
            <span className={\`transition-transform \${expanded ? 'rotate-90' : ''}\`}>▶</span>
          )}
        </button>

        {/* Checkbox */}
        <input
          ref={checkboxRef}
          type="checkbox"
          onChange={() => onToggleCheck(node)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />

        {/* 图标和文字 */}
        <span className="cursor-pointer" onClick={() => onToggleCheck(node)}>
          {hasChildren ? (expanded ? '📂' : '📁') : '📄'}
          {' '}{node.label}
        </span>
      </div>

      {/* 递归渲染子节点 */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <CheckableNode
              key={child.id}
              node={child}
              depth={depth + 1}
              checkedIds={checkedIds}
              expandedIds={expandedIds}
              onToggleCheck={onToggleCheck}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}
\`\`\`

### 右键菜单

\`\`\`tsx
import { useState, useEffect, useRef } from 'react'

type ContextMenuState = {
  x: number
  y: number
  nodeId: string
} | null

function TreeWithContextMenu({ data }: { data: TreeNode[] }) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault() // 阻止浏览器默认右键菜单
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
    })
  }

  return (
    <div className="relative">
      <TreeView
        data={data}
        onContextMenu={handleContextMenu}
      />

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border rounded-lg shadow-lg py-1 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
            <span>✏️</span> 重命名
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
            <span>📋</span> 复制
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
            <span>📁</span> 新建文件夹
          </button>
          <div className="border-t my-1" />
          <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <span>🗑️</span> 删除
          </button>
        </div>
      )}
    </div>
  )
}
\`\`\`

### 大数据虚拟滚动

如果 Tree 有成千上万个节点，DOM 渲染会卡顿。需要虚拟滚动（只渲染可视区域内的节点）：

\`\`\`tsx
// 虚拟滚动的核心：先把树"拍平"成一维数组
function flattenTree(
  nodes: TreeNode[],
  expandedIds: Set<string>,
  depth = 0
): Array<{ node: TreeNode; depth: number }> {
  const result: Array<{ node: TreeNode; depth: number }> = []

  for (const node of nodes) {
    result.push({ node, depth })
    // 展开的节点才渲染子节点
    if (node.children?.length && expandedIds.has(node.id)) {
      result.push(...flattenTree(node.children, expandedIds, depth + 1))
    }
  }

  return result
}

// 使用 react-window 做虚拟滚动
// npm install react-window @types/react-window
import { FixedSizeList as List } from 'react-window'

function VirtualTree({ data, expandedIds }: { data: TreeNode[]; expandedIds: Set<string> }) {
  const flatList = flattenTree(data, expandedIds)
  const ITEM_HEIGHT = 32

  return (
    <List
      height={500}
      itemCount={flatList.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
    >
      {({ index, style }) => {
        const { node, depth } = flatList[index]
        return (
          <div style={style}>
            <div
              className="flex items-center gap-2 px-2 h-full hover:bg-gray-100"
              style={{ paddingLeft: \`\${depth * 24 + 8}px\` }}
            >
              {node.children?.length ? (expandedIds.has(node.id) ? '📂' : '📁') : '📄'}
              {node.label}
            </div>
          </div>
        )
      }}
    </List>
  )
}
\`\`\`

递归是编程中非常强大的思维方式——一个看起来复杂的 Tree 组件，核心递归部分可能只有 10 行代码。掌握递归组件的关键是：定义好递归的数据结构、找到递归终止条件（没有 children 或未展开）、组件自己渲染自己。文件系统、评论回复、嵌套菜单、级联选择都是同一个递归模式。下一章我们来实现酷炫的拖拽看板（Kanban）。
`,
  },
  {
    id: "tsrx-drag-kanban",
    group: "实战篇",
    icon: "📋",
    title: "拖拽看板(Drag and Drop)",
    content: `## 拖拽看板(Drag and Drop)

拖拽是现代 Web 应用中非常直观的交互方式——看板看板（Trello/Jira 风格的任务看板）是拖拽最经典的应用场景。在 React 生态中，**@dnd-kit** 是目前最现代、最灵活的拖拽库，API 设计优雅，完全拥抱 Hooks，性能优秀，已经取代了老一代的 react-dnd。

### 为什么选择 @dnd-kit

- **现代架构**：基于 React Hooks 和 Context，没有 findDOMNode 等过时 API
- **无障碍优先**：内置键盘拖拽支持，开箱即用
- **传感器可定制**：支持鼠标、触摸、键盘等多种输入方式，可以自定义传感器
- **性能优秀**：不重渲染整个列表，只更新必要的元素
- **不锁定 DOM 结构**：不像 react-dnd 需要装饰器/HOC，DOM 结构完全自由
- **动画流畅**：内置平滑动画和 DragOverlay 视觉反馈

### 安装与基础概念

\`\`\`bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
\`\`\`

dnd-kit 的核心概念：

1. **DndContext**：拖拽上下文，包裹整个拖拽区域
2. **Sensor（传感器）**：决定如何触发拖拽（PointerSensor 鼠标+触摸、KeyboardSensor 键盘）
3. **useDraggable**：让元素可以被拖拽
4. **useDroppable**：让元素可以接受放置
5. **DragOverlay**：拖拽时跟随鼠标的浮层副本

### 最小可用示例：拖拽一张卡片

\`\`\`tsx filename="src/components/DragDrop/BasicExample.tsx"
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

// 可拖拽元素
function DraggableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 bg-white border rounded-lg shadow cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  )
}

// 放置区域
function DroppableArea({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={\`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors \${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }\`}
    >
      {children}
    </div>
  )
}

export function BasicDragExample() {
  const [parent, setParent] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 激活约束：移动 5px 以上才触发拖拽，防止点击误触
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { over } = event
    setParent(over ? over.id as string : null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 p-8">
        {/* 未放置的区域 */}
        {!parent && (
          <DraggableItem id="my-card">
            🃏 拖拽我
          </DraggableItem>
        )}

        <DroppableArea id="droppable-1">
          <p className="text-gray-400 mb-2">放置区域1</p>
          {parent === 'droppable-1' && (
            <DraggableItem id="my-card">🃏 拖拽我</DraggableItem>
          )}
        </DroppableArea>

        <DroppableArea id="droppable-2">
          <p className="text-gray-400 mb-2">放置区域2</p>
          {parent === 'droppable-2' && (
            <DraggableItem id="my-card">🃏 拖拽我</DraggableItem>
          )}
        </DroppableArea>
      </div>

      {/* DragOverlay：拖拽时显示的浮层副本 */}
      <DragOverlay>
        {activeId ? (
          <div className="p-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl rotate-3">
            🃏 拖拽我
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
\`\`\`

**DragOverlay 是提升体验的关键**：不使用 DragOverlay 时，拖拽的是原始元素（需要用 transform 移动，原位置会空出来）；使用 DragOverlay 后，原始元素保留在原位（可以显示占位符样式），一个半透明的副本跟随鼠标，视觉效果更流畅。

### 完整 Kanban 看板实现

\`\`\`tsx filename="src/components/Kanban/KanbanBoard.tsx"
import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 类型定义
type Column = {
  id: string
  title: string
  taskIds: string[]
}

type Task = {
  id: string
  content: string
  priority: 'low' | 'medium' | 'high'
}

type KanbanState = {
  columns: Column[]
  tasks: Record<string, Task>
  moveTask: (taskId: string, fromCol: string, toCol: string, fromIndex: number, toIndex: number) => void
  addTask: (columnId: string, content: string) => void
  deleteTask: (taskId: string, columnId: string) => void
}

// Zustand store + localStorage 持久化
const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      columns: [
        { id: 'todo', title: '📋 待办', taskIds: ['t1', 't2'] },
        { id: 'doing', title: '🔄 进行中', taskIds: ['t3'] },
        { id: 'done', title: '✅ 已完成', taskIds: [] },
      ],
      tasks: {
        t1: { id: 't1', content: '学习 dnd-kit 基础', priority: 'high' },
        t2: { id: 't2', content: '实现看板拖拽', priority: 'medium' },
        t3: { id: 't3', content: '写单元测试', priority: 'low' },
      },
      moveTask: (taskId, fromCol, toCol, fromIndex, toIndex) => {
        set(state => {
          const newColumns = [...state.columns]
          const fromColIndex = newColumns.findIndex(c => c.id === fromCol)
          const toColIndex = newColumns.findIndex(c => c.id === toCol)

          if (fromColIndex === -1 || toColIndex === -1) return state

          const fromTaskIds = [...newColumns[fromColIndex].taskIds]
          fromTaskIds.splice(fromIndex, 1)
          newColumns[fromColIndex] = { ...newColumns[fromColIndex], taskIds: fromTaskIds }

          const toTaskIds = fromCol === toCol ? fromTaskIds : [...newColumns[toColIndex].taskIds]
          toTaskIds.splice(toIndex, 0, taskId)
          newColumns[toColIndex] = { ...newColumns[toColIndex], taskIds: toTaskIds }

          return { columns: newColumns }
        })
      },
      addTask: (columnId, content) => {
        set(state => {
          const newTaskId = \`t\${Date.now()}\`
          const newTask = { id: newTaskId, content, priority: 'medium' as const }
          const newColumns = state.columns.map(c =>
            c.id === columnId ? { ...c, taskIds: [...c.taskIds, newTaskId] } : c
          )
          return {
            tasks: { ...state.tasks, [newTaskId]: newTask },
            columns: newColumns,
          }
        })
      },
      deleteTask: (taskId, columnId) => {
        set(state => {
          const newTasks = { ...state.tasks }
          delete newTasks[taskId]
          const newColumns = state.columns.map(c =>
            c.id === columnId ? { ...c, taskIds: c.taskIds.filter(id => id !== taskId) } : c
          )
          return { tasks: newTasks, columns: newColumns }
        })
      },
    }),
    { name: 'kanban-storage' }
  )
)
\`\`\`

可排序的任务卡片：
\`\`\`tsx
// 可排序的 Task 卡片
function SortableTask({ taskId, columnId }: { taskId: string; columnId: string }) {
  const task = useKanbanStore(s => s.tasks[taskId])
  const deleteTask = useKanbanStore(s => s.deleteTask)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId, data: { columnId } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm flex-1">{task.content}</p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteTask(taskId, columnId)
          }}
          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
      <div className="mt-2">
        <span className={\`text-xs px-2 py-0.5 rounded \${priorityColors[task.priority]}\`}>
          {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
        </span>
      </div>
    </div>
  )
}

// 看板列
function KanbanColumn({ column }: { column: Column }) {
  const tasks = useKanbanStore(s => s.tasks)
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskContent, setNewTaskContent] = useState('')
  const addTask = useKanbanStore(s => s.addTask)

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleAdd = () => {
    if (newTaskContent.trim()) {
      addTask(column.id, newTaskContent.trim())
      setNewTaskContent('')
      setIsAdding(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={\`w-80 flex-shrink-0 bg-gray-100 rounded-xl p-3 transition-colors \${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
      }\`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">
          {column.title}
          <span className="ml-2 text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            {column.taskIds.length}
          </span>
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          +
        </button>
      </div>

      <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {column.taskIds.map(taskId => (
            <SortableTask key={taskId} taskId={taskId} columnId={column.id} />
          ))}
        </div>
      </SortableContext>

      {isAdding && (
        <div className="mt-2">
          <textarea
            autoFocus
            value={newTaskContent}
            onChange={e => setNewTaskContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAdd()
              }
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewTaskContent('')
              }
            }}
            placeholder="输入任务内容..."
            className="w-full p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              添加
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewTaskContent('') }}
              className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-200 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
\`\`\`

主看板组件和拖拽逻辑：
\`\`\`tsx
export function KanbanBoard() {
  const columns = useKanbanStore(s => s.columns)
  const tasks = useKanbanStore(s => s.tasks)
  const moveTask = useKanbanStore(s => s.moveTask)

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 查找任务所在的列和索引
  function findTaskColumn(taskId: string) {
    const column = columns.find(c => c.taskIds.includes(taskId))
    if (!column) return null
    return {
      column,
      index: column.taskIds.indexOf(taskId),
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeData = active.data.current
    const overData = over.data.current

    // 找到源和目标
    const from = findTaskColumn(activeId)
    if (!from) return

    // 拖到另一张卡片上
    if (overData?.type === 'task') {
      const to = findTaskColumn(overId)
      if (!to) return
      moveTask(activeId, from.column.id, to.column.id, from.index, to.index)
    }
    // 拖到一列的空区域
    else if (overData?.type === 'column') {
      const toCol = columns.find(c => c.id === overId)
      if (!toCol) return
      moveTask(activeId, from.column.id, toCol.id, from.index, toCol.taskIds.length)
    }
  }

  const activeTask = activeTaskId ? tasks[activeTaskId] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-50">
        {columns.map(column => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-white p-3 rounded-lg shadow-xl border-2 border-blue-500 rotate-2 w-72">
            <p className="text-sm">{activeTask.content}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
\`\`\`

拖拽看板的关键技巧：
1. **activationConstraint** 防止点击误触：鼠标移动一定距离后才触发拖拽
2. **DragOverlay** 提供流畅视觉：原位置保留，浮层副本跟随鼠标
3. **closestCorners** 碰撞检测：适合列布局，检测最近的角落
4. **data 属性** 在 draggable/droppable 上传递元数据（类型、位置）
5. **persist 中间件** 自动保存到 localStorage，刷新不丢失

dnd-kit 还支持拖拽动画、多容器拖拽、嵌套拖拽等高级场景。掌握了 dnd-kit，你可以实现任何拖拽交互——排序、看板、日历、画板、文件上传区等等。下一章我们将从零到一构建一个完整的 TodoApp 项目，串联所有学过的知识。
`,
  },
  {
    id: "tsrx-full-project",
    group: "实战篇",
    icon: "🏗️",
    title: "完整项目实战:从0到1构建TodoApp",
    content: `## 完整项目实战:从0到1构建TodoApp

经过前面章节的学习，我们已经掌握了 TypeScript + React 生态的各个方面——类型系统、Hooks、状态管理、路由、表单、测试、错误处理、a11y、i18n、复杂组件。现在我们要用这些知识从零到一构建一个完整的、可部署的 TodoApp 项目，串联所有知识点，形成完整的工程能力。

### 项目规划

#### 技术选型

我们选择一套经过实战检验的现代 React 技术栈：

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| 构建工具 | Vite 5 | 极快的开发体验 |
| UI 框架 | React 18 | 并发特性、Suspense |
| 语言 | TypeScript 5 | 类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 状态管理 | Zustand | 轻量、简单、TS 友好 |
| 路由 | React Router v6 | 数据路由、lazy loading |
| 表单 | React Hook Form + Zod | 高性能表单 + 类型安全验证 |
| 测试 | Vitest + RTL | 极快测试 + 用户视角 |
| UI 原子组件 | cva + tailwind-merge | 变体管理 + className 合并 |

#### 目录结构

\`\`\`
src/
├── components/
│   ├── ui/           # 通用 UI 原子组件(Button/Input/Modal等)
│   └── layout/       # 布局组件(Header/Sidebar)
├── hooks/            # 自定义 Hooks
├── store/            # Zustand 状态管理
├── pages/            # 路由页面
├── types/            # 全局类型定义
├── utils/            # 工具函数
├── api/              # API 请求封装(本项目模拟)
├── test/             # 测试配置和工具
├── App.tsx
├── main.tsx
└── index.css
\`\`\`

### Step 1:项目初始化与通用组件库

\`\`\`bash
npm create vite@latest todo-app -- --template react-ts
cd todo-app
npm install zustand react-router-dom react-hook-form zod @hookform/resolvers
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D tailwindcss postcss autoprefixer class-variance-authority clsx tailwind-merge
npx tailwindcss init -p
\`\`\`

配置 cva + cn 工具函数:
\`\`\`typescript filename="src/utils/cn.ts"
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
\`\`\`

\`\`\`tsx filename="src/components/ui/Button.tsx"
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
\`\`\`

\`\`\`tsx filename="src/components/ui/Input.tsx"
import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={cn(
            'w-full h-10 px-3 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? \`\${props.name}-error\` : undefined}
          {...props}
        />
        {error && (
          <p id={\`\${props.name}-error\`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
\`\`\`

\`\`\`tsx filename="src/components/ui/Card.tsx"
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border bg-white shadow-sm', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-3', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-3', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
\`\`\`

\`\`\`tsx filename="src/components/ui/Modal.tsx"
import { ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn(
          'bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
\`\`\`

### Step 2:自定义 Hooks 与状态管理

\`\`\`tsx filename="src/hooks/useLocalStorage.ts"
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      console.error(\`Error writing localStorage key "\${key}"\`)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
\`\`\`

\`\`\`tsx filename="src/hooks/useDebounce.ts"
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
\`\`\`

\`\`\`tsx filename="src/hooks/useClickOutside.ts"
import { useEffect, useRef } from 'react'

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])

  return ref
}
\`\`\`

Zustand store 包含 Auth 和 Todo:
\`\`\`typescript filename="src/store/auth.ts"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  email: string
  name: string
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // 模拟 API 请求
        await new Promise(resolve => setTimeout(resolve, 500))
        // 模拟验证:任何邮箱+密码6位以上登录成功
        set({
          user: { id: '1', email, name: email.split('@')[0] },
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage' }
  )
)

// 受保护路由 Hook
export function useRequireAuth() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user = useAuthStore(s => s.user)

  if (!isAuthenticated) {
    return { isAuthenticated: false, user: null, redirectTo: '/login' }
  }
  return { isAuthenticated: true, user, redirectTo: null }
}
\`\`\`

\`\`\`typescript filename="src/store/todo.ts"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Priority = 'low' | 'medium' | 'high'
export type FilterType = 'all' | 'active' | 'completed'

export type Todo = {
  id: string
  text: string
  completed: boolean
  priority: Priority
  createdAt: number
}

type TodoState = {
  todos: Todo[]
  filter: FilterType
  addTodo: (text: string, priority?: Priority) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  editTodo: (id: string, text: string) => void
  clearCompleted: () => void
  setFilter: (filter: FilterType) => void
  getFilteredTodos: () => Todo[]
  getStats: () => { total: number; active: number; completed: number }
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      filter: 'all',

      addTodo: (text, priority = 'medium') => {
        set(state => ({
          todos: [
            { id: Date.now().toString(), text, completed: false, priority, createdAt: Date.now() },
            ...state.todos,
          ]
        }))
      },

      toggleTodo: (id) => {
        set(state => ({
          todos: state.todos.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        }))
      },

      deleteTodo: (id) => {
        set(state => ({
          todos: state.todos.filter(t => t.id !== id)
        }))
      },

      editTodo: (id, text) => {
        set(state => ({
          todos: state.todos.map(t => t.id === id ? { ...t, text } : t)
        }))
      },

      clearCompleted: () => {
        set(state => ({
          todos: state.todos.filter(t => !t.completed)
        }))
      },

      setFilter: (filter) => set({ filter }),

      getFilteredTodos: () => {
        const { todos, filter } = get()
        if (filter === 'active') return todos.filter(t => !t.completed)
        if (filter === 'completed') return todos.filter(t => t.completed)
        return todos
      },

      getStats: () => {
        const { todos } = get()
        const completed = todos.filter(t => t.completed).length
        return { total: todos.length, active: todos.length - completed, completed }
      },
    }),
    { name: 'todo-storage' }
  )
)
\`\`\`

### Step 3:主题切换与布局

CSS Variables 实现主题切换:
\`\`\`css filename="src/index.css"
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
}

[data-theme="dark"] {
  --color-bg: #111827;
  --color-bg-secondary: #1f2937;
  --color-text: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #374151;
  --color-primary: #60a5fa;
  --color-primary-hover: #3b82f6;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.2s, color 0.2s;
}
\`\`\`

\`\`\`tsx filename="src/hooks/useTheme.ts"
import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme, setTheme }
}
\`\`\`

布局组件:
\`\`\`tsx filename="src/components/layout/Layout.tsx"
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/Button'

export function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <h1 className="text-xl font-bold">
              <NavLink to="/" className="text-blue-500">TodoApp</NavLink>
            </h1>
            {isAuthenticated && (
              <>
                <NavLink to="/" end className={({isActive}) => isActive ? 'text-blue-500 font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}>
                  任务列表
                </NavLink>
                <NavLink to="/about" className={({isActive}) => isActive ? 'text-blue-500 font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}>
                  关于
                </NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>
                  {user?.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  退出
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                登录
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
\`\`\`

### Step 4:路由配置与受保护路由

\`\`\`tsx filename="src/App.tsx"
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/store/auth'

// Lazy 加载页面,首屏更快
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const TodoPage = lazy(() => import('@/pages/TodoPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// 受保护路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">出错了</h1>
        <a href="/" className="text-blue-500 underline">返回首页</a>
      </div>
    ),
    children: [
      { index: true, element: <ProtectedRoute><TodoPage /></ProtectedRoute> },
      { path: 'about', element: <AboutPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  )
}
\`\`\`

登录页(RHF + Zod):
\`\`\`tsx filename="src/pages/LoginPage.tsx"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch {
      setError('root', { message: '登录失败,请重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">登录 TodoApp</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">邮箱</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">密码</label>
              <Input
                id="password"
                type="password"
                placeholder="至少6位"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
            {errors.root && (
              <p className="text-sm text-red-500 text-center">{errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
            <p className="text-xs text-center text-gray-500">
              演示:任意邮箱 + 6位以上密码即可登录
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

### Step 5:Todo 主页面

\`\`\`tsx filename="src/pages/TodoPage.tsx"
import { useState } from 'react'
import { useTodoStore, Priority } from '@/store/todo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: '高', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: '中', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { label: '低', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
}

export default function TodoPage() {
  const [newTodo, setNewTodo] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted, filter, setFilter, getFilteredTodos, getStats } = useTodoStore()
  const filteredTodos = getFilteredTodos()
  const stats = getStats()

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim(), priority)
      setNewTodo('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">我的任务</h1>
        <p className="text-gray-500">共 {stats.total} 项,待完成 {stats.active} 项</p>
      </div>

      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="添加新任务..."
            className="flex-1"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          <Button onClick={handleAdd}>添加</Button>
        </div>
      </Card>

      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </Button>
        ))}
        <div className="flex-1" />
        {stats.completed > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompleted}>
            清除已完成
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>暂无任务,添加一个吧</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <Card key={todo.id} className="p-4 flex items-center gap-3 group">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <span className={cn('flex-1', todo.completed && 'line-through text-gray-400')}>
                {todo.text}
              </span>
              <span className={cn('text-xs px-2 py-0.5 rounded', priorityConfig[todo.priority].className)}>
                {priorityConfig[todo.priority].label}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="删除"
              >
                ✕
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="src/pages/AboutPage.tsx"
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">关于 TodoApp</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>这是一个使用 TypeScript + React 18 + Vite + Tailwind CSS + Zustand 构建的示例应用。</p>
          <div>
            <h2 className="font-semibold mb-2">技术栈</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>React 18 + TypeScript</li>
              <li>Vite 构建工具</li>
              <li>Tailwind CSS 样式</li>
              <li>Zustand 状态管理</li>
              <li>React Router v6 路由</li>
              <li>React Hook Form + Zod 表单</li>
              <li>Vitest + RTL 测试</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="src/pages/NotFoundPage.tsx"
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-500 mb-6">页面不存在</p>
      <Link to="/">
        <Button>返回首页</Button>
      </Link>
    </div>
  )
}
\`\`\`

### Step 6:关键组件测试

\`\`\`tsx filename="src/components/ui/Button.test.tsx"
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('应该正确渲染按钮文字', () => {
    render(<Button>确定</Button>)
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument()
  })

  it('点击应该触发 onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>点击</Button>)
    await user.click(screen.getByRole('button', { name: '点击' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 状态不可点击', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>不可用</Button>)
    expect(screen.getByRole('button', { name: '不可用' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '不可用' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
\`\`\`

### Step 7:部署配置

\`\`\`json filename="vercel.json"
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
\`\`\`

\`\`\`bash
npm run build
# 产物在 dist/ 目录,直接部署到 Vercel/Netlify/Cloudflare Pages/GitHub Pages
# Vercel: import GitHub 仓库,自动识别 Vite 项目,零配置部署
\`\`\`

### 项目优化回顾

这个完整项目串联了我们学过的所有核心知识点:

1. **TypeScript 类型安全**: Zod schema 类型推导、组件 props 类型、store 类型
2. **React 18 Hooks**: useState/useEffect/useRef/自定义 Hook,forwardRef 转发
3. **组件设计**: cva 变体管理、cn 合并、复合组件模式(Card/CardHeader/CardContent)
4. **状态管理**: Zustand 简洁 store + persist 中间件持久化
5. **路由**: React Router v6 数据路由、懒加载、受保护路由、NavLink
6. **表单**: React Hook Form 高性能表单 + Zod 类型安全验证
7. **样式**: Tailwind CSS 原子化 + CSS Variables 主题切换(明/暗模式)
8. **错误处理**: ErrorBoundary 错误边界、Suspense 加载状态
9. **无障碍**: 语义化 HTML、aria-label、focus 管理、键盘操作
10. **测试**: Vitest + RTL 测试关键组件

这个项目虽然功能不复杂,但涵盖了现代 React 工程的完整生命周期——从初始化、组件设计、状态管理、路由、表单、测试到部署。掌握了这些能力,你可以独立构建任何中小型 React 应用。大型应用再加上 i18n、性能优化(React.memo/useMemo/useCallback/虚拟列表)、微前端、监控等即可。

恭喜你完成了 TypeScript + React 测试篇和实战篇的学习!
`,
  },
];

