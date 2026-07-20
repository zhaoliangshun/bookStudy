// =============================================================
// 文件：app/forgerock-mini/mini-forgerock.js
// -------------------------------------------------------------
// 【一句话职责】
//   手写迷你版 ForgeRock JavaScript SDK，演示 ForgeRock 的核心概念：
//   "Authentication Tree（认证树）驱动的渐进式认证"。
//
// 【ForgeRock 核心心智模型】
//   传统登录：客户端把账号密码一次性 POST 给服务端，服务端返回 token。
//   ForgeRock：服务端预先配置一棵"认证树"（由多个节点组成），
//             客户端发起请求 → 服务端返回第一批 callback（要信息）
//             → 客户端填好 → 提交 → 服务端返回下一批 callback
//             → ... → 直到服务端返回 success（含 token）或 error。
//
//   一棵树可以表达任意复杂流程：账号密码 → OTP → 安全问题 → 设备指纹 →
//   风控判定 → ... 每个节点负责一类 callback。
//
// 【本文件架构】
//   1. Config          —— 全局配置（服务器、realm、tree 名）
//   2. Storage         —— token 持久化（localStorage 包装）
//   3. Callback 体系   —— NameCallback / PasswordCallback /
//                         ConfirmationCallback / TextOutputCallback /
//                         ChoiceCallback / HiddenValueCallback /
//                         ValidatedCreateUsernameCallback /
//                         ValidatedCreatePasswordCallback（带策略）
//   4. Step            —— 一个认证步骤的封装（含 callbacks + 状态）
//   5. MockServer      —— 模拟服务端，内置 login/registration/changePassword
//                         三棵树，根据当前 step + 用户响应推进状态机
//   6. FRAuth          —— 认证入口（start/next）
//   7. FRUser          —— 用户登录/登出
//   8. SessionManager  —— 会话管理
//
// 【与真实 SDK 的差异】
//   - 真实 SDK 通过 HTTP 与 AM 通信；本 mini 版用 MockServer 模拟
//   - 真实 SDK 的树由服务端配置；本 mini 版在 MockServer 里硬编码
//   - 保留核心 API 形状（FRAuth.next(step)、Step.getCallback(type) 等），
//     方便理解真实 SDK 的用法
// =============================================================

// =============================================================
// 1. Config —— 全局配置
// -------------------------------------------------------------
// 真实 SDK：config.set({ serverConfig: { baseUrl, timeout } })
// 这里简化为单例对象。Config 在 SDK 内部被各模块共享读取。
// =============================================================
class Config {
  static _config = {
    baseUrl: "https://openam.example.com/am",  // AM 服务器地址
    realm: "root",                              // realm（领域）
    tree: "Login",                              // 默认认证树
    timeout: 30000,                             // 请求超时
  };

  /** 设置全局配置，与已有配置合并 */
  static set(partial) {
    Config._config = { ...Config._config, ...partial };
  }

  /** 读取全局配置（或某个键） */
  static get(key) {
    return key ? Config._config[key] : { ...Config._config };
  }
}

// =============================================================
// 2. Storage —— token 持久化
// -------------------------------------------------------------
// 真实 SDK 支持多种存储后端：localStorage / sessionStorage / cookie。
// 这里简化为 localStorage 包装，并处理 SSR 环境（window 不存在）。
// =============================================================
class Storage {
  // 命名空间前缀，避免与站点其他 localStorage key 冲突
  static PREFIX = "fr-mini:";

  static get(key) {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(Storage.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(Storage.PREFIX + key, JSON.stringify(value));
    } catch {
      // localStorage 满或被禁用时静默失败
    }
  }

  static remove(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(Storage.PREFIX + key);
  }
}

// =============================================================
// 3. Callback 体系
// -------------------------------------------------------------
// Callback 是服务端"向客户端要信息"的载体。每种 callback 对应一种
// UI 元素（输入框、密码框、按钮组、纯文本提示等）。
//
// 数据形状（参考真实 SDK）：
//   {
//     type: "NameCallback",
//     payload: { prompt: "用户名", input: "" },     // 服务端下发时 input 为空
//   }
//
// 客户端用 setInput 填好后提交，服务端据此推进树。
// =============================================================

