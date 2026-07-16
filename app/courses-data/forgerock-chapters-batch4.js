// =============================================================
// @forgerock/javascript-sdk 教程 —— 第 4 批：高级主题
// -------------------------------------------------------------
// 覆盖：错误处理与重试、Redirect 流程详解、自定义 Callback、
//       生产环境最佳实践、调试与常见问题。
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：错误处理
  // -------------------------------------------------------------
  {
    id: "fr-error-handling",
    group: "高级主题",
    icon: "🐛",
    title: "错误处理与重试",
    content: `# 错误处理与重试

SDK 的错误主要分四类：网络错误、认证失败、token 过期、配置错误。

## 1. 网络错误

\`FRAuth.next\` / \`TokenManager.getTokens\` 等所有网络调用都可能抛 \`FailedToFetch\` 或 \`NetworkError\`：

\`\`\`js
import { FRAuth } from "@forgerock/javascript-sdk";

try {
  const step = await FRAuth.start();
} catch (e) {
  if (e.message === "FailedToFetch" || e.message === "NetworkError") {
    // 网络问题，建议重试
  }
}
\`\`\

## 2. allowedErrors 白名单

\`OAuth2Client\` 导出的 \`allowedErrors\` 是"可恢复"错误，表示"需要重新登录"而非"系统故障"：

\`\`\`js
import { allowedErrors } from "@forgerock/javascript-sdk";

const RECOVERABLE = new Set(Object.values(allowedErrors));

function isErrorRecoverable(message) {
  return RECOVERABLE.has(message);
}

// iframe 静默续期失败时
try {
  await TokenManager.getTokens();
} catch (e) {
  if (isErrorRecoverable(e.message)) {
    router.push("/login");
  } else {
    setError("系统错误: " + e.message);
  }
}
\`\`\`

\`allowedErrors\` 列表：

- \`AuthenticationConsentRequired\` — 需要用户授权同意
- \`AuthenticationIsRequired\` — 需要重新登录
- \`AuthorizationTimeout\` — iframe 续期超时
- \`FailedToFetch\` — fetch 失败
- \`NetworkError\` — 网络错误
- \`CORSError\` — CORS 配置问题
- \`InteractionNotAllowed\` — 当前 tree 不允许交互
- \`LoginRequired\` — 需要重新登录
- \`RequestRequiresConsent\` — 需要用户同意

## 3. 自动重试封装

\`\`\`js
async function withRetry(fn, maxRetries = 2) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (e.message === "FailedToFetch" || e.message === "NetworkError") {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1))); // 指数退避
        continue;
      }
      throw e; // 非网络错误直接抛
    }
  }
  throw lastError;
}

// 使用
const step = await withRetry(() => FRAuth.start(), 2);
\`\`\`

## 4. LoginFailure 处理

\`FRAuth.next\` 返回 \`LoginFailure\` 不会抛错，需要主动检查 \`step.type\`：

\`\`\`js
import { FRAuth, StepType } from "@forgerock/javascript-sdk";

const step = await FRAuth.next(prevStep);
if (step.type === StepType.LoginFailure) {
  const detail = step.getDetail?.() ?? "登录失败";
  const message = step.getMessage?.() ?? detail;
  throw new Error(message);
}
\`\`\`

## 5. token 过期处理

\`TokenManager.getTokens()\` 会在 token 即将过期时自动续期，但续期可能失败：

\`\`\`js
try {
  const tokens = await TokenManager.getTokens();
} catch (e) {
  if (e.message === allowedErrors.AuthenticationIsRequired) {
    // refresh token 也失效了，需要重新登录
    router.push("/login");
  } else if (e.message === "AuthorizationTimeout") {
    // iframe 续期超时
    router.push("/login");
  } else {
    throw e;
  }
}
\`\`\`

## 6. 配置错误

\`Config.set\` 不会校验参数，但调用 API 时会抛 \`"Configuration not set"\` 或 \`"Missing clientId"\`：

\`\`\`js
try {
  await FRAuth.start();
} catch (e) {
  if (/Configuration not set|Missing/i.test(e.message)) {
    // 忘了 Config.set 或参数不全
    console.error("初始化失败:", e.message);
  }
}
\`\`\`

## 7. 统一错误封装

\`\`\`js
class AuthError extends Error {
  constructor(message, { recoverable = false, retryable = false } = {}) {
    super(message);
    this.recoverable = recoverable;
    this.retryable = retryable;
  }
}

async function safeCall(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    const recoverable = isErrorRecoverable(e.message);
    const retryable = ["FailedToFetch", "NetworkError", "AuthorizationTimeout"].includes(e.message);
    return { ok: false, error: new AuthError(e.message, { recoverable, retryable }) };
  }
}

// 使用
const { ok, data, error } = await safeCall(() => FRAuth.start());
if (!ok) {
  if (error.recoverable) router.push("/login");
  else if (error.retryable) showRetryButton();
  else showError(error.message);
}
\`\`\`

## 踩坑提示

- \`LoginFailure\` 不抛错，**必须检查 \`step.type\`**
- \`allowedErrors\` 的字符串**不带空格**，比较时注意
- iframe 续期失败时浏览器控制台会有 CORS 警告，但 \`e.message\` 仍是 \`AuthenticationIsRequired\`
- 重试时要区分"网络错误"（可重试）和"配置错误"（重试无用）
`,
  },

  // -------------------------------------------------------------
  // 章节 2：Redirect 流程
  // -------------------------------------------------------------
  {
    id: "fr-redirect-flow",
    group: "高级主题",
    icon: "🔀",
    title: "Redirect 流程详解",
    content: `# Redirect 流程详解

OAuth2 的 redirect 流程涉及多个页面跳转，本章梳理完整链路。

## 流程总览

\`\`\`
[登录页] → TokenManager.getTokens({ login: 'redirect' })
   ↓ 浏览器跳转到 AM /authorize
[AM 登录页] → 用户输入凭证
   ↓ AM 跳回 redirectUri
[Callback 页] → TokenManager.getTokens({ query: { code, state } })
   ↓ 换 token
[业务页]
\`\`\`

## 1. 触发 redirect 登录

\`\`\`js
// /login 页
import { TokenManager } from "@forgerock/javascript-sdk";

async function handleRedirectLogin() {
  // 这行执行后浏览器会跳走，下面代码不会执行
  await TokenManager.getTokens({
    forceRenew: true,
    login: "redirect",
  });
}
\`\`\`

## 2. AM 端配置

在 AM OAuth2 Agent 配置里：

- \`redirect_uri\` 必须包含 \`window.location.origin + "/callback"\`
- \`grant_type\` 包含 \`authorization_code\`
- \`response_type\` 包含 \`code\`
- 启用 PKCE（推荐）

## 3. 回调页处理

\`\`\`jsx
// app/callback/page.js
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TokenManager } from "@forgerock/javascript-sdk";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      router.replace(\`/login?error=\${encodeURIComponent(error)}\`);
      return;
    }

    if (!code) {
      router.replace("/login");
      return;
    }

    TokenManager.getTokens({ query: { code, state } })
      .then(() => router.replace("/dashboard"))
      .catch((e) => router.replace(\`/login?error=\${encodeURIComponent(e.message)}\`));
  }, [router, searchParams]);

  return <div>处理回调中...</div>;
}
\`\`\`

## 4. state 参数的作用

\`state\` 是 SDK 自动生成的随机串，存在 sessionStorage 里，回跳后用来：

- 防 CSRF：回跳的 state 必须与发起时一致
- 恢复流程上下文（如果中途有自定义参数）

如果 state 不匹配，\`getTokens({ query })\` 会抛 \`"State mismatch"\`。

## 5. 社交登录 redirect（FRAuth.redirect）

社交登录（Google、Apple）走的是 \`FRAuth.redirect(step)\` 而不是 \`TokenManager\`：

\`\`\`js
// /login 页
import { FRAuth, StepType } from "@forgerock/javascript-sdk";

async function startSocialLogin() {
  let step = await FRAuth.start({ tree: "SocialLogin" });
  // 第一步通常含 SelectIdPCallback
  step.getCallbackOfType("SelectIdPCallback").setInputValue("google");
  step = await FRAuth.next(step);

  // 第二步含 RedirectCallback
  if (step.getCallbackOfType("RedirectCallback")) {
    FRAuth.redirect(step); // 跳到 Google
    return;
  }
}
\`\`\`

Google 登录完成后，AM 跳回 \`redirectUri\`（**与 OAuth2 的 redirectUri 同一个**），此时：

\`\`\`jsx
// /callback 页
import { FRAuth, StepType } from "@forgerock/javascript-sdk";

useEffect(() => {
  const url = window.location.href;
  // 优先尝试 OAuth2 code
  const code = new URL(url).searchParams.get("code");

  if (code) {
    // OAuth2 redirect 流程
    TokenManager.getTokens({ query: { code, state: new URL(url).searchParams.get("state") } })
      .then(() => router.replace("/dashboard"));
  } else {
    // 社交登录回跳，恢复认证树
    FRAuth.resume(url).then((step) => {
      if (step.type === StepType.LoginSuccess) {
        router.replace("/dashboard");
      }
    });
  }
}, []);
\`\`\`

## 6. 单点登出（OIDC end_session）

\`\`\`js
import { OAuth2Client } from "@forgerock/javascript-sdk";

// 跳到 AM end_session 端点，登出后回到 logoutRedirectUri
window.location.href = await OAuth2Client.createEndSessionUrl({
  logoutRedirectUri: window.location.origin + "/login",
});
// 或直接调
await OAuth2Client.endSession({
  logoutRedirectUri: window.location.origin + "/login",
});
\`\`\`

\`endSession\` 会跳到 AM 的 \`/connect/endSession\`，AM 清完 session 后跳回 \`logoutRedirectUri\`。

## 7. 跨子域 SSO

如果多个应用在同一个 AM realm 下：

- 共享 AM cookie（CDSSO）：cookie 域要设为 \`.example.com\`
- 共享 OAuth2 token：\`tokenStore: 'localStorage'\` 但 localStorage 不跨域
- 推荐方案：每个子域独立走 OAuth2，AM cookie 提供 SSO，每个应用各自拿 token

## 踩坑提示

- \`redirectUri\` 必须**与 AM 注册的完全一致**（包括协议、端口、路径）
- \`state\` 不匹配通常是 sessionStorage 被清空（隐私模式、清缓存）
- \`endSession\` 跳转后回到的页面**不能再调 \`endSession\`**，会循环
`,
  },

  // -------------------------------------------------------------
  // 章节 3：自定义 Callback
  // -------------------------------------------------------------
  {
    id: "fr-custom-callback",
    group: "高级主题",
    icon: "🧩",
    title: "自定义 Callback 处理",
    content: `# 自定义 Callback 处理

当 AM 配置了非标准节点，或你想完全控制 UI 渲染时，可以用 \`callbackFactory\` 自定义 callback 实例化。

## 1. callbackFactory 配置

\`Config.set({ callbackFactory })\` 接受一个函数，参数是 \`type: string\` 和 \`payload: Callback\`，返回一个 \`FRCallback\` 子类实例。

\`\`\`js
import { Config, FRCallback } from "@forgerock/javascript-sdk";

class MyCustomCallback extends FRCallback {
  constructor(payload) {
    super(payload);
  }
  getCustomField() {
    return this.getOutputByName("customField", "");
  }
}

Config.set({
  // ...其他
  callbackFactory: (type, payload) => {
    if (type === "CustomCallbackType") {
      return new MyCustomCallback(payload);
    }
    return undefined; // 返回 undefined 走 SDK 默认实例化
  },
});
\`\`\`

返回 \`undefined\` 时 SDK 会用内置的 callback 工厂创建对应的 \`FRCallback\` 子类实例。

## 2. 直接用 payload 操作

如果不想自定义类，也可以直接读 \`payload\`：

\`\`\`js
const step = await FRAuth.start();
step.callbacks.forEach((cb) => {
  // payload 是 AM 返回的原始结构
  console.log(cb.payload.type);
  console.log(cb.payload.output?.[0]?.value);
});
\`\`\`

\`FRCallback.payload\` 是公开属性，可以直接访问。

## 3. 自定义渲染策略

不用 \`stage\` 分支，而是用 \`callback.getType()\` 分发：

\`\`\`js
const RENDERERS = {
  NameCallback: (cb, fill) => (
    <TextInput label={cb.getOutputByName("prompt", "用户名")} onChange={fill} />
  ),
  PasswordCallback: (cb, fill) => (
    <PasswordInput label={cb.getOutputByName("prompt", "密码")} onChange={fill} />
  ),
  ChoiceCallback: (cb, fill) => (
    <Select
      label="请选择"
      options={cb.getOutputByName("choices", [])}
      onChange={fill}
    />
  ),
  // 自定义类型
  CustomCallbackType: (cb, fill) => (
    <CustomComponent field={cb.getCustomField?.() ?? cb.getOutputByName("customField", "")} onChange={fill} />
  ),
};

function renderCallback(cb, fill) {
  const Renderer = RENDERERS[cb.getType()];
  if (!Renderer) {
    return <div>未支持的类型: {cb.getType()}</div>;
  }
  return <Renderer cb={cb} fill={fill} />;
}
\`\`\`

## 4. 处理未知 callback

遇到 SDK 没识别的 callback 类型，\`cb.getType()\` 会返回原字符串，可以用 \`FRCallback\` 基类方法兜底：

\`\`\`js
const cb = step.callbacks.find((c) => c.getType() === "UnknownType");
if (cb) {
  // 用基类方法读 output
  const prompt = cb.getOutputByName("prompt", "");
  // 用基类方法填 input
  cb.setInputValue("my-value");
}
\`\`\`

\`FRCallback\` 基类的 \`getInputValue\` / \`setInputValue\` / \`getOutputValue\` / \`getOutputByName\` 适用于任何 callback，**类型不需要子类化也能用**。

## 5. 跳过不需要填的 callback

有些 callback 是只读的（\`TextOutputCallback\`、\`MetadataCallback\`），不需要填 input：

\`\`\`js
step.callbacks.forEach((cb) => {
  if (cb.getType() === "TextOutputCallback") {
    // 只展示，不填
    return;
  }
  // 其他填充
});
\`\`\`

## 6. 多 callback 同类型

如果有多个 \`TextInputCallback\`，用 \`getCallbacksOfType\`：

\`\`\`js
const otpCallbacks = step.getCallbacksOfType("TextInputCallback");
otpCallbacks[0].setInputValue(otp1);
otpCallbacks[1].setInputValue(otp2);
\`\`\`

## 踩坑提示

- \`callbackFactory\` 返回 \`undefined\` 时**必须**显式返回，不要 \`return null\`
- 自定义类要 \`extends FRCallback\` 并在 \`constructor\` 调用 \`super(payload)\`
- 直接改 \`payload\` 不影响 AM，所有修改通过 \`setInputValue\` 才会被 \`next\` 提交
`,
  },

  // -------------------------------------------------------------
  // 章节 4：生产环境最佳实践
  // -------------------------------------------------------------
  {
    id: "fr-production",
    group: "高级主题",
    icon: "🚀",
    title: "生产环境最佳实践",
    content: `# 生产环境最佳实践

## 1. 环境变量管理

\`\`\`bash
# .env.local（不提交）
NEXT_PUBLIC_FR_BASE_URL=https://my-tenant.forgeblocks.com/am
NEXT_PUBLIC_FR_CLIENT_ID=my-web-client
NEXT_PUBLIC_FR_TREE=UsernamePassword
NEXT_PUBLIC_FR_SCOPE="openid profile email"
NEXT_PUBLIC_FR_REALM=root
\`\`\`

\`\`\`js
// lib/forgerock-config.js
export const frConfig = {
  clientId: process.env.NEXT_PUBLIC_FR_CLIENT_ID,
  serverConfig: {
    baseUrl: process.env.NEXT_PUBLIC_FR_BASE_URL,
    timeout: 5000,
  },
  tree: process.env.NEXT_PUBLIC_FR_TREE,
  redirectUri:
    typeof window !== "undefined"
      ? window.location.origin + "/callback"
      : "http://localhost:3000/callback",
  scope: process.env.NEXT_PUBLIC_FR_SCOPE,
  realmPath: process.env.NEXT_PUBLIC_FR_REALM,
  tokenStore: "localStorage",
  logLevel: process.env.NODE_ENV === "production" ? "error" : "debug",
};
\`\`\`

## 2. 日志级别

生产环境用 \`"error"\` 或 \`"none"\`，开发用 \`"debug"\`：

\`\`\`js
Config.set({
  logLevel: process.env.NODE_ENV === "production" ? "error" : "debug",
});
\`\`\

\`"debug"\` 会在 console 打印每个请求和响应，含敏感信息，**不要上线**。

## 3. 安全配置

| 项 | 建议 |
| --- | --- |
| HTTPS | 必须（WebAuthn 强制） |
| AM cookie | HttpOnly + Secure + SameSite=Lax |
| tokenStore | 高安全场景用 sessionStorage |
| PKCE | 必须开启（默认） |
| state 校验 | 不要禁用 |
| redirectUri 白名单 | AM 端严格校验 |
| refresh token rotation | 启用 |
| log 脱敏 | 自己加中间件打码 |

## 4. 请求中间件

\`Config.set({ middleware })\` 可以拦截所有请求，用于加自定义 header、日志、打码：

\`\`\`js
function authMiddleware(req, res, next) {
  // 加自定义 header
  req.headers["X-My-App"] = "v1.0";
  next(req);
}

function logMiddleware(req, res, next) {
  console.log("[FR]", req.url);
  next(req);
}

function redactMiddleware(req, res, next) {
  // 打码密码字段
  if (req.body?.password) {
    console.log("[FR] body.password = ***");
  }
  next(req);
}

Config.set({
  middleware: [logMiddleware, redactMiddleware, authMiddleware],
});
\`\`\`

\`middleware\` 签名是 \`RequestMiddleware\`，参数 \`{ url, init, action }\`，调用 \`next(init)\` 继续传递。

## 5. token 刷新策略

\`oauthThreshold\` 控制 token 提前刷新阈值（秒），默认 30s：

\`\`\`js
Config.set({
  oauthThreshold: 60, // 提前 60s 刷新
});
\`\`\`

手动续期：

\`\`\`js
import { TokenManager } from "@forgerock/javascript-sdk";

async function ensureValidToken() {
  try {
    const tokens = await TokenManager.getTokens();
    if (!tokens?.accessToken) {
      router.push("/login");
    }
  } catch (e) {
    if (e.message === "AuthenticationIsRequired") {
      router.push("/login");
    }
  }
}

// 定时检查（如每 5 分钟）
setInterval(ensureValidToken, 5 * 60 * 1000);
\`\`\`

## 6. 多标签同步

\`\`\`js
useEffect(() => {
  const handler = (e) => {
    if (e.key === "forgerock_access_token") {
      if (e.newValue === null) {
        // 别的标签登出了
        router.replace("/login");
      } else if (e.newValue && !currentToken) {
        // 别的标签登录了，刷新当前页用户状态
        window.location.reload();
      }
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}, []);
\`\`\`

## 7. 性能优化

- **动态导入**：只在登录/受保护路由加载 SDK
- **预加载 token**：登录后预取 \`UserManager.getCurrentUser()\` 缓存到 Context
- **iframe 续期节流**：避免短时间内多次 \`getTokens()\`

\`\`\`js
// 动态导入
const { FRAuth } = await import("@forgerock/javascript-sdk");
\`\`\`

## 8. 监控

埋点关键事件：

- 登录成功 / 失败
- token 续期失败
- WebAuthn 调用 / 失败
- Redirect 回跳耗时

\`\`\`js
function track(event, payload) {
  // 上报到你的监控系统
  console.log("[track]", event, payload);
}

// 关键节点埋点
const start = Date.now();
try {
  await runAuthTree();
  track("login_success", { duration: Date.now() - start });
} catch (e) {
  track("login_failure", { error: e.message });
}
\`\`\`

## 9. 部署检查清单

- [ ] AM 端 CORS 配置包含前端域名
- [ ] \`redirectUri\` 在 AM OAuth2 Agent 注册
- [ ] HTTPS 证书有效
- [ ] \`logLevel\` 设为 \`"error"\` 或 \`"none"\`
- [ ] refresh token 在 AM 配置合理过期时间
- [ ] 测试过 iframe 静默续期
- [ ] 测试过多标签登出同步
- [ ] 测试过 token 过期后的恢复流程
- [ ] 监控告警覆盖关键错误
`,
  },

  // -------------------------------------------------------------
  // 章节 5：调试与常见问题
  // -------------------------------------------------------------
  {
    id: "fr-troubleshooting",
    group: "高级主题",
    icon: "🔍",
    title: "调试与常见问题",
    content: `# 调试与常见问题

## 1. 开启 debug 日志

\`\`\`js
Config.set({
  logLevel: "debug",
});
\`\`\`

控制台会输出每个请求的 URL、body 和响应。**注意敏感信息**，不要在生产用。

## 2. 查看 step 的完整结构

\`\`\`js
const step = await FRAuth.start();
console.log("step:", step);
console.log("type:", step.type);
console.log("stage:", step.getStage());
console.log("header:", step.getHeader());
console.log("description:", step.getDescription());
console.log("callbacks:", step.callbacks);

// 看 callback 内部
step.callbacks.forEach((cb, i) => {
  console.log(\`callback[\${i}]:\`, cb.getType(), cb.payload);
});
\`\`\`

## 3. 查看 token 状态

\`\`\`js
// localStorage 模式
console.log("access_token:", localStorage.getItem("forgerock_access_token"));
console.log("id_token:", localStorage.getItem("forgerock_id_token"));
console.log("refresh_token:", localStorage.getItem("forgerock_refresh_token"));
console.log("expiry:", localStorage.getItem("forgerock_token_expiry"));
\`\`\`

## 4. 常见问题排查

### Q1：\`Configuration not set\`

**原因**：\`Config.set\` 未调用，或在 SSR 阶段调用。

**解决**：

\`\`\`js
useEffect(() => {
  if (typeof window !== "undefined") {
    Config.set({ ... });
  }
}, []);
\`\`\`

### Q2：CORS 错误

\`\`\`
Access to fetch at 'https://am.example.com/am/json/...' from origin 'https://app.example.com'
has been blocked by CORS policy
\`\`\`

**原因**：AM 端 CORS 没配置前端域名。

**解决**：在 AM 的 \`CORS\` 配置里加 \`Origin\`，允许 \`GET\`/\`POST\`/\`OPTIONS\`，允许 \`Authorization\` header。

### Q3：\`redirect_uri_mismatch\`

**原因**：\`redirectUri\` 与 AM OAuth2 Agent 注册的不一致。

**解决**：

- AM 端 \`redirect_uri\` 列表必须包含 \`window.location.origin + "/callback"\`
- 协议、端口、路径必须完全一致（包括尾部 \`/\`）

### Q4：\`State mismatch\`

**原因**：发起 redirect 时的 state（存 sessionStorage）与回跳的 state 不一致。

**解决**：

- 检查 sessionStorage 是否被清空（隐私模式）
- 检查是否有多个 tab 同时发起登录
- 不要在 redirect 中间清理 sessionStorage

### Q5：iframe 续期不工作

**现象**：\`TokenManager.getTokens()\` 卡住或抛 \`AuthorizationTimeout\`。

**原因**：

- AM 端 third-party cookie 被浏览器拦截（Safari 默认拦截）
- \`redirectUri\` 与 iframe 域名不一致
- AM \`session\` 已过期

**解决**：

- 改用 \`login: 'redirect'\` 显式跳转续期
- 检查 AM session 时长配置
- 提示用户重新登录

### Q6：hydration mismatch

**现象**：React 报 \`Text content does not match server-rendered HTML\`。

**原因**：SSR 渲染时用了未登录状态，客户端恢复成了已登录。

**解决**：

\`\`\`jsx
// 初始 loading=true，等客户端恢复完再渲染
const [loading, setLoading] = useState(true);
if (loading) return <Skeleton />;
\`\`\`

### Q7：WebAuthn 报 \`NotAllowedError\`

**原因**：用户取消了认证器选择，或超时。

**解决**：

\`\`\`js
try {
  await FRWebAuthn.authenticate(step);
} catch (e) {
  if (e.name === "NotAllowedError") {
    setError("用户取消了 WebAuthn 认证");
  }
}
\`\`\`

### Q8：登出后还能访问

**原因**：只清了 OAuth2 token，没清 AM session。

**解决**：用 \`FRUser.logout()\` 而非 \`TokenManager.deleteTokens()\`。

## 5. 调试技巧

### 用浏览器 DevTools 看请求

\`Network\` 面板过滤 \`am/\`，看每个请求的：

- URL（确认走的是哪个端点）
- Request body（确认 callback payload 正确）
- Response body（看 AM 返回的错误）
- Status code（401=未授权，403=权限不足，500=AM 内部错）

### 打印 step 的 JSON

\`\`\`js
const stepJson = JSON.stringify(step, null, 2);
console.log(stepJson);
\`\`\

注意 \`FRStep\` 有循环引用，直接 \`JSON.stringify\` 可能失败。可以序列化 \`payload\`：

\`\`\`js
console.log(JSON.stringify(step.payload, null, 2));
\`\`\`

### 用 Postman 模拟 AM 响应

直接调 AM 的 \`/json/authenticate?authIndexType=service&authIndexValue=UsernamePassword\`，对照真实响应。

## 6. SDK 源码阅读

\`node_modules/@forgerock/javascript-sdk/dist/\` 下有完整 \`.d.ts\` 定义，配合 sourcemap 可以读 JS 实现：

\`\`\`bash
# 看某个类的实现
node_modules/@forgerock/javascript-sdk/dist/fr-auth/fr-auth.js
\`\`\`

## 7. 官方资源

- GitHub: \`ForgeRock/javascript-sdk\`
- npm: \`@forgerock/javascript-sdk\`
- 文档: \`docs.forgerock.com\`

至此 \`@forgerock/javascript-sdk\` 教程结束，可以打开 \`/forgerock-demo\` 体验 mock 流程。
`,
  },
];
