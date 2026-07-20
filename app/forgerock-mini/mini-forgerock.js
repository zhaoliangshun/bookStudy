// =============================================================
// 文件：app/forgerock-mini/mini-forgerock.js
// -------------------------------------------------------------
// 【一句话职责】
//   手写迷你版 ForgeRock JavaScript SDK，演示 ForgeRock 的核心概念：
//   "Authentication Tree（认证树）驱动的渐进式认证"。
//
// 【为什么需要 Tree-driven Auth？】
//   传统登录是「单次往返」：客户端把账号密码一次性 POST 给服务端，
//   服务端校验后返回 token。这种模式在简单场景下够用，但遇到
//   「需要二次验证」「需要按条件分支」「需要多步骤收集信息」时
//   就力不从心 —— 客户端得为每种流程写专门的代码。
//
//   ForgeRock 的解法是把流程编排权下放到服务端：
//     - 服务端运维人员通过可视化界面拖拽节点，配置出一棵"认证树"
//     - 客户端只负责「按服务端说的去收集信息」，不关心流程逻辑
//     - 同一个客户端代码可以跑任意复杂的树（OTP / 生物识别 / 风控 / ...）
//
// 【核心通信流程】
//   1. 客户端调 FRAuth.start("login") → 服务端返回第一个 Step
//      Step.callbacks = [NameCallback, PasswordCallback]  // 要收集的信息
//   2. 客户端 UI 根据 callbacks 动态渲染输入框
//   3. 用户填写后调 FRAuth.next(step) → 服务端校验 + 返回下一个 Step
//   4. 重复 2-3 直到 Step.success === true（含 token）或 Step.error
//
//   关键洞察：客户端 UI 是「泛化」的，不写死「先输入用户名，再输入验证码」，
//   而是拿到 callbacks 数组后按类型渲染。新增一种流程只需服务端配置，
//   客户端代码零改动 —— 这就是 Tree-driven 的核心价值。
//
// 【本文件架构】
//   1. Config          —— 全局配置（服务器、realm、tree 名）
//   2. Storage         —— token 持久化（localStorage 包装）
//   3. Callback 体系   —— 8 种 callback 类型，对应不同 UI 控件
//                         NameCallback / PasswordCallback /
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
// 【设计模式应用】
//   - 单例模式：Config / Storage / MockServer 都是静态方法 + 全局单例
//   - 模板方法模式：Callback 基类定义 setInput/getOutput/toJSON 骨架
//   - 工厂模式：MockServer.TREES 用对象字面量定义树，build() 工厂函数造 callback
//   - 状态机模式：MockServer.sessions 维护每个流程的 stepIndex，按状态推进
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
//
// 设计要点：
//   - 用静态字段 + 静态方法实现单例，避免 new 实例化的样板代码
//   - set() 用展开合并（而非直接覆盖），允许部分配置更新
//   - get(key) 不传 key 时返回配置副本（防止外部直接修改内部对象）
// =============================================================
class Config {
  static _config = {
    baseUrl: "https://openam.example.com/am",  // AM 服务器地址
    realm: "root",                              // realm（领域， ForgeRock 多租户隔离的单位）
    tree: "Login",                              // 默认认证树
    timeout: 30000,                             // 请求超时（毫秒）
  };

  /** 设置全局配置，与已有配置合并 */
  static set(partial) {
    Config._config = { ...Config._config, ...partial };
  }

  /** 读取全局配置（或某个键） */
  static get(key) {
    // 不传 key → 返回配置副本（防止外部直接修改内部对象）
    // 传 key → 返回该键的值
    return key ? Config._config[key] : { ...Config._config };
  }
}

// =============================================================
// 2. Storage —— token 持久化
// -------------------------------------------------------------
// 真实 SDK 支持多种存储后端：localStorage / sessionStorage / cookie。
// 这里简化为 localStorage 包装，并处理 SSR 环境（window 不存在）。
//
// 设计要点：
//   - PREFIX 命名空间前缀，避免与站点其他 localStorage key 冲突
//   - typeof window === "undefined" 检查防止 SSR 报错（Next.js 服务端无 window）
//   - try-catch 兜底处理 localStorage 满或被禁用（隐私模式下会抛错）
//   - 所有值都 JSON.stringify 包装，方便存对象（不只是字符串）
// =============================================================
class Storage {
  // 命名空间前缀，避免与站点其他 localStorage key 冲突
  // 比如其他 demo 也用 localStorage["session"]，加前缀就不会互相覆盖
  static PREFIX = "fr-mini:";

