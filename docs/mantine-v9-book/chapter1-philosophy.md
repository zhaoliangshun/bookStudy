# 第一章 · Mantine 的设计理念与哲学

> "Build fully functional accessible web applications faster than ever."

在 React 生态系统中，UI 组件库的数量令人眼花缭乱——从昔日的 Material-UI（现 MUI）、Ant Design，到近年的 Chakra UI、Radix UI、shadcn/ui，每一种组件库都在试图回答同一个根本性问题：**如何让开发者以更少的时间、更少的代码，构建出更好、更可用的应用界面？**

Mantine 对这个问题的回答，既简单又深刻——**开箱即用、完全可访问、深度可定制、面向 AI 协作时代**。

本章将从 Mantine 的诞生背景、核心设计哲学、模块化架构、可访问性承诺、暗色模式策略、v9 版本革新、与其他组件库的横向对比以及快速上手指南等八个维度，系统性、深入地将 Mantine 的设计理念与工程哲学呈现给你。

---

## 1.1 Mantine 是什么

### 1.1.1 项目起源与定位

Mantine 由 Vitaly Rtishchev 于 2021 年创建，最初是作为一个个人项目开始的。Vitaly 在使用其他 React 组件库时感到沮丧——它们要么过于复杂、要么定制性差、要么缺乏对可访问性的关注、要么 hooks 和工具函数的支持严重不足。他决定创建一个"自己愿意每天都用的组件库"，这就是 Mantine 的起点。

Mantine 的目标从来不是简单地"做出一套好看的 UI 组件"。它的野心要大得多：

> **Mantine 想要覆盖一个真实业务应用从表单、布局、通知、弹窗、日期选择、文件上传、富文本编辑到图表的几乎所有交互需求。**

这种定位意味着 Mantine 是一套**完整的 React 应用开发工具包**，而不仅仅是一个组件库。它解决的是"构建一个完整可用、可访问的 Web 应用"这一更高层次的问题。

### 1.1.2 核心愿景

Mantine 的核心愿景可以用五个关键词概括：

1. **开箱即用（Batteries Included）**：Mantine 提供了一切你需要快速构建应用的东西——组件、hooks、主题系统、通知系统、模态框管理、Spotlight 搜索、日期选择器、富文本编辑器等。你不需要在数十个第三方库之间做选择和集成。

2. **完全可访问（Accessible by Default）**：每一个 Mantine 组件都遵循 WAI-ARIA 标准，支持键盘导航、屏幕阅读器、焦点管理。可访问性不是"附加功能"，而是内置在组件 DNA 中的基本要求。

3. **深度可定制（Deeply Customizable）**：通过 Theme 系统、Styles API、CSS 变量、`classNames` prop 等多层级的定制机制，你可以完全控制组件的外观，从颜色、字体、间距到单个内部元素的样式。

4. **TypeScript 优先（TypeScript First）**：Mantine 全部使用 TypeScript 编写，提供完整的类型推断和泛型支持。你不用猜测一个 prop 接受什么类型——IDE 会告诉你一切。

5. **AI 协作友好（AI-Friendly）**：Mantine v9 的 API 设计充分考虑了 AI 代码生成的场景，提供了更一致的命名、更简洁的接口、更好的类型推断，使得 AI 工具能够更准确地生成 Mantine 代码。

---

## 1.2 Mantine 的设计哲学

### 1.2.1 组合优于配置（Composition over Configuration）

Mantine 的核心设计哲学之一是**组合优于配置**。这意味着 Mantine 组件被设计为小型、专注、可组合的构建块，而不是庞大、配置驱动的一体化组件。

举个简单的例子——在 Mantine 中，你不会看到一个带有 `type="card-with-image-and-footer"` 的 `Card` 组件。相反，你会使用 `Card`、`Card.Section`、`Image`、`Text`、`Group`、`Button` 等原子组件来组合出你需要的卡片布局：

```tsx
// Mantine 的组合式设计
import { Card, Image, Text, Group, Button } from '@mantine/core';

function ProductCard({ product }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={product.image} height={160} alt={product.name} />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{product.name}</Text>
        <Text c="blue" fw={700}>${product.price}</Text>
      </Group>

      <Text size="sm" c="dimmed">
        {product.description}
      </Text>

      <Button color="blue" fullWidth mt="md" radius="md">
        加入购物车
      </Button>
    </Card>
  );
}
```