/** Callback 基类：封装 type + payload + 输入值读写 */
class Callback {
  constructor(type, payload = {}) {
    this.type = type;       // callback 类型标识（如 "NameCallback"）
    this.payload = payload; // 服务端下发的额外数据（prompt、选项、策略等）
    // input 是客户端回填的字段。初始为 "" 或 []，取决于 callback 类型
    this.input = payload.defaultInput ?? "";
  }

  /** 客户端设置输入值（用户在 UI 上填写后调用） */
  setInput(value) {
    this.input = value;
    return this;
  }

  /** 服务端读取客户端回填的值 */
  getOutput() {
    return this.input;
  }

  /** 序列化为 JSON（模拟 HTTP 提交的 body） */
  toJSON() {
    return { type: this.type, payload: this.payload, input: this.input };
  }
}

/** NameCallback：收集用户名（普通文本输入框） */
class NameCallback extends Callback {
  constructor(prompt = "用户名") {
    super("NameCallback", { prompt });
  }
  /** UI 显示用的提示文案 */
  getPrompt() {
    return this.payload.prompt;
  }
}

/** PasswordCallback：收集密码（密码输入框，UI 应 type="password"） */
class PasswordCallback extends Callback {
  constructor(prompt = "密码") {
    super("PasswordCallback", { prompt });
  }
  getPrompt() {
    return this.payload.prompt;
  }
}

/**
 * ValidatedCreatePasswordCallback：注册时创建密码，带策略校验
 * 这是 ForgeRock 注册树的特色 callback：服务端下发密码策略
 * （长度、字符种类等），客户端可即时校验给用户反馈。
 */
class ValidatedCreatePasswordCallback extends PasswordCallback {
  constructor(prompt = "创建密码", policies = []) {
    super(prompt);
    this.type = "ValidatedCreatePasswordCallback";
    this.payload.policies = policies;
  }

  /**
   * 根据策略校验密码，返回 { valid, failed: [...] }
   * 真实策略有更复杂格式，这里简化为 { name, regex, message }
   */
  validate(value) {
    const failed = [];
    for (const policy of this.payload.policies) {
      if (policy.regex && !new RegExp(policy.regex).test(value)) {
        failed.push(policy.message);
      }
      if (policy.minLength && value.length < policy.minLength) {
        failed.push(policy.message);
      }
    }
    return { valid: failed.length === 0, failed };
  }

  getPolicies() {
    return this.payload.policies;
  }
}

/**
 * ValidatedCreateUsernameCallback：注册时创建用户名，带策略校验
 * 与 ValidatedCreatePasswordCallback 类似，用于校验用户名格式/可用性。
 */
class ValidatedCreateUsernameCallback extends NameCallback {
  constructor(prompt = "创建用户名", policies = []) {
    super(prompt);
    this.type = "ValidatedCreateUsernameCallback";
    this.payload.policies = policies;
  }

  validate(value) {
    const failed = [];
    for (const policy of this.payload.policies) {
      if (policy.regex && !new RegExp(policy.regex).test(value)) {
        failed.push(policy.message);
      }
      if (policy.minLength && value.length < policy.minLength) {
        failed.push(policy.message);
      }
    }
    return { valid: failed.length === 0, failed };
  }
}

/**
 * ConfirmationCallback：确认型按钮组（如"确定/取消"、"是/否"）
 * input 存选中选项的索引（不是文本），与真实 SDK 一致。
 */
class ConfirmationCallback extends Callback {
  constructor(prompt = "请确认", options = ["确定", "取消"]) {
    super("ConfirmationCallback", { prompt, options });
    this.input = -1; // 未选中
  }
  getPrompt() {
    return this.payload.prompt;
  }
  getOptions() {
    return this.payload.options;
  }
  /** 选中某个选项（按索引或文本） */
  select(option) {
    if (typeof option === "number") {
      this.input = option;
    } else {
      this.input = this.payload.options.indexOf(option);
    }
    return this;
  }
}