  static get(key) {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(Storage.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      // 解析失败或 localStorage 不可用时返回 null（调用方需处理 null）
      return null;
    }
  }

  static set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(Storage.PREFIX + key, JSON.stringify(value));
    } catch {
      // localStorage 满或被禁用时静默失败
      // 真实 SDK 这里应该上报错误并 fallback 到 sessionStorage / cookie
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
// 【为什么用 callback 而不是直接返回字段名？】
//   1. 类型安全：服务端明确告诉客户端「我要的是密码，不是普通文本」
//      → 客户端 UI 知道要用 type="password" 渲染
//   2. 携带元信息：callback 的 payload 可以包含 prompt、选项、策略等
//      → 客户端无需硬编码这些信息
//   3. 可扩展：新增 callback 类型对老客户端透明（虽然不能渲染但能识别）
//   4. 跨平台一致：Web / iOS / Android 用同一套 callback 协议
//
// 数据形状（参考真实 SDK）：
//   {
//     type: "NameCallback",
//     payload: { prompt: "用户名" },     // 服务端下发
//     input: ""                          // 客户端回填
//   }
//
// 客户端用 setInput 填好后提交，服务端据此推进树。
// =============================================================

/**
 * Callback 基类：封装 type + payload + 输入值读写
 *
 * 这是「模板方法模式」：基类定义统一的 setInput/getOutput/toJSON 骨架，
 * 子类只需在 payload 里加自己的字段（prompt、policies、choices...），
 * 然后提供语义化的 getter（如 getPrompt/getPolicies）。
 *
 * 这样设计的好处：
 *   - MockServer.next() 不用关心具体类型，统一用 cb.getOutput() 取值
 *   - UI 渲染层通过 cb.type 判断后调用对应子类方法（如 cb.getChoices()）
 *   - 新增 callback 类型只需继承 Callback 并加 getter，无需改基类
 */
class Callback {
  constructor(type, payload = {}) {
    this.type = type;       // callback 类型标识（如 "NameCallback"）
    this.payload = payload; // 服务端下发的额外数据（prompt、选项、策略等）
    // input 是客户端回填的字段。初始为 "" 或 []，取决于 callback 类型
    // payload.defaultInput 允许服务端下发时指定初始值（HiddenValueCallback 用到）
    this.input = payload.defaultInput ?? "";
  }

  /**
   * 客户端设置输入值（用户在 UI 上填写后调用）
   * 返回 this 支持链式调用：cb.setInput("alice").setInput("xxx")
   */
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

/**
 * NameCallback：收集用户名（普通文本输入框）
 *
 * 最基础的 callback。服务端下发 { prompt: "用户名" }，
 * 客户端渲染一个 type="text" 的 input。
 */
class NameCallback extends Callback {
  constructor(prompt = "用户名") {
    super("NameCallback", { prompt });
  }
  /** UI 显示用的提示文案 */
  getPrompt() {
    return this.payload.prompt;
  }
}

/**
 * PasswordCallback：收集密码（密码输入框，UI 应 type="password"）
 *
 * 与 NameCallback 的区别仅在 UI 渲染层（用 type="password" 隐藏输入），
 * 数据结构完全相同。这种区分让 UI 渲染层不需要硬编码「哪个字段是密码」。
 */
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
 *
 * 这是 ForgeRock 注册树的特色 callback：服务端下发密码策略
 * （长度、字符种类等），客户端可即时校验给用户反馈。
 *
 * 这种设计的价值：
 *   - 用户输入密码时立即看到「至少 8 位」「需要大写字母」等提示
 *   - 服务端策略变更后，客户端 UI 自动同步（无需发版）
 *   - 避免「提交后才知道密码不满足要求」的差体验
 *
 * 真实 SDK 的策略格式更复杂（含 policyRequirement、params 等），
 * 这里简化为 { minLength?, regex?, message } 三字段格式。
 */
class ValidatedCreatePasswordCallback extends PasswordCallback {
  constructor(prompt = "创建密码", policies = []) {
    super(prompt);
    // 显式覆盖 type（因为继承 PasswordCallback 时 type 已被设为 "PasswordCallback"）
    this.type = "ValidatedCreatePasswordCallback";
    this.payload.policies = policies;
  }

  /**
   * 根据策略校验密码，返回 { valid, failed: [...] }
   * 真实策略有更复杂格式，这里简化为 { name, regex, message }
   *
   * @param {string} value - 待校验的密码
   * @returns {{ valid: boolean, failed: string[] }}
   *   - valid: 是否所有策略都通过
   *   - failed: 未通过的策略的 message 数组（用于 UI 展示）
   */
  validate(value) {
    const failed = [];
    for (const policy of this.payload.policies) {
      // regex 检查：用 new RegExp 而非字面量，因为 regex 是字符串
      if (policy.regex && !new RegExp(policy.regex).test(value)) {
        failed.push(policy.message);
      }
      // minLength 检查：长度不足时也算失败
      if (policy.minLength && value.length < policy.minLength) {
        failed.push(policy.message);
      }
    }
    return { valid: failed.length === 0, failed };
  }

  /** 获取所有策略（UI 用它渲染「密码要求」清单） */
  getPolicies() {
    return this.payload.policies;
  }
}

/**
 * ValidatedCreateUsernameCallback：注册时创建用户名，带策略校验
 *
 * 与 ValidatedCreatePasswordCallback 类似，用于校验用户名格式/可用性。
 * 继承 NameCallback 是因为用户名是明文输入（type="text"）。
 *
 * 注意：用户名「是否已被注册」的校验只能在服务端做（客户端无法访问用户库），
 * 所以这里的策略只校验格式（长度、字符集），不校验唯一性。
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
 *
 * input 存选中选项的索引（不是文本），与真实 SDK 一致。
 * 用索引而非文本的好处：服务端不依赖客户端的本地化文案，
 * 改 UI 文案不需要改服务端代码。
 *
 * 初始 input = -1 表示「未选中」，服务端可据此判断用户是否点击过。
 */
class ConfirmationCallback extends Callback {
  constructor(prompt = "请确认", options = ["确定", "取消"]) {
    super("ConfirmationCallback", { prompt, options });
    this.input = -1; // 未选中（不能用 0，因为 0 是第一个选项的索引）
  }
  getPrompt() {
    return this.payload.prompt;
  }
  getOptions() {
    return this.payload.options;
  }
  /**
   * 选中某个选项（按索引或文本）
   * 同时支持数字和字符串是为了方便 UI 调用：
   *   - 按索引：cb.select(0)         // 程序化选择
   *   - 按文本：cb.select("提交注册") // 通过按钮文本选择
   */
  select(option) {
    if (typeof option === "number") {
      this.input = option;
    } else {
      // 文本查找索引；找不到时 indexOf 返回 -1，符合「未选中」语义
      this.input = this.payload.options.indexOf(option);
    }
    return this;
  }
}

/**
 * TextOutputCallback：纯文本提示（不收集输入，只显示信息）
 *
 * 例如"密码已过期，请重置"、"验证码已发送到您的邮箱"。
 * messageType 用于 UI 选择提示样式（INFO / WARNING / ERROR）。
 *
 * 这个 callback 的 input 永远为 null（无需用户回填），
 * MockServer.next() 也不会从它取 output。
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
 *
 * 例如选择安全问题、选择 OTP 发送方式（短信/邮箱/电话）。
 *
 * 与 ConfirmationCallback 的区别：
 *   - ConfirmationCallback：语义是「确认/取消」，选项通常 2 个
 *   - ChoiceCallback：语义是「从多个选项中选一个」，选项可以更多
 *   - 真实 SDK 中 ChoiceCallback 还支持多选（input 是数组），这里简化为单选
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
 *
 * 例如 CSRF token、设备指纹、会话续期标记等。
 * 服务端下发时给出 name + value，客户端原样回传（或附加自己的数据）。
 *
 * 这个 callback 的 input 默认沿用服务端下发的 value，
 * 客户端通常不需要修改它（直接回传给服务端做状态恢复）。
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
//
// 【三种状态】
//   - 进行中：callbacks 数组非空，UI 应渲染这些 callback 收集输入
//   - 成功：success=true，token 字段含 session token
//   - 失败：error 非空，UI 显示错误并允许重试
//
// 这是个「状态对象」而非「数据传输对象」：
//   - 它不仅是数据载体，还提供了 isComplete / getCallback 等便捷方法
//   - UI 层拿到 Step 后无需关心服务端通信细节，直接用方法即可
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

  /** 是否已完成（成功或失败）—— UI 据此决定是否停止流程 */
  isComplete() {
    return this.success || !!this.error;
  }

  /**
   * 按 callback 类型获取第一个匹配的 callback
   * UI 渲染时常用，如：step.getCallback("NameCallback") 拿到用户名输入框
   * 如果同类型有多个，只返回第一个（约定同类型不重复）
   */
  getCallback(type) {
    return this.callbacks.find((cb) => cb.type === type) || null;
  }

  /** 按 callback 类型获取所有匹配的 callback（少用，因为同类型一般不重复） */
  getCallbacks(type) {
    return this.callbacks.filter((cb) => cb.type === type);
  }

  /**
   * 便捷方法：按类型设置某个 callback 的输入值
   * 真实 SDK 有类似 setCallbackValue 工具方法
   * 用法：step.setCallbackValue("NameCallback", "alice")
   */
  setCallbackValue(type, value) {
    const cb = this.getCallback(type);
    if (cb) cb.setInput(value);
    return this; // 链式调用
  }
}

// =============================================================
// 5. MockServer —— 模拟服务端
// -------------------------------------------------------------
// 这是 mini 版的核心。真实 SDK 通过 HTTP 与 AM 通信，
// 本 mini 版用内存中的状态机模拟服务端。
//
// 【状态机模型】
//   每棵 tree 是一个 step 序列（数组），每个 step 包含：
//     - stage / header / description：UI 显示用
//     - build(session, prevResponses)：返回该 step 的 callbacks
//       （可读取 prevResponses 做条件判断，例如校验密码后决定下一步）
//     - validate(session, responses)：校验本 step 的响应，
//       返回 { ok: true } 或 { ok: false, error }
//
//   每个 session 有一个状态：{ tree, stepIndex, data, otp }
//   stepIndex 是状态机的「当前状态」，next() 推进它：
//     stepIndex 0 → 1 → 2 → ... → 越界（成功）
//
// 【sessions Map】
//   服务端维护一个 sessions Map：sessionId -> { tree, stepIndex, data }
//   这模拟了真实服务端的「会话存储」：
//     - 每次启动一棵树，分配一个 sessionId
//     - 客户端每次 next(step) 都要带 sessionId，服务端据此恢复上下文
//     - 成功/失败时清理 session（模拟服务端会话销毁）
//
// 【users Map】
//   内存中的「用户库」，注册树成功后写入新用户，登录树校验用户密码。
//   预置一个 demo 用户，方便登录 demo 直接测试。
// =============================================================
class MockServer {
  constructor() {
    this.sessions = new Map();    // sessionId → session state
    this.sessionCounter = 0;      // 自增计数器，保证 sessionId 唯一
    this.tokenCounter = 0;        // 自增计数器，保证 token 唯一
    // 已注册用户（注册成功后写入，登录时校验）
    this.users = new Map();
    // 预置一个 demo 用户，方便登录 demo
    // 真实场景用户数据存在 LDAP / DB 里，这里用 Map 模拟
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
   *
   * @param {string} treeName - 树名（如 "login" / "registration" / "changePassword"）
   * @returns {Step} 第一个 step（含 sessionId 和 callbacks）
   */
  start(treeName) {
    // 生成唯一 sessionId（真实 SDK 用 UUID，这里简化为自增）
    const sessionId = `sess-${++this.sessionCounter}`;
    // 创建 session 状态对象
    this.sessions.set(sessionId, {
      tree: treeName,
      stepIndex: 0,  // 状态机当前状态：第 0 个 step
      data: {},       // 累积的响应数据（如已收集到的用户名）
      otp: null,      // 当前流程生成的 OTP（OTP demo 用）
    });
    return this._buildStep(sessionId);
  }

  /**
   * 提交当前 step 的响应，推进到下一步
   *
   * @param {Step} step - 客户端传回的 step（含填好的 callbacks）
   * @returns {Step} 下一个 step（可能是新 step、success step 或 error step）
   *
   * 流程：
   *   1. 用 step.sessionId 恢复 session 上下文
   *   2. 把 step.callbacks 的 output 收集到 responses 对象
   *   3. 调用当前 stepDef.validate() 校验响应
   *   4. 校验失败 → 返回 error step（含原 callbacks 让用户重试）
   *   5. 校验通过 → stepIndex++，构造并返回下一个 step
   */
  next(step) {
    const session = this.sessions.get(step.sessionId);
    // 会话不存在（已过期、被清理、或 sessionId 错误）
    if (!session) {
      return new Step({ error: "会话不存在或已过期", tree: step.tree });
    }

    // 找到当前树的定义
    const treeDef = MockServer.TREES[session.tree];
    if (!treeDef) {
      return new Step({ error: `未知的认证树: ${session.tree}` });
    }
    // 取出当前 step 的定义（按 stepIndex）
    const currentStepDef = treeDef[session.stepIndex];
    if (!currentStepDef) {
      return new Step({ error: "认证树已结束" });
    }

    // 把响应数据存到 session.data（用 callback type 作为 key）
    // 这是「累积」的：每个 step 的响应都会存进来，后续 step 可读
    // 例如登录 step1 收集的用户名，step2 可以从 session.data 取
    const responses = step.callbacks.reduce((acc, cb) => {
      acc[cb.type] = cb.getOutput();
      return acc;
    }, {});
    Object.assign(session.data, responses);

    // 执行校验：调 stepDef.validate() 让树自己判断响应是否合法
    if (currentStepDef.validate) {
      const result = currentStepDef.validate(session, responses, step);
      if (!result.ok) {
        // 校验失败：返回 error step，但同时返回原 callbacks 让用户重试
        // 这样 UI 不需要重新拉取 step，直接显示错误 + 保留输入框
        return new Step({
          error: result.error,
          tree: session.tree,
          sessionId: step.sessionId,
          stage: currentStepDef.stage,
          callbacks: currentStepDef.build(session, {}),
        });
      }
    }

    // 校验通过：推进状态机到下一个状态
    session.stepIndex += 1;
    return this._buildStep(step.sessionId);
  }

  /**
   * 构造 session 当前 stepIndex 对应的 Step
   * 如果已经是最后一个 step 之后，返回 success（含 token）
   *
   * 这是「状态机出口」：stepIndex 越界 = 流程结束 = 成功
   */
  _buildStep(sessionId) {
    const session = this.sessions.get(sessionId);
    const treeDef = MockServer.TREES[session.tree];
    const stepDef = treeDef[session.stepIndex];

    // 已经走完所有 step → 成功（状态机终态）
    if (!stepDef) {
      const token = `token-${++this.tokenCounter}`;
      // 清理 session（模拟服务端会话销毁）
      // 重要：成功后必须清理，否则 sessions Map 会无限增长（内存泄漏）
      this.sessions.delete(sessionId);
      return new Step({
        success: true,
        token,
        tree: session.tree,
        data: session.data, // 把收集到的数据一并返回（demo 用）
      });
    }

    // 还有 step 要走：构造新的 Step 并返回
    return new Step({
      stage: stepDef.stage,
      header: stepDef.header,
      description: stepDef.description,
      tree: session.tree,
      sessionId,
      // build 是工厂函数，每次调用返回新的 callback 实例
      // 这样不同 session 的 callback 互不影响（避免共享状态污染）
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
// 【树定义格式】
//   每个 step 是一个对象，包含：
//     - stage:        机器可读的 stage 标识（如 "UsernamePassword"）
//     - header:       UI 标题
//     - description:  UI 描述
//     - build(session, prevResponses): 工厂函数，返回该 step 的 callbacks
//     - validate(session, responses, step): 校验函数，返回 { ok, error? }
//
// 【responses 结构】
//   MockServer.next 把 step.callbacks 的输出值按"类型→值"做成对象。
//   为避免同类型 callback 冲突，约定同一 step 内不出现重复类型；
//   需要两个文本输入时用不同 callback（如 NameCallback + PasswordCallback）。
//
//   例如 step 的 callbacks = [NameCallback, PasswordCallback]：
//     responses = {
//       NameCallback: "alice",        // 用户名
//       PasswordCallback: "secret",   // 密码
//     }
//
// 【build 为什么是函数而不是直接数组】
//   如果用数组，所有 session 会共享同一组 callback 实例（共享 input 状态）。
//   用工厂函数每次调用都返回新实例，避免状态污染。
//   build(session, prevResponses) 的参数让 step 可以根据前序响应动态构造：
//     - 例如 OTP step 显示「验证码已发送到 {手机号}」需要读 session.data
// =============================================================

// 把策略校验逻辑抽成工具函数，避免在 validate 里反复构造 callback 实例
// 同时让 build 和 validate 共享同一份策略定义（避免策略漂移）
function validateByPolicies(value, policies) {
  const failed = [];
  for (const p of policies) {
    if (p.minLength && value.length < p.minLength) failed.push(p.message);
    if (p.regex && !new RegExp(p.regex).test(value)) failed.push(p.message);
  }
  return { valid: failed.length === 0, failed };
}

// 策略常量：build 和 validate 共享同一份定义，避免 build() 重复创建实例
// 这种「单一数据源」设计让策略修改只需改一处
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
  // ------------------------------------------------------------
  // 这棵树演示了「多 step 渐进式」的精髓：
  //   step1 验证账号密码后，服务端动态生成 OTP 并存到 session
  //   step2 用 session.otp 校验用户输入的验证码
  // 两 step 之间通过 session 共享状态 —— 这是 Tree-driven 的关键能力：
  // 服务端可以在 step 之间做任意状态管理（生成 token、记录设备指纹、风控判定等）
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
        // 基础校验：非空
        if (!username || !password) {
          return { ok: false, error: "用户名和密码不能为空" };
        }
        // 用户存在性 + 密码正确性校验
        // 安全提示：真实场景密码不应明文存储，应存 hash + salt
        const user = server.users.get(username);
        if (!user || user.password !== password) {
          return { ok: false, error: "用户名或密码错误" };
        }
        // 记住当前用户，后续 step 可用（OTP step 不需要，但成功后 FRUser.login 需要）
        session.data.currentUser = user;
        // 模拟服务端生成 6 位 OTP
        // 关键：OTP 存到 session 而不是返回给客户端（否则就不是验证码了）
        // 真实场景会通过短信/邮箱发送，这里通过 TextOutputCallback 在 UI 显示（demo 用）
        session.otp = String(Math.floor(100000 + Math.random() * 900000));
        return { ok: true };
      },
    },
    {
      stage: "OTP",
      header: "二次验证",
      description: "验证码已发送到您的注册手机",
      // build 接收 session 参数，可以读取上一步存入的 otp
      build: (session) => [
        // TextOutputCallback 显示 OTP（demo 演示用，真实环境不会下发）
        // 这里通过 TextOutputCallback 让用户「看到」验证码，模拟短信接收
        new TextOutputCallback(
          `【模拟短信】您的验证码是 ${session.otp}，5 分钟内有效`,
          "INFO"
        ),
        // NameCallback 收集用户输入的验证码
        // 注意：这里没有用专门的 OTP callback，因为 ForgeRock 的 callback 是通用的
        new NameCallback("请输入 6 位验证码"),
      ],
      validate: (session, responses) => {
        const code = responses.NameCallback;
        // OTP 比对：直接比较字符串
        // 真实场景会有过期时间、重试次数限制等
        if (code !== session.otp) {
          return { ok: false, error: "验证码错误" };
        }
        return { ok: true };
      },
    },
  ],

  // ============================================================
  // 树 2：registration —— 多步注册流程
  // ------------------------------------------------------------
  // 这棵树演示了「分步收集信息」的常见注册流程：
  //   step1: 用户名（带策略校验：长度、字符集、不重复）
  //   step2: 密码（带策略校验：长度、大小写、数字）
  //   step3: 邮箱(NameCallback) + 安全问题(ChoiceCallback) + 安全答案(PasswordCallback)
  //          —— 用三种不同类型避免 responses key 冲突
  //   step4: 确认提交（ConfirmationCallback）
  //
  // 【为什么 step3 用三种不同 callback 类型？】
  //   responses 是 { [cb.type]: value } 的对象，key 是 callback 类型。
  //   如果同 step 内有两个 NameCallback，后一个会覆盖前一个的值。
  //   解决方案：用不同类型（NameCallback + ChoiceCallback + PasswordCallback）
  //   不仅避免了冲突，还让 UI 自动用不同控件渲染（输入框/下拉/密码框）。
  // ============================================================
  registration: [
    {
      stage: "CreateUsername",
      header: "注册 - 第 1 步",
      description: "创建一个用户名（3-20 位字母数字下划线）",
      // 用 ValidatedCreateUsernameCallback 而非 NameCallback
      // 这样客户端 UI 能拿到策略，实时校验用户名格式
      build: () => [
        new ValidatedCreateUsernameCallback("用户名", USERNAME_POLICIES),
      ],
      validate: (session, responses) => {
        const username = responses.ValidatedCreateUsernameCallback;
        if (!username) return { ok: false, error: "请输入用户名" };
        // 用工具函数 + 共享策略常量校验
        // 注意：客户端已经实时校验过，服务端仍要再校验一遍（防绕过）
        const check = validateByPolicies(username, USERNAME_POLICIES);
        if (!check.valid) {
          return { ok: false, error: check.failed[0] };
        }
        // 用户名重复检查 —— 这个只能服务端做（客户端无法访问用户库）
        if (server.users.has(username)) {
          return { ok: false, error: "该用户名已被注册" };
        }
        // 把用户名存到 session.data，后续 step 可以读取
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
      // 一个 step 可以同时收集多个字段（用不同 callback 类型避免冲突）
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
        // 邮箱格式校验：简单正则，真实场景更严格
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { ok: false, error: "邮箱格式不正确" };
        }
        // 安全问题必须选（ChoiceCallback 默认 -1 表示未选）
        if (securityQ === undefined || securityQ < 0) {
          return { ok: false, error: "请选择安全问题" };
        }
        // 安全答案非空
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
      // 最后一步通常用 ConfirmationCallback 让用户确认
      // 配合 TextOutputCallback 给出最终提示
      build: () => [
        new TextOutputCallback("请确认以下信息无误后提交", "INFO"),
        new ConfirmationCallback("确认注册？", ["提交注册", "取消"]),
      ],
      validate: (session, responses) => {
        const choice = responses.ConfirmationCallback;
        // ConfirmationCallback.input 是选中选项的索引
        // 这里 0 = "提交注册"，1 = "取消"
        if (choice !== 0) {
          return { ok: false, error: "用户取消注册" };
        }
        // 注册成功，写入 users Map（demo 用，真实场景写 DB）
        // 从 session.data 取出前面 step 累积收集的字段
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
  // ------------------------------------------------------------
  // 这棵树演示了「敏感操作的安全链路」：
  //   step1: 当前密码（校验与登录用户匹配）—— 防止他人在已登录设备改密码
  //   step2: 新密码（带策略校验 + 不能与旧密码相同）—— 防止用户改了个寂寞
  //   step3: 确认新密码（两次输入一致）—— 防止用户输错密码
  //
  // 【targetUser 的设计】
  //   真实场景：客户端调 FRAuth.start("changePassword") 时应带当前登录用户
  //   简化场景：这里用 session.data.targetUser 兜底为 "demo"
  //   完整实现会在 FRAuth.start 时把 currentUser 写入 session.data
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
        // 找到当前用户（demo 场景默认 demo）
        const username = session.data.targetUser || "demo";
        const user = server.users.get(username);
        if (!user || user.password !== current) {
          return { ok: false, error: "当前密码错误" };
        }
        // 标记已验证旧密码（后续 step 可以信任这个状态）
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
        // 策略校验（与客户端实时校验一致）
        const check = validateByPolicies(newPwd, PASSWORD_POLICIES);
        if (!check.valid) return { ok: false, error: check.failed[0] };

        // 跨 step 校验：新密码不能与旧密码相同
        // 这里通过 server.users.get(user).password 读取旧密码
        // 真实场景旧密码已 hash，应该用 bcrypt.compare 等方法
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
        // 跨 step 校验：两次输入的新密码一致
        // session.data.newPassword 是 step2 存进去的
        if (confirm !== session.data.newPassword) {
          return { ok: false, error: "两次输入的新密码不一致" };
        }
        // 所有校验通过，写入新密码到 users Map
        // 这是状态机的「副作用」：修改持久化数据
        const username = session.data.targetUser || "demo";
        const user = server.users.get(username);
        if (user) user.password = confirm;
        return { ok: true };
      },
    },
  ],
};

// 全局 MockServer 单例（demo 中直接使用）
// 真实 SDK 不需要这个，因为服务端是远程的；这里因为是「内存服务端」需要全局唯一
const server = new MockServer();

// =============================================================
// 6. FRAuth —— 认证入口
// -------------------------------------------------------------
// 真实 SDK 的核心 API：
//   const step = await FRAuth.next(step);
// 这里同步实现（MockServer 是同步的），但保留 async 签名以对齐真实 SDK
//
// 【为什么保留 async？】
//   真实 SDK 走 HTTP，必然异步。如果 mini 版用同步 API，
//   demo 代码会写成 `const step = FRAuth.next(step)`（无 await），
//   迁移到真实 SDK 时所有调用点都要改成 await，迁移成本高。
//   保留 async 让 demo 代码与真实代码风格一致，便于学习迁移。
// =============================================================
class FRAuth {
  /**
   * 启动一棵认证树，返回第一个 step
   * @param {string} [treeName] - 树名，不传则用 Config 配置的默认树
   */
  static async start(treeName) {
    const tree = treeName || Config.get("tree");
    return server.start(tree);
  }

  /**
   * 提交当前 step 的响应，返回下一个 step
   * @param {Step} step - 客户端填好的 step
   * @returns {Promise<Step>}
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
//
// 【与 FRAuth 的关系】
//   FRAuth 只负责走树（认证流程），不关心结果怎么用
//   FRUser 在 FRAuth 走完整棵树（success）后，把 token 持久化到 Storage
//   真实 SDK 的 FRUser.login(handler) 接收一个 handler 函数，
//   内部驱动 FRAuth.next() 直到 success，然后持久化
//   这里简化为接收已完成的 step 做持久化（让 demo 代码更显式）
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
      // 把 token + 用户信息存到 localStorage
      // 后续 SessionManager.getCurrent() 可以读出来判断登录状态
      // username 的取值兼容两种树：login 树存 currentUser.username，registration 树存 username
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
//
// 【为什么单独抽一层 SessionManager？】
//   FRUser.logout() 也能登出，但语义上 FRUser 是「用户操作」层
//   SessionManager 是「会话查询」层，更细粒度
//   比如 UI 想知道「当前是否登录」「当前用户是谁」用 SessionManager
//   想做「登出」操作可以用任一（FRUser.logout 或 SessionManager.logout）
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
// -------------------------------------------------------------
// 这样设计让消费方可以按需 import：
//   import { FRAuth, FRUser } from "./mini-forgerock";  // 只用高层 API
//   import { NameCallback } from "./mini-forgerock";    // 直接构造 callback
//   import { MockServer } from "./mini-forgerock";      // 测试时用
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
