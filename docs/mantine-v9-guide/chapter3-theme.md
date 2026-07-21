# 第三章 Mantine Theme 系统深度解析

Theme（主题）是 Mantine 的骨架。它决定了应用中的颜色、字体、间距、圆角、阴影等所有视觉基调。理解 Theme 系统，不仅能帮助你快速统一应用风格，还能让你在需要时进行深度定制。

本章将从 theme 对象的结构出发，逐步讲解 `createTheme`、颜色系统、`primaryColor` 与 `primaryShade`、CSS 变量、暗色模式、Styles API、组件级变量覆盖，以及实际项目中的主题管理策略。

---

## 3.1 theme 对象是什么

在 Mantine 中，theme 是一个普通的 JavaScript 对象，其中存储了应用的所有设计 Token。这些 Token 包括但不限于：

- 颜色（colors）
- 主色（primaryColor）与主色深浅（primaryShade）
- 字体（fontFamily、headings.fontFamily）
- 间距（spacing）
- 圆角（radius）
- 阴影（shadows）
- 断点（breakpoints）
- 焦点环策略（focusRing）
- 默认半径（defaultRadius）
- 缩放比例（scale）

Mantine 将这些 Token 转换为 CSS 变量，注入到页面中。组件在渲染时引用这些 CSS 变量，而不是硬编码的色值，因此换肤、暗色模式、主题定制都变得非常自然。

### 3.1.1 theme 对象的核心字段

```ts
interface MantineTheme {
  focusRing: "auto" | "always" | "never";
  scale: number;
  fontSmoothing: boolean;
  white: string;
  black: string;
  colors: MantineThemeColors;
  primaryShade: MantinePrimaryShade;
  primaryColor: string;
  variantColorResolver: VariantColorsResolver;
  radius: MantineThemeRadius;
  defaultRadius: MantineRadius;
  spacing: MantineThemeSpacing;
  fontFamily: string;
  fontFamilyMonospace: string;
  headings: MantineThemeHeadings;
  shadows: MantineThemeShadows;
  breakpoints: MantineThemeBreakpoints;
  cursorType: "default" | "pointer";
  defaultGradient: MantineGradient;
  components: MantineThemeComponents;
  other: Record<string, any>;
  activeClassName: string;
}
```

不需要记住所有字段，后续会逐一讲解最常用的部分。

---

## 3.2 createTheme：创建自定义主题

`createTheme` 是 Mantine 提供的主题创建函数。它的作用有两个：

1. 对传入的对象进行类型推断和校验；
2. 将自定义主题与 Mantine 默认主题进行深度合并。

### 3.2.1 基础用法

```jsx
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  // 主色调改为靛蓝色
  primaryColor: "indigo",
  // 标题字体加粗
  headings: { fontWeight: "800" },
  // 默认圆角加大
  defaultRadius: "lg",
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <YourApp />
    </MantineProvider>
  );
}
```

### 3.2.2 为什么要用 createTheme

理论上你也可以直接写一个普通对象传给 `MantineProvider`，但 `createTheme` 有以下优势：

- **类型安全**：TypeScript 会提示你哪些字段是合法的。
- **默认值合并**：你只需要覆盖想改的字段，其余字段保持 Mantine 默认值。
- **自动补全**：IDE 可以提供字段补全。

```jsx
// ❌ 不推荐：直接写对象，失去类型保护
<MantineProvider theme={{ primaryColor: "indigo" }}>

// ✅ 推荐：使用 createTheme
const theme = createTheme({ primaryColor: "indigo" });
<MantineProvider theme={theme}>
```

---

## 3.3 颜色系统

Mantine 的颜色系统是其主题系统中最重要、最强大的部分之一。

### 3.3.1 默认调色板

Mantine 默认提供 18 个命名颜色：

`dark`、`gray`、`red`、`pink`、`grape`、`violet`、`indigo`、`blue`、`cyan`、`teal`、`green`、`lime`、`yellow`、`orange`。

每个颜色都是一个包含 10 个色阶的数组，从浅到深排列：

```ts
const blue = [
  "#e7f5ff", // 0
  "#d0ebff", // 1
  "#a5d8ff", // 2
  "#74c0fc", // 3
  "#4dabf7", // 4
  "#339af0", // 5
  "#228be6", // 6
  "#1c7ed6", // 7
  "#1971c2", // 8
  "#1864ab", // 9
];
```

### 3.3.2 使用颜色

组件通过 `color` prop 引用主题中的颜色：

```jsx
import { Button, Badge, ThemeIcon } from "@mantine/core";

function ColorDemo() {
  return (
    <>
      <Button color="blue">蓝色按钮</Button>
      <Button color="red">红色按钮</Button>
      <Badge color="green">成功</Badge>
      <ThemeIcon color="violet" variant="light">
        ✓
      </ThemeIcon>
    </>
  );
}
```

### 3.3.3 自定义颜色

你可以通过 `createTheme` 覆盖或新增颜色：

