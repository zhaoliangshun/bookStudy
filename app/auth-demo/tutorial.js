"use client";

// =============================================================
// 文件：app/auth-demo/tutorial.js
// -------------------------------------------------------------
// 【职责】
//   /auth-demo/tutorial 子路由教程页面。用 MarkdownRenderer 渲染
//   一篇超长的认证实战教程（10 章），覆盖 ForgeRock JavaScript SDK、
//   Zod v4 数据校验、Mantine v9 表单实战、登录/注册/OTP/密码管理/
//   安全问题/会话管理/项目架构。最后用 CodeBlock 展示一份完整的
//   登录流程示例代码。
//
// 【组件类型】
//   "use client" 客户端组件：因为 CodeBlock 内部使用了 Monaco 编辑器
//   （动态加载、依赖浏览器），整个组件树必须在客户端渲染。
// =============================================================

import { useState } from "react";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { CodeBlock } from "../CodeBlock";

// ============================================================
// 教程正文（Markdown）
// ------------------------------------------------------------
// 用模板字符串承载一篇长 Markdown。代码围栏里的反引号需转义为 \`。
// MarkdownRenderer 支持的语法：标题、列表、引用、表格、代码块、
// 行内代码、加粗、段落。
// ============================================================
const tutorialContent = `# ForgeRock 认证实战教程

本教程配套 \`/auth-demo\` 路由的完整认证 Demo，从 ForgeRock JavaScript SDK 的核心概念出发，结合 Zod v4 数据校验与 Mantine v9 表单组件库，手把手带你实现一套生产级的登录、注册、OTP 验证、密码管理、安全问题、会话管理流程。教程共十章，每章都包含**概念讲解 + 代码示例 + 关键点说明**，内容尽量详尽，方便你逐章对照源码学习。

> 测试账号：\`demo\` / \`Demo1234\`，登录后 OTP 任意 6 位数字均可通过（验证码会打印到浏览器控制台）。

---

## 第一章：ForgeRock JavaScript SDK 基础

### 1.1 SDK 是什么、为什么用它

ForgeRock JavaScript SDK（npm 包名 \`@forgerock/javascript-sdk\`）是 ForgeRock 身份平台（IGA / IAM）官方提供的浏览器端 SDK。它的核心价值在于**把认证流程抽象成「认证树（Authentication Tree）」**，前端不需要为每一种认证场景写死一套逻辑，而是通过一套统一的「提交回调 → 接收下一步」循环来驱动任意复杂的认证流。

为什么用它而不是自己写一个 \`/login\` 接口：

- **认证树可配置**：安全团队在 ForgeRock AM（Access Management）后台拖拽节点编排认证树（用户名密码、OTP、设备指纹、风险评分……），前端代码无需改动即可适配新流程。
- **回调协议标准化**：每一步要收集什么输入，由服务器通过 \`callbacks\` 数组下发，前端据此动态渲染表单字段。这让「用户名密码登录」「OTP 登录」「注册」可以复用同一套渲染逻辑。
- **类型安全 + 便捷 API**：SDK 提供 \`FRStep\`、\`FRCallback\` 等类，封装了 \`getCallbackOfType\`、\`getInputValue\`、\`setInputValue\`、\`getOutputByName\` 等方法，避免手写 \`payload.callbacks[0].input[0].value\` 这种易错的索引访问。
- **会话管理**：SDK 自带 token 刷新、session 续期、登出等能力，对接真实 AM 时无需重复造轮子。

### 1.2 核心概念：Authentication Tree、FRStep、FRCallback、CallbackType

要理解 ForgeRock SDK，必须先吃透这四个概念，它们贯穿了本 Demo 的所有认证流程。

**Authentication Tree（认证树）**：一棵由节点（node）组成的有向图，每个节点代表一个「需要做的判断」。常见的节点有：用户名密码收集节点、OTP 节点、数据校验节点、决策节点（成功/失败分支）。前端看到的「树」其实是**线性的步骤序列**——服务器按顺序下发每一步，前端逐步推进。

**FRStep（认证步骤）**：认证树中「一个步骤」在前端的抽象。一个 \`FRStep\` 实例包含：

- \`type\`：步骤类型，取值来自 \`StepType\` 枚举：\`Step\`（中间步骤）、\`LoginSuccess\`（登录成功终态）、\`LoginFailure\`（登录失败终态）。
- \`stage\`：阶段标识字符串（如 \`Login\`、\`OTP\`、\`RegisterUsername\`），前端据此决定渲染哪种 UI。用 \`step.getStage()\` 读取。
- \`description\`：本步骤的人类可读描述，用 \`step.getDescription()\` 读取。
- \`callbacks\`：本步骤需要收集的输入单元数组，每个元素是一个 \`FRCallback\`。

**FRCallback（回调）**：一个步骤里需要收集的一个输入单元。例如登录第一步有两个 callback：\`NameCallback\`（用户名）和 \`PasswordCallback\`（密码）。每个 callback 包含：

- \`output\`：服务器下发给前端的元数据（如 \`prompt\` 字段标签、\`policies\` 校验策略、\`predefinedQuestions\` 预定义问题列表）。
- \`input\`：前端要回填的输入值。用 \`cb.setInputValue(value)\` 写入，用 \`cb.getInputValue()\` 读取。

**CallbackType（回调类型枚举）**：标识 callback 的种类，决定前端如何渲染它。本 Demo 用到的回调类型：

| CallbackType | 用途 | 对应 UI |
| --- | --- | --- |
| \`NameCallback\` | 收集用户名（明文文本） | \`TextInput\` |
| \`PasswordCallback\` | 收集密码（掩码） | \`PasswordInput\` |
| \`TextInputCallback\` | 收集通用文本（如 OTP 验证码） | \`TextInput\` |
| \`ValidatedCreateUsernameCallback\` | 注册时收集用户名（带策略校验） | \`TextInput\` |
| \`ValidatedCreatePasswordCallback\` | 注册时收集密码（带密码策略） | \`PasswordInput\` |
| \`StringAttributeInputCallback\` | 收集用户属性（如邮箱 mail） | \`TextInput\` |
| \`KbaCreateCallback\` | 收集安全问题 + 答案（KBA） | \`Select\` + \`TextInput\` |

### 1.3 认证树的工作流程：startAuth → nextAuth → LoginSuccess/LoginFailure

无论登录、注册还是忘记密码，前端与 AM 的交互都是同一个循环：

1. **启动流程**：调用 \`startAuth(flowType)\` 拿到第一个 \`FRStep\`。\`flowType\` 决定走哪棵认证树（\`login\` / \`register\` / \`forgotPassword\` / \`changePassword\` / \`securityVerify\`）。
2. **渲染第一步**：根据 \`step.getStage()\` 和 \`step.callbacks\` 渲染对应表单。
3. **用户填写并提交**：把表单值通过 \`cb.setInputValue()\` 写回每个 callback，然后调用 \`nextAuth(step, context)\`。
4. **接收下一步**：\`nextAuth\` 返回的对象 \`type\` 字段决定走向：
   - \`Step\` → 中间步骤，更新 step/state，回到第 2 步继续渲染。
   - \`LoginSuccess\` → 流程成功，读取会话信息，结束。
   - \`LoginFailure\` → 流程失败，用 \`getMessage()\` / \`getDetail()\` 取错误信息展示给用户。
5. **循环**：重复 2–4，直到拿到终态。

这个循环是 ForgeRock SDK 的精髓：**前端是「无状态」的，每一步的下一步完全由服务器决定**。这就是为什么同一套前端代码能适配「密码登录」「OTP 登录」「生物识别登录」——只要服务器按需下发 callback 即可。

### 1.4 动态 import 的原因（SDK 依赖 redux/immer，不能 SSR）

\`@forgerock/javascript-sdk\` 内部依赖 \`redux\`、\`immer\` 等库，这些库在 Node.js 服务端渲染（SSR）环境下会报错（访问 \`window\`、\`document\` 等）。Next.js App Router 默认组件是 Server Component，如果在模块顶层直接 \`import\` 会导致构建或运行时报错。

解决方案是**动态 import**，把 SDK 加载推迟到客户端运行时：

\`\`\`js
// app/auth-demo/lib/sdk.js
let _sdk = null;

export async function loadSdk() {
  if (_sdk) return _sdk; // 单例缓存，避免重复加载
  _sdk = await import("@forgerock/javascript-sdk");
  return _sdk;
}
\`\`\`

然后在每个需要 SDK 的地方：

\`\`\`js
export async function startAuth(flowType) {
  const sdk = await loadSdk();
  // 用 sdk.FRStep、sdk.StepType、sdk.CallbackType ...
  return new sdk.FRStep(payload);
}
\`\`\`

### 1.5 关键点说明

- \`FRStep\` 只是 callback payload 的「便捷包装器」，本质仍是普通对象，可以序列化传输。
- \`step.getCallbackOfType(type)\` 返回第一个匹配类型的 callback，找不到会抛错；\`step.getCallbacksOfType(type)\` 返回全部匹配（用于 KBA 这种多 callback 同类型的场景）。
- \`context\` 对象是跨步骤传递上下文的容器，本 Demo 用它传递 \`flowType\`、\`username\`、\`email\`、\`pendingUser\`，让 Mock 引擎在下一步能关联到当前用户。真实项目里这些信息通常由服务器 session 持有。

---

## 第二章：Zod v4 数据校验

### 2.1 Zod 是什么、为什么用它

Zod 是 TypeScript/JavaScript 生态最流行的**声明式数据校验库**。核心思想：先用 schema（模式）描述「数据应该长什么样」，再拿数据去匹配 schema，匹配失败就返回结构化的错误信息。

为什么用它而不是手写 \`if\` 校验：

- **声明式**：schema 即文档，一眼能看出数据形状，可读性强。
- **前后端同构**：同一份 schema 既能给前端表单校验，也能给后端 API 校验，避免「前端校验了后端没校验」的漏洞。
- **类型自动推导**：\`z.infer<typeof schema>\` 自动从 schema 推导出 TypeScript 类型，避免类型与校验逻辑脱节。
- **链式 API**：\`z.string().min(2).max(32).regex(...)\` 链式组合校验规则，表达力强。
- **跨字段校验**：\`.refine()\` 在对象层面做跨字段一致性校验（如两次密码一致）。

### 2.2 Schema 定义：z.string() / z.object() / z.enum() / z.literal()

Zod 的基础 schema 构造器：

\`\`\`js
import { z } from "zod";

// 基础类型
const str = z.string();              // 字符串
const num = z.number();              // 数字
const bool = z.boolean();            // 布尔
const date = z.date();               // Date 对象

// 字面量（精确匹配某个值）
const role = z.literal("admin");     // 只接受 "admin"
const agree = z.literal(true);       // 只接受 true

// 枚举
const color = z.enum(["red", "green", "blue"]); // 只接受这三个值之一

// 对象
const userSchema = z.object({
  username: z.string(),
  age: z.number(),
  isAdmin: z.boolean(),
});

// 可选 / 默认值 / 可空
const opt = z.string().optional();           // string | undefined
const withDefault = z.string().default("x"); // 不传时取 "x"
const nullable = z.string().nullable();      // string | null
\`\`\`

### 2.3 链式校验：.min() / .max() / .regex() / .email()

字符串 schema 支持丰富的链式校验方法，每个方法第二个参数是**校验失败时的错误消息**（Zod v4 直接传字符串）：

\`\`\`js
// 用户名：2-32 字符，只允许字母数字下划线
const username = z
  .string()
  .min(2, "用户名至少 2 个字符")
  .max(32, "用户名最多 32 个字符")
  .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线");

// 邮箱：用内置 email 规则
const email = z
  .string()
  .min(1, "邮箱不能为空")
  .email("邮箱格式不正确");

// 密码：至少 8 位，必须同时含字母和数字
// (?=.*[a-zA-Z]) 正向预查：确保含字母
// (?=.*\\d) 正向预查：确保含数字
const password = z
  .string()
  .min(8, "密码至少 8 个字符")
  .max(128, "密码最多 128 个字符")
  .regex(/^(?=.*[a-zA-Z])(?=.*\\d).+$/, "密码必须包含字母和数字");

// 6 位数字验证码
const otp = z
  .string()
  .regex(/^\\d{6}$/, "验证码必须是 6 位数字");
\`\`\`

### 2.4 跨字段校验：.refine()

单字段校验只能检查「这一个字段本身」，但很多业务规则是跨字段的（如两次密码一致、两个安全问题不能相同）。Zod 用 \`z.object({...}).refine(predicate, options)\` 在对象层面做：

\`\`\`js
export const registerSchema = z
  .object({
    username: z.string().min(2),
    email: z.string().email("邮箱格式不正确"),
    password: z.string().min(8),
    confirmPassword: z.string().min(1, "请确认密码"),
    agree: z.literal(true, "必须同意服务条款才能注册"),
  })
  // refine 第一个参数是判断函数，返回 false 则触发错误
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    // path 决定错误显示在哪个字段下（显示在 confirmPassword 输入框下方）
    path: ["confirmPassword"],
  });
\`\`\`

可以链多个 \`refine\`，例如修改密码同时校验「新旧密码不同」和「两次新密码一致」：

\`\`\`js
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z.string().min(8, "新密码至少 8 个字符"),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "新密码不能与当前密码相同",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
\`\`\`

### 2.5 Zod v4 vs v3 差异（errorMap → 直接字符串消息）

本项目使用 \`zod@4.4.3\`。Zod v4 与 v3 在自定义错误消息上有**破坏性变更**，这是最容易踩的坑：

| 场景 | Zod v3 写法（已废弃） | Zod v4 写法（推荐） |
| --- | --- | --- |
| 自定义消息 | \`z.string().min(2, { errorMap: () => ({ message: "..." }) })\` | \`z.string().min(2, "直接传字符串")\` |
| 字面量消息 | \`z.literal(true, { errorMap: ... })\` | \`z.literal(true, "消息")\` |
| 选项对象 | \`{ message: "..." }\` | \`{ error: "..." }\` 或直接字符串 |

**坑**：如果 v4 里仍用旧的 \`errorMap\` 写法，自定义消息会被**静默忽略**（不报错，但显示默认英文消息）。所以本 Demo 一律用直接传字符串的方式。

### 2.6 与 Mantine Form 集成：schemaResolver

Mantine v9 的 \`@mantine/form\` 提供了 \`schemaResolver\` 函数，把符合 [Standard Schema](https://github.com/standard-schema/standard-schema) 规范的 schema（Zod v4 原生实现）转成 Mantine form 能识别的校验函数：

\`\`\`js
import { useForm, schemaResolver } from "@mantine/form";
import { loginSchema } from "../lib/schemas.js";

const loginForm = useForm({
  initialValues: { username: "", password: "" },
  validate: schemaResolver(loginSchema), // Zod schema → Mantine 校验函数
});
\`\`\`

好处是：**不再需要第三方 \`zodResolver\` 适配包**，Zod v4 开箱即用。

### 2.7 关键点说明

- \`z.literal(true, "消息")\` 用于「必须勾选」场景，传 \`false\` 会被拒绝。
- \`refine\` 的 \`path\` 决定错误显示位置，对 UX 很重要（错误应贴着对应字段）。
- 本 Demo 所有 schema 集中在 \`app/auth-demo/lib/schemas.js\`，方便复用与维护。

---

## 第三章：Mantine v9 表单实战

### 3.1 useForm 核心用法

\`@mantine/form\` 的 \`useForm\` 是表单状态管理核心。返回的 \`form\` 对象包含 \`values\`、\`errors\`、\`getInputProps\`、\`onSubmit\`、\`reset\`、\`setFieldValue\` 等方法。

\`\`\`jsx
import { useForm, schemaResolver } from "@mantine/form";
import { loginSchema } from "../lib/schemas.js";

function LoginForm() {
  const form = useForm({
    initialValues: { username: "", password: "" },
    validate: schemaResolver(loginSchema),
  });

  const handleSubmit = (values) => {
    console.log("提交的值：", values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* getInputProps 桥接 value/onChange/onError */}
      <TextInput {...form.getInputProps("username")} />
      <PasswordInput {...form.getInputProps("password")} />
      <Button type="submit">登录</Button>
    </form>
  );
}
\`\`\`

\`getInputProps("字段名")\` 返回一个对象，展开后自动绑定 \`value\`、\`onChange\`、\`error\`，让输入控件与表单状态自动同步，是 Mantine form 的精髓 API。

### 3.2 initialValues / validate / getInputProps / onSubmit

四个核心配置项与方法的职责：

- **initialValues**：表单初始值对象，定义所有字段。字段可以是嵌套对象/数组。
- **validate**：校验函数或 \`schemaResolver(schema)\`。提交或失焦时自动调用，错误写入 \`form.errors\`。
- **getInputProps(name)**：返回字段的 \`{ value, onChange, error, onBlur }\`，展开到输入组件上即可双向绑定。
- **onSubmit(handler)**：返回 \`onSubmit\` 事件处理函数，校验通过后才回调 \`handler(values)\`。

### 3.3 常用输入组件：TextInput / PasswordInput / Select / Textarea / Checkbox / Switch

\`\`\`jsx
import {
  TextInput, PasswordInput, Select, Textarea, Checkbox, Switch,
} from "@mantine/core";

// 单行文本
<TextInput label="用户名" placeholder="请输入" {...form.getInputProps("username")} />

// 密码（自带显示/隐藏眼睛图标）
<PasswordInput label="密码" placeholder="请输入" {...form.getInputProps("password")} />

// 下拉选择，data 格式 [{ value, label }]
<Select
  label="安全问题"
  data={questions.map((q) => ({ value: q, label: q }))}
  {...form.getInputProps("question1")}
/>

// 多行文本
<Textarea label="简介" autosize minRows={3} {...form.getInputProps("bio")} />

// 复选框（必须勾选场景）
<Checkbox label="我已阅读并同意服务条款" {...form.getInputProps("agree")} />

// 开关（如 2FA 开关）
<Switch label="启用双因素认证" {...form.getInputProps("twoFactor")} />
\`\`\`

### 3.4 AppShell 布局：Header / Navbar / Main

\`AppShell\` 是 Mantine 的应用骨架组件，支持 Header / Navbar / Aside / Footer 多栏布局，自带响应式断点（移动端自动折叠 Navbar）：

\`\`\`jsx
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

function Layout() {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
        {/* 顶部内容 */}
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {/* 左侧导航 */}
      </AppShell.Navbar>

      <AppShell.Main>
        {/* 主内容区 */}
      </AppShell.Main>
    </AppShell>
  );
}
\`\`\`

\`breakpoint: "sm"\` 表示在小于 sm 断点（移动端）时 Navbar 自动折叠，\`collapsed.mobile\` 控制折叠状态。

### 3.5 useMantineColorScheme 主题切换

\`useMantineColorScheme\` 提供运行时亮/暗主题切换：

\`\`\`jsx
import { SegmentedControl, useMantineColorScheme } from "@mantine/core";

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <SegmentedControl
      value={colorScheme}
      onChange={(v) => setColorScheme(v)}
      data={[
        { value: "light", label: "☀️" },
        { value: "dark", label: "🌙" },
      ]}
    />
  );
}
\`\`\`

\`colorScheme\` 取值 \`"light" | "dark" | "auto"\`，切换后 Mantine 自动更新 CSS 变量，全站组件即时响应。

### 3.6 ColorSchemeScript 防 FOUC

直接用 \`useMantineColorScheme\` 切换会有 **FOUC（Flash of Unstyled Content，刷新闪烁）** 问题：服务端渲染默认亮色，但用户上次选了暗色，刷新时先闪一下亮色再变暗。

\`ColorSchemeScript\` 在 HTML 解析阶段同步读取 \`localStorage\` 设置主题，早于 React hydration，从而避免闪烁：

\`\`\`jsx
// app/auth-demo/layout.js
import { MantineProvider, createTheme, ColorSchemeScript } from "@mantine/core";

export default function AuthDemoLayout({ children }) {
  return (
    <>
      {/* 放在 MantineProvider 外部，作为 Server Component 静态输出 */}
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </>
  );
}
\`\`\`

### 3.7 关键点说明

- \`MantineProvider\` 必须包裹所有用 Mantine 组件的子树，本 Demo 在 \`layout.js\` 里挂载，样式隔离在 \`/auth-demo\` 子树，不污染主站。
- Mantine v9 的 \`PasswordInput\` 内置强度指示器，\`Stepper\` 适合多步注册流程。
- \`hiddenFrom\` / \`visibleFrom\` prop 控制组件在特定断点显隐，替代手写 CSS media query。

---

## 第四章：登录流程实现

### 4.1 两步登录流程：用户名密码 → OTP → 成功

本 Demo 的登录是典型的两步登录（2FA）：

1. **第一步 Login**：收集用户名 + 密码。校验通过后提交给 AM，AM 验证账密。
2. **第二步 OTP**：账密正确且用户开启了 2FA，AM 下发 OTP 步骤，前端收集 6 位验证码再提交。
3. **成功**：OTP 正确，AM 返回 \`LoginSuccess\`，前端建立会话。

### 4.2 NameCallback + PasswordCallback 解析

登录第一步有两个 callback：\`NameCallback\`（用户名）和 \`PasswordCallback\`（密码）。前端用 \`getCallbackOfType\` 取出，用 \`setInputValue\` 写入用户输入：

\`\`\`jsx
import { startAuth, nextAuth } from "../lib/sdk.js";

const STEP_TYPE_STEP = "Step";
const STEP_TYPE_SUCCESS = "LoginSuccess";
const STEP_TYPE_FAILURE = "LoginFailure";
const CB_NAME = "NameCallback";
const CB_PASSWORD = "PasswordCallback";

// 启动登录流程，拿到第一步
const step = await startAuth("login");
// step.getStage() === "Login"
// step.callbacks 包含 NameCallback + PasswordCallback

// 提交第一步
const nameCb = step.getCallbackOfType(CB_NAME);
const pwdCb = step.getCallbackOfType(CB_PASSWORD);
nameCb.setInputValue("demo");
pwdCb.setInputValue("Demo1234");

const next = await nextAuth(step, { flowType: "login", username: "demo" });
// next.type 可能是 "Step"（进入 OTP）或 "LoginFailure"（账密错误）
\`\`\`

### 4.3 TextInputCallback 用于 OTP

第二步 OTP 用 \`TextInputCallback\` 收集 6 位验证码（OTP 不是密码，用通用文本回调即可）：

\`\`\`jsx
const CB_TEXT = "TextInputCallback";

// 假设 next.type === "Step" 且 next.getStage() === "OTP"
const otpStep = next;
const otpCb = otpStep.getCallbackOfType(CB_TEXT);
otpCb.setInputValue("123456");

const result = await nextAuth(otpStep, { flowType: "login", username: "demo" });
// result.type === "LoginSuccess" 表示登录成功
\`\`\`

### 4.4 60 秒倒计时重发逻辑

OTP 步骤有「60 秒倒计时才能重发」的 UX 约束，防止短信轰炸。用 \`useState\` + \`useEffect\` + \`setInterval\` 实现：

\`\`\`jsx
const OTP_COUNTDOWN_TOTAL = 60;
const [otpCountdown, setOtpCountdown] = useState(0);

// 当 otpCountdown > 0 时，每秒减 1
useEffect(() => {
  if (otpCountdown <= 0) return undefined;
  const timer = setInterval(() => {
    setOtpCountdown((c) => (c > 0 ? c - 1 : 0));
  }, 1000);
  return () => clearInterval(timer);
}, [otpCountdown]);

// 进入 OTP 步骤时启动倒计时
const enterOtp = () => setOtpCountdown(OTP_COUNTDOWN_TOTAL);

// 重发按钮在倒计时中禁用
<button disabled={otpCountdown > 0} onClick={handleResendOtp}>
  {otpCountdown > 0 ? \`重新发送 (\${otpCountdown}s)\` : "重新发送验证码"}
</button>
\`\`\`

重发的实现是「用缓存的账密重新走一遍登录第一步」，让 Mock 引擎重新生成验证码。

### 4.5 账户锁定机制（5 次失败锁定）

Mock 引擎在 \`nextAuth\` 里实现账户锁定：连续输错 5 次密码锁定账户，必须走「忘记密码」重置：

\`\`\`js
if (user.password !== password) {
  user.failedAttempts++;
  if (user.failedAttempts >= 5) {
    user.locked = true;
    return makeLoginFailure(sdk, "密码错误次数过多，账户已被锁定");
  }
  return makeLoginFailure(
    sdk,
    \`密码错误（剩余 \${5 - user.failedAttempts} 次尝试机会）\`
  );
}
// 登录成功，重置失败计数
user.failedAttempts = 0;
\`\`\`

### 4.6 关键点说明

- 状态机：\`phase: idle → running → success/failure\`，\`stage: "login" | "otp"\`，清晰区分流程阶段。
- \`context.flowType\` 是 Mock 引擎区分「登录 OTP」和「忘记密码 OTP」的关键。
- 账密错误信息要带「剩余尝试次数」，给用户明确的预期。

---

## 第五章：注册流程实现

### 5.1 三步注册：用户名/邮箱 → 密码 → 安全问题

注册流程分三步，对应三棵子树：

1. **RegisterUsername**：收集用户名（\`ValidatedCreateUsernameCallback\`）+ 邮箱（\`StringAttributeInputCallback\`）。
2. **RegisterPassword**：收集密码（\`ValidatedCreatePasswordCallback\`，带密码策略）。
3. **RegisterSecurityQuestions**：收集 2 个安全问题 + 答案（\`KbaCreateCallback\`）。

注册成功后自动登录并建立会话。

### 5.2 ValidatedCreateUsernameCallback

\`ValidatedCreateUsernameCallback\` 比普通 \`NameCallback\` 多了 \`policies\` 字段，服务器可以下发用户名策略（长度、字符集、是否允许重复）。前端用 Zod schema 做客户端预校验，减轻服务器压力：

\`\`\`js
// schemas.js
username: z
  .string()
  .min(2, "用户名至少 2 个字符")
  .max(32, "用户名最多 32 个字符")
  .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
\`\`\`

提交时把用户名写入 callback，Mock 引擎检查是否已存在：

\`\`\`js
if (stage === "RegisterUsername") {
  const usernameCb = step.getCallbackOfType(
    sdk.CallbackType.ValidatedCreateUsernameCallback
  );
  const username = usernameCb.getInputValue();
  if (mockUsers.has(username)) {
    return makeLoginFailure(sdk, "用户名已被注册");
  }
  // 进入下一步
  context.pendingUser = { username, email };
  return wrapStep(sdk, makeRegisterStep2(sdk));
}
\`\`\`

### 5.3 ValidatedCreatePasswordCallback（密码策略）

\`ValidatedCreatePasswordCallback\` 携带 \`policies\`（密码策略）和 \`failedPolicies\`（上次提交未通过的策略）。本 Demo 用 Zod regex 做强度校验（至少 8 位，含字母和数字）：

\`\`\`js
password: z
  .string()
  .min(8, "密码至少 8 个字符")
  .max(128, "密码最多 128 个字符")
  .regex(/^(?=.*[a-zA-Z])(?=.*\\d).+$/, "密码必须包含字母和数字"),
\`\`\`

### 5.4 KbaCreateCallback（安全问题）

\`KbaCreateCallback\` 是 KBA（Knowledge Based Authentication）专用回调，有**两个 input**：\`input[0]\` 是问题，\`input[1]\` 是答案。用 \`getInputValue(0)\` 取问题，\`getInputValue(1)\` 取答案：

\`\`\`js
if (stage === "RegisterSecurityQuestions") {
  const kbaCallbacks = step.getCallbacksOfType(
    sdk.CallbackType.KbaCreateCallback
  );
  const securityQuestions = kbaCallbacks.map((cb) => ({
    question: cb.getInputValue(0),
    answer: cb.getInputValue(1),
  }));
  // 保存到新用户记录
  const newUser = { ..., securityQuestions };
  mockUsers.set(newUser.username, newUser);
  return makeLoginSuccess(sdk, newUser);
}
\`\`\`

\`output\` 里的 \`predefinedQuestions\` 是服务器下发的预定义问题列表，前端用 \`Select\` 渲染供用户选择。

### 5.5 Stepper 组件展示进度

Mantine 的 \`Stepper\` 非常适合多步注册，\`active\` 控制当前步骤，\`onStepClick\` 支持点击跳转：

\`\`\`jsx
import { Stepper } from "@mantine/core";

<Stepper active={active} onStepClick={setActive}>
  <Stepper.Step label="账号" description="用户名和邮箱">
    {/* 第一步表单 */}
  </Stepper.Step>
  <Stepper.Step label="密码" description="设置登录密码">
    {/* 第二步表单 */}
  </Stepper.Step>
  <Stepper.Step label="安全问题" description="用于账户恢复">
    {/* 第三步表单 */}
  </Stepper.Step>
  <Stepper.Completed>
    注册成功！
  </Stepper.Completed>
</Stepper>
\`\`\`

### 5.6 关键点说明

- 跨步骤上下文用 \`context.pendingUser\` 累积（用户名/邮箱/密码），真实项目应由服务器 session 持有。
- \`ValidatedCreate*\` 系列回调的 \`policies\` 可用于实时校验提示，本 Demo 简化为提交后校验。
- 注册成功自动登录是常见 UX，免去用户再手动登录一次。

---

## 第六章：OTP 验证码完整实现

### 6.1 OTP 生成（6 位随机数字）

OTP 是一次性密码（One-Time Password），本 Demo 生成 6 位随机数字：

\`\`\`js
function generateOtp() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  // 模拟"发送到手机/邮箱"：控制台打印
  console.log(\`%c[Mock SMS/Email] 您的验证码是: \${code}\`, "color: #2563eb; font-weight: bold;");
  return code;
}
\`\`\`

\`Math.floor(100000 + Math.random() * 900000)\` 保证结果在 100000–999999 之间，正好 6 位。

### 6.2 OTP 发送（模拟短信/邮件）

Mock 模式下不真的发短信，而是把验证码打印到控制台（开发时打开 DevTools Console 即可看到）。真实项目应调用短信网关 / 邮件服务：

\`\`\`js
// 真实项目伪代码
async function sendOtpSms(phone, code) {
  await fetch("/api/sms/send", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}
\`\`\`

### 6.3 OTP 验证（6 位数字格式校验）

前端用 Zod schema 做格式预校验，必须是 6 位纯数字：

\`\`\`js
export const otpSchema = z.object({
  otp: z.string().regex(/^\\d{6}$/, "验证码必须是 6 位数字"),
});
\`\`\`

提交后服务器校验验证码是否匹配（Mock 模式下任意 6 位数字都通过，但会校验是否过期）：

\`\`\`js
if (stage === "OTP") {
  const otpCb = step.getCallbackOfType(sdk.CallbackType.TextInputCallback);
  const otp = otpCb.getInputValue();
  const tokenData = resetTokens.get(context.email);
  if (tokenData && Date.now() > tokenData.expires) {
    return makeLoginFailure(sdk, "验证码已过期，请重新获取");
  }
  // 验证通过，进入下一步
}
\`\`\`

### 6.4 倒计时重发机制

见第四章 4.4 节。核心是 \`useState\` 持有剩余秒数，\`useEffect\` + \`setInterval\` 每秒递减，到 0 自动清除定时器。重发时用缓存的账密重新走登录，让引擎生成新验证码并重启倒计时。

### 6.5 OTP 过期处理

验证码有 5 分钟有效期（\`Date.now() + 300000\`），过期后提交会返回失败。前端可以额外加一个「过期自动提示重发」的 UX：到时把重发按钮高亮提示用户。

### 6.6 关键点说明

- OTP 应该是「服务端生成 + 服务端校验」，前端只负责收集和展示。
- 倒计时是防短信轰炸的必要 UX 约束。
- 真实项目要限制同一手机号每分钟的发送次数，并做风控（异地登录、新设备等触发二次验证）。

---

## 第七章：密码管理

### 7.1 忘记密码流程：邮箱验证 → OTP → 重置

未登录场景的密码重置流程：

1. **ForgotPasswordEmail**：输入注册邮箱，引擎查找用户并「发送」验证码。
2. **OTP**：输入 6 位验证码。
3. **ForgotPasswordReset**：输入新密码 + 确认密码，重置成功。

\`\`\`js
if (stage === "ForgotPasswordEmail") {
  const emailCb = step.getCallbackOfType(sdk.CallbackType.StringAttributeInputCallback);
  const email = emailCb.getInputValue();
  // 查找用户
  let foundUser = null;
  for (const [, u] of mockUsers) {
    if (u.email === email) { foundUser = u; break; }
  }
  if (!foundUser) return makeLoginFailure(sdk, "该邮箱未注册");
  // 生成并发送验证码
  const otp = generateOtp();
  resetTokens.set(email, { code: otp, expires: Date.now() + 300000 });
  context.email = email;
  context.username = foundUser.username;
  context.flowType = "forgotPassword";
  return wrapStep(sdk, makeOtpStep(sdk, "邮箱"));
}
\`\`\`

### 7.2 修改密码流程：旧密码验证 → 新密码

已登录场景的修改密码流程，单步完成：当前密码 + 新密码 + 确认新密码。

\`\`\`js
if (stage === "ChangePassword") {
  const callbacks = step.callbacks;
  const currentPassword = callbacks[0].getInputValue();
  const newPassword = callbacks[1].getInputValue();
  const confirmPassword = callbacks[2].getInputValue();
  const user = mockUsers.get(currentSession.username);
  if (user.password !== currentPassword) {
    return makeLoginFailure(sdk, "当前密码不正确");
  }
  if (newPassword !== confirmPassword) {
    return makeLoginFailure(sdk, "两次输入的新密码不一致");
  }
  if (currentPassword === newPassword) {
    return makeLoginFailure(sdk, "新密码不能与当前密码相同");
  }
  user.password = newPassword;
  return { type: sdk.StepType.LoginSuccess, getMessage: () => "密码已成功修改" };
}
\`\`\`

### 7.3 密码强度校验（字母+数字、最少 8 位）

用 Zod regex 强制密码必须同时含字母和数字，至少 8 位：

\`\`\`js
newPassword: z
  .string()
  .min(8, "新密码至少 8 个字符")
  .max(128, "新密码最多 128 个字符")
  .regex(/^(?=.*[a-zA-Z])(?=.*\\d).+$/, "新密码必须包含字母和数字"),
\`\`\`

### 7.4 两次密码一致性校验（refine）

用 \`refine\` 在对象层面校验两次输入一致：

\`\`\`js
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})
\`\`\`

### 7.5 新旧密码不能相同

再链一个 \`refine\` 校验新旧密码不同：

\`\`\`js
.refine((data) => data.currentPassword !== data.newPassword, {
  message: "新密码不能与当前密码相同",
  path: ["newPassword"],
})
\`\`\`

### 7.6 关键点说明

- 忘记密码用邮箱 + OTP 双因子验证身份，防止恶意重置他人密码。
- 修改密码要先验证旧密码，证明是本人操作。
- 重置密码后应解锁账户并清零失败计数（\`failedAttempts = 0; locked = false\`）。

---

## 第八章：安全问题（KBA）

### 8.1 KBA 是什么（Knowledge Based Authentication）

KBA = Knowledge Based Authentication，基于知识的认证。用户提供只有自己知道的「安全问题答案」作为额外身份验证因子，常用于账户恢复（忘记密码时的二次验证）。KBA 分两种：

- **静态 KBA**：用户在注册时从预定义问题中选择并设置答案。本 Demo 采用这种方式。
- **动态 KBA**：基于用户历史数据生成问题（如「你最近在哪登录过」），安全性更高但实现复杂。

### 8.2 KbaCreateCallback 的 getInputValue(0) 获取问题，getInputValue(1) 获取答案

\`KbaCreateCallback\` 是 KBA 专用回调，有**两个 input**：

- \`input[0]\`（\`getInputValue(0)\`）：用户选择/输入的安全问题文本。
- \`input[1]\`（\`getInputValue(1)\`）：用户设置的答案。

\`output\` 里包含 \`predefinedQuestions\`（预定义问题列表）和 \`prompt\`（字段标签）：

\`\`\`js
function makeRegisterStep3(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "RegisterSecurityQuestions",
    description: "请设置 2 个安全问题（用于账户恢复）",
    callbacks: [
      {
        type: sdk.CallbackType.KbaCreateCallback,
        output: [
          { name: "prompt", value: "安全问题 1" },
          { name: "predefinedQuestions", value: PREDEFINED_QUESTIONS },
        ],
        input: [
          { name: "IDToken1", value: "" }, // 问题
          { name: "IDToken2", value: "" }, // 答案
        ],
      },
      // 第二个 KbaCreateCallback ...
    ],
  };
}
\`\`\`

### 8.3 预定义安全问题列表

\`\`\`js
const PREDEFINED_QUESTIONS = [
  "你的小学名称是什么？",
  "你的母亲叫什么名字？",
  "你的第一只宠物叫什么？",
  "你出生的城市是哪里？",
  "你最喜欢的书叫什么？",
  "你的父亲叫什么名字？",
];
\`\`\`

前端用 \`Select\` 渲染这些问题供用户选择，再配一个 \`TextInput\` 收集答案。

### 8.4 安全问题验证流程

账户恢复时验证安全问题答案：

\`\`\`js
if (stage === "SecurityVerify") {
  const user = mockUsers.get(context.username);
  const answers = step.callbacks.map((cb) => cb.getInputValue());
  for (let i = 0; i < user.securityQuestions.length; i++) {
    const expected = user.securityQuestions[i].answer.toLowerCase();
    const actual = String(answers[i] || "").toLowerCase().trim();
    if (expected !== actual) {
      return makeLoginFailure(sdk, \`安全问题 \${i + 1} 答案不正确\`);
    }
  }
  return { type: sdk.StepType.LoginSuccess, getMessage: () => "安全问题验证通过" };
}
\`\`\`

### 8.5 关键点说明

- 安全问题答案应做大小写无关比较（\`toLowerCase()\`）并 trim 空白，提升用户体验。
- 两个安全问题不能相同（用 \`refine\` 校验），否则失去多因子意义。
- KBA 安全性有限（答案可能被社交工程获取），生产环境建议结合 OTP / 硬件密钥。

---

## 第九章：会话管理

### 9.1 会话创建（登录成功后）

登录成功后 Mock 引擎创建会话对象，存到模块级变量 \`currentSession\`：

\`\`\`js
function makeLoginSuccess(sdk, user) {
  currentSession = {
    sessionId: "mock-session-" + Date.now(),
    token: "mock-token-" + Math.random().toString(36).slice(2),
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 小时后过期
  };
  return {
    type: sdk.StepType.LoginSuccess,
    sessionId: currentSession.sessionId,
    getMessage: () => \`欢迎回来，\${user.displayName}\`,
  };
}
\`\`\`

### 9.2 会话信息（sessionId, token, loginTime, expiresAt）

会话对象包含：

- \`sessionId\`：会话唯一标识，用于服务端查找会话。
- \`token\`：访问令牌，前端请求 API 时放在 \`Authorization\` 头。
- \`username\` / \`displayName\` / \`email\`：用户基本信息缓存。
- \`loginTime\`：登录时间，用于审计与展示。
- \`expiresAt\`：过期时间，到点需重新登录或刷新 token。

### 9.3 会话过期检查

\`isLoggedIn()\` 检查会话是否存在且未过期：

\`\`\`js
export function isLoggedIn() {
  if (!currentSession) return false;
  if (new Date(currentSession.expiresAt) < new Date()) {
    currentSession = null; // 过期，清除
    return false;
  }
  return true;
}
\`\`\`

### 9.4 登出（清除会话）

\`\`\`js
export function logout() {
  currentSession = null;
}
\`\`\`

真实项目登出还要：调用 AM 的 \`/sessions?_action=logout\` 让服务端 token 失效、清除前端 localStorage / cookie、跳转登录页。

### 9.5 2FA 开关切换

已登录用户可在会话面板切换 2FA：

\`\`\`js
export function toggleTwoFactor(enabled) {
  if (!currentSession) return { error: "请先登录" };
  const user = mockUsers.get(currentSession.username);
  user.twoFactorEnabled = enabled;
  return { success: true, enabled };
}
\`\`\`

### 9.6 关键点说明

- Mock 会话存内存，刷新页面保留但热重载丢失；真实项目用 httpOnly cookie + 服务端 session 存储。
- token 刷新（refresh token）机制让用户在 token 过期前无感续期，提升体验。
- 2FA 开关应做二次确认（避免误关降低安全性）。

---

## 第十章：项目架构与最佳实践

### 10.1 目录结构

\`\`\`
app/auth-demo/
├── layout.js              # MantineProvider 隔离 + ColorSchemeScript 防 FOUC
├── page.js                # AppShell 主页面，左侧导航切换功能模块
├── tutorial.js            # 本教程页面
├── components/
│   ├── LoginFlow.jsx      # 两步登录（账密 + OTP）
│   ├── RegisterFlow.jsx   # 三步注册（Stepper）
│   ├── ForgotPasswordFlow.jsx
│   ├── ChangePasswordFlow.jsx
│   ├── SecurityQuestionsPanel.jsx
│   ├── ProfilePanel.jsx
│   └── SessionPanel.jsx
└── lib/
    ├── sdk.js             # ForgeRock SDK 加载 + Mock 认证引擎
    └── schemas.js         # 集中管理 Zod schema
\`\`\`

### 10.2 lib/sdk.js：SDK 加载 + Mock 引擎

\`sdk.js\` 做两件事：

1. **动态加载 SDK**：\`loadSdk()\` 用 \`await import()\` 把 SDK 加载推迟到客户端，避免 SSR 报错；用模块级 \`_sdk\` 变量缓存单例。
2. **Mock 认证引擎**：\`startAuth\` / \`nextAuth\` 模拟 AM 服务器的认证树逻辑，用真实 \`FRStep\` / \`FRCallback\` 类包装 payload，前端代码与接真实 AM 时**完全一致**。

### 10.3 lib/schemas.js：集中管理 Zod schema

所有 Zod schema 集中在一个文件，方便复用与维护。前端表单和（未来的）后端 API 校验共用同一份 schema，保证一致性。

### 10.4 components/：按功能拆分组件

每个认证流程一个组件文件（\`LoginFlow\`、\`RegisterFlow\` 等），单一职责，便于测试与复用。父组件 \`page.js\` 通过 \`activeSection\` 状态切换显示哪个组件。

### 10.5 layout.js：Mantine Provider 隔离

\`layout.js\` 挂载 \`MantineProvider\`，让 Mantine 的 reset 和 CSS 变量**只在 \`/auth-demo\` 子树生效**，不污染主站（教程网站）原有样式。\`ColorSchemeScript\` 放在 \`MantineProvider\` 外部，作为 Server Component 静态输出，避免 React 19.2 hydration 警告。

### 10.6 为什么用 Mock 而非真实 AM 服务器

- **零部署成本**：教程网站无法要求每个读者自建 ForgeRock AM（需要 Java + 配置 + 许可证）。
- **可离线运行**：Mock 引擎纯内存，不依赖网络，方便演示。
- **代码同构**：前端代码与真实 AM 对接时**完全一致**，只需把 \`lib/sdk.js\` 的 Mock 实现替换为真实 SDK 的 \`FRAuth.next()\` 调用。

### 10.7 如何接入真实 ForgeRock AM

替换 \`sdk.js\` 的 \`startAuth\` / \`nextAuth\` 实现为真实 SDK 调用：

\`\`\`js
import { Config, FRAuth } from "@forgerock/javascript-sdk";

// 初始化配置
Config.set({
  clientId: "your-client-id",
  redirectUri: window.location.origin + "/callback",
  scope: "openid profile email",
  serverConfig: { baseUrl: "https://your-am.example.com/am" },
  tree: "Login", // 认证树名
});

export async function startAuth(flowType) {
  // FRAuth.next() 不带 step 参数表示启动新流程
  return await FRAuth.next();
}

export async function nextAuth(step) {
  // step 已包含用户填写的 callback，直接提交
  return await FRAuth.next(step);
}
\`\`\`

### 10.8 安全最佳实践

- **永远不要在前端硬编码密钥**：client_id 可以公开，但 secret 必须放服务端。
- **使用 HTTPS**：所有认证流量加密传输，防止中间人。
- **token 存 httpOnly cookie**：防止 XSS 窃取 token。
- **后端再次校验**：前端 Zod 校验只是 UX，后端必须用同一份 schema 重新校验。
- **限流 + 风控**：登录、OTP 发送、注册接口加限流，异地/新设备登录触发二次验证。
- **密码不明文存储**：真实项目用 bcrypt/argon2 哈希存储，本 Demo 为演示用明文，切勿用于生产。
- **CSRF 防护**：表单提交加 CSRF token，cookie 设 \`SameSite\`。

### 10.9 关键点说明

- 教程与 Demo 同源：本教程的所有代码片段都来自 \`app/auth-demo\` 的真实实现，可对照阅读。
- Mock → 真实平滑迁移：前端组件代码零改动，只替换 \`lib/sdk.js\` 即可。
- 持续关注 SDK 版本：\`@forgerock/javascript-sdk\` 升级时 API 可能有变化，参考官方迁移指南。

---

## 总结

本教程配套 \`/auth-demo\` 路由，完整覆盖了从 ForgeRock SDK 概念到 Mantine 表单实战的全流程。重点掌握：

1. **认证树循环**：\`startAuth → nextAuth → 终态\`，前端无状态驱动。
2. **FRStep / FRCallback**：用 SDK 便捷 API 读写表单值，避免索引访问。
3. **Zod v4**：声明式 schema + \`refine\` 跨字段校验，\`schemaResolver\` 接入 Mantine form。
4. **Mantine v9**：\`useForm\` + \`AppShell\` + \`Stepper\` + \`ColorSchemeScript\` 全套。
5. **Mock 引擎**：零部署成本演示，前端代码与真实 AM 对接完全一致。

下方 CodeBlock 展示了一份完整的登录流程示例代码，综合运用了本教程所有知识点，建议对照阅读。
`;