/**
 * TextOutputCallback：纯文本提示（不收集输入，只显示信息）
 * 例如"密码已过期，请重置"、"验证码已发送到您的邮箱"。
 */
class TextOutputCallback extends Callback {
  constructor(message = "", messageType = "INFO") {
    super("TextOutputCallback", { message, messageType });
    this.input = null; // 此 callback 无需输入
  }
  getMessage() {
    return this.payload.message;
  }
  getMessageType() {
    return this.payload.messageType; // INFO / WARNING / ERROR
  }
}

/**
 * ChoiceCallback：多选一（与 ConfirmationCallback 类似，但通常用于更多选项）
 * 例如选择安全问题、选择 OTP 发送方式（短信/邮箱）。
 */
class ChoiceCallback extends Callback {
  constructor(prompt = "请选择", choices = []) {
    super("ChoiceCallback", { prompt, choices });
    this.input = -1;
  }
  getPrompt() {
    return this.payload.prompt;
  }
  getChoices() {
    return this.payload.choices;
  }
  select(choice) {
    if (typeof choice === "number") {
      this.input = choice;
    } else {
      this.input = this.payload.choices.indexOf(choice);
    }
    return this;
  }
}

/**
 * HiddenValueCallback：隐藏值（不显示给用户，常用于传递 state）
 * 例如 CSRF token、设备指纹、会话续期标记等。
 */
class HiddenValueCallback extends Callback {
  constructor(name = "", value = "") {
    super("HiddenValueCallback", { name, value });
    this.input = value; // 默认沿用服务端下发的值
  }
}

// =============================================================
// 4. Step —— 认证步骤封装
// -------------------------------------------------------------
// Step 是 FRAuth.next() 的返回值，代表"当前认证流程进行到了哪一步"。
//   - 未完成：callbacks 数组非空，UI 应渲染这些 callback 收集输入
//   - 成功：success=true，token 字段含 session token
//   - 失败：error 非空
//
// 真实 SDK 的 Step 还有 stage（节点 stage 名）、tokenId、authId 等字段，
// 这里保留 stage/header/description 供 UI 显示。
// =============================================================
class Step {
  constructor(payload = {}) {
    this.callbacks = payload.callbacks || [];     // 当前 step 要收集的 callback
    this.stage = payload.stage || "";             // 当前 stage（UI 提示用）
    this.header = payload.header || "";            // 标题
    this.description = payload.description || "";  // 描述文案
    this.success = payload.success || false;       // 是否认证成功
    this.token = payload.token || null;            // 成功时的 session token
    this.error = payload.error || null;            // 失败时的错误信息
    this.tree = payload.tree || "";                // 当前树名
    this.sessionId = payload.sessionId || null;    // 服务端会话 ID（resume 用）
    this.data = payload.data || null;              // 成功时携带的累积数据（demo 用）
  }

  /** 是否已完成（成功或失败） */
  isComplete() {
    return this.success || !!this.error;
  }

  /** 按 callback 类型获取第一个匹配的 callback */
  getCallback(type) {
    return this.callbacks.find((cb) => cb.type === type) || null;
  }

  /** 按 callback 类型获取所有匹配的 callback */
  getCallbacks(type) {
    return this.callbacks.filter((cb) => cb.type === type);
  }

  /**
   * 便捷方法：按类型设置某个 callback 的输入值
   * 真实 SDK 有类似 setCallbackValue 工具方法
   */
  setCallbackValue(type, value) {
    const cb = this.getCallback(type);
    if (cb) cb.setInput(value);
    return this;
  }
}