```jsx
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  colors: {
    // 覆盖现有颜色
    blue: [
      "#eef7ff",
      "#d9edff",
      "#b4daff",
      "#8ac4ff",
      "#5ea8ff",
      "#3685ff",
      "#1a66f2",
      "#1552c4",
      "#12439f",
      "#0f3680",
    ],
    // 新增品牌色
    brand: [
      "#fff5f5",
      "#ffe3e3",
      "#ffc9c9",
      "#ffa8a8",
      "#ff8787",
      "#ff6b6b",
      "#fa5252",
      "#f03e3e",
      "#e03131",
      "#c92a2a",
    ],
  },
});
```

新增颜色后，可以像默认颜色一样使用：

```jsx
<Button color="brand">品牌色按钮</Button>
```

### 3.3.4 primaryColor 与 primaryShade

`primaryColor` 指定应用的主色调，所有未明确指定 `color` 的组件都会使用它。

```jsx
const theme = createTheme({
  primaryColor: "indigo",
});
```

`primaryShade` 指定主色调使用哪个色阶。不同场景下，较浅或较深的色阶可能更合适。

```jsx
const theme = createTheme({
  primaryColor: "blue",
  // 浅色模式用 shade 6，暗色模式用 shade 8
  primaryShade: { light: 6, dark: 8 },
});
```

如果不指定 `primaryShade`，默认值为 `{ light: 6, dark: 8 }`。

---

## 3.4 字体与排版

### 3.4.1 全局字体

通过 `fontFamily` 字段设置全局字体：

```jsx
const theme = createTheme({
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
});
```

### 3.4.2 标题字体

标题可以使用与正文不同的字体：

```jsx
const theme = createTheme({
  headings: {
    fontFamily: "'Georgia', serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.5rem", lineHeight: "1.2" },
      h2: { fontSize: "2rem", lineHeight: "1.3" },
    },
  },
});
```

### 3.4.3 等宽字体

代码块、内联代码默认使用 `fontFamilyMonospace`：

```jsx
const theme = createTheme({
  fontFamilyMonospace: "'Fira Code', 'Consolas', monospace",
});
```

---

## 3.5 间距、圆角与阴影

### 3.5.1 间距系统

Mantine 的 `spacing` 是一组基于 rem 的数值，默认从 `xs` 到 `xl`，以及数字 0-9：

```ts
const spacing = {
  xs: "0.625rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  // ...
};
```

组件的 `p`、`m`、`gap` 等 props 可以直接使用这些 Token：

```jsx
<Box p="md" m="lg">
  内容
</Box>
```

### 3.5.2 圆角系统

`radius` 也是一组 Token：

```ts
const radius = {
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
  xl: "2rem",
};
```

组件的 `radius` prop 接受这些 Token：

```jsx
<Button radius="xl">大圆角按钮</Button>
<Button radius="sm">小圆角按钮</Button>
```

`defaultRadius` 是全局默认圆角：

```jsx
const theme = createTheme({
  defaultRadius: "md",
});
```

### 3.5.3 阴影系统

```jsx
<Paper shadow="sm">小阴影</Paper>
<Paper shadow="xl">大阴影</Paper>
```

可以通过 `theme.shadows` 自定义阴影：

```jsx
const theme = createTheme({
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 2px 4px rgba(0,0,0,0.05)",
    md: "0 4px 8px rgba(0,0,0,0.1)",
    lg: "0 8px 16px rgba(0,0,0,0.1)",
    xl: "0 16px 32px rgba(0,0,0,0.15)",
  },
});
```

---

## 3.6 CSS 变量：主题系统的底层机制

Mantine v7+ 使用 CSS 变量（CSS Custom Properties）作为主题系统的底层机制。理解这一点，对于进行高级定制非常重要。

### 3.6.1 Mantine 自动生成的 CSS 变量

当应用挂载 `MantineProvider` 后，Mantine 会在 `:root` 或对应选择器下注入一组 CSS 变量，例如：

```css
:root {
  --mantine-color-blue-0: #e7f5ff;
  --mantine-color-blue-1: #d0ebff;
  /* ... */
  --mantine-color-blue-filled: var(--mantine-color-blue-6);
  --mantine-color-blue-filled-hover: var(--mantine-color-blue-7);
  --mantine-color-blue-light: rgba(34, 139, 230, 0.1);
  --mantine-color-blue-light-hover: rgba(34, 139, 230, 0.12);
  --mantine-color-blue-text: var(--mantine-color-blue-filled);
  --mantine-color-body: #ffffff;
  --mantine-color-text: #212529;
  --mantine-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  --mantine-spacing-md: 1rem;
  --mantine-radius-md: 0.5rem;
  --mantine-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* ... */
}
```

### 3.6.2 在自定义样式中使用 CSS 变量

你可以在普通 CSS 中直接使用这些变量：

```css
/* styles.module.css */
.myCard {
  background-color: var(--mantine-color-body);
  color: var(--mantine-color-text);
  padding: var(--mantine-spacing-md);
  border-radius: var(--mantine-radius-lg);
  box-shadow: var(--mantine-shadow-sm);
}
```

### 3.6.3 暗色模式下的变量变化

切换到暗色模式时，Mantine 会修改变量值，组件无需重新渲染即可更新样式：

