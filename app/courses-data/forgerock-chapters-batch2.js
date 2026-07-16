// =============================================================
// @forgerock/javascript-sdk 教程 —— 第 2 批：核心进阶
// -------------------------------------------------------------
// 覆盖：TokenManager 令牌管理、OAuth2Client OAuth2 客户端、
//       FRUser 用户登录登出、UserManager 用户信息、SessionManager 会话管理。
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：TokenManager
  // -------------------------------------------------------------
  {
    id: "fr-token-manager",
    group: "核心进阶",
    icon: "🎫",
    title: "TokenManager 令牌管理",
    content: `# TokenManager 令牌管理

\`TokenManager\` 是 OAuth2 层的高层封装，负责 **授权码流程**、**PKCE 生成**、**token 交换**和**存储**。它在 \`FRAuth\` 完成 AM 认证树之后调用，拿到 OAuth2 token。

## 两个核心方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| \`getTokens(options?)\` | \`Promise<OAuth2Tokens\|void>\` | 获取 token（必要时走 authorize） |
| \`deleteTokens()\` | \`Promise<void>\` | 清除本地 token |

## getTokens 的 4 种用法

### 1. embedded 模式（认证在本应用内完成）

\`\`\`js
import { TokenManager } from "@forgerock/javascript-sdk";

// 先用 FRAuth 走完认证树
await runAuthTree();

// 然后静默拿 token（不会触发跳转）
const tokens = await TokenManager.getTokens({
  forceRenew: true,
  login: "embedded",
  serverConfig: { timeout: 5000 },
});
console.log(tokens.accessToken);
\`\`\`

### 2. redirect 模式（认证在外部页面完成）

\`\`\`js
// 跳转到 AM 的 /authorize，用户在那边登录后回跳
await TokenManager.getTokens({
  forceRenew: true,
  login: "redirect",
});
// 浏览器会跳走，回跳后需要在 callback 页再调一次
\`\`\`

### 3. 从 redirect 回跳 URL 拿 token

\`\`\`js
// 在 /callback 页
const url = new URL(window.location.href);
const code = url.searchParams.get("code");
const state = url.searchParams.get("state");

const tokens = await TokenManager.getTokens({
  query: { code, state },
});
\`\`\`

### 4. 静默续期（iframe 模式）

\`\`\`js
// 默认行为：如果有 token 且未过期直接返回，否则用隐藏 iframe 静默续期
const tokens = await TokenManager.getTokens();

// 想跳过 iframe（避免后台请求）
const tokens2 = await TokenManager.getTokens({
  skipBackgroundRequest: true,
});
\`\`\`

## OAuth2Tokens 结构

\`\`\`ts
interface OAuth2Tokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
\`\`\`

## deleteTokens：登出前清理

\`\`\`js
import { TokenManager } from "@forgerock/javascript-sdk";

await TokenManager.deleteTokens();
// localStorage 中的 token 全部清除
\`\`\`

## 配合 FRAuth 使用

**典型顺序**：先 \`FRAuth\` 拿 AM session，再 \`TokenManager\` 用这个 session 换 OAuth2 token。

\`\`\`js
import { FRAuth, TokenManager, StepType } from "@forgerock/javascript-sdk";

// 1. 走认证树
const step = await FRAuth.start();
step.getCallbackOfType("NameCallback").setInputValue("alice");
step.getCallbackOfType("PasswordCallback").setInputValue("secret");
const result = await FRAuth.next(step);

if (result.type !== StepType.LoginSuccess) {
  throw new Error("登录失败");
}

// 2. 换 OAuth2 token
const tokens = await TokenManager.getTokens({ forceRenew: true });
localStorage.setItem("access_token", tokens.accessToken);
\`\`\`

## GetTokensOptions 完整字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| \`forceRenew\` | boolean | 强制重新获取，即使本地有 token |
| \`login\` | 'embedded' \| 'redirect' | 登录模式 |
| \`skipBackgroundRequest\` | boolean | 跳过 iframe 静默续期 |
| \`query\` | {code?, state?} | redirect 回跳后传 code/state |
| \`serverConfig\` / \`clientId\` / \`tree\` 等 | ConfigOptions | 临时覆盖全局配置 |

## 踩坑提示

- **\`getTokens()\` 不传参时**：如果本地有有效 token 直接返回，否则走 iframe 静默续期；iframe 失败会抛 \`AuthenticationIsRequired\`
- **redirect 模式必须配 \`redirectUri\`**，且回跳页要能识别 \`code\` 参数
- **\`forceRenew: true\` + \`login: 'redirect'\`**：会触发浏览器跳转，之后所有代码都不执行
- **token 存储位置**由 \`Config.set({ tokenStore })\` 决定，\`TokenManager\` 不感知

下一章讲 \`OAuth2Client\`（更底层的 OAuth2 操作）。
`,
  },

  // -------------------------------------------------------------
  // 章节 2：OAuth2Client
  // -------------------------------------------------------------
  {
    id: "fr-oauth2-client",
    group: "核心进阶",
    icon: "🔐",
    title: "OAuth2Client OAuth2 客户端",
    content: `# OAuth2Client OAuth2 客户端

\`OAuth2Client\` 是比 \`TokenManager\` 更底层的 OAuth2 操作，提供 \`createAuthorizeUrl\`、\`getAuthCodeByIframe\`、\`getOAuth2Tokens\`、\`getUserInfo\`、\`endSession\`、\`revokeToken\` 等方法。

通常你只需要 \`TokenManager\`，下列方法在自定义流程时才有用。

## 方法清单

| 方法 | 作用 |
| --- | --- |
| \`createAuthorizeUrl(options)\` | 构造 /authorize URL（用于 \`window.location.href\` 跳转） |
| \`getAuthCodeByIframe(options)\` | 用隐藏 iframe 拿 auth code（静默续期核心） |
| \`getOAuth2Tokens(options)\` | 用 auth code 换 token |
| \`getUserInfo(options?)\` | 拿 OIDC userinfo（需要 \`openid\` scope） |
| \`endSession(options?)\` | 调 OIDC end_session 端点 |
| \`revokeToken(options?)\` | 立即吊销存储的 access_token |

## createAuthorizeUrl：手动构造跳转 URL

\`\`\`js
import { OAuth2Client } from "@forgerock/javascript-sdk";

const url = await OAuth2Client.createAuthorizeUrl({
  clientId: "myClient",
  redirectUri: window.location.origin + "/callback",
  scope: "openid profile email",
  responseMode: "query",
  responseType: "code",
  state: "my-random-state",
  // 可选：自定义参数
  acrValues: "urn:example:loa:2",
});

// 跳转到 AM 的 /authorize
window.location.href = url;
\`\`\`

## getOAuth2Tokens：手动换 token

通常 \`TokenManager.getTokens({ query })\` 已经够用，但如果你想完全控制：

\`\`\`js
const tokens = await OAuth2Client.getOAuth2Tokens({
  clientId: "myClient",
  redirectUri: window.location.origin + "/callback",
  authorizationCode: "code-from-redirect",
});
console.log(tokens.accessToken, tokens.idToken);
\`\`\`

## getUserInfo：拿 OIDC 用户信息

\`\`\`js
const userInfo = await OAuth2Client.getUserInfo();
console.log(userInfo);
// { sub: "alice", email: "alice@example.com", name: "Alice" }
\`\`\`

注意：\`getUserInfo\` 需要本地有有效的 access_token，且 scope 包含 \`openid\`。

## endSession：OIDC 单点登出

\`\`\`js
// 默认会跳转
await OAuth2Client.endSession({
  logoutRedirectUri: window.location.origin + "/login",
});

// 不跳转，只调端点
await OAuth2Client.endSession({
  redirect: false,
});
\`\`\`

PingOne 场景下 \`endSession\` 会跳到 \`/signoff\`，建议**显式传 \`logoutRedirectUri\`**。

## revokeToken：吊销 access_token

\`\`\`js
await OAuth2Client.revokeToken();
// 立即吊销，本地 token 仍存在但已失效
\`\`\`

## allowedErrors：可忽略的错误

\`OAuth2Client\` 导出 \`allowedErrors\`，列出可识别的错误类型：

\`\`\`js
import { OAuth2Client, allowedErrors } from "@forgerock/javascript-sdk";

console.log(allowedErrors);
// {
//   AuthenticationConsentRequired: "AuthenticationConsentRequired",
//   AuthenticationIsRequired: "AuthenticationIsRequired",
//   AuthorizationTimeout: "AuthorizationTimeout",
//   FailedToFetch: "FailedToFetch",
//   NetworkError: "NetworkError",
//   CORSError: "CORSError",
//   InteractionNotAllowed: "InteractionNotAllowed",
//   LoginRequired: "LoginRequired",
//   RequestRequiresConsent: "RequestRequiresConsent"
// }
\`\`\`

iframe 续期时这些错误通常表示"需要重新登录"，前端应该友好处理：

\`\`\`js
try {
  await OAuth2Client.getAuthCodeByIframe({ ... });
} catch (e) {
  if (e.message === allowedErrors.AuthenticationIsRequired) {
    // 跳到登录页
    window.location.href = "/login";
  } else {
    throw e;
  }
}
\`\`\`

## ResponseType 枚举

\`\`\`js
import { ResponseType } from "@forgerock/javascript-sdk";
// ResponseType.Code = "code"
\`\`\`

## 何时用 OAuth2Client 而非 TokenManager

| 场景 | 推荐 |
| --- | --- |
| 标准嵌入式登录 | \`TokenManager.getTokens({ login: 'embedded' })\` |
| 标准 redirect 登录 | \`TokenManager.getTokens({ login: 'redirect' })\` |
| 拿 auth code 后自定义换 token 流程 | \`OAuth2Client.getOAuth2Tokens()\` |
| OIDC 单点登出（带跳转） | \`OAuth2Client.endSession()\` |
| 立即吊销 token | \`OAuth2Client.revokeToken()\` |
| 拿 OIDC userinfo | \`OAuth2Client.getUserInfo()\` |

下一章讲 \`FRUser\`。
`,
  },

  // -------------------------------------------------------------
  // 章节 3：FRUser
  // -------------------------------------------------------------
  {
    id: "fr-user",
    group: "核心进阶",
    icon: "👤",
    title: "FRUser 用户登录登出",
    content: `# FRUser 用户登录登出

\`FRUser\` 是更高层封装，把"认证树 + 拿 token + 拿用户信息"打包成一个调用。

## 方法

| 方法 | 说明 |
| --- | --- |
| \`FRUser.login(handler, options?)\` | 传一个 step handler，自动走完整流程并拿 token + 用户信息 |
| \`FRUser.logout(options?)\` | 结束 AM 会话 + 吊销 OAuth2 token |

## FRUser.login：传 handler 自动走树

\`login\` 接受一个函数 \`handler: (step: FRStep) => void\`，SDK 会在每一步调用它来填 callback。

\`\`\`js
import { FRUser } from "@forgerock/javascript-sdk";

const user = await FRUser.login((step) => {
  // 根据 stage 决定填什么
  if (step.getStage() === "UsernamePassword") {
    step.getCallbackOfType("NameCallback").setInputValue("alice");
    step.getCallbackOfType("PasswordCallback").setInputValue("secret123");
  } else if (step.getStage() === "OTP") {
    const code = await askUserForOTP(); // 你的 UI
    step.getCallbackOfType("TextInputCallback").setInputValue(code);
  }
});
\`\`\`

注意 \`handler\` **不支持 async**（不能 return Promise），如果需要异步（比如等用户输入 OTP），就要用 \`FRAuth.next\` 手动驱动循环，见 \`fr-login-flow\` 章节。

## FRUser.logout：完整登出

\`FRUser.logout\` 会做三件事：

1. \`OAuth2Client.endSession()\`（OIDC 单点登出）
2. \`SessionManager.logout()\`（结束 AM session）
3. \`TokenManager.deleteTokens()\`（清本地 token）

\`\`\`js
import { FRUser } from "@forgerock/javascript-sdk";

await FRUser.logout({
  logoutRedirectUri: window.location.origin + "/login",
});
\`\`\`

\`options\` 类型是 \`LogoutOptions\`，扩展自 \`ConfigOptions\`，多了：

- \`logoutRedirectUri?: string\` — 登出后跳转地址
- \`redirect?: boolean\` — 是否跳转，默认 true

## 完整示例

\`\`\`js
import { FRUser } from "@forgerock/javascript-sdk";

// 登录
async function doLogin({ username, password }) {
  try {
    const user = await FRUser.login((step) => {
      switch (step.getStage()) {
        case "UsernamePassword":
          step.getCallbackOfType("NameCallback").setInputValue(username);
          step.getCallbackOfType("PasswordCallback").setInputValue(password);
          break;
        // 其他 stage 不填，让 SDK 自动 next
      }
    });
    return user;
  } catch (e) {
    throw new Error("登录失败: " + e.message);
  }
}

// 登出
async function doLogout() {
  await FRUser.logout({
    logoutRedirectUri: window.location.origin + "/login",
  });
}
\`\`\`

## logout 不跳转场景

\`\`\`js
await FRUser.logout({
  redirect: false,
  logoutRedirectUri: window.location.origin + "/login",
});
// 自己控制跳转
window.location.href = "/login";
\`\`\`

## 踩坑提示

- \`FRUser.login\` 的 handler 不能是 async（无法 await 用户输入），需要异步交互请用 \`FRAuth.next\` 手动循环
- \`FRUser.logout\` 是"完整登出"，如果只想清本地 token 用 \`TokenManager.deleteTokens()\`
- \`logout\` 中 \`endSession\` 失败不会中断流程，会继续 \`deleteTokens\`
`,
  },

  // -------------------------------------------------------------
  // 章节 4：UserManager
  // -------------------------------------------------------------
  {
    id: "fr-user-manager",
    group: "核心进阶",
    icon: "📇",
    title: "UserManager 用户信息",
    content: `# UserManager 用户信息

\`UserManager\` 只有一个方法：\`getCurrentUser()\`，用于获取当前登录用户的 profile。

## 方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| \`getCurrentUser(options?)\` | \`Promise<unknown>\` | 拿当前用户的 profile |

## 基本用法

\`\`\`js
import { UserManager } from "@forgerock/javascript-sdk";

const user = await UserManager.getCurrentUser();
console.log(user);
// {
//   username: "alice",
//   mail: "alice@example.com",
//   givenName: "Alice",
//   sn: "Wonderland",
//   ...
// }
\`\`\`

返回的对象结构由 AM 端的用户属性决定，SDK 不强约定。

## 配合 TokenManager 使用

\`getCurrentUser\` 会从本地 token 取 access_token，去调 AM 的 \`/userinfo\` 或 \`/users?_action=idFromSession\` 端点。

所以调用前必须确保：

1. \`Config.set\` 已配置 \`clientId\`、\`serverConfig\` 等
2. 本地有有效 access_token（已登录过）

\`\`\`js
import { TokenManager, UserManager } from "@forgerock/javascript-sdk";

// 检查 token 是否存在
const tokens = await TokenManager.getTokens();
if (!tokens || !tokens.accessToken) {
  // 未登录，跳转
  window.location.href = "/login";
  return;
}

const user = await UserManager.getCurrentUser();
console.log("当前用户:", user);
\`\`\`

## 返回类型是 unknown

SDK 类型定义里返回的是 \`Promise<unknown>\`，因为不同 AM 部署的用户属性差异很大。建议在应用层自己定义类型：

\`\`\`ts
interface UserProfile {
  username: string;
  mail?: string;
  givenName?: string;
  sn?: string;
  cn?: string;
}

const user = (await UserManager.getCurrentUser()) as UserProfile;
\`\`\`

## 临时覆盖配置

\`\`\`js
const user = await UserManager.getCurrentUser({
  serverConfig: { baseUrl: "https://other-tenant.forgeblocks.com/am" },
});
\`\`\`

## 与 OAuth2Client.getUserInfo 的区别

| API | 路径 | 数据来源 |
| --- | --- | --- |
| \`UserManager.getCurrentUser()\` | AM \`/json/realms/root/users/\` | AM 用户身份存储 |
| \`OAuth2Client.getUserInfo()\` | AM \`/oauth2/realms/root/userinfo\` | OIDC id_token claims |

通常 \`getCurrentUser\` 返回的字段更全（AM 内置属性），\`getUserInfo\` 只返回 \`scope\` 里 claim 过的字段。

## 踩坑提示

- \`getCurrentUser\` **不会自动续 token**，token 过期会抛 401
- 返回对象类型 \`unknown\`，**必须自己断言**或用 zod 校验
- 配合 \`tokenStore: 'sessionStorage'\` 时，刷新页面会丢失登录状态，需要重新走 \`TokenManager.getTokens()\`
`,
  },

  // -------------------------------------------------------------
  // 章节 5：SessionManager
  // -------------------------------------------------------------
  {
    id: "fr-session-manager",
    group: "核心进阶",
    icon: "🔌",
    title: "SessionManager 会话管理",
    content: `# SessionManager 会话管理

\`SessionManager\` 负责管理 AM 的 **session cookie**（不是 OAuth2 token）。只有一个方法：\`logout()\`。

## 方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| \`logout(options?)\` | \`Promise<Response>\` | 调 AM \`/json/realms/root/sessions/?_action=logout\` 结束当前 session |

## 基本用法

\`\`\`js
import { SessionManager } from "@forgerock/javascript-sdk";

await SessionManager.logout();
// AM session cookie 失效，但本地 OAuth2 token 还在
\`\`\`

## logout 不等于登出

\`SessionManager.logout()\` **只结束 AM session**，不清 OAuth2 token。完整的登出流程是：

\`\`\`js
import { SessionManager, TokenManager, OAuth2Client } from "@forgerock/javascript-sdk";

// 1. 吊销 access_token（可选，看是否要立即使其失效）
await OAuth2Client.revokeToken();

// 2. 删除本地 token
await TokenManager.deleteTokens();

// 3. 结束 AM session
await SessionManager.logout();

// 4. OIDC 单点登出（会跳转）
await OAuth2Client.endSession({
  logoutRedirectUri: window.location.origin + "/login",
});
\`\`\`

**直接用 \`FRUser.logout()\` 即可**，它内部就是这四步的组合。

## 临时覆盖配置

\`\`\`js
await SessionManager.logout({
  serverConfig: { baseUrl: "https://other-tenant.forgeblocks.com/am" },
});
\`\`\

## Session vs Token 的关系

\`\`\`
用户名密码 → FRAuth 走认证树 → 拿到 AM session cookie（CDSSO）
                              ↓
                TokenManager.getTokens() 用 session 换 OAuth2 token
                              ↓
                本地存 access_token / id_token / refresh_token
\`\`\`

- **AM session**：基于 cookie，跨子域共享（CDSSO）
- **OAuth2 token**：存在 localStorage/sessionStorage，跨域不共享

\`SessionManager.logout()\` 只清前者；\`TokenManager.deleteTokens()\` 只清后者。完整登出两者都要。

## 何时单独用 SessionManager.logout

- 想保留 OAuth2 token 但退出 AM 会话（少见）
- 自定义登出流程，不想要 \`FRUser.logout\` 的"完整三步"

否则**优先用 \`FRUser.logout()\`**。
`,
  },
];