// =============================================================
// 5. MockServer —— 模拟服务端
// -------------------------------------------------------------
// 这是 mini 版的核心。真实 SDK 通过 HTTP 与 AM 通信，
// 本 mini 版用内存中的状态机模拟服务端。
//
// 每棵 tree 是一个 step 序列（数组），每个 step 包含：
//   - stage / header / description：UI 显示用
//   - build(session, prevResponses)：返回该 step 的 callbacks
//     （可读取 prevResponses 做条件判断，例如校验密码后决定下一步）
//   - validate(session, responses)：校验本 step 的响应，
//     返回 { ok: true } 或 { ok: false, error }
//
// 服务端维护一个 sessions Map：sessionId -> { tree, stepIndex, data }
// =============================================================
class MockServer {
  constructor() {
    this.sessions = new Map();
    this.sessionCounter = 0;
    this.tokenCounter = 0;
    // 已注册用户（注册成功后写入，登录时校验）
    this.users = new Map();
    // 预置一个 demo 用户，方便登录 demo
    this.users.set("demo", {
      username: "demo",
      password: "Demo1234",
      email: "demo@example.com",
      phone: "138****8888",
      securityAnswer: "blue",
    });
  }

  /**
   * 启动一棵树：创建 session，返回第一个 step
   */
  start(treeName) {
    const sessionId = `sess-${++this.sessionCounter}`;
    this.sessions.set(sessionId, {
      tree: treeName,
      stepIndex: 0,
      data: {},       // 累积的响应数据（如已收集到的用户名）
      otp: null,      // 当前流程生成的 OTP（OTP demo 用）
    });
    return this._buildStep(sessionId);
  }

  /**
   * 提交当前 step 的响应，推进到下一步
   * @param {Step} step - 客户端传回的 step（含填好的 callbacks）
   */
  next(step) {
    const session = this.sessions.get(step.sessionId);
    if (!session) {
      return new Step({ error: "会话不存在或已过期", tree: step.tree });
    }

    // 校验当前 step 的响应
    const treeDef = MockServer.TREES[session.tree];
    if (!treeDef) {
      return new Step({ error: `未知的认证树: ${session.tree}` });
    }
    const currentStepDef = treeDef[session.stepIndex];
    if (!currentStepDef) {
      return new Step({ error: "认证树已结束" });
    }

    // 把响应数据存到 session.data（用 callback type 作为 key）
    const responses = step.callbacks.reduce((acc, cb) => {
      acc[cb.type] = cb.getOutput();
      return acc;
    }, {});
    Object.assign(session.data, responses);

    // 执行校验
    if (currentStepDef.validate) {
      const result = currentStepDef.validate(session, responses, step);
      if (!result.ok) {
        return new Step({
          error: result.error,
          tree: session.tree,
          sessionId: step.sessionId,
          stage: currentStepDef.stage,
          // 校验失败时返回原 step 的 callbacks，让用户重试
          callbacks: currentStepDef.build(session, {}),
        });
      }
    }

    // 推进到下一步
    session.stepIndex += 1;
    return this._buildStep(step.sessionId);
  }

  /**
   * 构造 session 当前 stepIndex 对应的 Step
   * 如果已经是最后一个 step 之后，返回 success（含 token）
   */
  _buildStep(sessionId) {
    const session = this.sessions.get(sessionId);
    const treeDef = MockServer.TREES[session.tree];
    const stepDef = treeDef[session.stepIndex];

    // 已经走完所有 step → 成功
    if (!stepDef) {
      const token = `token-${++this.tokenCounter}`;
      // 清理 session
      this.sessions.delete(sessionId);
      return new Step({
        success: true,
        token,
        tree: session.tree,
        data: session.data, // 把收集到的数据一并返回（demo 用）
      });
    }

    return new Step({
      stage: stepDef.stage,
      header: stepDef.header,
      description: stepDef.description,
      tree: session.tree,
      sessionId,
      callbacks: stepDef.build(session, {}),
    });
  }

  /** 注册新用户（注册树成功后调用） */
  _registerUser(user) {
    this.users.set(user.username, user);
  }
}

