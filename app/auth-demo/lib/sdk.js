// =============================================================
// 文件：app/auth-demo/lib/sdk.js
// -------------------------------------------------------------
// 【整体职责】
//   在不依赖真实 ForgeRock AM 服务器的前提下，提供一个完整的
//   Mock 认证引擎，模拟以下认证树流程：
//     1. 登录      — UsernamePassword → OTP → LoginSuccess
//     2. 注册      — ValidatedCreateUsername → ValidatedCreatePassword → KBA → Success
//     3. 忘记密码  — Email → OTP → ResetPassword → Success
//     4. 修改密码  — CurrentPassword → NewPassword → Success
//     5. 安全问题  — KbaCreateCallback 设置 / 验证
//     6. 会话管理  — 登录状态 / 登出 / Token 信息
//
// 【关键设计】
//   1. 使用真实 npm 包 @forgerock/javascript-sdk 的 FRStep / FRCallback
//      类来解析 callback payload，享受 SDK 自带的便捷 API
//   2. 动态 import SDK：SDK 内部依赖 redux/immer 等只能在浏览器运行
//      的库，若走 SSR 会让 Next.js 报错；用 await import() 挪到客户端
//   3. Mock 用户数据库存储在模块级变量中，刷新页面会丢失
//      （真实项目用后端数据库 + token 持久化）
//
// 【测试账号】
//   预置用户：demo / Demo1234（含字母和数字）
//   注册新用户后即可用新账号登录
//   OTP 任意 6 位数字均可通过（控制台会打印"发送"的验证码）
// =============================================================

// ---- SDK 单例缓存 ----
// 模块级变量 _sdk：第一次调用 loadSdk() 时执行动态 import，
// 后续调用直接返回缓存的 module namespace 对象。
let _sdk = null;

/**
 * 动态加载 @forgerock/javascript-sdk
 * SDK 依赖浏览器环境（redux/immer 等），不能走 SSR。
 * @returns {Promise<typeof import("@forgerock/javascript-sdk")>}
 */
export async function loadSdk() {
  if (_sdk) return _sdk;
  _sdk = await import("@forgerock/javascript-sdk");
  return _sdk;
}

// ============================================================
// Mock 用户数据库
// ------------------------------------------------------------
// 模拟后端的用户表。真实项目中这些数据存在数据库里。
// 每个用户记录包含：用户名、密码（明文，仅 demo）、邮箱、
// 安全问题、登录尝试次数、是否锁定等字段。
// ============================================================

const PREDEFINED_QUESTIONS = [
  "你的小学名称是什么？",
  "你的母亲叫什么名字？",
  "你的第一只宠物叫什么？",
  "你出生的城市是哪里？",
  "你最喜欢的书叫什么？",
  "你的父亲叫什么名字？",
];

// 预置用户：demo / Demo1234
const mockUsers = new Map();
mockUsers.set("demo", {
  username: "demo",
  password: "Demo1234",
  email: "demo@example.com",
  displayName: "演示用户",
  phone: "13800138000",
  bio: "这是一个预置的演示账号",
  securityQuestions: [
    { question: "你的出生的城市是哪里？", answer: "北京" },
    { question: "你的第一只宠物叫什么？", answer: "小白" },
  ],
  failedAttempts: 0,
  locked: false,
  twoFactorEnabled: true,
});

// 当前会话（登录成功后设置）
let currentSession = null;

// 密码重置令牌：email -> { code, expires }
// 模拟"发送验证码到邮箱"后存储的验证码
const resetTokens = new Map();

// ============================================================
// Mock payload 构造函数
// ------------------------------------------------------------
// 这些函数返回的 plain object 模拟 AM 认证树返回的原始 JSON。
// 结构遵循 ForgeRock callback 协议：
//   {
//     type: StepType.Step,         // 步骤类型
//     stage: "UsernamePassword",   // 阶段标识，前端据此定制 UI
//     description: "...",          // 步骤描述
//     callbacks: [...]             // 该步骤需要收集的输入
//   }
// 用 new sdk.FRStep(payload) 包装后，即可使用 SDK 的便捷 API。
// ============================================================

