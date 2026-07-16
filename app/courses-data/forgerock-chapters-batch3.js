// =============================================================
// @forgerock/javascript-sdk 教程 —— 第 3 批：实战应用
// -------------------------------------------------------------
// 覆盖：FRWebAuthn WebAuthn、FRPolicy 密码策略、TokenStorage 令牌存储、
//       React 集成模式、Mock 模式演示（无需 AM 服务器）。
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：FRWebAuthn
  // -------------------------------------------------------------
  {
    id: "fr-webauthn",
    group: "实战应用",
    icon: "🔑",
    title: "FRWebAuthn WebAuthn 支持",
    content: `# FRWebAuthn WebAuthn 支持

\`FRWebAuthn\` 封装了 WebAuthn API，用于在认证树中触发平台认证器（Touch ID / Windows Hello）或漫游认证器（YubiKey）的注册与认证。

## 两个核心方法

| 方法 | 作用 |
| --- | --- |
| \`FRWebAuthn.authenticate(step)\` | 用 WebAuthn 完成登录（断言） |
| \`FRWebAuthn.register(step)\` | 用 WebAuthn 完成注册（证明） |

## 自动模式 vs 手动模式

SDK 提供 \`WebAuthnCallbackType\` 常量，callback 类型有：

- \`WebAuthnPublicKeyCredentialCreationOptions\` — 注册
- \`WebAuthnPublicKeyCredentialGetOptions\` — 认证

\`FRWebAuthn.authenticate/register\` 会自动处理这两类 callback。

## 注册流程示例

\`\`\`js
import { FRAuth, FRWebAuthn, StepType } from "@forgerock/javascript-sdk";

async function registerWebAuthn() {
  // 1. 走到 WebAuthn 注册节点
  let step = await FRAuth.start({ tree: "WebAuthnRegistration" });

  // 假设第一步是用户名密码
  step.getCallbackOfType("NameCallback").setInputValue("alice");
  step.getCallbackOfType("PasswordCallback").setInputValue("secret");
  step = await FRAuth.next(step);

  // 2. 遇到 WebAuthn 注册 callback，触发浏览器 UI
  step = await FRWebAuthn.register(step);

  // 3. 提交
  const finalStep = await FRAuth.next(step);
  if (finalStep.type === StepType.LoginSuccess) {
    console.log("注册并登录成功");
  }
}
\`\`\`

## 登录流程示例

\`\`\`js
import { FRAuth, FRWebAuthn, StepType } from "@forgerock/javascript-sdk";

async function loginWithWebAuthn() {
  let step = await FRAuth.start({ tree: "WebAuthnAuthentication" });

  // 第一步可能就是 WebAuthn 认证 callback
  while (step.type === StepType.Step) {
    if (FRWebAuthn.isWebAuthnStep(step)) {
      // 触发 Touch ID / Windows Hello
      step = await FRWebAuthn.authenticate(step);
    } else {
      // 普通 callback
      // ...
    }
    step = await FRAuth.next(step);
  }

  if (step.type === StepType.LoginSuccess) {
    console.log("WebAuthn 登录成功");
  }
}
\`\`\`

## 浏览器兼容性检查

\`\`\`js
if (!window.PublicKeyCredential) {
  alert("当前浏览器不支持 WebAuthn");
}
\`\`\`

## 跨设备流程（条件 UI）

现代浏览器支持 \`conditionalCreate\` / \`conditionalGet\`，在 autofill 中显示 passkey 选项。SDK 当前版本不直接支持，需要手动扩展：

\`\`\`js
const available = await PublicKeyCredential.isConditionalMediationAvailable();
if (available) {
  // 启用 autofill passkey
}
\`\`\`

## 踩坑提示

- WebAuthn 必须 **HTTPS**（localhost 例外）
- 触发 \`authenticate\` 时浏览器会弹原生 UI，**期间用户无法操作页面**
- \`register\` 和 \`authenticate\` 不可混用，看 AM 节点是 \`WebAuthnRegistrationNode\` 还是 \`WebAuthnAuthenticationNode\`
- 失败要 catch，常见错误：用户取消、超时、认证器不匹配
`,
  },

  // -------------------------------------------------------------
  // 章节 2：FRPolicy
  // -------------------------------------------------------------
  {
    id: "fr-policy",
    group: "实战应用",
    icon: "📏",
    title: "FRPolicy 密码策略",
    content: `# FRPolicy 密码策略

\`FRPolicy\` 用于在前端**预校验密码**是否符合 AM 配置的策略，避免提交后才报错。

## 方法

| 方法 | 作用 |
| --- | --- |
| \`FRPolicy.validatePolicy(policies, value)\` | 校验单个值是否符合策略数组 |

## 基本用法

\`\`\`js
import { FRPolicy } from "@forgerock/javascript-sdk";

// 这些 policies 通常来自 ValidatedCreatePasswordCallback 的 output
const policies = [
  {
    policyId: "atLeast8Chars",
    params: { minLength: 8 },
  },
  {
    policyId: "atLeastOneNumber",
  },
  {
    policyId: "atLeastOneUppercaseChar",
  },
];

const result = FRPolicy.validatePolicy(policies, "Pass123");
// { valid: true, failedPolicies: [] }

const result2 = FRPolicy.validatePolicy(policies, "pass");
// { valid: false, failedPolicies: ["atLeast8Chars", "atLeastOneNumber", "atLeastOneUppercaseChar"] }
\`\`\`

## 内置策略 ID

| \`policyId\` | 含义 |
| --- | --- |
| \`atLeastXChars\` | 至少 X 个字符（params: \`minLength\`） |
| \`atMostXChars\` | 至多 X 个字符（params: \`maxLength\`） |
| \`atLeastOneNumber\` | 至少一个数字 |
| \`atLeastOneSpecialChar\` | 至少一个特殊字符 |
| \`atLeastOneUppercaseChar\` | 至少一个大写字母 |
| \`atLeastOneLowercaseChar\` | 至少一个小写字母 |
| \`cannotContainOldPassword\` | 不能包含旧密码 |
| \`noUserNameInPassword\` | 不能包含用户名 |
| \`matchRegexp\` | 匹配正则（params: \`regexp\`） |

## 配合 ValidatedCreatePasswordCallback

\`\`\`js
import { FRAuth, FRPolicy } from "@forgerock/javascript-sdk";

const step = await FRAuth.start({ tree: "Registration" });

const cb = step.getCallbackOfType("ValidatedCreatePasswordCallback");
const policies = cb.getOutputByName("policies", []);
const failedPolicies = cb.getOutputByName("failedPolicies", []);

// 实时校验
function validatePassword(value) {
  const result = FRPolicy.validatePolicy(policies, value);
  if (!result.valid) {
    return result.failedPolicies.map((id) => policyIdToMessage(id));
  }
  return [];
}

// 失败时展示错误
function policyIdToMessage(id) {
  const map = {
    atLeast8Chars: "至少 8 个字符",
    atLeastOneNumber: "至少一个数字",
    atLeastOneUppercaseChar: "至少一个大写字母",
  };
  return map[id] ?? id;
}
\`\`\`

## 自定义策略扩展

\`FRPolicy\` 内部维护一个 \`PolicyKey\` 到校验函数的映射，可以通过子类化或 patch 扩展。但 SDK 当前版本未暴露 \`registerPolicy\`，自定义策略需要在前端手动 \`validatePolicy\` 之外加判断。

\`\`\`js
// 自定义：禁止包含用户名
function customValidate(value, username) {
  const builtin = FRPolicy.validatePolicy(policies, value);
  if (!value.includes(username)) {
    return builtin;
  }
  return {
    ...builtin,
    valid: false,
    failedPolicies: [...builtin.failedPolicies, "noUserNameInPassword"],
  };
}
\`\`\`

## 踩坑提示

- \`policies\` 来自 callback 的 \`getOutputByName("policies", [])\`，**不是所有 ValidatedCreatePasswordCallback 都有**
- \`validatePolicy\` 是同步函数，不返回 Promise
- \`failedPolicies\` 是 \`policyId\` 字符串数组，不是对象
`,
  },

  // -------------------------------------------------------------
  // 章节 3：TokenStorage
  // -------------------------------------------------------------
  {
    id: "fr-token-storage",
    group: "实战应用",
    icon: "💾",
    title: "TokenStorage 令牌存储",
    content: `# TokenStorage 令牌存储

\`TokenStorage\` 是 SDK 内部的 token 持久化抽象，通过 \`Config.set({ tokenStore })\` 切换实现。

## 三种内置实现

| 值 | 存储位置 | 生命周期 |
| --- | --- | --- |
| \`'localStorage'\` | localStorage | 永久（手动清除） |
| \`'sessionStorage'\` | sessionStorage | 标签页关闭后失效 |
| 自定义对象 | 你定 | 你定 |

## 默认是 localStorage

\`\`\`js
Config.set({
  // ...其他
  tokenStore: "localStorage", // 默认值，可省略
});
\`\`\`

## 切换到 sessionStorage

适合"关闭标签即登出"的临时登录场景：

\`\`\`js
Config.set({
  tokenStore: "sessionStorage",
});
\`\`\`

## 自定义存储对象

实现 \`TokenStoreObject\` 接口即可：

\`\`\`ts
interface TokenStoreObject {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
\`\`\

例如用 IndexedDB 存 token（容量更大、不阻塞主线程）：

\`\`\`js
const indexedDBStore = {
  async get(key) {
    const db = await openDB("tokens", 1, {
      upgrade(db) {
        db.createObjectStore("tokens");
      },
    });
    return (await db.get("tokens", key)) ?? null;
  },
  async set(key, value) {
    const db = await openDB("tokens", 1);
    await db.put("tokens", value, key);
  },
  async remove(key) {
    const db = await openDB("tokens", 1);
    await db.delete("tokens", key);
  },
};

Config.set({
  tokenStore: indexedDBStore,
});
\`\`\`

## LocalStorage 直接访问

SDK 也导出 \`LocalStorage\` 工具类（命名空间形式）：

\`\`\`js
import { LocalStorage } from "@forgerock/javascript-sdk";

// 但通常不需要直接用，TokenManager 会自动调
\`\`\`

## token 的 key 命名规则

SDK 在存储时用以下 key（前缀 \`"forgerock_"\`）：

- \`forgerock_access_token\`
- \`forgerock_id_token\`
- \`forgerock_refresh_token\`
- \`forgerock_token_expiry\`

清理时只需删这些 key：

\`\`\`js
["access_token", "id_token", "refresh_token", "token_expiry"]
  .forEach(k => localStorage.removeItem("forgerock_" + k));
\`\`\`

## 安全建议

| 场景 | 推荐 |
| --- | --- |
| 普通网站 | \`localStorage\` + HTTPS + HttpOnly Cookie 配合 |
| 金融 / 高安全 | \`sessionStorage\` + 短时效 token + 频繁续期 |
| 多标签共享登录 | \`localStorage\` + \`storage\` 事件同步 |
| 移动端 WebView | 自定义对象 + 原生 Keychain |

## 踩坑提示

- 切换 \`tokenStore\` 后**老 token 会读不到**，需要先 \`deleteTokens\` 再重新登录
- \`sessionStorage\` 模式下，刷新页面 token 还在，但新开标签会要求重新登录
- 自定义 \`tokenStore\` 的方法**必须返回 Promise**，不能同步返回
`,
  },

  // -------------------------------------------------------------
  // 章节 4：React 集成模式
  // -------------------------------------------------------------
  {
    id: "fr-react-integration",
    group: "实战应用",
    icon: "⚛️",
    title: "React 集成模式",
    content: `# React 集成模式

本章给出在 React/Next.js App Router 中接入 \`@forgerock/javascript-sdk\` 的标准模式。

## 1. AuthProvider Context 模式

\`\`\`jsx
// app/_lib/auth-context.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Config,
  TokenManager,
  UserManager,
  FRUser,
} from "@forgerock/javascript-sdk";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 客户端初始化
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

    // 启动时尝试恢复登录
    (async () => {
      try {
        const tokens = await TokenManager.getTokens();
        if (tokens?.accessToken) {
          const profile = await UserManager.getCurrentUser();
          setUser(profile);
        }
      } catch (e) {
        console.warn("恢复登录失败:", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username, password) {
    // 1. 走认证树
    const { FRAuth, StepType } = await import("@forgerock/javascript-sdk");
    let step = await FRAuth.start();
    step.getCallbackOfType("NameCallback").setInputValue(username);
    step.getCallbackOfType("PasswordCallback").setInputValue(password);
    const result = await FRAuth.next(step);
    if (result.type !== StepType.LoginSuccess) {
      throw new Error("登录失败");
    }
    // 2. 拿 token + 用户信息
    await TokenManager.getTokens({ forceRenew: true });
    const profile = await UserManager.getCurrentUser();
    setUser(profile);
  }

  async function logout() {
    await FRUser.logout({
      logoutRedirectUri: window.location.origin + "/login",
    });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
\`\`\`

## 2. 受保护路由 HOC

\`\`\`jsx
// app/_components/with-auth.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_lib/auth-context";

export function withAuth(Wrapped) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login");
      }
    }, [user, loading]);

    if (loading) return <div>加载中...</div>;
    if (!user) return null;
    return <Wrapped {...props} />;
  };
}
\`\`\

## 3. 登录页组件

\`\`\`jsx
// app/login/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username, form.password);
      router.push("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        placeholder="用户名"
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="密码"
      />
      <button disabled={loading}>{loading ? "登录中..." : "登录"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
\`\`\`

## 4. OAuth2 回调页

\`\`\`jsx
// app/callback/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TokenManager } from "@forgerock/javascript-sdk";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const url = window.location.href;
    const params = new URL(url).searchParams;
    const code = params.get("code");
    const state = params.get("state");

    if (code) {
      TokenManager.getTokens({ query: { code, state } })
        .then(() => router.replace("/dashboard"))
        .catch(() => router.replace("/login?error=callback"));
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <div>处理回调中...</div>;
}
\`\`\`

## 5. SSR 注意事项

- \`Config.set\` **必须在客户端执行**，SSR 阶段跳过（用 \`typeof window === "undefined"\` 判断）
- \`useAuth\` 初始 \`loading=true\`，避免 SSR 渲染出"未登录"状态导致 hydration 不一致
- 所有 \`FRAuth\` / \`TokenManager\` 调用都要在 \`useEffect\` 或事件处理函数里
- 不要在 \`app/layout.js\` 顶层调用 \`Config.set\`，会污染所有路由

## 6. 多标签同步登出

监听 \`storage\` 事件：

\`\`\`jsx
useEffect(() => {
  const handler = (e) => {
    if (e.key === "forgerock_access_token" && !e.newValue) {
      router.replace("/login");
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}, [router]);
\`\`\`

下一章给一个不依赖 AM 服务器的 mock demo。
`,
  },

  // -------------------------------------------------------------
  // 章节 5：Mock 模式演示
  // -------------------------------------------------------------
  {
    id: "fr-mock-demo",
    group: "实战应用",
    icon: "🎭",
    title: "Mock 模式演示（无需 AM 服务器）",
    content: `# Mock 模式演示（无需 AM 服务器）

\`@forgerock/javascript-sdk\` 真实使用需要 AM 服务器配合，但教学时我们可以**模拟一个完整的认证树流程**，演示 \`FRStep\` / \`FRCallback\` 的所有 API 用法。

## Mock 思路

不调用 \`FRAuth\` / \`TokenManager\`，而是用本地状态模拟一个两步认证树：

\`\`\`
Step 1: UsernamePassword（NameCallback + PasswordCallback）
  ↓ 用户名 = "demo", 密码 = "demo123"
Step 2: OTP（TextInputCallback）
  ↓ 任意 OTP（控制台会打印）
LoginSuccess
\`\`\`

## 完整可运行 Demo

下方 code 是一个独立 \`/forgerock-demo\` 路由的页面，可以在不配置 AM 的情况下完整体验 SDK 的 API 风格（FRStep、getCallbackOfType、setInputValue、StepType 等都是真实 SDK 导出）。

\`\`\`jsx
"use client";
import { useState } from "react";
import { FRStep, StepType, CallbackType } from "@forgerock/javascript-sdk";

// 构造 mock step payload，模拟 AM 返回的 callback 结构
function makeUsernamePasswordStep() {
  return {
    type: StepType.Step,
    stage: "UsernamePassword",
    description: "请输入用户名和密码",
    callbacks: [
      {
        type: CallbackType.NameCallback,
        output: [{ name: "prompt", value: "用户名" }],
        input: [{ name: "IDToken1", value: "" }],
      },
      {
        type: CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "密码" }],
        input: [{ name: "IDToken2", value: "" }],
      },
    ],
  };
}

function makeOTPStep() {
  return {
    type: StepType.Step,
    stage: "OTP",
    description: "请输入 6 位短信验证码（任意）",
    callbacks: [
      {
        type: CallbackType.TextInputCallback,
        output: [{ name: "prompt", value: "验证码" }],
        input: [{ name: "IDToken1", value: "" }],
      },
    ],
  };
}

function makeLoginSuccess() {
  return { type: StepType.LoginSuccess, sessionId: "mock-session-" + Date.now() };
}

// 用真实的 FRStep 包装 payload
function wrapStep(payload) {
  return new FRStep(payload);
}

// 模拟 AM 的 next 逻辑
async function mockNext(step) {
  await new Promise((r) => setTimeout(r, 400)); // 模拟网络延迟
  if (step.getStage() === "UsernamePassword") {
    const name = step.getCallbackOfType(CallbackType.NameCallback).getInputValue();
    const pwd = step.getCallbackOfType(CallbackType.PasswordCallback).getInputValue();
    if (name === "demo" && pwd === "demo123") {
      return wrapStep(makeOTPStep());
    }
    return { type: StepType.LoginFailure, detail: "用户名或密码错误" };
  }
  if (step.getStage() === "OTP") {
    return makeLoginSuccess();
  }
  return { type: StepType.LoginFailure, detail: "未知 stage" };
}

export default function ForgeRockMockDemo() {
  const [step, setStep] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | running | success | failure
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});

  async function start() {
    setStatus("running");
    setError(null);
    const first = wrapStep(makeUsernamePasswordStep());
    setStep(first);
    setValues({});
  }

  async function next() {
    if (!step) return;
    // 把 values 灌到 step 的 callback
    step.callbacks.forEach((cb) => {
      const key = cb.getType() + "|" + (cb.getOutputByName("prompt", cb.getType()));
      cb.setInputValue(values[key] ?? "");
    });
    try {
      const result = await mockNext(step);
      if (result.type === StepType.LoginSuccess) {
        setStatus("success");
        setStep(null);
      } else if (result.type === StepType.LoginFailure) {
        setStatus("failure");
        setError(result.detail);
        setStep(null);
      } else {
        setStep(result);
        setValues({});
      }
    } catch (e) {
      setStatus("failure");
      setError(e.message);
    }
  }

  if (status === "success") {
    return (
      <div style={{ padding: 24 }}>
        <h2>✅ 登录成功</h2>
        <p>（mock）session 已建立</p>
        <button onClick={() => setStatus("idle")}>重新开始</button>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div style={{ padding: 24 }}>
        <h2>❌ 登录失败</h2>
        <p>{error}</p>
        <button onClick={start}>重试</button>
      </div>
    );
  }

  if (!step) {
    return (
      <div style={{ padding: 24 }}>
        <h2>ForgeRock Mock Demo</h2>
        <p>用真实 SDK 的 FRStep / Callback API，模拟一个两步登录流程</p>
        <p>测试账号：<code>demo / demo123</code></p>
        <button onClick={start}>开始登录</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <h2>{step.getHeader?.() ?? step.getDescription?.() ?? step.getStage()}</h2>
      <form onSubmit={(e) => { e.preventDefault(); next(); }}>
        {step.callbacks.map((cb, i) => {
          const prompt = cb.getOutputByName("prompt", cb.getType());
          const key = cb.getType() + "|" + prompt;
          const isPassword = cb.getType() === CallbackType.PasswordCallback;
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <label>{prompt}</label>
              <input
                type={isPassword ? "password" : "text"}
                value={values[key] ?? ""}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              />
            </div>
          );
        })}
        <button type="submit">下一步</button>
      </form>
    </div>
  );
}
\`\`\`

\`/forgerock-demo\` 路由会挂载这个组件，你可以在浏览器里直接体验。

## 真实环境接入

把 \`mockNext\` 换成 \`FRAuth.next(step)\`，\`wrapStep(makeXxx())\` 换成 \`FRAuth.start()\`，\`makeLoginSuccess\` 换成真实 \`LoginSuccess\` 即可。

batch4 讲高级主题。
`,
    code: `"use client";
// ForgeRock Mock Demo —— 不依赖 AM 服务器的完整流程演示
// 用真实 SDK 的 FRStep / Callback API，但 step 由本地构造
import { useState } from "react";
import { FRStep, StepType, CallbackType } from "@forgerock/javascript-sdk";

// 构造 mock step payload，模拟 AM 返回的 callback 结构
function makeUsernamePasswordStep() {
  return {
    type: StepType.Step,
    stage: "UsernamePassword",
    description: "请输入用户名和密码",
    callbacks: [
      {
        type: CallbackType.NameCallback,
        output: [{ name: "prompt", value: "用户名" }],
        input: [{ name: "IDToken1", value: "" }],
      },
      {
        type: CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "密码" }],
        input: [{ name: "IDToken2", value: "" }],
      },
    ],
  };
}

function makeOTPStep() {
  return {
    type: StepType.Step,
    stage: "OTP",
    description: "请输入 6 位短信验证码（任意）",
    callbacks: [
      {
        type: CallbackType.TextInputCallback,
        output: [{ name: "prompt", value: "验证码" }],
        input: [{ name: "IDToken1", value: "" }],
      },
    ],
  };
}

function makeLoginSuccess() {
  return { type: StepType.LoginSuccess, sessionId: "mock-session-" + Date.now() };
}

// 用真实的 FRStep 包装 payload，享受 getCallbackOfType / setInputValue 等 API
function wrapStep(payload) {
  return new FRStep(payload);
}

// 模拟 AM 的 next 逻辑
async function mockNext(step) {
  await new Promise((r) => setTimeout(r, 400));
  if (step.getStage() === "UsernamePassword") {
    const name = step.getCallbackOfType(CallbackType.NameCallback).getInputValue();
    const pwd = step.getCallbackOfType(CallbackType.PasswordCallback).getInputValue();
    if (name === "demo" && pwd === "demo123") {
      return wrapStep(makeOTPStep());
    }
    return { type: StepType.LoginFailure, detail: "用户名或密码错误" };
  }
  if (step.getStage() === "OTP") {
    return makeLoginSuccess();
  }
  return { type: StepType.LoginFailure, detail: "未知 stage" };
}

export default function ForgeRockMockDemoPage() {
  const [step, setStep] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});

  async function start() {
    setStatus("running");
    setError(null);
    const first = wrapStep(makeUsernamePasswordStep());
    setStep(first);
    setValues({});
  }

  async function next() {
    if (!step) return;
    step.callbacks.forEach((cb) => {
      const key = cb.getType() + "|" + (cb.getOutputByName("prompt", cb.getType()));
      cb.setInputValue(values[key] ?? "");
    });
    try {
      const result = await mockNext(step);
      if (result.type === StepType.LoginSuccess) {
        setStatus("success");
        setStep(null);
      } else if (result.type === StepType.LoginFailure) {
        setStatus("failure");
        setError(result.detail);
        setStep(null);
      } else {
        setStep(result);
        setValues({});
      }
    } catch (e) {
      setStatus("failure");
      setError(e.message);
    }
  }

  if (status === "success") {
    return (
      <div style={{ padding: 24 }}>
        <h2>登录成功</h2>
        <p>（mock）session 已建立</p>
        <button onClick={() => setStatus("idle")}>重新开始</button>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div style={{ padding: 24 }}>
        <h2>登录失败</h2>
        <p>{error}</p>
        <button onClick={start}>重试</button>
      </div>
    );
  }

  if (!step) {
    return (
      <div style={{ padding: 24 }}>
        <h2>ForgeRock Mock Demo</h2>
        <p>用真实 SDK 的 FRStep / Callback API，模拟一个两步登录流程</p>
        <p>测试账号：<code>demo / demo123</code></p>
        <button onClick={start}>开始登录</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <h2>{step.getHeader?.() ?? step.getDescription?.() ?? step.getStage()}</h2>
      <form onSubmit={(e) => { e.preventDefault(); next(); }}>
        {step.callbacks.map((cb, i) => {
          const prompt = cb.getOutputByName("prompt", cb.getType());
          const key = cb.getType() + "|" + prompt;
          const isPassword = cb.getType() === CallbackType.PasswordCallback;
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <label>{prompt}</label>
              <input
                type={isPassword ? "password" : "text"}
                value={values[key] ?? ""}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              />
            </div>
          );
        })}
        <button type="submit">下一步</button>
      </form>
    </div>
  );
}`,
  },
];
