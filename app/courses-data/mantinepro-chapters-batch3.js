// =============================================================
// Mantine v9 深度实战 —— 第 3 批章节（Theme 定制 + Styles API）
// -------------------------------------------------------------
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "mantinepro-theme-tokens",
    icon: "🔧",
    title: "设计 Token 详解",
    group: "二、Mantine Theme 系统",
    content: `# 设计 Token 详解

## 一、字体配置

### 1.1 fontFamily

设置全局字体族：

\`\`\`jsx
const theme = createTheme({
  // 主字体：按优先级排列，系统字体栈兼容性最好
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  // 等宽字体：用于代码块等
  fontFamilyMonospace:
    'Monaco, "Cascadia Mono", "Roboto Mono", monospace',
});
\`\`\`

### 1.2 headings

配置标题（h1-h6）的字体、字重和大小：

\`\`\`jsx
const theme = createTheme({
  headings: {
    fontFamily: 'Georgia, serif', // 标题使用衬线字体
    fontWeight: '700',
    textWrap: 'balance', // 标题文字平衡换行
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', lineHeight: '1.4' },
      h4: { fontSize: '1.25rem', lineHeight: '1.5' },
      h5: { fontSize: '1.1rem', lineHeight: '1.5' },
      h6: { fontSize: '1rem', lineHeight: '1.5' },
    },
  },
});
\`\`\`

默认标题大小：h1=34px, h2=26px, h3=22px, h4=18px, h5=16px, h6=14px。

---

## 二、字体大小、行高、字重

### 2.1 fontSizes

\`\`\`jsx
const theme = createTheme({
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px（默认正文）
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
  },
});
\`\`\`

### 2.2 fontWeights

\`\`\`jsx
const theme = createTheme({
  fontWeights: {
    regular: 400,
    medium: 600,  // ⚠️ v9 中从 500 改为 600
    bold: 700,
  },
});
\`\`\`

> **v9 变更**：fontWeights.medium 从 v8 的 500 改为 600，更符合现代设计趋势。

---

## 三、间距（spacing）

spacing 控制所有 margin/padding 的值：

\`\`\`jsx
const theme = createTheme({
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.25rem',  // 20px
    xl: '2rem',     // 32px
  },
});
\`\`\`

Style Props 中的 m、p、mt、px 等都引用这些值：

\`\`\`jsx
// <Box mt="md" p="lg"> 等价于
// margin-top: 1rem; padding: 1.25rem;
<Box mt="md" p="lg">
  内容
</Box>
\`\`\`

---

## 四、圆角（radius）

\`\`\`jsx
const theme = createTheme({
  defaultRadius: 'md', // 默认圆角
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '32px',
  },
});
\`\`\`

设置为 0 可以实现直角设计：

\`\`\`jsx
const theme = createTheme({
  defaultRadius: 0, // 全局直角
});
\`\`\`

---

## 五、阴影（shadows）

\`\`\`jsx
const theme = createTheme({
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
  },
});
\`\`\`

---

## 六、响应式断点（breakpoints）

Mantine 使用 em 单位定义断点：

\`\`\`jsx
const theme = createTheme({
  breakpoints: {
    xs: '36em',  // 576px
    sm: '48em',  // 768px
    md: '62em',  // 992px
    lg: '75em',  // 1200px
    xl: '88em',  // 1408px
  },
});
\`\`\`

使用 hiddenFrom/visibleFrom 控制响应式显隐：

\`\`\`jsx
import { Box, Button } from '@mantine/core';

function ResponsiveDemo() {
  return (
    <Box>
      {/* 在 sm 断点（768px）以下隐藏 */}
      <Button hiddenFrom="sm">仅大屏幕显示</Button>
      {/* 在 md 断点（992px）以上隐藏 */}
      <Button visibleFrom="md">仅小屏幕显示</Button>
      {/* 亮色模式隐藏 */}
      <Box lightHidden>暗色模式内容</Box>
      {/* 暗色模式隐藏 */}
      <Box darkHidden>亮色模式内容</Box>
    </Box>
  );
}
\`\`\`

响应式 Style Props：

\`\`\`jsx
<Box
  mt={{ base: 10, sm: 20, lg: 30 }}
  p={{ base: 'sm', md: 'md', lg: 'lg' }}
>
  不同断点不同间距
</Box>
\`\`\`

---

## 七、其他主题配置

### 7.1 cursorType

\`\`\`jsx
const theme = createTheme({
  cursorType: 'pointer', // 交互元素显示手型光标（默认 'default'）
});
\`\`\`

### 7.2 respectReducedMotion

\`\`\`jsx
const theme = createTheme({
  respectReducedMotion: true, // 尊重用户"减少动画"偏好
});
\`\`\`

### 7.3 other：自定义 token

\`other\` 属性存储任意自定义设计 token：

\`\`\`jsx
const theme = createTheme({
  other: {
    sidebarWidth: 260,
    headerHeight: 64,
    brandColor: '#1a365d',
    maxContentWidth: 1200,
  },
});

// 在组件中使用
function App() {
  const theme = useMantineTheme();
  return (
    <Box style={{ maxWidth: theme.other.maxContentWidth }}>
      内容
    </Box>
  );
}
\`\`\`

---

## 本章小结

- fontFamily/fontFamilyMonospace/headings 控制字体
- fontSizes/fontWeights/lineHeights 控制文字排版
- spacing 控制间距，radius 控制圆角，shadows 控制阴影
- breakpoints 定义响应式断点，配合 hiddenFrom/visibleFrom 使用
- other 属性可以存储任意自定义 token
- 所有 token 都通过 CSS 变量暴露，可以在 CSS 中使用

下一章我们深入 Styles API——Mantine 最强大的样式定制能力。`,
  },
  {
    id: "mantinepro-styles-api",
    icon: "🎛️",
    title: "Styles API：组件级样式定制",
    group: "二、Mantine Theme 系统",
    content: `# Styles API：组件级样式定制

## 一、什么是 Styles API

Styles API 是 Mantine 提供的**组件内部元素样式定制系统**。每个组件由多个内部元素组成（比如 Button 包含 root、label、loader、section 等），Styles API 让你可以精确地自定义其中任何一个元素的样式。

### Button 组件的内部元素

以 Button 为例，它有以下可定制元素：

| Selector | 静态类名 | 说明 |
|----------|---------|------|
| root | .mantine-Button-root | 根元素（button/a） |
| loader | .mantine-Button-loader | 加载中状态的 loader |
| inner | .mantine-Button-inner | 包含 label 和 section 的容器 |
| section | .mantine-Button-section | 左/右图标 section |
| label | .mantine-Button-label | 按钮文字 |

---

## 二、四种样式定制方式

### 2.1 classNames prop：添加 CSS 类名

\`\`\`jsx
import { Button } from '@mantine/core';
import classes from './MyButton.module.css';

<Button
  classNames={{
    root: classes.myButtonRoot,
    label: classes.myButtonLabel,
  }}
>
  自定义按钮
</Button>;
\`\`\`

### 2.2 styles prop：内联样式

\`\`\`jsx
<Button
  styles={{
    root: { backgroundColor: 'red', borderRadius: '50px' },
    label: { fontSize: 18, fontWeight: 700 },
    inner: { gap: 12 },
  }}
>
  自定义按钮
</Button>
\`\`\`

> 注意：内联样式优先级高于 classNames，但不支持 :hover、@media 等伪类和媒体查询。推荐优先使用 classNames。

### 2.3 基于 props 的动态样式

classNames 和 styles 支持回调函数，可以根据组件 props 动态返回样式：

\`\`\`jsx
import cx from 'clsx';
import { TextInput, createTheme } from '@mantine/core';
import classes from './CustomInput.module.css';

const theme = createTheme({
  components: {
    TextInput: TextInput.extend({
      classNames: (_theme, props) => ({
        // 当字段必填时，label 添加 required 样式
        label: cx({ [classes.labelRequired]: props.required }),
        // 当有错误时，input 添加 error 样式
        input: cx({ [classes.inputError]: props.error }),
      }),
    }),
  },
});
\`\`\`

### 2.4 vars prop：CSS 变量覆盖

vars 是通过 CSS 变量改变组件的核心属性，是最灵活的定制方式：

\`\`\`jsx
import { Button, createTheme } from '@mantine/core';

const theme = createTheme({
  components: {
    Button: Button.extend({
      vars: (theme, props) => {
        // 自定义超大按钮尺寸
        if (props.size === 'xxl') {
          return {
            root: {
              '--button-height': '64px',
              '--button-padding-x': '32px',
              '--button-fz': '20px',
              '--button-radius': '32px',
            },
          };
        }
        return { root: {} };
      },
    }),
  },
});

// 使用自定义尺寸
<Button size="xxl">超大按钮</Button>;
\`\`\`

---

## 三、在主题中全局覆盖

使用 \`Component.extend()\` 在主题中全局设置组件默认 props 和样式：

\`\`\`jsx
import {
  createTheme,
  Button,
  TextInput,
  Card,
  Table,
  PasswordInput,
} from '@mantine/core';

const theme = createTheme({
  components: {
    // 全局设置 Button 样式
    Button: Button.extend({
      defaultProps: {
        radius: 'xl', // 胶囊圆角
        size: 'md',
        fw: 500,
      },
    }),

    // 全局设置 TextInput 样式
    TextInput: TextInput.extend({
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          height: '48px',
          borderWidth: '2px',
        },
        label: {
          fontSize: '14px',
          fontWeight: 600,
        },
      },
    }),

    // 全局设置 Card 样式
    Card: Card.extend({
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        shadow: 'sm',
      },
    }),

    // 全局设置 Table 样式
    Table: {
      defaultProps: {
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
        highlightOnHover: true,
        striped: true,
      },
    },
  },
});
\`\`\`

---

## 四、withProps：创建组件变体

\`withProps\` 创建预设了默认 props 的组件变体：

\`\`\`jsx
import { Button, TextInput } from '@mantine/core';

// 创建一个链接按钮变体
const LinkButton = Button.withProps({
  component: 'a',
  variant: 'subtle',
  target: '_blank',
  rel: 'noreferrer',
});

// 创建手机号输入框变体
const PhoneInput = TextInput.withProps({
  label: '手机号',
  placeholder: '请输入手机号',
  inputMode: 'tel',
  maxLength: 11,
});

// 使用
<LinkButton href="https://mantine.dev">打开文档</LinkButton>
<PhoneInput />;
\`\`\`

---

## 五、静态类名

每个组件都有 \`.mantine-{ComponentName}-{selector}\` 格式的静态类名，可以直接在全局 CSS 中覆盖：

\`\`\`css
/* 全局修改所有 Button 样式 */
.mantine-Button-root {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 全局修改所有 TextInput 的 label */
.mantine-TextInput-label {
  font-size: 13px;
  color: var(--mantine-color-dimmed);
}
\`\`\`

类名前缀可以通过 \`classNamesPrefix\` 修改：

\`\`\`jsx
<MantineProvider classNamesPrefix="myapp">
  {/* 类名变为 .myapp-Button-root */}
</MantineProvider>
\`\`\`

---

## 六、实战：企业主题定制

让我们看一个完整的企业级主题定制示例：

\`\`\`jsx
import { createTheme, Button, TextInput, Card, Table } from '@mantine/core';

const BRAND_BLUE = '#1a56db';

export const corporateTheme = createTheme({
  // ===== 颜色 =====
  colors: {
    brand: [
      '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
      '#3b82f6', BRAND_BLUE, '#1e40af', '#1e3a8a', '#172554',
    ],
  },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,

  // ===== 字体 =====
  fontFamily: '"Inter", -apple-system, sans-serif',
  headings: { fontFamily: '"Inter", -apple-system, sans-serif', fontWeight: '700' },

  // ===== 间距和圆角 =====
  defaultRadius: '8px',
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },

  // ===== 组件覆盖 =====
  components: {
    Button: Button.extend({
      defaultProps: { radius: '8px', fw: 500 },
      styles: { root: { height: '44px', transition: 'all 0.15s ease' } },
    }),
    TextInput: TextInput.extend({
      defaultProps: { radius: '8px' },
      styles: { input: { height: '44px' } },
    }),
    Card: Card.extend({
      defaultProps: { padding: '24px', radius: '12px', shadow: '0 1px 3px rgba(0,0,0,0.08)' },
    }),
  },
});
\`\`\`

---

## 本章小结

- Styles API 让你精确控制组件内部每个元素的样式
- classNames 添加 CSS 类，styles 添加内联样式，vars 通过 CSS 变量改变核心属性
- Component.extend() 在主题中全局覆盖组件的默认 props 和样式
- withProps 创建预设默认 props 的组件变体
- 静态类名可以直接在全局 CSS 中覆盖
- 实际项目中，建议在主题中统一配置组件默认样式

Theme 系统我们已经学完了，接下来进入 Mantine 的另一个核心：Form 表单验证。`,
  },
];
