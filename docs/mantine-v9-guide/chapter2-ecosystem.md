# 第二章 Mantine v9 生态概览

理解了 Mantine 的设计哲学之后，下一步是了解它的生态系统。Mantine 并不是单一的一个 npm 包，而是由多个专注于不同场景的包组成的家族。正确选择需要的包，既能减少 bundle 体积，也能避免引入不必要的依赖。

本章将系统介绍 Mantine v9 的核心包、扩展包、peer dependencies 变化、与 React 19 的协作关系，以及如何在实际项目中进行包管理。

---

## 2.1 核心包与扩展包

Mantine 的包可以分为两大类：**核心包**（必须或几乎必须安装）和 **扩展包**（按需安装）。

### 2.1.1 核心包

| 包名 | 作用 | 是否必须 |
|---|---|---|
| `@mantine/core` | 所有 UI 组件 | 是 |
| `@mantine/hooks` | 通用 React Hooks | 强烈推荐 |
| `@mantine/form` | 表单状态管理与验证 | 按需 |
| `@mantine/styles` | 样式工具（通常不需要直接引入） | 一般否 |

`@mantine/core` 和 `@mantine/hooks` 是大多数项目的起点。`@mantine/form` 虽然 optional，但如果你需要构建表单，强烈建议使用，因为它与 Mantine 输入组件的集成非常自然。

### 2.1.2 扩展包

| 包名 | 作用 | 典型场景 |
|---|---|---|
| `@mantine/notifications` | 通知系统 | 全局消息提示、操作反馈 |
| `@mantine/modals` | 模态框管理 | 命令式打开确认框、提示框 |
| `@mantine/spotlight` | 命令面板 | Cmd+K 搜索、快速导航 |
| `@mantine/dates` | 日期选择组件 | 日期、日期范围、时间选择 |
| `@mantine/dropzone` | 文件拖放上传 | 图片、文档上传 |
| `@mantine/carousel` | 轮播组件 | 商品展示、图片轮播 |
| `@mantine/charts` | 图表组件 | 数据可视化 |
| `@mantine/tiptap` | 富文本编辑器 | 内容编辑、文章发布 |
| `@mantine/code-highlight` | 代码高亮 | 文档站点、代码展示 |
| `@mantine/schedule` | 日历调度（v9 新增） | 日程管理、预约系统 |

这些扩展包的设计遵循同一套 API 约定，学习曲线非常平缓。例如，`@mantine/notifications` 和 `@mantine/modals` 都使用类似的 "provider + hook" 模式。

---

## 2.2 安装与版本约束

### 2.2.1 安装核心包

```bash
# 使用 npm
npm install @mantine/core @mantine/hooks

# 使用 yarn
yarn add @mantine/core @mantine/hooks

# 使用 pnpm
pnpm add @mantine/core @mantine/hooks
```

### 2.2.2 安装表单包

```bash
npm install @mantine/form
```

### 2.2.3 安装日期包

日期包依赖 `dayjs`：

```bash
npm install @mantine/dates dayjs
```

### 2.2.4 v9 的 Peer Dependencies 变化

从 Mantine v9 开始，以下依赖版本被强制要求：

| 依赖 | 最低版本 | 说明 |
|---|---|---|
| React | 19.2+ | v9 利用 React 19 的新特性优化性能 |
| React DOM | 19.2+ | 与 React 版本保持一致 |
| Tiptap | 3+ | 仅 `@mantine/tiptap` 需要 |
| Recharts | 3+ | 仅 `@mantine/charts` 需要 |

如果你的项目还在使用 React 18，需要先升级到 React 19.2 或更高版本，才能使用 Mantine v9。

---

## 2.3 与 React 19 的协作

React 19 为组件库带来了新的可能性，Mantine v9 充分利用了这些特性。

### 2.3.1 Actions 与表单

React 19 的 Actions 允许函数作为 `action` 属性的值，自动处理 pending 状态。Mantine v9 的 Button 组件可以无缝配合 Actions：

```jsx
import { Button } from "@mantine/core";

function SubmitButton() {
  return (
    <Button type="submit" variant="filled">
      提交
    </Button>
  );
}
```

在 React 19 中，配合 `useActionState` 等 Hook，可以更方便地管理表单提交状态。