/**
 * 构造登录第一步：用户名 + 密码
 * 使用 NameCallback + PasswordCallback
 */
function makeLoginStep(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "Login",
    description: "请输入用户名和密码",
    callbacks: [
      {
        // NameCallback：文本输入，对应用户名
        type: sdk.CallbackType.NameCallback,
        output: [{ name: "prompt", value: "用户名" }],
        input: [{ name: "IDToken1", value: "" }],
      },
      {
        // PasswordCallback：密码输入，前端渲染为 type="password"
        type: sdk.CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "密码" }],
        input: [{ name: "IDToken2", value: "" }],
      },
    ],
  };
}

/**
 * 构造 OTP 验证步骤
 * 使用 TextInputCallback 收集 6 位验证码
 */
function makeOtpStep(sdk, channel = "短信") {
  return {
    type: sdk.StepType.Step,
    stage: "OTP",
    description: `请输入 6 位${channel}验证码（任意 6 位数字均可）`,
    callbacks: [
      {
        type: sdk.CallbackType.TextInputCallback,
        output: [{ name: "prompt", value: "验证码" }],
        input: [{ name: "IDToken1", value: "" }],
      },
    ],
  };
}

/**
 * 构造注册第一步：用户名 + 邮箱
 * 使用 ValidatedCreateUsernameCallback（带校验策略的创建用户名）
 */
function makeRegisterStep1(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "RegisterUsername",
    description: "请设置用户名和邮箱",
    callbacks: [
      {
        // ValidatedCreateUsernameCallback：创建用户名时带策略校验
        type: sdk.CallbackType.ValidatedCreateUsernameCallback,
        output: [
          { name: "prompt", value: "用户名" },
          { name: "policies", value: [] },
        ],
        input: [{ name: "IDToken1", value: "" }],
      },
      {
        // 用 StringAttributeInputCallback 收集邮箱
        type: sdk.CallbackType.StringAttributeInputCallback,
        output: [
          { name: "prompt", value: "邮箱" },
          { name: "name", value: "mail" },
        ],
        input: [{ name: "IDToken1", value: "" }],
      },
    ],
  };
}

/**
 * 构造注册第二步：设置密码
 * 使用 ValidatedCreatePasswordCallback（带密码策略校验）
 */
function makeRegisterStep2(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "RegisterPassword",
    description: "请设置登录密码",
    callbacks: [
      {
        type: sdk.CallbackType.ValidatedCreatePasswordCallback,
        output: [
          { name: "prompt", value: "密码" },
          { name: "policies", value: [] },
          { name: "failedPolicies", value: [] },
        ],
        input: [{ name: "IDToken1", value: "" }],
      },
    ],
  };
}

/**
 * 构造注册第三步：设置安全问题（KBA）
 * 使用 KbaCreateCallback
 */
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
          { name: "IDToken1", value: "" },  // 问题
          { name: "IDToken2", value: "" },  // 答案
        ],
      },
      {
        type: sdk.CallbackType.KbaCreateCallback,
        output: [
          { name: "prompt", value: "安全问题 2" },
          { name: "predefinedQuestions", value: PREDEFINED_QUESTIONS },
        ],
        input: [
          { name: "IDToken1", value: "" },
          { name: "IDToken2", value: "" },
        ],
      },
    ],
  };
}

/**
 * 构造忘记密码第一步：输入邮箱
 */
function makeForgotPasswordStep1(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "ForgotPasswordEmail",
    description: "请输入注册邮箱，我们将发送验证码",
    callbacks: [
      {
        type: sdk.CallbackType.StringAttributeInputCallback,
        output: [
          { name: "prompt", value: "邮箱" },
          { name: "name", value: "mail" },
        ],
        input: [{ name: "IDToken1", value: "" }],
      },
    ],
  };
}

/**
 * 构造忘记密码第二步：输入验证码 + 新密码
 */