```css
[data-mantine-color-scheme="dark"] {
  --mantine-color-body: #1a1b1e;
  --mantine-color-text: #c1c2c5;
  /* ... */
}
```

这种基于 CSS 变量的方案比传统的 CSS-in-JS 运行时更高效，尤其是在 SSR/SSG 场景下。

---

## 3.7 Styles API：组件级样式定制

当全局主题无法满足需求时，可以使用 Styles API 对单个组件实例进行样式覆盖。Mantine 提供三种方式：`classNames`、`styles`、`vars`。

### 3.7.1 classNames

`classNames` 允许你为组件内部的特定元素添加类名。每个组件都有一组可定制的内部元素名称。

以 `Button` 为例：

```jsx
import { Button } from "@mantine/core";
import classes from "./Demo.module.css";

function Demo() {
  return (
    <Button
      classNames={{
        root: classes.root,
        label: classes.label,
        inner: classes.inner,
      }}
    >
      自定义样式按钮
    </Button>
  );
}
```

```css
/* Demo.module.css */
.root {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.label {
  color: white;
  font-weight: 700;
}
```

### 3.7.2 styles

`styles` 允许你直接传入 CSS 属性对象，适合简单的内联覆盖：

```jsx
<Button
  styles={{
    root: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "none",
    },
    label: { color: "white", fontWeight: 700 },
  }}
>
  渐变按钮
</Button>
```

### 3.7.3 vars

`vars` 允许你覆盖组件使用的 CSS 变量，实现更细粒度的控制：

```jsx
<Button
  vars={{
    root: {
      "--button-height": "48px",
      "--button-padding-x": "24px",
    },
  }}
>
  大号按钮
</Button>
```

### 3.7.4 三种方式的适用场景

| 方式 | 优点 | 缺点 | 适用场景 |
|---|---|---|---|
| `classNames` | 可复用、性能好、支持媒体查询 | 需要额外 CSS 文件 | 需要复用的复杂样式 |
| `styles` | 快速、无需额外文件 | 内联样式，不易复用 | 一次性简单覆盖 |
| `vars` | 直接修改组件内部变量 | 需要知道变量名 | 调整尺寸、间距等设计 Token |

---

## 3.8 通过 theme.components 修改默认组件

除了实例级覆盖，你还可以在全局主题中修改某类组件的默认行为。

```jsx
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        variant: "light",
        radius: "md",
      },
      styles: {
        root: {
          textTransform: "uppercase",
        },
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
```

这样设置后，应用中所有 `Button` 默认使用 `variant="light"` 和 `radius="md"`，无需在每个按钮上重复指定。

---

## 3.9 暗色模式最佳实践

### 3.9.1 使用 CSS 变量而非条件渲染

在暗色模式下，优先使用 CSS 变量切换样式，而不是在组件中根据 `colorScheme` 做条件渲染：

```css
/* ✅ 推荐：变量自动切换 */
.myBox {
  background: var(--mantine-color-body);
  color: var(--mantine-color-text);
}

/* ❌ 不推荐：增加渲染复杂度 */
```

### 3.9.2 自定义暗色模式颜色

如果需要为暗色模式单独调整某个颜色，可以在 `colors` 中使用函数形式：

```jsx
const theme = createTheme({
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
});
```

### 3.9.3 持久化用户主题偏好

可以使用 `localStorage` 或 cookie 保存用户的主题选择，避免每次刷新后重置：

```jsx
import { MantineProvider } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";

function App() {
  const preferredColorScheme = useColorScheme();

  return (
    <MantineProvider
      defaultColorScheme={preferredColorScheme}
      // 后续切换会自动保存到 localStorage
    >
      <YourApp />
    </MantineProvider>
  );
}
```

---

## 3.10 实战：打造一套企业级主题

下面是一个完整的企业级主题配置示例：

```jsx
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "blue",
  primaryShade: { light: 6, dark: 8 },
  defaultRadius: "md",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: "700",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
    },
  },
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <YourApp />
    </MantineProvider>
  );
}
```

这个主题配置：

- 使用蓝色作为主色，符合大多数企业应用审美；
- 统一的 `md` 圆角，保持界面一致性；
- 系统字体栈，加载速度快；
- 为 Button、TextInput、Card 设置了合理的默认 props。

---

## 3.11 本章小结

本章深入讲解了 Mantine 的 Theme 系统：

1. **theme 对象** 是存储所有设计 Token 的中心；
2. **`createTheme`** 用于创建类型安全、可合并的自定义主题；
3. **颜色系统** 包含默认调色板、自定义颜色、`primaryColor` 和 `primaryShade`；
4. **CSS 变量** 是 Mantine 主题系统的底层机制，支持高效的暗色模式切换；
5. **Styles API**（`classNames`、`styles`、`vars`）提供组件级样式定制能力；
6. **`theme.components`** 可以修改某类组件的默认 props 和样式。

掌握 Theme 系统后，你就可以为应用打造统一、可维护、可扩展的视觉语言。下一章将进入本书的另一个核心主题：Mantine Form 表单验证。