这种组合式设计带来的好处是显而易见的：

- **灵活性**：你可以自由组合任何组件，不受预设模板限制
- **可预测性**：每个组件只做一件事，行为清晰、可预测
- **可维护性**：组件职责单一，修改和扩展都不会产生意外副作用
- **学习成本低**：你不需要记忆大量的配置选项，只需要了解每个组件的基本用法

### 1.2.2 约定优于配置（Convention over Configuration）

虽然 Mantine 强调组合式设计，但它也遵循"约定优于配置"的原则。Mantine 为每个组件提供了经过精心设计的默认值，这些默认值遵循现代 UI 设计的最佳实践。你不需要从零开始配置每个组件——它们开箱即用就已经很好看。

```tsx
// 零配置即可使用，外观已经很好
import { Button, TextInput, Select } from '@mantine/core';

function MyForm() {
  return (
    <>
      <TextInput label="用户名" placeholder="请输入用户名" />
      <Select
        label="角色"
        placeholder="请选择角色"
        data={['管理员', '编辑者', '观察者']}
      />
      <Button>提交</Button>
    </>
  );
}
```

当你需要定制时，Mantine 提供了多层级的覆盖机制，让你可以从最粗略的颜色调整到最精细的单个元素样式覆盖。

### 1.2.3 不可知论（Framework Agnostic within React）

Mantine 不绑定任何特定的状态管理库、路由库、表单库或数据获取方案。它只依赖 React 本身。这意味着你可以将 Mantine 与 Redux、Zustand、React Router、TanStack Router、React Query、SWR 等任何你喜欢的工具组合使用。

这种"不可知论"的设计让 Mantine 可以适应任何技术栈，而不是强迫你按照某种特定的方式组织代码。

### 1.2.4 渐进式采用（Progressive Adoption）

Mantine 的设计允许你在现有项目中逐步引入，而不是一次性全部替换。你可以先在一个页面中使用 Mantine 的 Button 和 TextInput，然后逐步扩展到更多组件。Mantine 不会污染全局样式，也不会与你现有的 CSS 方案冲突。

---

## 1.3 Mantine 的模块化架构

### 1.3.1 核心包概览

Mantine 采用了高度模块化的包结构，每个包都有明确的职责边界：

| 包名 | 功能 | 典型场景 |
|------|------|----------|
| `@mantine/core` | 核心组件库 | Button、Input、Modal、Table、Grid 等基础组件 |
| `@mantine/hooks` | 通用 Hooks 集合 | useDisclosure、useLocalStorage、useDebouncedValue 等 |
| `@mantine/form` | 表单状态管理 | useForm、表单验证、Schema 集成 |
| `@mantine/dates` | 日期选择器 | DatePicker、DatePickerInput、Calendar |
| `@mantine/notifications` | 通知系统 | 成功/错误/警告/信息通知 |
| `@mantine/spotlight` | Spotlight 搜索 | 命令面板、快速搜索 |
| `@mantine/tiptap` | 富文本编辑器 | 基于 TipTap 的富文本编辑 |
| `@mantine/carousel` | 轮播组件 | 基于 Embla 的轮播/走马灯 |
| `@mantine/charts` | 图表组件 | 基于 Recharts 的面积图、条形图、饼图等 |
| `@mantine/code-highlight` | 代码高亮 | 代码块渲染与语法高亮 |
| `@mantine/dropzone` | 文件拖拽上传 | 拖拽/点击上传文件区域 |
| `@mantine/nprogress` | 进度条导航 | 页面切换时的顶部进度条 |

### 1.3.2 包的设计原则

Mantine 的每个包都遵循以下设计原则：

1. **独立可安装**：你可以只安装需要的包，不必引入整个生态
2. **零运行时依赖**（除核心包外）：每个包只依赖 `@mantine/core` 和 `@mantine/hooks`，不引入额外第三方依赖
3. **一致的 API 风格**：所有包遵循相同的 API 设计模式，一个包会用，其他包也会用
4. **完整的 TypeScript 支持**：每个包都提供完整的类型定义

### 1.3.3 @mantine/hooks 的独特价值

Mantine 的 hooks 集合是其最被低估的宝藏之一。它提供了 70+ 个经过生产验证的 React hooks，覆盖了以下场景：