function makeForgotPasswordStep2(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "ForgotPasswordReset",
    description: "请输入验证码和新密码",
    callbacks: [
      {
        type: sdk.CallbackType.TextInputCallback,
        output: [{ name: "prompt", value: "验证码" }],
        input: [{ name: "IDToken1", value: "" }],
      },
      {
        type: sdk.CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "新密码" }],
        input: [{ name: "IDToken2", value: "" }],
      },
      {
        type: sdk.CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "确认新密码" }],
        input: [{ name: "IDToken3", value: "" }],
      },
    ],
  };
}

/**
 * 构造修改密码步骤：当前密码 + 新密码 + 确认新密码
 */
function makeChangePasswordStep(sdk) {
  return {
    type: sdk.StepType.Step,
    stage: "ChangePassword",
    description: "请输入当前密码和新密码",
    callbacks: [
      {
        type: sdk.CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "当前密码" }],
        input: [{ name: "IDToken1", value: "" }],
      },
      {
        type: sdk.CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "新密码" }],
        input: [{ name: "IDToken2", value: "" }],
      },
      {
        type: sdk.CallbackType.PasswordCallback,
        output: [{ name: "prompt", value: "确认新密码" }],
        input: [{ name: "IDToken3", value: "" }],
      },
    ],
  };
}

/**
 * 构造安全问题验证步骤（用于账户恢复）
 */
function makeSecurityVerifyStep(sdk, user) {
  return {
    type: sdk.StepType.Step,
    stage: "SecurityVerify",
    description: "请回答您的安全问题",
    callbacks: user.securityQuestions.map((q) => ({
      type: sdk.CallbackType.TextInputCallback,
      output: [{ name: "prompt", value: q.question }],
      input: [{ name: "IDToken1", value: "" }],
    })),
  };
}

/**
 * 构造登录成功终态
 */
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
    getDetail: () => "登录成功",
    getMessage: () => `欢迎回来，${user.displayName || user.username}`,
  };
}

/**
 * 构造登录失败终态
 */
function makeLoginFailure(sdk, message) {
  return {
    type: sdk.StepType.LoginFailure,
    getDetail: () => message,
    getMessage: () => message,
  };
}

/**
 * 用真实 FRStep 包装 payload
 */
function wrapStep(sdk, payload) {
  return new sdk.FRStep(payload);
}

/**
 * 生成 6 位随机验证码（模拟"发送到手机/邮箱"）
 * 控制台会打印，方便 demo 测试
 */
function generateOtp() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  // 在控制台打印，模拟"收到了验证码"
  if (typeof console !== "undefined") {
    console.log(
      `%c[Mock SMS/Email] 您的验证码是: ${code}`,
      "color: #2563eb; font-weight: bold; font-size: 14px"
    );
  }
  return code;
}

// ============================================================
// Mock 认证引擎：next 函数
// ------------------------------------------------------------
// 模拟 AM 服务器的"下一步"逻辑。前端把当前 step（含用户输入）
// POST 给 AM，AM 返回下一个 step 或终态。
// 这里根据 step.getStage() 判断当前阶段，执行对应的 mock 逻辑。
// ============================================================

/**
 * 开始一个认证流程
 * @param {"login"|"register"|"forgotPassword"|"changePassword"|"securityVerify"} flowType
 * @param {object} [context] 额外上下文（如 changePassword 需要当前用户）
 */
export async function startAuth(flowType, context = {}) {
  const sdk = await loadSdk();

  switch (flowType) {
    case "login":
      return wrapStep(sdk, makeLoginStep(sdk));

    case "register":
      return wrapStep(sdk, makeRegisterStep1(sdk));

    case "forgotPassword":
      return wrapStep(sdk, makeForgotPasswordStep1(sdk));

    case "changePassword":
      // 修改密码需要已登录
      if (!currentSession) {
        return makeLoginFailure(sdk, "请先登录后再修改密码");
      }
      return wrapStep(sdk, makeChangePasswordStep(sdk));

    case "securityVerify": {
      // 安全问题验证需要用户名
      const user = mockUsers.get(context.username);
      if (!user) {
        return makeLoginFailure(sdk, "用户不存在");
      }
      return wrapStep(sdk, makeSecurityVerifyStep(sdk, user));
    }

    default:
      return makeLoginFailure(sdk, "未知的流程类型: " + flowType);
  }
}