### 2.3.2 Style Hoisting

React 19 的 style hoisting 允许样式在构建时被提取，减少客户端运行时开销。Mantine v9 的 CSS 变量架构与这一特性天然契合，因为组件样式大量依赖 CSS 变量而非运行时生成的类名。

### 2.3.3 use API

React 19 引入了新的 `use` API，用于读取 Promise 或 Context。Mantine v9 的内部实现可以利用这一特性优化上下文读取，但普通开发者通常不需要直接操作。

---

## 2.4 `@mantine/schedule`：v9 的明星新包

`@mantine/schedule` 是 Mantine v9 新增的企业级日历调度组件套件。它的出现填补了 Mantine 在 "日历" 这一复杂场景上的空白。

### 2.4.1 主要组件

| 组件 | 作用 |
|---|---|
| `Schedule` | 统一容器，整合所有视图 |
| `WeekView` | 周视图 |
| `DayView` | 日视图 |
| `MonthView` | 月视图 |
| `ScheduleEvent` | 事件渲染 |

### 2.4.2 基础示例

```jsx
import { useState } from "react";
import dayjs from "dayjs";
import { Schedule } from "@mantine/schedule";

const initialEvents = [
  {
    id: "1",
    title: "团队周会",
    start: dayjs().hour(10).minute(0).toDate(),
    end: dayjs().hour(11).minute(0).toDate(),
  },
];

function CalendarDemo() {
  const [events, setEvents] = useState(initialEvents);

  return (
    <Schedule
      events={events}
      onEventUpdate={(event) =>
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? event : e))
        )
      }
    />
  );
}
```

这个包对于需要日程管理、会议室预约、课程表等场景的项目非常有价值。

---

## 2.5 包体积与 Tree Shaking

Mantine 的所有包都支持 Tree Shaking。这意味着即使你安装了整个 `@mantine/core`，最终打包时只会包含实际使用到的组件。

### 2.5.1 推荐导入方式

```jsx
// ✅ 推荐：按组件导入
import { Button, TextInput } from "@mantine/core";

// ❌ 避免：通配导入（可能破坏 Tree Shaking）
import * as Mantine from "@mantine/core";
```

### 2.5.2 Bundle 体积参考

以典型项目为例：

| 包 | gzip 后大致体积 |
|---|---|
| `@mantine/core`（常用 20 个组件） | ~60-90 KB |
| `@mantine/hooks`（常用 10 个 hooks） | ~15-25 KB |
| `@mantine/form` | ~8 KB |
| `@mantine/dates` | ~25 KB |

这些体积在同类组件库中处于中等偏优水平，且随着 Tree Shaking 的使用会进一步降低。

---

## 2.6 项目结构建议

一个使用 Mantine v9 的典型项目结构如下：

```
my-app/
├── app/
│   ├── layout.js          # 根布局，挂载 MantineProvider
│   ├── page.js            # 首页
│   └── components/        # 业务组件
├── components/
│   └── ui/                # 基于 Mantine 封装的通用组件
├── theme.js               # createTheme 配置
├── package.json
└── next.config.js
```

### 2.6.1 根布局示例

```jsx
// app/layout.js
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

### 2.6.2 主题文件拆分

当主题配置较大时，建议拆分到单独文件：

```js
// theme.js
import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 8 },
  defaultRadius: "md",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
});
```

```jsx
// app/layout.js
import { MantineProvider } from "@mantine/core";
import { theme } from "@/theme";
import "@mantine/core/styles.css";

export default function RootLayout({ children }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
```

---

## 2.7 本章小结

本章介绍了 Mantine v9 的完整生态：

1. **核心包** `@mantine/core`、`@mantine/hooks`、`@mantine/form` 是大多数项目的起点；
2. **扩展包** 覆盖通知、模态框、命令面板、日期、图表、富文本、日历调度等场景；
3. **v9 要求 React 19.2+**，并针对 React 19 的新特性进行了优化；
4. **`@mantine/schedule`** 是 v9 新增的日历调度套件，标志着 Mantine 进入更复杂的应用场景；
5. **Tree Shaking 友好**，按组件导入可获得最佳 bundle 体积。

下一章将进入本书的核心主题之一：Mantine 的 Theme 系统。