// =============================================================
// MockServer.TREES —— 三棵内置认证树定义
// -------------------------------------------------------------
// 每棵树是一个 step 数组，按顺序执行。
// 真实 ForgeRock 的树由服务端可视化配置；这里用代码表达同样的逻辑。
//
// 【responses 结构】
//   MockServer.next 把 step.callbacks 的输出值按"类型→值"做成对象。
//   为避免同类型 callback 冲突，约定同一 step 内不出现重复类型；
//   需要两个文本输入时用不同 callback（如 NameCallback + PasswordCallback）。
// =============================================================

// 把策略校验逻辑抽成工具函数，避免在 validate 里反复构造 callback 实例
function validateByPolicies(value, policies) {
  const failed = [];
  for (const p of policies) {
    if (p.minLength && value.length < p.minLength) failed.push(p.message);
    if (p.regex && !new RegExp(p.regex).test(value)) failed.push(p.message);
  }
  return { valid: failed.length === 0, failed };
}

// 策略常量：build 和 validate 共享同一份定义，避免 build() 重复创建实例
const USERNAME_POLICIES = [
  { minLength: 3, message: "用户名至少 3 个字符" },
  { regex: "^[a-zA-Z0-9_]+$", message: "只能包含字母、数字、下划线" },
];
const PASSWORD_POLICIES = [
  { minLength: 8, message: "密码至少 8 位" },
  { regex: "[a-z]", message: "密码必须包含小写字母" },
  { regex: "[A-Z]", message: "密码必须包含大写字母" },
  { regex: "[0-9]", message: "密码必须包含数字" },
];