/**
 * 提交当前步骤，获取下一步或终态
 * @param {FRStep} step 当前步骤（含用户输入）
 * @param {object} [context] 额外上下文
 */
export async function nextAuth(step, context = {}) {
  const sdk = await loadSdk();

  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

  const stage = step.getStage?.() ?? step.type;

  // ===============================
  // 登录流程
  // ===============================
  if (stage === "Login") {
    const nameCb = step.getCallbackOfType(sdk.CallbackType.NameCallback);
    const pwdCb = step.getCallbackOfType(sdk.CallbackType.PasswordCallback);
    const username = nameCb.getInputValue();
    const password = pwdCb.getInputValue();

    const user = mockUsers.get(username);

    if (!user) {
      return makeLoginFailure(sdk, "用户不存在（试试 demo / Demo1234）");
    }

    // 账户锁定检查
    if (user.locked) {
      return makeLoginFailure(sdk, "账户已被锁定，请使用忘记密码重置");
    }

    if (user.password !== password) {
      user.failedAttempts++;
      // 连续失败 5 次锁定账户
      if (user.failedAttempts >= 5) {
        user.locked = true;
        return makeLoginFailure(sdk, "密码错误次数过多，账户已被锁定");
      }
      return makeLoginFailure(
        sdk,
        `密码错误（剩余 ${5 - user.failedAttempts} 次尝试机会）`
      );
    }

    // 登录成功，重置失败计数
    user.failedAttempts = 0;

    // 如果开启了 2FA，进入 OTP 步骤
    if (user.twoFactorEnabled) {
      // 生成并"发送"验证码
      const otp = generateOtp();
      // 暂存验证码，OTP 步骤提交时校验
      resetTokens.set(user.email, {
        code: otp,
        expires: Date.now() + 300000, // 5 分钟有效
      });
      return wrapStep(sdk, makeOtpStep(sdk, "短信"));
    }

    // 未开启 2FA，直接登录成功
    return makeLoginSuccess(sdk, user);
  }

  // OTP 验证步骤（登录和忘记密码共用）
  if (stage === "OTP") {
    const otpCb = step.getCallbackOfType(sdk.CallbackType.TextInputCallback);
    const otp = otpCb.getInputValue();

    // 从 context 获取关联的邮箱（登录流程通过 context 传递）
    const email = context.email;
    const tokenData = email ? resetTokens.get(email) : null;

    // Mock 模式：不严格校验，任意 6 位数字通过
    // 真实项目会校验 resetTokens 中的 code 是否匹配
    if (tokenData && Date.now() > tokenData.expires) {
      return makeLoginFailure(sdk, "验证码已过期，请重新获取");
    }

    // 登录流程的 OTP → 登录成功
    if (context.flowType === "login") {
      const user = mockUsers.get(context.username);
      if (user) {
        return makeLoginSuccess(sdk, user);
      }
      return makeLoginFailure(sdk, "会话异常，请重新登录");
    }

    // 忘记密码流程的 OTP → 进入重置密码步骤
    if (context.flowType === "forgotPassword") {
      return wrapStep(sdk, makeForgotPasswordStep2(sdk));
    }

    return makeLoginFailure(sdk, "未知的 OTP 上下文");
  }

  // ===============================
  // 注册流程
  // ===============================
  if (stage === "RegisterUsername") {
    const usernameCb = step.getCallbackOfType(
      sdk.CallbackType.ValidatedCreateUsernameCallback
    );
    const emailCb = step.getCallbackOfType(
      sdk.CallbackType.StringAttributeInputCallback
    );
    const username = usernameCb.getInputValue();
    const email = emailCb.getInputValue();

    // 检查用户名是否已存在
    if (mockUsers.has(username)) {
      return makeLoginFailure(sdk, "用户名已被注册");
    }

    // 检查邮箱是否已被使用
    for (const [, u] of mockUsers) {
      if (u.email === email) {
        return makeLoginFailure(sdk, "邮箱已被注册");
      }
    }

    // 进入设置密码步骤
    // 把用户名和邮箱暂存在 context 中（真实项目会通过 session 关联）
    context.pendingUser = { username, email };
    return wrapStep(sdk, makeRegisterStep2(sdk));
  }

  if (stage === "RegisterPassword") {
    const pwdCb = step.getCallbackOfType(
      sdk.CallbackType.ValidatedCreatePasswordCallback
    );
    const password = pwdCb.getInputValue();

    // 进入安全问题设置步骤
    context.pendingUser = context.pendingUser || {};
    context.pendingUser.password = password;
    return wrapStep(sdk, makeRegisterStep3(sdk));
  }

  if (stage === "RegisterSecurityQuestions") {
    const kbaCallbacks = step.getCallbacksOfType(
      sdk.CallbackType.KbaCreateCallback
    );

    // 收集安全问题和答案
    const securityQuestions = kbaCallbacks.map((cb) => {
      // KbaCreateCallback 的 input[0] 是问题，input[1] 是答案
      const question = cb.getInputValue(0);
      const answer = cb.getInputValue(1);
      return { question, answer };
    });

    // 创建用户并保存到 mock 数据库
    const pendingUser = context.pendingUser || {};
    const newUser = {
      username: pendingUser.username || "newuser",
      password: pendingUser.password || "password",
      email: pendingUser.email || "new@example.com",
      displayName: pendingUser.username || "新用户",
      phone: "",
      bio: "",
      securityQuestions,
      failedAttempts: 0,
      locked: false,
      twoFactorEnabled: false,
    };
    mockUsers.set(newUser.username, newUser);

    // 注册成功，自动登录
    return makeLoginSuccess(sdk, newUser);
  }

  // ===============================
  // 忘记密码流程
  // ===============================
  if (stage === "ForgotPasswordEmail") {
    const emailCb = step.getCallbackOfType(
      sdk.CallbackType.StringAttributeInputCallback
    );
    const email = emailCb.getInputValue();

    // 查找使用该邮箱的用户
    let foundUser = null;
    for (const [, u] of mockUsers) {
      if (u.email === email) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return makeLoginFailure(sdk, "该邮箱未注册");
    }

    // 生成并"发送"验证码
    const otp = generateOtp();
    resetTokens.set(email, {
      code: otp,
      expires: Date.now() + 300000,
    });

    // 进入 OTP 验证步骤
    // 通过 context 传递邮箱和用户名，供下一步使用
    context.email = email;
    context.username = foundUser.username;
    context.flowType = "forgotPassword";
    return wrapStep(sdk, makeOtpStep(sdk, "邮箱"));
  }

  if (stage === "ForgotPasswordReset") {
    const callbacks = step.callbacks;
    // 第一个 callback 是验证码（已在 OTP 步骤验证过，这里跳过）
    // 第二个是新密码，第三个是确认密码
    const newPassword = callbacks[1].getInputValue();
    const confirmPassword = callbacks[2].getInputValue();

    if (newPassword !== confirmPassword) {
      return makeLoginFailure(sdk, "两次输入的密码不一致");
    }

    // 重置密码
    const username = context.username;
    const user = mockUsers.get(username);
    if (user) {
      user.password = newPassword;
      user.failedAttempts = 0;
      user.locked = false; // 解锁账户
    }

    // 清除重置令牌
    resetTokens.delete(context.email);

    return {
      type: sdk.StepType.LoginSuccess,
      getDetail: () => "密码重置成功",
      getMessage: () => "密码已成功重置，请使用新密码登录",
    };
  }

  // ===============================
  // 修改密码流程
  // ===============================
  if (stage === "ChangePassword") {
    if (!currentSession) {
      return makeLoginFailure(sdk, "请先登录");
    }

    const callbacks = step.callbacks;
    const currentPassword = callbacks[0].getInputValue();
    const newPassword = callbacks[1].getInputValue();
    const confirmPassword = callbacks[2].getInputValue();

    const user = mockUsers.get(currentSession.username);

    // 校验当前密码
    if (user.password !== currentPassword) {
      return makeLoginFailure(sdk, "当前密码不正确");
    }

    // 校验新密码一致性
    if (newPassword !== confirmPassword) {
      return makeLoginFailure(sdk, "两次输入的新密码不一致");
    }

    // 校验新旧密码不同
    if (currentPassword === newPassword) {
      return makeLoginFailure(sdk, "新密码不能与当前密码相同");
    }

    // 更新密码
    user.password = newPassword;

    return {
      type: sdk.StepType.LoginSuccess,
      getDetail: () => "密码修改成功",
      getMessage: () => "密码已成功修改",
    };
  }

  // ===============================
  // 安全问题验证流程
  // ===============================
  if (stage === "SecurityVerify") {
    const username = context.username;
    const user = mockUsers.get(username);

    if (!user) {
      return makeLoginFailure(sdk, "用户不存在");
    }

    // 校验每个安全问题答案
    const answers = step.callbacks.map((cb) => cb.getInputValue());
    for (let i = 0; i < user.securityQuestions.length; i++) {
      const expected = user.securityQuestions[i].answer.toLowerCase();
      const actual = String(answers[i] || "").toLowerCase().trim();
      if (expected !== actual) {
        return makeLoginFailure(sdk, `安全问题 ${i + 1} 答案不正确`);
      }
    }

    // 验证通过，返回成功（前端可引导用户重置密码）
    return {
      type: sdk.StepType.LoginSuccess,
      getDetail: () => "身份验证成功",
      getMessage: () => "安全问题验证通过，您可以重置密码了",
    };
  }

  // 未知 stage
  return makeLoginFailure(sdk, "未知阶段: " + stage);
}

