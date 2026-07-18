// =============================================================
// @forgerock/javascript-sdk 教程 —— 第 1 批：基础入门
// -------------------------------------------------------------
// 覆盖：SDK 介绍、安装与配置、FRAuth 认证树流程、FRStep 步骤、
//       FRCallback 基类、Callback 类型大全、登录流程示例。
// 章节对象格式：
//   { id, group, icon, title, content, code }
//   - content: Markdown 字符串（内部 ``` 代码围栏需写成 \`\`\` 转义）
//   - code:    可选的 CodeBlock 源码字符串（教程页底部展示，可在线运行）
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：SDK 介绍
  // -------------------------------------------------------------
  {
    id: "fr-intro",
    group: "基础入门",
    icon: "🛡️",
    title: "@forgerock/javascript-sdk 是什么",
    content: `# @forgerock/javascript-sdk 是什么

\`@forgerock/javascript-sdk\` 是 **Ping Identity（ForgeRock）** 官方维护的 JavaScript SDK，用于在前端应用中接入 ForgeRock Identity Platform（AM / Identity Cloud）的认证授权能力。

## 它能做什么

- **认证树（Authentication Trees）**：通过 \`FRAuth\` 走 AM 的认证树，支持用户名密码、OTP、社交登录、WebAuthn 等多种节点
- **OAuth 2.0 / OIDC**：通过 \`TokenManager\` / \`OAuth2Client\` 获取 access token、id token、refresh token
- **用户管理**：通过 \`FRUser\` / \`UserManager\` 完成登录、登出、获取用户信息
- **会话管理**：通过 \`SessionManager\` 结束 AM 会话
- **WebAuthn**：通过 \`FRWebAuthn\` 支持平台认证器与漫游认证器
- **密码策略**：通过 \`FRPolicy\` 在前端校验密码强度

## 核心模块速览

| 模块 | 作用 | 典型方法 |
| --- | --- | --- |
| \`Config\` | 全局配置 | \`Config.set(options)\` |
| \`FRAuth\` | 认证树流程 | \`start()\` / \`next(step)\` / \`resume(url)\` |
| \`FRStep\` | 单步操作 | \`getCallbackOfType()\` / \`setCallbackValue()\` |
| \`FRCallback\` | 回调基类及子类 | \`setInputValue()\` / \`getOutputByName()\` |
| \`TokenManager\` | OAuth2 令牌 | \`getTokens()\` / \`deleteTokens()\` |
| \`OAuth2Client\` | OAuth2 客户端 | \`createAuthorizeUrl()\` / \`getUserInfo()\` |
| \`FRUser\` | 用户登录登出 | \`login()\` / \`logout()\` |
| \`UserManager\` | 用户信息 | \`getCurrentUser()\` |
| \`SessionManager\` | 会话管理 | \`logout()\` |
| \`FRWebAuthn\` | WebAuthn | \`authenticate()\` / \`register()\` |
| \`FRPolicy\` | 密码策略 | \`validatePolicy()\` |

## 适用场景

- 企业 SSO 内嵌应用
- B2C 用户注册登录（支持手机号、邮箱、社交账号）
- 金融/政企对 WebAuthn、强认证有要求的场景
- 已经采购 Ping Identity / ForgeRock 平台的客户

## 依赖说明

- SDK 内部依赖 \`@reduxjs/toolkit\` + \`immer\`（用于状态管理）
- \`package.json\` 中 \`"type": "module"\`，默认 ESM 导出
- 同时提供 \`./device-client\` 子入口（设备profile采集场景）

## 版本

本教程基于 \`v4.9.1\`。

下一章我们开始安装并完成第一次配置。
`,
  },

  // -------------------------------------------------------------
  // 章节 2：安装与配置
  // -------------------------------------------------------------
  {
    id: "fr-install",
    group: "基础入门",
    icon: "📦",
    title: "安装与 Config.set 配置",
    content: `# 安装与 Config.set 配置

## 安装

\`\`\`bash
npm install @forgerock/javascript-sdk
\`\`\`

## 最小配置：Config.set

SDK 的所有模块都依赖一个**全局配置**，必须在调用任何 API 之前通过 \`Config.set(options)\` 设置一次。

\`\`\`js
import { Config } from "@forgerock/javascript-sdk";

// 应用启动时调用一次
Config.set({
  // OAuth2 客户端 ID（在 AM 中注册的 OAuth2 Agent 的 client_id）
  clientId: "myClient",
  // 服务器配置
  serverConfig: {
    // ForgeRock AM 的基础地址（注意不要带 /openam 尾巴，SDK 会自动拼接）
    baseUrl: "https://my-tenant.forgeblocks.com/am",
    // 请求超时（毫秒），默认 60s
    timeout: 5000,
  },
  // 认证树名称（在 AM 中配置的 tree name）
  tree: "UsernamePassword",
  // OAuth2 回调地址（必须与 AM 中注册的 redirect_uri 一致）
  redirectUri: window.location.origin + "/callback",
  // OAuth2 scope
  scope: "openid profile email",
  // Realm 路径（默认 "/"）
  realmPath: "root",
  // token 存储方式：'localStorage' | 'sessionStorage' | 自定义对象
  tokenStore: "localStorage",
  // 日志级别：'none' | 'info' | 'warn' | 'error' | 'debug'
  logLevel: "error",
});
\`\`\`

## ConfigOptions 完整字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| \`clientId\` | string | OAuth2 流程必填 | OAuth2 Agent 的 client_id |
| \`serverConfig.baseUrl\` | string | 必填 | AM 基础地址 |
| \`serverConfig.timeout\` | number | 可选 | 请求超时（毫秒） |
| \`tree\` | string | 可选 | 默认认证树名称 |
| \`redirectUri\` | string | OAuth2 必填 | 回调地址 |
| \`scope\` | string | OAuth2 必填 | 空格分隔的 scope |
| \`realmPath\` | string | 可选 | Realm 路径，默认 \`/\` |
| \`tokenStore\` \| string\|object | 可选 | token 存储方式，默认 \`localStorage\` |
| \`logLevel\` | string | 可选 | 日志级别，默认 \`none\` |
| \`oauthThreshold\` | number | 可选 | token 提前刷新阈值（秒） |
| \`middleware\` | RequestMiddleware[] | 可选 | 请求拦截中间件 |
| \`callbackFactory\` | function | 可选 | 自定义 Callback 工厂 |

## 在 React 中初始化的最佳实践

通常在应用启动时（\`app/layout.js\` 或一个独立的 \`init.js\` 模块）调用 \`Config.set\`，**只在客户端执行**，SSR 阶段不要调用。

\`\`\`js
// lib/forgerock-init.js
import { Config } from "@forgerock/javascript-sdk";

let initialized = false;

export function initForgeRock() {
  if (initialized) return;
  if (typeof window === "undefined") return; // SSR 跳过
  Config.set({
    clientId: process.env.NEXT_PUBLIC_FR_CLIENT_ID,
    serverConfig: {
      baseUrl: process.env.NEXT_PUBLIC_FR_BASE_URL,
      timeout: 5000,
    },
    tree: "UsernamePassword",
    redirectUri: window.location.origin + "/callback",
    scope: "openid profile email",
    realmPath: "root",
    tokenStore: "localStorage",
    logLevel: "error",
  });
  initialized = true;
}
\`\`\`

然后在 React 组件挂载后调用：

\`\`\`jsx
import { useEffect } from "react";
import { initForgeRock } from "@/lib/forgerock-init";

export default function AppShell({ children }) {
  useEffect(() => {
    initForgeRock();
  }, []);
  return children;
}
\`\`\`

## 获取当前配置：Config.get

\`\`\`js
import { Config } from "@forgerock/javascript-sdk";

const currentConfig = Config.get();
console.log(currentConfig.baseUrl, currentConfig.tree);
\`\`\`

\`Config.get()\` 返回的是**合并了默认值**的完整配置对象（\`ValidConfigOptions\`），用于内部模块读取。

## 异步配置：Config.setAsync

如果你的配置需要先异步获取（比如从后端拉取 tenant 信息），可以用 \`Config.setAsync\`：

\`\`\`js
await Config.setAsync({
  clientId: "myClient",
  serverConfig: { baseUrl: "https://example.com/am" },
  // 其他字段同 ConfigOptions
});
\`\`\`

下一章我们正式开始认证树流程。
`,
  },

  // -------------------------------------------------------------
  // 章节 3：FRAuth 认证树
  // -------------------------------------------------------------
  {
    id: "fr-fr-auth",
    group: "基础入门",
    icon: "🌳",
    title: "FRAuth 认证树流程",
    content: `# FRAuth 认证树流程

ForgeRock AM 的核心抽象是**认证树（Authentication Tree）**：一棵由多个节点组成的流程树，每个节点产生一个 \`Step\`，前端需要填充 \`Callback\` 并提交，AM 根据填充结果决定下一步走哪个节点。

\`FRAuth\` 是这棵树的"游标"，它有 4 个静态方法：

| 方法 | 作用 |
| --- | --- |
| \`FRAuth.start(options?)\` | 开始认证树，获取第一步 |
| \`FRAuth.next(prevStep?, options?)\` | 提交当前步骤并获取下一步 |
| \`FRAuth.redirect(step)\` | 跳转到外部 IdP（社交登录、SAML 等） |
| \`FRAuth.resume(url, options?)\` | 从外部 IdP 回跳后恢复流程 |

## 基本流程

\`\`\`
start() → Step1
  ↓ 填充 callback
next(step1) → Step2 或 LoginSuccess 或 LoginFailure
  ↓
  如果是 Step：继续填充并 next
  如果是 LoginSuccess：拿到 session/token
  如果是 LoginFailure：流程结束，展示错误
\`\`\`

## 最小示例：两步登录（用户名密码 + 完成）

\`\`\`js
import { FRAuth, FRStep } from "@forgerock/javascript-sdk";
import { StepType } from "@forgerock/javascript-sdk";

async function login(username, password) {
  // 1. 开始认证树
  let step = await FRAuth.start();

  // 2. 检查返回类型
  while (step.type === StepType.Step) {
    // 3. 填充 callback
    if (step.getStage() === "UsernamePassword") {
      step.getCallbackOfType("NameCallback").setInputValue(username);
      step.getCallbackOfType("PasswordCallback").setInputValue(password);
    }

    // 4. 提交并获取下一步
    step = await FRAuth.next(step);
  }

  // 5. 处理最终结果
  if (step.type === StepType.LoginSuccess) {
    console.log("登录成功", step.getSessionToken?.());
  } else {
    console.log("登录失败", step.getDetail?.());
  }
}
\`\`\`

## 三种返回类型

\`FRAuth.start/next/resume\` 都返回 \`Promise<FRStep | FRLoginSuccess | FRLoginFailure>\`，你需要用 \`step.type\` 区分：

| \`step.type\` | 含义 | 关键方法 |
| --- | --- | --- |
| \`StepType.Step\` | 还需要继续走树 | \`getCallbacks()\` / \`getStage()\` |
| \`StepType.LoginSuccess\` | 登录成功 | \`getSessionToken()\` / \`getDetail()\` |
| \`StepType.LoginFailure\` | 登录失败 | \`getDetail()\` / \`getMessage()\` |

## StepOptions：覆盖默认配置

每个方法都接受 \`options?: StepOptions\`，可以在调用时覆盖 \`tree\`、\`realmPath\` 等：

\`\`\`js
// 临时切换到另一棵树
const step = await FRAuth.start({ tree: "RegistrationTree" });
\`\`\`

## redirect 与 resume：外部 IdP 场景

如果认证树里包含社交登录节点（Google、Apple 等），SDK 会返回一个 \`RedirectCallback\`，这时需要：

\`\`\`js
import { FRAuth } from "@forgerock/javascript-sdk";

// 当前步骤包含 RedirectCallback
FRAuth.redirect(step); // 浏览器会跳转到 IdP

// 用户回跳到 redirectUri 后，恢复流程
const url = window.location.href;
const finalStep = await FRAuth.resume(url);
\`\`\`

\`FRAuth.redirect\` 会把当前 step 暂存到 localStorage，\`resume\` 时会自动取出来继续。

## 踩坑提示

- **\`FRAuth.start\` 本质就是 \`FRAuth.next(undefined)\`**，没区别
- **\`Config.set\` 必须先调用**，否则 \`start\` 会抛 \`"Configuration not set"\`
- **每个 step 的 callback 是不可变的**，填充后必须把 step 对象传给 \`next\`，不能丢弃
- **\`StepType\` 枚举值是字符串**，可以直接 console.log 看内容

下一章我们详细讲解 \`FRStep\` 的 API。
`,
  },

  // -------------------------------------------------------------
  // 章节 4：FRStep 详解
  // -------------------------------------------------------------
  {
    id: "fr-step",
    group: "基础入门",
    icon: "🪜",
    title: "FRStep 步骤详解",
    content: `# FRStep 步骤详解

\`FRStep\` 表示认证树中的**一步**，它包装了 AM 返回的 \`payload\`，并提供便利方法访问其中的 \`Callback\`。

## 属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| \`type\` | \`StepType.Step\` | 永远是 \`StepType.Step\`（区分于 Success/Failure） |
| \`payload\` | \`Step\` | AM 返回的原始 payload |
| \`callbacks\` | \`FRCallback[]\` | 当前步骤包含的所有 callback |

## 方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| \`getCallbackOfType(type)\` | \`FRCallback\` | 取第一个指定类型的 callback |
| \`getCallbacksOfType(type)\` | \`FRCallback[]\` | 取所有指定类型的 callback |
| \`setCallbackValue(type, value)\` | \`void\` | 设置第一个匹配 callback 的值（快捷方式） |
| \`getDescription()\` \| \`string\|undefined\` | 步骤描述 |
| \`getHeader()\` \| \`string\|undefined\` | 步骤标题 |
| \`getStage()\` \| \`string\|undefined\` | **stage 标识符**（最常用来分支） |

## getStage：分支的关键

\`stage\` 是 AM 节点配置的标识符，前端用它来决定渲染哪个表单：

\`\`\`js
const step = await FRAuth.start();
const stage = step.getStage();

switch (stage) {
  case "UsernamePassword":
    // 渲染用户名密码表单
    break;
  case "OTP":
    // 渲染 OTP 输入框
    break;
  case "WebAuthn":
    // 触发 WebAuthn 流程
    break;
}
\`\`\`

## 快捷填充：setCallbackValue

\`\`\`js
// 等价于 step.getCallbackOfType("NameCallback").setInputValue("alice")
step.setCallbackValue("NameCallback", "alice");
step.setCallbackValue("PasswordCallback", "secret123");
\`\`\`

注意：如果有多个同类型 callback，\`setCallbackValue\` 只会设置第一个。

## 遍历所有 callback

\`\`\`js
const step = await FRAuth.start();

step.callbacks.forEach((cb) => {
  console.log(cb.getType(), cb);
});
// 输出形如：
// NameCallback { ... }
// PasswordCallback { ... }
\`\`\`

## 用 getCallbackOfType 取具体子类

\`getCallbackOfType\` 是泛型方法，可以拿到具体子类实例：

\`\`\`js
import { FRAuth } from "@forgerock/javascript-sdk";

const step = await FRAuth.start();

const nameCb = step.getCallbackOfType("NameCallback");
const prompt = nameCb.getOutputByName("prompt", "Username:");
console.log(prompt); // "Username:"

nameCb.setInputValue("alice");
\`\`\`

## 链式调试

\`\`\`js
const step = await FRAuth.start();
console.log("header:", step.getHeader());
console.log("description:", step.getDescription());
console.log("stage:", step.getStage());
console.log("callbacks:", step.callbacks.map(c => c.getType()));
\`\`\`

下一章我们讲解 \`FRCallback\` 基类。
`,
  },

  // -------------------------------------------------------------
  // 章节 5：FRCallback 基类
  // -------------------------------------------------------------
  {
    id: "fr-callback",
    group: "基础入门",
    icon: "🔌",
    title: "FRCallback 回调基类",
    content: `# FRCallback 回调基类

\`FRCallback\` 是所有 callback 类型的**基类**，它包装了 AM 返回的 \`Callback\` payload，提供统一的 input/output 访问接口。

## 核心概念：input / output

每个 callback 都有 **output**（AM 给前端的提示信息，如 prompt）和 **input**（前端需要填的字段）。理解这一点就理解了 callback 的本质。

\`\`\`
AM → output → 前端展示
前端 → input → AM 处理
\`\`\`

## 基类方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| \`getType()\` | \`CallbackType\` | callback 类型字符串 |
| \`getInputValue(selector?)\` | \`unknown\` | 取 input 值（按 index 或 name） |
| \`setInputValue(value, selector?)\` | \`void\` | 设置 input 值 |
| \`getOutputValue(selector?)\` | \`unknown\` | 取 output 值 |
| \`getOutputByName(name, defaultValue)\` | \`T\` | 按 name 取 output，找不到返回默认值 |

## getType：判断 callback 类型

\`\`\`js
const cb = step.callbacks[0];
console.log(cb.getType());
// "NameCallback" | "PasswordCallback" | "ChoiceCallback" | ...
\`\`\`

## getOutputByName：取 prompt

最常用的场景：拿 \`NameCallback\` 的提示文字。

\`\`\`js
const nameCb = step.getCallbackOfType("NameCallback");
const prompt = nameCb.getOutputByName("prompt", "Username:");
// prompt 现在是 "User Name:" 或自定义默认值
\`\`\`

## setInputValue：填充用户输入

\`\`\`js
nameCb.setInputValue("alice");
// 等价于 setInputValue("alice", 0)，填到第一个 input
\`\`\`

对于有多个 input 的 callback（如 \`ChoiceCallback\`），可以按 name 或 index 填：

\`\`\`js
const choiceCb = step.getCallbackOfType("ChoiceCallback");
const choices = choiceCb.getOutputByName("choices", []);
console.log(choices); // ["Email", "SMS"]

// 选中第 0 个
choiceCb.setInputValue(0, 0); // 第一个 0 是 input index
\`\`\`

## 完整示例：渲染一个表单

\`\`\`js
import { FRAuth } from "@forgerock/javascript-sdk";

const step = await FRAuth.start();

// 收集每个 callback 的展示信息
const fields = step.callbacks.map((cb) => {
  switch (cb.getType()) {
    case "NameCallback":
      return {
        type: "text",
        label: cb.getOutputByName("prompt", "Username"),
        fill: (v) => cb.setInputValue(v),
      };
    case "PasswordCallback":
      return {
        type: "password",
        label: cb.getOutputByName("prompt", "Password"),
        fill: (v) => cb.setInputValue(v),
      };
    default:
      return null;
  }
}).filter(Boolean);
\`\`\`

## 踩坑提示

- \`getOutputByName\` 必须传 \`defaultValue\`，否则返回 \`undefined\`
- \`setInputValue\` 的第二参数 \`selector\` 可以是 number（按 index）或 string（按 name）
- callback 对象**不要直接修改 \`payload\`**，所有修改都要通过 \`setInputValue\`

下一章我们列出所有 callback 子类。
`,
  },

  // -------------------------------------------------------------
  // 章节 6：Callback 类型大全
  // -------------------------------------------------------------
  {
    id: "fr-callback-types",
    group: "基础入门",
    icon: "📚",
    title: "Callback 类型大全",
    content: `# Callback 类型大全

SDK 内置了 20+ 种 callback 子类，每种对应 AM 认证树中的一个节点类型。下面按使用频率排序介绍。

## 速查表

| 类型 | 用途 | 关键 output |
| --- | --- | --- |
| \`NameCallback\` | 用户名输入 | \`prompt\` |
| \`PasswordCallback\` | 密码输入 | \`prompt\` |
| \`ChoiceCallback\` | 单选下拉 | \`choices\` |
| \`ConfirmationCallback\` | 确认/取消按钮 | \`options\` |
| \`TextInputCallback\` | 通用文本输入 | \`prompt\` |
| \`TextOutputCallback\` | 展示一段文字 | \`message\` |
| \`HiddenValueCallback\` | 隐藏字段（CSRF 等） | — |
| \`RedirectCallback\` | 外部 IdP 跳转 | \`redirectUri\` |
| \`SelectIdPCallback\` | 选择社交 IdP | \`providers\` |
| \`TermsAndConditionsCallback\` | 同意条款 | \`terms\` / \`version\` |
| \`ValidatedCreatePasswordCallback\` | 注册密码（带策略） | \`policies\` |
| \`ValidatedCreateUsernameCallback\` | 注册用户名（带策略） | \`policies\` |
| \`PollingWaitCallback\` | 轮询等待 | \`waitTime\` |
| \`ReCaptchaCallback\` | Google reCAPTCHA v2 | \`siteKey\` |
| \`ReCaptchaEnterpriseCallback\` | reCAPTCHA Enterprise | \`siteKey\` |
| \`KbaCreateCallback\` | 安全问题设置 | \`questions\` |
| \`AttributeInputCallback\` | 通用属性输入（邮箱、手机等） | \`name\` / \`value\` |
| \`PingOneProtectEvaluationCallback\` | PingOne Protect 风险评估 | — |
| \`DeviceProfileCallback\` | 设备信息采集 | — |
| \`SuspendedTextOutputCallback\` | 流程暂停提示 | \`message\` |

## NameCallback

\`\`\`js
const cb = step.getCallbackOfType("NameCallback");
const label = cb.getOutputByName("prompt", "Username:");
cb.setInputValue("alice");
\`\`\`

## PasswordCallback

\`\`\`js
const cb = step.getCallbackOfType("PasswordCallback");
const label = cb.getOutputByName("prompt", "Password:");
cb.setInputValue("secret123");
\`\`\`

## ChoiceCallback

AM 返回多个选项，前端选一个：

\`\`\`js
const cb = step.getCallbackOfType("ChoiceCallback");
const choices = cb.getOutputByName("choices", []);
// ["Send Email", "Send SMS"]
const defaultSelection = cb.getOutputByName("defaultChoiceValues", []);
// [0]

cb.setInputValue(1); // 选中 "Send SMS"
\`\`\`

## ConfirmationCallback

类似 \`ChoiceCallback\`，但语义是"确认/取消"：

\`\`\`js
const cb = step.getCallbackOfType("ConfirmationCallback");
const options = cb.getOutputByName("options", []);
// ["Yes", "No"]

cb.setInputValue(0); // 选 Yes
\`\`\`

## TextInputCallback

通用文本输入，常用于 OTP、邮箱验证码：

\`\`\`js
const cb = step.getCallbackOfType("TextInputCallback");
const label = cb.getOutputByName("prompt", "Enter OTP:");
cb.setInputValue("123456");
\`\`\`

## TextOutputCallback

只展示文字，不需要输入。注意 AM 可能在下一步就完成登录，所以**遇到它仍要 \`next\`**：

\`\`\`js
const cb = step.getCallbackOfType("TextOutputCallback");
const message = cb.getOutputByName("message", "");
const msgType = cb.getOutputByName("messageType", 0);
// 0=info 1=warning 2=error 3=success

// 直接 next 即可
step = await FRAuth.next(step);
\`\`\`

## HiddenValueCallback

服务端要求的隐藏字段，UI 上不渲染但必须填：

\`\`\`js
const cb = step.getCallbackOfType("HiddenValueCallback");
const id = cb.getOutputByName("id", "");
if (id === "csrf-token") {
  cb.setInputValue(getCsrfToken());
}
\`\`\`

## RedirectCallback

外部 IdP 跳转，**用 \`FRAuth.redirect(step)\` 而不是手动处理**：

\`\`\`js
const step = await FRAuth.next(prevStep);
if (step.type === StepType.Step && step.getCallbackOfType("RedirectCallback")) {
  FRAuth.redirect(step);
  return; // 浏览器会跳走
}
\`\`\`

## SelectIdPCallback

社交登录选择：

\`\`\`js
const cb = step.getCallbackOfType("SelectIdPCallback");
const providers = cb.getOutputByName("providers", []);
// [{ provider: "google", displayName: "Google" }, ...]

cb.setInputValue("google");
\`\`\`

## TermsAndConditionsCallback

条款同意：

\`\`\`js
const cb = step.getCallbackOfType("TermsAndConditionsCallback");
const terms = cb.getOutputByName("terms", "");
const version = cb.getOutputByName("version", "v1");
cb.setInputValue(true); // 同意
\`\`\`

## ValidatedCreatePasswordCallback

注册密码，附带密码策略：

\`\`\`js
const cb = step.getCallbackOfType("ValidatedCreatePasswordCallback");
const prompt = cb.getOutputByName("prompt", "Password:");
const policies = cb.getOutputByName("policies", []);
// [{ policyId: "atLeastOneNumber", ... }]

cb.setInputValue("MyPass123!");
\`\`\`

可以配合 \`FRPolicy.validatePolicy()\` 前端校验，详见 batch3。

## PollingWaitCallback

需要轮询等待（如短信网关）：

\`\`\`js
const cb = step.getCallbackOfType("PollingWaitCallback");
const wait = cb.getOutputByName("waitTime", 5000);

setTimeout(() => {
  step = await FRAuth.next(step);
}, wait);
\`\`\`

## AttributeInputCallback

通用属性输入（注册时填邮箱、姓名等）：

\`\`\`js
const cb = step.getCallbackOfType("AttributeInputCallback");
const name = cb.getOutputByName("name", "");
// "mail" | "givenName" | ...
const value = cb.getOutputByName("value", "");

cb.setInputValue("alice@example.com");
\`\`\`

下一章我们写一个完整的登录流程示例。
`,
  },

  // -------------------------------------------------------------
  // 章节 7：完整登录流程示例
  // -------------------------------------------------------------
  {
    id: "fr-login-flow",
    group: "基础入门",
    icon: "🚀",
    title: "完整登录流程示例",
    content: `# 完整登录流程示例

本章把前 6 章的 API 串起来，写一个能覆盖大多数场景的"通用登录函数"。

## 设计目标

- 支持任意认证树，按 \`stage\` 分发到不同的 UI 渲染函数
- 支持 \`RedirectCallback\`（社交登录）
- 支持 \`PollingWaitCallback\`（异步等待）
- 处理 \`LoginSuccess\` 和 \`LoginFailure\`
- 错误抛出，UI 层 try/catch

## 完整代码

\`\`\`js
import { FRAuth, FRStep, StepType, CallbackType } from "@forgerock/javascript-sdk";

// UI 渲染函数由调用方提供，返回 Promise<FRStep>
// 这里只是一个类型签名说明
async function renderStage(step) {
  const stage = step.getStage();
  switch (stage) {
    case "UsernamePassword":
      return renderUsernamePassword(step);
    case "OTP":
      return renderOTP(step);
    default:
      // 通用 fallback：把所有 callback 都渲染成 input
      return renderGeneric(step);
  }
}

// 主流程
export async function runAuthTree({ tree } = {}) {
  let step = await FRAuth.start(tree ? { tree } : undefined);

  while (step.type === StepType.Step) {
    // 1. 处理 RedirectCallback（社交登录）
    if (step.getCallbackOfType(CallbackType.RedirectCallback)) {
      FRAuth.redirect(step);
      return; // 浏览器会跳走
    }

    // 2. 处理 PollingWaitCallback（轮询等待）
    const polling = step.getCallbackOfType(CallbackType.PollingWaitCallback);
    if (polling) {
      const wait = polling.getOutputByName("waitTime", 5000);
      await new Promise((r) => setTimeout(r, wait));
      step = await FRAuth.next(step);
      continue;
    }

    // 3. 普通步骤：交给 UI 渲染并填充 callback
    const filledStep = await renderStage(step);

    // 4. 提交
    step = await FRAuth.next(filledStep);
  }

  // 5. 处理最终结果
  if (step.type === StepType.LoginSuccess) {
    return { ok: true, step };
  } else {
    const detail = step.getDetail?.() ?? "Login failed";
    throw new Error(detail);
  }
}

// 从 redirectUri 恢复（社交登录回跳后）
export async function resumeAuthTree() {
  const url = window.location.href;
  const step = await FRAuth.resume(url);

  if (step.type === StepType.LoginSuccess) {
    return { ok: true, step };
  } else if (step.type === StepType.Step) {
    // 恢复后可能还要继续走
    return runAuthTree();
  } else {
    throw new Error(step.getDetail?.() ?? "Resume failed");
  }
}
\`\`\`

## 在 React 中使用

\`\`\`jsx
import { useEffect, useState } from "react";
import { runAuthTree, resumeAuthTree } from "@/lib/auth-flow";

export default function LoginPage() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // 检测是否是 redirect 回跳
    const isRedirect = new URL(window.location.href).searchParams.has("code")
                   || new URL(window.location.href).searchParams.has("error");

    (async () => {
      try {
        if (isRedirect) {
          await resumeAuthTree();
        }
        // 否则等用户点登录按钮
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  async function handleLogin(username, password) {
    try {
      await runAuthTree({ tree: "UsernamePassword" });
      // 成功后跳转
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e.message);
    }
  }

  return <LoginForm onSubmit={handleLogin} error={error} />;
}
\`\`\`

## 配合 TokenManager 拿 OAuth2 token

如果还需要 OAuth2 token（不是只拿 AM session），登录成功后调用：

\`\`\`js
import { TokenManager } from "@forgerock/javascript-sdk";

const tokens = await TokenManager.getTokens({ forceRenew: true });
console.log(tokens.accessToken, tokens.idToken);
\`\`\`

batch2 会详细讲 \`TokenManager\`。
`,
  },
];