MockServer.TREES = {
  // ============================================================
  // 树 1：login —— 账号密码 + OTP 两步登录
  // ============================================================
  login: [
    {
      stage: "UsernamePassword",
      header: "登录",
      description: "请输入用户名和密码",
      build: () => [
        new NameCallback("用户名"),
        new PasswordCallback("密码"),
      ],
      validate: (session, responses) => {
        const username = responses.NameCallback;
        const password = responses.PasswordCallback;
        if (!username || !password) {
          return { ok: false, error: "用户名和密码不能为空" };
        }
        const user = server.users.get(username);
        if (!user || user.password !== password) {
          return { ok: false, error: "用户名或密码错误" };
        }
        // 记住当前用户，后续 step 可用
        session.data.currentUser = user;
        // 模拟服务端生成 6 位 OTP
        session.otp = String(Math.floor(100000 + Math.random() * 900000));
        return { ok: true };
      },
    },
    {
      stage: "OTP",
      header: "二次验证",
      description: "验证码已发送到您的注册手机",
      build: (session) => [
        // TextOutputCallback 显示 OTP（demo 演示用，真实环境不会下发）
        new TextOutputCallback(
          `【模拟短信】您的验证码是 ${session.otp}，5 分钟内有效`,
          "INFO"
        ),
        new NameCallback("请输入 6 位验证码"),
      ],
      validate: (session, responses) => {
        const code = responses.NameCallback;
        if (code !== session.otp) {
          return { ok: false, error: "验证码错误" };
        }
        return { ok: true };
      },
    },
  ],

  // ============================================================
  // 树 2：registration —— 多步注册流程
  //   step1: 用户名（带策略校验：长度、字符集、不重复）
  //   step2: 密码（带策略校验：长度、大小写、数字）
  //   step3: 邮箱(NameCallback) + 安全问题(ChoiceCallback) + 安全答案(PasswordCallback)
  //          —— 用三种不同类型避免 responses key 冲突
  //   step4: 确认提交（ConfirmationCallback）
  // ============================================================
  registration: [
    {
      stage: "CreateUsername",
      header: "注册 - 第 1 步",
      description: "创建一个用户名（3-20 位字母数字下划线）",
      build: () => [
        new ValidatedCreateUsernameCallback("用户名", USERNAME_POLICIES),
      ],
      validate: (session, responses) => {
        const username = responses.ValidatedCreateUsernameCallback;
        if (!username) return { ok: false, error: "请输入用户名" };
        // 用工具函数 + 共享策略常量校验
        const check = validateByPolicies(username, USERNAME_POLICIES);
        if (!check.valid) {
          return { ok: false, error: check.failed[0] };
        }
        // 用户名重复检查
        if (server.users.has(username)) {
          return { ok: false, error: "该用户名已被注册" };
        }
        session.data.username = username;
        return { ok: true };
      },
    },
    {
      stage: "CreatePassword",
      header: "注册 - 第 2 步",
      description: "创建密码（至少 8 位，含大小写字母和数字）",
      build: () => [
        new ValidatedCreatePasswordCallback("密码", PASSWORD_POLICIES),
      ],
      validate: (session, responses) => {
        const password = responses.ValidatedCreatePasswordCallback;
        if (!password) return { ok: false, error: "请输入密码" };
        const check = validateByPolicies(password, PASSWORD_POLICIES);
        if (!check.valid) {
          return { ok: false, error: check.failed[0] };
        }
        session.data.password = password;
        return { ok: true };
      },
    },
    {
      stage: "ProfileInfo",
      header: "注册 - 第 3 步",
      description: "完善个人资料",
      build: () => [
        // 邮箱用 NameCallback（普通文本）
        new NameCallback("邮箱"),
        // 安全问题用 ChoiceCallback（下拉选择）
        new ChoiceCallback("安全问题", [
          "您最喜欢的颜色？",
          "您的出生城市？",
          "您的宠物名字？",
        ]),
        // 安全答案用 PasswordCallback（隐藏输入，因为是敏感信息）
        // 同时避免与邮箱的 NameCallback 在 responses 中 key 冲突
        new PasswordCallback("安全答案"),
      ],
      validate: (session, responses) => {
        const email = responses.NameCallback;
        const securityQ = responses.ChoiceCallback;
        const securityA = responses.PasswordCallback;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { ok: false, error: "邮箱格式不正确" };
        }
        if (securityQ === undefined || securityQ < 0) {
          return { ok: false, error: "请选择安全问题" };
        }
        if (!securityA || securityA.trim().length < 1) {
          return { ok: false, error: "请填写安全答案" };
        }
        session.data.email = email;
        session.data.securityQuestionIndex = securityQ;
        session.data.securityAnswer = securityA;
        return { ok: true };
      },
    },
    {
      stage: "Confirm",
      header: "注册 - 第 4 步",
      description: "请确认并提交注册信息",
      build: () => [
        new TextOutputCallback("请确认以下信息无误后提交", "INFO"),
        new ConfirmationCallback("确认注册？", ["提交注册", "取消"]),
      ],
      validate: (session, responses) => {
        const choice = responses.ConfirmationCallback;
        if (choice !== 0) {
          return { ok: false, error: "用户取消注册" };
        }
        // 注册成功，写入 users Map
        server._registerUser({
          username: session.data.username,
          password: session.data.password,
          email: session.data.email,
          securityAnswer: session.data.securityAnswer,
        });
        return { ok: true };
      },
    },
  ],

  // ============================================================
  // 树 3：changePassword —— 修改密码流程
  //   step1: 当前密码（校验与登录用户匹配）
  //   step2: 新密码（带策略校验 + 不能与旧密码相同）
  //   step3: 确认新密码（两次输入一致）
  // ============================================================
  changePassword: [
    {
      stage: "CurrentPassword",
      header: "修改密码 - 第 1 步",
      description: "请输入当前密码以验证身份",
      build: () => [
        new PasswordCallback("当前密码"),
      ],
      validate: (session, responses) => {
        const current = responses.PasswordCallback;
        const username = session.data.targetUser || "demo";
        const user = server.users.get(username);
        if (!user || user.password !== current) {
          return { ok: false, error: "当前密码错误" };
        }
        session.data.verifiedOld = true;
        return { ok: true };
      },
    },
    {
      stage: "NewPassword",
      header: "修改密码 - 第 2 步",
      description: "设置新密码（至少 8 位，含大小写字母和数字，且不能与旧密码相同）",
      build: () => [
        new ValidatedCreatePasswordCallback("新密码", PASSWORD_POLICIES),
      ],
      validate: (session, responses) => {
        const newPwd = responses.ValidatedCreatePasswordCallback;
        if (!newPwd) return { ok: false, error: "请输入新密码" };
        const check = validateByPolicies(newPwd, PASSWORD_POLICIES);
        if (!check.valid) return { ok: false, error: check.failed[0] };

        const username = session.data.targetUser || "demo";
        const user = server.users.get(username);
        if (user && newPwd === user.password) {
          return { ok: false, error: "新密码不能与旧密码相同" };
        }
        session.data.newPassword = newPwd;
        return { ok: true };
      },
    },
    {
      stage: "ConfirmNewPassword",
      header: "修改密码 - 第 3 步",
      description: "请再次输入新密码以确认",
      build: () => [
        new PasswordCallback("确认新密码"),
      ],
      validate: (session, responses) => {
        const confirm = responses.PasswordCallback;
        if (confirm !== session.data.newPassword) {
          return { ok: false, error: "两次输入的新密码不一致" };
        }
        // 写入新密码到 users Map
        const username = session.data.targetUser || "demo";
        const user = server.users.get(username);
        if (user) user.password = confirm;
        return { ok: true };
      },
    },
  ],
};