// ============================================================
// 会话管理 API
// ============================================================

/**
 * 获取当前会话信息
 * @returns {object|null} 会话对象或 null（未登录）
 */
export function getSession() {
  return currentSession;
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  if (!currentSession) return false;
  // 检查是否过期
  if (new Date(currentSession.expiresAt) < new Date()) {
    currentSession = null;
    return false;
  }
  return true;
}

/**
 * 登出：清除当前会话
 */
export function logout() {
  currentSession = null;
}

/**
 * 获取当前用户信息（从 mock 数据库读取最新的）
 */
export function getCurrentUser() {
  if (!currentSession) return null;
  const user = mockUsers.get(currentSession.username);
  if (!user) return null;
  // 不返回密码
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * 更新用户资料
 * @param {object} updates 要更新的字段
 */
export function updateProfile(updates) {
  if (!currentSession) return { error: "请先登录" };
  const user = mockUsers.get(currentSession.username);
  if (!user) return { error: "用户不存在" };

  // 更新允许修改的字段
  if (updates.displayName !== undefined) user.displayName = updates.displayName;
  if (updates.email !== undefined) {
    // 检查邮箱是否被其他用户使用
    for (const [name, u] of mockUsers) {
      if (name !== user.username && u.email === updates.email) {
        return { error: "邮箱已被其他用户使用" };
      }
    }
    user.email = updates.email;
    currentSession.email = updates.email;
  }
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.bio !== undefined) user.bio = updates.bio;

  return { success: true, user: getCurrentUser() };
}

/**
 * 切换 2FA 开关
 */
export function toggleTwoFactor(enabled) {
  if (!currentSession) return { error: "请先登录" };
  const user = mockUsers.get(currentSession.username);
  if (!user) return { error: "用户不存在" };
  user.twoFactorEnabled = enabled;
  return { success: true, enabled };
}

/**
 * 获取预定义安全问题列表
 */
export function getPredefinedQuestions() {
  return [...PREDEFINED_QUESTIONS];
}

/**
 * 获取 Mock 用户列表（仅 demo 调试用）
 */
export function getMockUsers() {
  const result = [];
  for (const [username, user] of mockUsers) {
    const { password, ...safe } = user;
    result.push({ ...safe, username });
  }
  return result;
}