- **状态管理**：`useDisclosure`（布尔值切换）、`useCounter`（计数器）、`useListState`（列表状态）、`useSetState`（Set 状态）
- **副作用管理**：`useDebouncedValue`（防抖值）、`useThrottledValue`（节流值）、`useDebouncedCallback`（防抖回调）
- **DOM 与交互**：`useClickOutside`（点击外部）、`useIntersection`（交叉观察）、`useScrollIntoView`（滚动到视图）、`useResizeObserver`（尺寸观察）
- **浏览器 API**：`useLocalStorage`（本地存储）、`useSessionStorage`（会话存储）、`useFullscreen`（全屏）、`useClipboard`（剪贴板）
- **设备检测**：`useMediaQuery`（媒体查询）、`useReducedMotion`（减少动效）、`useColorScheme`（色彩方案）
- **网络与数据**：`useFetch`（数据获取）、`useNetwork`（网络状态）

这些 hooks 都经过精心设计，API 简洁、类型安全、性能优化，可以减少你编写自定义 hooks 的频率。

---

## 1.4 可访问性（Accessibility）

### 1.4.1 为什么可访问性重要

在全球范围内，超过 10 亿人（约世界人口的 15%）有某种形式的残疾。这些用户依赖屏幕阅读器、键盘导航、高对比度模式等辅助技术来使用 Web 应用。可访问性不仅关乎道德和责任，在许多国家和地区（如美国的 ADA、欧洲的 EAA），它也是法律要求。

### 1.4.2 Mantine 的可访问性承诺

Mantine 对可访问性的承诺不是"附加功能"，而是**内置在每一个组件中的基本要求**。具体来说：

- **WAI-ARIA 合规**：每个组件都实现了正确的 ARIA 属性（role、aria-label、aria-describedby、aria-expanded、aria-selected 等）
- **键盘导航**：所有交互组件都支持完整的键盘操作（Tab、Enter、Space、Escape、Arrow Keys 等）
- **焦点管理**：弹窗、抽屉、下拉菜单等组件在打开/关闭时自动管理焦点
- **屏幕阅读器支持**：动态内容变化通过 `aria-live` 区域通知屏幕阅读器
- **色彩对比度**：默认主题颜色满足 WCAG AA 级对比度要求
- **减少动效**：尊重用户的 `prefers-reduced-motion` 设置

### 1.4.3 实际示例

```tsx
// Mantine 组件自动处理可访问性
import { Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

function AccessibleModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {/* 按钮自动有 role="button" 和键盘支持 */}
      <Button onClick={open}>打开弹窗</Button>

      {/* Modal 自动处理：
          - role="dialog"
          - aria-modal="true"
          - aria-labelledby 关联标题
          - 焦点自动锁定在 Modal 内
          - Escape 键关闭
          - 关闭后焦点回到触发按钮 */}
      <Modal
        opened={opened}
        onClose={close}
        title="用户信息"
      >
        <p>这是一个完全可访问的弹窗。</p>
      </Modal>
    </>
  );
}
```

---

## 1.5 暗色模式与 Color Scheme

### 1.5.1 内建暗色模式

Mantine 从设计之初就考虑了暗色模式支持。它的暗色模式不是简单的"反转颜色"，而是经过精心设计的色彩方案：

- 每个组件都有独立的亮色/暗色样式
- 暗色模式下的对比度经过优化，保证可读性
- 支持跟随系统偏好自动切换
- 支持在应用内手动切换，且切换状态可持久化

### 1.5.2 实现机制

Mantine 通过 `MantineProvider` 的 `defaultColorScheme` 和 `forceColorScheme` 属性来控制颜色方案，同时提供了 `useMantineColorScheme` hook 来读取和切换当前方案：

```tsx
import { MantineProvider, Button, useMantineColorScheme } from '@mantine/core';

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Button
      onClick={() =>
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
      }
    >
      切换到{colorScheme === 'dark' ? '亮色' : '暗色'}模式
    </Button>
  );
}

function App() {
  return (
    <MantineProvider defaultColorScheme="auto">
      <ThemeToggle />
    </MantineProvider>
  );
}
```

`defaultColorScheme="auto"` 会让 Mantine 自动检测系统的 `prefers-color-scheme` 媒体查询，这覆盖了大多数用户的需求。

---

## 1.6 Mantine v9 的重大革新

### 1.6.1 v9 的设计目标

Mantine v9 是一次重大的版本更新，其设计目标非常明确：