// ============================================================
// 完整登录流程代码示例（展示在 CodeBlock 中）
// ------------------------------------------------------------
// 这是一份可独立运行的登录流程组件，综合运用：
//   - ForgeRock SDK（通过 startAuth / nextAuth 间接）
//   - Zod v4 schema（loginSchema + otpSchema）
//   - Mantine v9 useForm + schemaResolver
//   - 60 秒 OTP 倒计时重发
//   - 状态机 phase / stage
// ============================================================
const fullLoginExample = `import { useState, useEffect, useCallback } from "react";
import {
  Paper, Stack, TextInput, PasswordInput, Button,
  Alert, Text, Code, Group, Divider, Progress,
} from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { z } from "zod";

// ---- Zod schema ----
const loginSchema = z.object({
  username: z.string().min(2, "用户名至少 2 个字符"),
  password: z.string().min(6, "密码至少 6 个字符"),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\\d{6}$/, "验证码必须是 6 位数字"),
});

// ---- ForgeRock 步骤类型常量 ----
const STEP_TYPE_STEP = "Step";
const STEP_TYPE_SUCCESS = "LoginSuccess";
const STEP_TYPE_FAILURE = "LoginFailure";
const CB_NAME = "NameCallback";
const CB_PASSWORD = "PasswordCallback";
const CB_TEXT = "TextInputCallback";
const OTP_COUNTDOWN_TOTAL = 60;

// ---- Mock 引擎（演示用，真实项目替换为 FRAuth.next）----
let mockOtp = null;
function mockStartAuth() {
  return {
    type: STEP_TYPE_STEP,
    stage: "login",
    description: "请输入用户名和密码",
    callbacks: [
      { type: CB_NAME, _val: "", getInputValue() { return this._val; }, setInputValue(v) { this._val = v; } },
      { type: CB_PASSWORD, _val: "", getInputValue() { return this._val; }, setInputValue(v) { this._val = v; } },
    ],
    getStage() { return this.stage; },
    getDescription() { return this.description; },
  };
}
function mockNextAuth(step, ctx) {
  const stage = step.getStage();
  if (stage === "login") {
    const u = step.callbacks[0].getInputValue();
    const p = step.callbacks[1].getInputValue();
    if (u !== "demo" || p !== "Demo1234") {
      return { type: STEP_TYPE_FAILURE, getMessage: () => "用户名或密码错误" };
    }
    mockOtp = String(Math.floor(100000 + Math.random() * 900000));
    console.log("[Mock] OTP:", mockOtp);
    return {
      type: STEP_TYPE_STEP,
      stage: "otp",
      description: "请输入 6 位验证码（任意 6 位数字）",
      callbacks: [
        { type: CB_TEXT, _val: "", getInputValue() { return this._val; }, setInputValue(v) { this._val = v; } },
      ],
      getStage() { return this.stage; },
      getDescription() { return this.description; },
    };
  }
  if (stage === "otp") {
    const code = step.callbacks[0].getInputValue();
    if (!/^\\d{6}$/.test(code)) {
      return { type: STEP_TYPE_FAILURE, getMessage: () => "验证码格式错误" };
    }
    return { type: STEP_TYPE_SUCCESS, getMessage: () => "登录成功" };
  }
  return { type: STEP_TYPE_FAILURE, getMessage: () => "未知阶段" };
}

// ---- 登录流程组件 ----
export default function FullLoginExample() {
  const [phase, setPhase] = useState("idle");      // idle | running | success | failure
  const [stage, setStage] = useState(null);         // login | otp
  const [step, setStep] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [lastLoginValues, setLastLoginValues] = useState(null);

  const loginForm = useForm({
    initialValues: { username: "", password: "" },
    validate: schemaResolver(loginSchema),
  });

  const otpForm = useForm({
    initialValues: { otp: "" },
    validate: schemaResolver(otpSchema),
  });

  // 倒计时
  useEffect(() => {
    if (otpCountdown <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // 启动登录流程
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const firstStep = await mockStartAuth();
        if (cancelled) return;
        setStep(firstStep);
        setStage("login");
        setPhase("running");
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "启动失败");
          setPhase("failure");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const dispatchNextStep = useCallback((next) => {
    const type = next?.type;
    if (type === STEP_TYPE_STEP) {
      const nextStage = next.getStage?.() || "";
      setStep(next);
      if (nextStage === "otp") {
        setStage("otp");
        setOtpCountdown(OTP_COUNTDOWN_TOTAL);
        otpForm.reset();
      }
      setPhase("running");
      return;
    }
    if (type === STEP_TYPE_SUCCESS) {
      setPhase("success");
      return;
    }
    if (type === STEP_TYPE_FAILURE) {
      setError(next.getMessage?.() || "登录失败");
      setPhase("failure");
      return;
    }
    setError("未知响应");
    setPhase("failure");
  }, [otpForm]);

  const handleLoginSubmit = async (values) => {
    setLoading(true);
    setError("");
    setLastLoginValues(values);
    try {
      const nameCb = step.callbacks.find((c) => c.type === CB_NAME);
      const pwdCb = step.callbacks.find((c) => c.type === CB_PASSWORD);
      if (nameCb) nameCb.setInputValue(values.username);
      if (pwdCb) pwdCb.setInputValue(values.password);
      const next = await mockNextAuth(step, { flowType: "login", username: values.username });
      dispatchNextStep(next);
    } catch (e) {
      setError(e?.message || "登录失败");
      setPhase("failure");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (values) => {
    setLoading(true);
    setError("");
    try {
      const otpCb = step.callbacks.find((c) => c.type === CB_TEXT);
      if (otpCb) otpCb.setInputValue(values.otp);
      const next = await mockNextAuth(step, { flowType: "login" });
      dispatchNextStep(next);
    } catch (e) {
      setError(e?.message || "验证码校验失败");
      setPhase("failure");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || !lastLoginValues) return;
    setLoading(true);
    try {
      const freshStep = await mockStartAuth();
      const nameCb = freshStep.callbacks.find((c) => c.type === CB_NAME);
      const pwdCb = freshStep.callbacks.find((c) => c.type === CB_PASSWORD);
      if (nameCb) nameCb.setInputValue(lastLoginValues.username);
      if (pwdCb) pwdCb.setInputValue(lastLoginValues.password);
      const next = await mockNextAuth(freshStep, { flowType: "login", username: lastLoginValues.username });
      dispatchNextStep(next);
    } catch (e) {
      setError(e?.message || "重发失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setStep(null);
    setStage(null);
    setOtpCountdown(0);
    setLoading(true);
    loginForm.reset();
    otpForm.reset();
    (async () => {
      try {
        const firstStep = await mockStartAuth();
        setStep(firstStep);
        setStage("login");
        setPhase("running");
      } catch (e) {
        setError(e?.message || "启动失败");
        setPhase("failure");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <Paper p="xl" withBorder shadow="md" radius="md">
      <Stack gap="lg">
        <div>
          <Text size="xl" fw={700}>🔐 登录</Text>
          <Text size="sm" c="dimmed" mt={4}>
            ForgeRock 两步登录 · Mantine v9 + Zod v4
          </Text>
        </div>
        <Divider />

        {phase === "success" && (
          <Alert color="green" variant="light" title="登录成功">
            欢迎回来！你已通过认证树完成登录。
          </Alert>
        )}

        {phase === "failure" && (
          <Stack gap="md">
            <Alert color="red" variant="light" title="登录失败">
              {error || "未知错误"}
            </Alert>
            <Button onClick={handleRetry} loading={loading}>重试</Button>
          </Stack>
        )}

        {phase === "idle" && (
          <Stack align="center" gap="sm" py="xl">
            <Text size="sm" c="dimmed">正在初始化登录流程…</Text>
            <Progress value={100} size="xs" w="100%" color="indigo" animated />
          </Stack>
        )}

        {phase === "running" && stage === "login" && (
          <form onSubmit={loginForm.onSubmit(handleLoginSubmit)}>
            <Stack gap="md">
              <TextInput
                label="用户名"
                placeholder="请输入用户名"
                withAsterisk
                description="测试账号：demo"
                {...loginForm.getInputProps("username")}
              />
              <PasswordInput
                label="密码"
                placeholder="请输入密码"
                withAsterisk
                description="测试密码：Demo1234"
                {...loginForm.getInputProps("password")}
              />
              <Button type="submit" loading={loading} fullWidth>登录</Button>
            </Stack>
          </form>
        )}

        {phase === "running" && stage === "otp" && (
          <form onSubmit={otpForm.onSubmit(handleOtpSubmit)}>
            <Stack gap="md">
              <Alert color="blue" variant="light" title="二次验证（2FA）">
                已发送验证码到手机（控制台可见），任意 6 位数字通过。
              </Alert>
              <TextInput
                label="验证码"
                placeholder="请输入 6 位验证码"
                withAsterisk
                inputMode="numeric"
                maxLength={6}
                {...otpForm.getInputProps("otp")}
              />
              <Progress
                value={(otpCountdown / OTP_COUNTDOWN_TOTAL) * 100}
                size="sm"
                color={otpCountdown < 10 ? "red" : "indigo"}
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {otpCountdown > 0 ? \`\${otpCountdown} 秒后可重新发送\` : "可重新发送"}
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  loading={loading}
                  disabled={otpCountdown > 0}
                  onClick={handleResendOtp}
                >
                  {otpCountdown > 0 ? \`重发 (\${otpCountdown}s)\` : "重新发送"}
                </Button>
              </Group>
              <Button type="submit" loading={loading} fullWidth>验证</Button>
            </Stack>
          </form>
        )}
      </Stack>
    </Paper>
  );
}
`;

// ============================================================
// 组件主体
// ============================================================
// 用 useState 占位，预留扩展（如目录折叠、滚动位置等）。
// 当前渲染 MarkdownRenderer + CodeBlock。
export default function AuthDemoTutorial() {
  const [activeChapter] = useState(0);

  return (
    <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
      <MarkdownRenderer content={tutorialContent} />
      <h2>完整登录流程代码示例</h2>
      <CodeBlock code={fullLoginExample} lang="jsx" maxHeight={600} />
    </div>
  );
}