// 全局 MockServer 单例（demo 中直接使用）
const server = new MockServer();

// =============================================================
// 6. FRAuth —— 认证入口
// -------------------------------------------------------------
// 真实 SDK 的核心 API：
//   const step = await FRAuth.next(step);
// 这里同步实现（MockServer 是同步的），但保留 async 签名以对齐真实 SDK
// =============================================================
class FRAuth {
  /** 启动一棵认证树，返回第一个 step */
  static async start(treeName) {
    const tree = treeName || Config.get("tree");
    return server.start(tree);
  }

  /**
   * 提交当前 step 的响应，返回下一个 step
   * @param {Step} step - 客户端填好的 step
   */
  static async next(step) {
    return server.next(step);
  }
}

// =============================================================
// 7. FRUser —— 用户登录/登出
// -------------------------------------------------------------
// 真实 SDK：FRUser.login(handler) / FRUser.logout()
// 这里提供简化版，封装 token 持久化
// =============================================================
class FRUser {
  /**
   * 登录成功后持久化 session
   * @param {Step} finalStep - 已完成的 success step（含 token + data）
   *
   * 注意：这里不再调 FRAuth.next（step 已完成，session 已清理）。
   * 真实 SDK 的 FRUser.login(handler) 内部驱动整棵树直到成功，
   * 这里简化为接收已完成的 step 做持久化。
   */
  static async login(finalStep) {
    if (finalStep && finalStep.success) {
      Storage.set("session", {
        token: finalStep.token,
        username: finalStep.data?.currentUser?.username || finalStep.data?.username,
        loginAt: Date.now(),
      });
    }
    return finalStep;
  }

  /** 登出，清理本地 session */
  static async logout() {
    Storage.remove("session");
  }
}

// =============================================================
// 8. SessionManager —— 会话管理
// -------------------------------------------------------------
// 真实 SDK：SessionManager.getCurrent() / .logout()
// 这里从本地存储读取，方便 demo 检查登录状态
// =============================================================
class SessionManager {
  /** 获取当前会话（无登录返回 null） */
  static getCurrent() {
    return Storage.get("session");
  }

  /** 是否已登录 */
  static isLoggedIn() {
    return !!Storage.get("session");
  }

  /** 登出（清理本地 session） */
  static async logout() {
    Storage.remove("session");
  }
}

// =============================================================
// 导出：对外暴露工厂对象和所有内部类
// =============================================================
export {
  Config,
  Storage,
  Callback,
  NameCallback,
  PasswordCallback,
  ValidatedCreateUsernameCallback,
  ValidatedCreatePasswordCallback,
  ConfirmationCallback,
  TextOutputCallback,
  ChoiceCallback,
  HiddenValueCallback,
  Step,
  MockServer,
  FRAuth,
  FRUser,
  SessionManager,
};