1. **拥抱 React 19**：充分利用 React 19 的新特性（Server Components、Actions、`use()` hook 等）
2. **简化 API**：移除冗余 props，合并相似功能，让 API 更加一致和直观
3. **提升 AI 协作体验**：使 API 设计更加适合 AI 工具生成代码
4. **性能优化**：减少不必要的重渲染，优化 bundle 体积
5. **Style Props 标准化**：引入统一的 Style Props 系统，让样式定制更加直观

### 1.6.2 主要变化

#### 组件合并与 API 简化

v9 中最显著的变化之一是组件的合并。例如：

- `TextInput`、`PasswordInput`、`Textarea` 等合并为统一的 `Input` 组件
- `Select` 和 `MultiSelect` 合并，通过 `multiple` prop 区分
- `Tabs` 重构，API 更接近原生 HTML 语义
- `AppShell` 重构，`AppShell.Section` 直接挂在 `AppShell` 上

#### Style Props 系统

v9 引入了全新的 Style Props 系统，允许你直接在组件上使用 CSS 属性作为 props：

```tsx
// v9 Style Props 示例
<Box
  bg="blue.1"
  p="md"
  m="lg"
  w={200}
  h={100}
  display="flex"
  style={{ alignItems: 'center', justifyContent: 'center' }}
>
  内容
</Box>
```

#### 更好的 TypeScript 支持

v9 的 TypeScript 类型推断更加精确，不再需要手动指定泛型参数：

```tsx
// v9 中类型自动推断
const form = useForm({
  initialValues: {
    name: '',
    age: 0,
  },
});

// form.values.name 自动推断为 string
// form.values.age 自动推断为 number
```

#### Server Components 兼容

Mantine v9 的组件被标记为 `'use client'`，但 Mantine 提供了更好的 Server Components 集成方案，包括：

- 将 MantineProvider 提取为独立的 Client Component
- 支持在 Server Component 中组合 Mantine 组件
- 提供 CSS 变量级别的服务端渲染支持

---

## 1.7 Mantine 与其他组件库的对比

### 1.7.1 Mantine vs MUI (Material-UI)

| 维度 | Mantine | MUI |
|------|---------|-----|
| 设计语言 | 中性、现代，不绑定特定设计规范 | 严格遵循 Material Design |
| 定制性 | 极高（Theme + Styles API + CSS 变量） | 中等（Theme 覆盖，但受 Material Design 约束） |
| 包大小 | 按需引入，tree-shaking 友好 | 较大，按需引入需额外配置 |
| Hooks | 70+ 内置 hooks | 无独立 hooks 包 |
| 表单 | `@mantine/form` 内置 | 需配合第三方库 |
| 通知/弹窗 | 内置系统 | 内置 |
| 图表 | `@mantine/charts` 内置 | 需第三方库 |
| 可访问性 | 优秀，默认内置 | 优秀，但部分组件需额外配置 |
| 社区规模 | 快速增长，27k+ GitHub Stars | 非常庞大，95k+ GitHub Stars |

### 1.7.2 Mantine vs Chakra UI

| 维度 | Mantine | Chakra UI |
|------|---------|-----------|
| 组件数量 | 100+ | 60+ |
| Hooks | 70+ | 20+ |
| 表单方案 | 内置 `@mantine/form` | 无内置方案 |
| 日期选择 | `@mantine/dates` 内置 | 需第三方库 |
| 富文本 | `@mantine/tiptap` 内置 | 需第三方库 |
| 图表 | `@mantine/charts` 内置 | 需第三方库 |
| 通知 | 内置 | 内置（Toast） |
| Style Props | 支持（v9 增强） | 核心特性 |
| 更新频率 | 活跃 | 较慢（v3 已筹备多时） |

### 1.7.3 Mantine vs shadcn/ui

| 维度 | Mantine | shadcn/ui |
|------|---------|-----------|
| 类型 | 传统 npm 包 | 复制源代码到项目中 |
| 定制性 | 通过 Theme 和 Styles API | 直接修改源码，无限定制 |
| 维护成本 | 低（升级包即可） | 高（需手动合并上游更新） |
| 组件数量 | 100+ | 50+ |
| Hooks | 70+ | 无独立 hooks 包 |
| 表单 | 内置 | 依赖 React Hook Form |
| 学习曲线 | 中等 | 较高（需理解 Radix UI 底层） |
| 适用场景 | 中小到大型项目 | 需要极致定制的项目 |

### 1.7.4 Mantine vs Ant Design

| 维度 | Mantine | Ant Design |
|------|---------|------------|
| 设计语言 | 中性、现代 | 企业级、严谨 |
| 国际化 | 基本支持 | 完善的多语言支持 |
| 组件数量 | 100+ | 150+ |
| 包大小 | 较小 | 较大 |
| 文档质量 | 优秀，交互式 Playground | 优秀，多语言 |
| 中国市场 | 社区较小 | 非常流行 |
| 表单方案 | 内置 `@mantine/form` | 内置 `Form` 组件 |
| 图表 | 轻量内置 | 需 `@ant-design/charts` |

### 1.7.5 选择 Mantine 的理由

综合来看，Mantine 最适合以下场景：

- 你需要一个**功能齐全的组件库**，不想在多个第三方库之间做选择
- 你重视**可访问性**，希望组件默认就符合 WCAG 标准
- 你需要**深度定制**组件外观，但不希望修改源码
- 你使用 **TypeScript**，希望获得一流的类型推断体验
- 你需要**暗色模式**支持，且希望自动跟随系统
- 你希望使用**现代 React 特性**（React 19、Server Components）
- 你希望有一个**活跃维护**、**文档完善**的组件库

---

## 1.8 快速上手：5 分钟搭建 Mantine 应用

### 1.8.1 安装

```bash
# 使用 npm
npm install @mantine/core @mantine/hooks @mantine/form

# 使用 yarn
yarn add @mantine/core @mantine/hooks @mantine/form

# 使用 pnpm
pnpm add @mantine/core @mantine/hooks @mantine/form
```

### 1.8.2 配置 MantineProvider

```tsx
// app/layout.tsx（或你的根布局文件）
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

### 1.8.3 编写第一个页面

```tsx
// app/page.tsx
import { Container, Title, Text, Button, Group } from '@mantine/core';

export default function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="md">
        欢迎来到 Mantine v9
      </Title>
      <Text c="dimmed" mb="xl">
        这是一个使用 Mantine v9 构建的现代化 React 应用。
      </Text>
      <Group>
        <Button variant="filled">开始使用</Button>
        <Button variant="outline">了解更多</Button>
      </Group>
    </Container>
  );
}
```

### 1.8.4 使用 hooks 增强交互

```tsx
import { useDisclosure, useCounter } from '@mantine/hooks';
import { Button, Modal, Text, Group, Stack } from '@mantine/core';

function CounterDemo() {
  const [opened, { open, close }] = useDisclosure(false);
  const [count, { increment, decrement }] = useCounter(0);

  return (
    <>
      <Group>
        <Button onClick={decrement}>-</Button>
        <Text fw={700}>{count}</Text>
        <Button onClick={increment}>+</Button>
      </Group>

      <Button onClick={open} mt="md">
        查看详情
      </Button>

      <Modal opened={opened} onClose={close} title="计数器详情">
        <Stack>
          <Text>当前计数：{count}</Text>
          <Text size="sm" c="dimmed">
            这是一个简单的计数器演示，展示了 Mantine hooks 和组件的组合使用。
          </Text>
        </Stack>
      </Modal>
    </>
  );
}
```

---

## 1.9 本章小结

本章我们深入探讨了 Mantine 的设计理念与哲学：

1. **Mantine 是什么**：一个完整的 React 应用开发工具包，不仅是组件库，更是构建现代 Web 应用的完整解决方案
2. **设计哲学**：组合优于配置、约定优于配置、框架不可知论、渐进式采用
3. **模块化架构**：12 个独立可安装的包，每个包职责明确、零额外依赖
4. **可访问性**：WAI-ARIA 合规、键盘导航、焦点管理、屏幕阅读器支持——内置在每一个组件中
5. **暗色模式**：精心设计的亮色/暗色双方案，支持系统偏好跟随
6. **v9 革新**：组件合并、Style Props 标准化、TypeScript 增强、Server Components 兼容
7. **横向对比**：与 MUI、Chakra UI、shadcn/ui、Ant Design 的详细对比
8. **快速上手**：5 分钟搭建 Mantine 应用

在下一章中，我们将深入 Mantine 最核心的系统之一——**Theme 主题系统**，学习如何通过 MantineProvider、主题对象、CSS 变量和 Styles API 来完全掌控应用的外观设计。