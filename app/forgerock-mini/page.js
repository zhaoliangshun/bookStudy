"use client";

// =============================================================
// 文件：app/forgerock-mini/page.js
// -------------------------------------------------------------
// 【一句话职责】
//   /forgerock-mini 路由的主页面。用 mini-forgerock 库演示
//   ForgeRock 的"认证树驱动"认证模式：UI 不预先知道要收集什么，
//   而是根据服务端返回的 callbacks 动态渲染输入控件。
//
// 【三个 demo】
//   1. 🔐 登录（OTP）—— 账号密码 + 验证码 两步登录
//   2. 📝 注册   —— 4 步树：用户名 → 密码 → 资料 → 确认
//   3. 🔑 改密码 —— 3 步树：当前密码 → 新密码 → 确认
//
// 【布局】
//   左侧：动态表单（根据当前 Step 的 callbacks 类型渲染）
//   右侧：Tree 状态面板（stage / header / callbacks JSON / 已收集数据）
//
// 【整体架构】
//   ForgeRockMiniPage（主页面，Tab 切换）
//   ├── LoginDemo / RegisterDemo / ChangePasswordDemo（三个 demo 容器）
//   │   └── AuthFlowWrapper（统一封装认证流程的状态管理）
//   │       ├── 左侧：CallbackRenderer 按 callback.type 分发渲染输入控件
//   │       │   ├── NameField（普通文本/密码输入框）
//   │       │   ├── PasswordField（带策略实时校验的密码框）
//   │       │   └── ChoiceField（下拉选择框）
//   │       └── 右侧：TreeStatusPanel（显示 step 元信息和 callbacks JSON）
//
// 【技术亮点】
//   1. CallbackRenderer：根据 callback.type 分发到不同输入控件
//      这正是 ForgeRock 的核心——服务端定义 UI 结构，客户端泛化渲染
//      新增 callback 类型只需在 switch 加一个 case + 一个 Field 组件
//   2. FRAuth.next(step) 驱动流程推进：UI 不关心流程，只管「填好就提交」
//   3. ValidatedCreatePasswordCallback 的策略实时校验：
//      用户输入密码时立即显示「至少 8 位」「需要大写字母」等提示
//   4. 左右联动：左侧每次 onChange 都会同步触发右侧 TreeStatusPanel 更新，
//      让用户直观看到「我填的数据长什么样、服务端会怎么收」
// =============================================================

import { useState, useMemo, useCallback, useEffect } from "react";
import { FRAuth, FRUser } from "./mini-forgerock";

// =============================================================
// 通用样式（沿用项目 CSS 变量，与 zod-mini 保持视觉一致）
// =============================================================
const styles = {
  page: {
    // 注意：全局 globals.css 对 html/body 设置了 height:100%; overflow:hidden
    // 所以页面根容器必须自己变成滚动容器，否则内容超出视口后无法滚动
    height: "100vh",
    overflowY: "auto",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--sans)",
    padding: "32px 24px 64px",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.6,
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 20px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  tabActive: {
    background: "var(--primary)",
    color: "#fff",
    // 用 border 简写而非 borderColor，避免与 tab 的 border 简写在切换时冲突
    border: "1px solid var(--primary)",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  panel: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "24px",
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 16px",
    color: "var(--text)",
  },
  stage: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
    background: "var(--bg-inline-code)",
    padding: "2px 8px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "8px",
  },
  stepHeader: {
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 4px",
  },
  stepDesc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "6px",
    color: "var(--text)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    outline: "none",
    transition: "border-color 0.15s",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    outline: "none",
    cursor: "pointer",
  },
  hint: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "4px",
    lineHeight: 1.5,
  },
  errorText: {
    fontSize: "12px",
    color: "var(--error)",
    marginTop: "4px",
  },
  successText: {
    fontSize: "12px",
    color: "var(--success)",
    marginTop: "4px",
  },
  button: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "var(--primary)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  buttonSecondary: {
    padding: "10px 24px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginRight: "8px",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
  alertError: {
    background: "var(--error-bg)",
    color: "var(--error)",
    border: "1px solid var(--error)",
  },
  alertSuccess: {
    background: "var(--success-bg)",
    color: "var(--success)",
    border: "1px solid var(--success)",
  },
  alertInfo: {
    background: "var(--primary-light)",
    color: "var(--primary)",
    border: "1px solid var(--primary)",
  },
  codeBlock: {
    background: "var(--bg-code)",
    color: "var(--text-code)",
    padding: "16px",
    borderRadius: "var(--radius-sm)",
    fontSize: "12px",
    fontFamily: "var(--mono)",
    overflow: "auto",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: "500px",
  },
  row: {
    display: "flex",
    gap: "12px",
    marginBottom: "8px",
    fontSize: "12px",
  },
  rowKey: {
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
    minWidth: "80px",
  },
  rowVal: {
    color: "var(--text)",
    fontFamily: "var(--mono)",
    wordBreak: "break-all",
  },
};

// =============================================================
// CallbackRenderer —— 根据 callback.type 动态渲染输入控件
// -------------------------------------------------------------
// 这是 Tree-driven auth 的核心：UI 不写死字段，
// 而是拿到 service 返回的 callback 对象后按类型分发渲染。
// 新增一种 callback 类型只需在这里加一个 case。
//
// 【分发模式 vs 配置模式】
//   这里用 switch/case 分发是「显式」做法：
//     - 优点：每个 case 清晰对应一种 callback，便于阅读和调试
//     - 缺点：新增类型需改这个组件
//   生产环境也可以用配置模式（callback type → component 的 map）：
//     - 优点：注册新类型无需改 Renderer
//     - 缺点：配置散落各处，不易追踪
//   demo 用 switch 更直观，便于学习理解。
//
// 【NameCallback 和 ValidatedCreateUsernameCallback 共用 NameField】
//   两者 UI 一样（都是 type="text" 的输入框），区别仅在策略校验。
//   ValidatedCreateUsernameCallback 的策略校验在服务端做（validate 函数），
//   客户端无需实时校验（用户名唯一性只能服务端验证），所以共用 NameField。
//   而 ValidatedCreatePasswordCallback 需要客户端实时校验（密码策略可纯前端验证），
//   所以单独用 PasswordField。
// =============================================================
function CallbackRenderer({ callback, onChange }) {
  // 根据 callback 类型渲染不同 UI
  switch (callback.type) {
    case "NameCallback":
    case "ValidatedCreateUsernameCallback":
      // 普通文本输入框（用户名、邮箱、验证码等）
      return (
        <NameField
          label={callback.getPrompt()}
          type="text"
          callback={callback}
          onChange={onChange}
        />
      );

    case "PasswordCallback":
      // 密码输入框（type="password"，UI 隐藏输入内容）
      return (
        <NameField
          label={callback.getPrompt()}
          type="password"
          callback={callback}
          onChange={onChange}
        />
      );

    case "ValidatedCreatePasswordCallback":
      // 带策略实时校验的密码框（注册/改密码场景用）
      return (
        <PasswordField callback={callback} onChange={onChange} />
      );

    case "ChoiceCallback":
      // 下拉选择框（如安全问题选择）
      return (
        <ChoiceField callback={callback} onChange={onChange} />
      );

    case "ConfirmationCallback":
      // ConfirmationCallback 不需要输入框，按钮组在表单底部统一渲染
      // 这里返回 null，按钮放在 submit 区域
      // 这样设计避免了「每个 ConfirmationCallback 都渲染一组按钮」的冗余
      return null;

    case "TextOutputCallback":
      // 纯文本提示（如「验证码已发送」「请确认信息」）
      // 用 alertInfo 样式渲染，让提示醒目
      return (
        <div style={styles.alertInfo}>{callback.getMessage()}</div>
      );

    default:
      // 未知类型：显示提示，不阻断流程（前向兼容）
      // 真实 SDK 遇到未知类型应上报错误并 fallback 到默认 UI
      return (
        <div style={styles.hint}>
          未知 callback 类型: {callback.type}
        </div>
      );
  }
}

/**
 * 普通文本/密码输入框
 *
 * 同时服务于 NameCallback / ValidatedCreateUsernameCallback / PasswordCallback
 * 因为它们的 UI 都是单个 input，区别只在 type（text/password）
 *
 * 【为什么 input value 用本地 state 而非直接读 callback.input？】
 *   1. callback.input 是 mutable 的，React 不会感知变化 → 不会重渲染
 *   2. 用 useState 让 React 控制输入框，保证输入流畅
 *   3. onChange 时同时更新本地 state 和 callback.input（双写）
 *      - 本地 state 驱动 UI 重渲染
 *      - callback.input 给服务端用（提交时 FRAuth.next(step) 读）
 */
function NameField({ label, type, callback, onChange }) {
  const [value, setValue] = useState("");
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          // 同时把值写回 callback，让 step.callbacks 持有最新值
          // 这样提交时 FRAuth.next(step) 能拿到填好的数据
          onChange(callback, e.target.value);
        }}
        style={styles.input}
        autoComplete="off"
      />
    </div>
  );
}

/**
 * 带策略校验的密码框 + 实时反馈
 *
 * 这个组件演示了 ForgeRock「服务端下发策略 → 客户端实时校验」的精髓：
 *   - 服务端通过 ValidatedCreatePasswordCallback.getPolicies() 下发策略清单
 *   - 客户端用 useMemo 实时校验，UI 显示「✓ 至少 8 位 / ○ 需要大写字母」
 *   - 用户输完密码时已经知道是否符合要求，不需要提交后才报错
 *
 * 【为什么用 useMemo？】
 *   callback.validate(value) 涉及正则匹配，每次渲染都跑会浪费。
 *   useMemo 缓存计算结果，只在 value 或 callback 变化时重算。
 */
function PasswordField({ callback, onChange }) {
  const [value, setValue] = useState("");
  // 一次性读取策略（callback 实例不变，策略也不会变）
  const policies = callback.getPolicies();
  // 实时校验：每次输入都重新跑一遍策略
  // 这里 check 没有直接用于 UI（UI 自己根据 policy 算 ok），
  // 但保留它作为「如何调用 callback.validate」的示例
  const check = useMemo(() => callback.validate(value), [value, callback]);

  return (
    <div style={styles.field}>
      <label style={styles.label}>{callback.getPrompt()}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(callback, e.target.value);
        }}
        style={styles.input}
        // autoComplete="new-password" 让浏览器不自动填充已保存的密码
        // 避免注册/改密码场景下浏览器「贴心」填了旧密码
        autoComplete="new-password"
      />
      {/* 实时策略校验提示：仅在有输入时显示，避免空表单就一堆灰字 */}
      {value && (
        <div style={{ marginTop: "8px" }}>
          {policies.map((p, i) => {
            // 单条策略的通过判断：
            //   - 有 minLength → 长度必须 ≥ minLength
            //   - 有 regex → 必须匹配 regex
            //   - 两个条件都满足才算通过（如果都配置了）
            const ok =
              (!p.minLength || value.length >= p.minLength) &&
              (!p.regex || new RegExp(p.regex).test(value));
            return (
              <div
                key={i}
                style={{
                  fontSize: "12px",
                  // 通过 → 绿色 + ✓；未通过 → 灰色 + ○
                  // 灰色而非红色：避免空表单时一片红字给用户压力
                  color: ok ? "var(--success)" : "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {ok ? "✓ " : "○ "}
                {p.message}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 下拉选择框
 *
 * 用于 ChoiceCallback，如安全问题选择、OTP 发送方式选择等。
 *
 * 【为什么默认值是 -1？】
 *   - -1 表示「未选中」，对应一个 placeholder option「请选择...」
 *   - 服务端可以据此判断用户是否真的选了（如果 required）
 *   - 不能用 0，因为 0 是第一个真实选项的索引
 */
function ChoiceField({ callback, onChange }) {
  const [selected, setSelected] = useState(-1);
  return (
    <div style={styles.field}>
      <label style={styles.label}>{callback.getPrompt()}</label>
      <select
        value={selected}
        onChange={(e) => {
          // e.target.value 是字符串，需要转回数字
          // 因为 ChoiceCallback.input 期望是索引（数字）
          const idx = parseInt(e.target.value, 10);
          setSelected(idx);
          onChange(callback, idx);
        }}
        style={styles.select}
      >
        {/* placeholder option：value=-1，禁用选中后无法选回 */}
        <option value={-1}>请选择...</option>
        {callback.getChoices().map((choice, i) => (
          <option key={i} value={i}>
            {choice}
          </option>
        ))}
      </select>
    </div>
  );
}

// =============================================================
// 右侧 Tree 状态面板：显示当前 step 的元信息和 callbacks JSON
// -------------------------------------------------------------
// 这个面板是「教学辅助」工具：让用户看到内部状态，
// 理解「我填的数据是怎么被服务端接收的」。
//
// 显示内容：
//   1. 元信息：tree / stage / sessionId / success / token / error
//   2. callbacks JSON：服务端下发的 callbacks 数组（含 payload 和当前 input）
//
// 教学价值：
//   - 用户填写时，input 字段实时变化，能直观看到「数据流向」
//   - 切换 step 时，stage 和 callbacks 变化，能看出「流程推进」
//   - 成功时显示 token，让用户理解「认证成功 = 拿到 token」
// =============================================================
function TreeStatusPanel({ step }) {
  // step 为 null：认证树还没启动（FRAuth.start 还没返回）
  if (!step) {
    return (
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Tree 状态</h3>
        <div style={styles.hint}>等待认证树启动...</div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <h3 style={styles.panelTitle}>Tree 状态</h3>

      {/* 元信息：用 key-value 行展示，让用户看清当前 step 的标识 */}
      <div style={styles.row}>
        <span style={styles.rowKey}>tree:</span>
        <span style={styles.rowVal}>{step.tree}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowKey}>stage:</span>
        <span style={styles.rowVal}>{step.stage}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowKey}>sessionId:</span>
        <span style={styles.rowVal}>{step.sessionId}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowKey}>success:</span>
        <span style={styles.rowVal}>{String(step.success)}</span>
      </div>
      {/* token 只在成功时显示 */}
      {step.token && (
        <div style={styles.row}>
          <span style={styles.rowKey}>token:</span>
          <span style={styles.rowVal}>{step.token}</span>
        </div>
      )}
      {/* error 只在失败时显示，用红色突出 */}
      {step.error && (
        <div style={styles.row}>
          <span style={styles.rowKey}>error:</span>
          <span style={{ ...styles.rowVal, color: "var(--error)" }}>
            {step.error}
          </span>
        </div>
      )}

      {/* callbacks JSON：把内部数据结构原样展示 */}
      {/* 教学意义：让用户看到 callback 的完整结构 */}
      <h4
        style={{
          fontSize: "13px",
          fontWeight: 600,
          margin: "16px 0 8px",
          color: "var(--text-secondary)",
        }}
      >
        Callbacks（服务端下发）
      </h4>
      <pre style={styles.codeBlock}>
        {JSON.stringify(
          // 序列化时只取关键字段（去掉方法、原型链等）
          // input 字段会随用户输入实时变化，让用户看到「数据被回填」的过程
          step.callbacks.map((cb) => ({
            type: cb.type,
            payload: cb.payload,
            input: cb.input,
          })),
          null,
          2
        )}
      </pre>
    </div>
  );
}

// =============================================================
// Demo 1：登录（OTP 两步）
// -------------------------------------------------------------
// 登录成功后用 FRUser.login 持久化 session（写入 localStorage）
//
// 【onComplete 回调的设计】
//   AuthFlowWrapper 在 step.success 时调 onComplete(finalStep)
//   Demo 在这里做「成功后的副作用」：
//     - LoginDemo：调 FRUser.login 持久化 session
//     - RegisterDemo：什么都不做（注册树本身已经写库了）
//     - ChangePasswordDemo：什么都不做（密码已在服务端更新）
//   这种设计让 AuthFlowWrapper 通用，Demo 专注业务副作用。
// =============================================================
function LoginDemo() {
  // step 状态：由 AuthFlowWrapper 通过 onStepChange 透传出来
  // 用于驱动右侧 TreeStatusPanel 显示
  const [step, setStep] = useState(null);

  return (
    <AuthFlowWrapper
      treeName="login"
      successMessage="登录成功！会话已建立"
      onComplete={async (finalStep) => {
        // 登录成功，用 FRUser 持久化 session（真实 SDK 会自动做这步）
        // 持久化后用户刷新页面也能保持登录态（SessionManager.getCurrent() 能读出来）
        await FRUser.login(finalStep);
      }}
      onStepChange={setStep}
    >
      {/* children 透传到 AuthFlowWrapper 的右侧 */}
      <TreeStatusPanel step={step} />
    </AuthFlowWrapper>
  );
}

// =============================================================
// Demo 2：注册（4 步树）
// -------------------------------------------------------------
// 注册树本身在服务端 validate 里写入了 users Map（_registerUser），
// 所以 onComplete 不需要做额外副作用。
// 真实场景注册成功通常会自动登录，这里为了演示流程不自动登录。
// =============================================================
function RegisterDemo() {
  const [step, setStep] = useState(null);

  return (
    <AuthFlowWrapper
      treeName="registration"
      successMessage="注册成功！用户已创建"
      onStepChange={setStep}
    >
      <TreeStatusPanel step={step} />
    </AuthFlowWrapper>
  );
}

// =============================================================
// Demo 3：修改密码（3 步树）
// -------------------------------------------------------------
// 修改密码树本身在服务端 validate 里更新了 users Map 里的密码，
// 所以 onComplete 不需要做额外副作用。
// 真实场景改密成功通常会强制重新登录（让用户用新密码登录）。
// =============================================================
function ChangePasswordDemo() {
  const [step, setStep] = useState(null);

  return (
    <AuthFlowWrapper
      treeName="changePassword"
      successMessage="密码修改成功！"
      onStepChange={setStep}
    >
      <TreeStatusPanel step={step} />
    </AuthFlowWrapper>
  );
}

// =============================================================
// AuthFlowWrapper —— 通用认证流程容器
// -------------------------------------------------------------
// 这是整个页面的「心脏」：封装了认证流程的状态管理，
// 让三个 Demo 只需提供 treeName 和 successMessage 即可复用。
//
// 【职责】
//   1. 启动认证树：useEffect 中调 FRAuth.start(treeName) 拿第一个 step
//   2. 渲染当前 step：根据 step 状态（loading / 成功 / 失败 / 进行中）渲染
//   3. 处理用户输入：handleCallbackChange 把值写回 callback.input
//   4. 提交当前 step：handleSubmit 调 FRAuth.next(step) 推进流程
//   5. 处理错误/成功：失败时显示 error，成功时调 onComplete
//   6. 重新开始：handleRestart 重新启动认证树
//
// 【左右联动机制】
//   - Wrapper 内部维护 step 状态
//   - 每次 step 变化都通过 onStepChange 透传给父组件
//   - 父组件（Demo）把 step 传给 TreeStatusPanel 渲染右侧
//   - 这样左侧表单和右侧状态面板实时同步
//
// 【为什么不用 children 渲染右侧？】
//   也可以把右侧作为 children 传入，但这样 Wrapper 无法直接控制 step。
//   用 onStepChange 回调让父组件持有 step，更灵活（可以传给任意子组件）。
// =============================================================
function AuthFlowWrapper({ treeName, onComplete, onRestart, onStepChange, successMessage, children }) {
  // capturedStep 是早期方案的残留，现在用 step + onStepChange 已足够
  // 保留是为了向前兼容（如果有外部代码用到）
  const [capturedStep, setCapturedStep] = useState(null);

  // 当前 step（含 callbacks、stage、success、error 等所有状态）
  const [step, setStep] = useState(null);
  const [error, setError] = useState("");
  // loading 表示「正在与服务端通信」：启动中 / 提交中
  // 用于禁用按钮，防止用户重复点击
  const [loading, setLoading] = useState(false);

  // 启动认证树：treeName 变化时重新启动
  // cancelled 标志防止「组件卸载后还 setState」的内存泄漏警告
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const firstStep = await FRAuth.start(treeName);
      // 如果组件已卸载（用户切换 Tab），不再 setState
      if (!cancelled) {
        setStep(firstStep);
        setCapturedStep(firstStep); // 兼容旧代码
        onStepChange && onStepChange(firstStep);
        setLoading(false);
      }
    })();
    return () => {
      // cleanup：组件卸载时把 cancelled 设为 true
      // 这样 async 函数的 await 返回后不会调用 setState
      cancelled = true;
    };
    // onStepChange 是父组件 useState 的 setter，引用稳定，可安全加入依赖
  }, [treeName, onStepChange]);

  /**
   * 处理 callback 输入变化
   *
   * 当用户在 NameField/PasswordField/ChoiceField 输入时触发：
   *   1. callback.setInput(value) 把值写回 callback（mutable 操作）
   *   2. 创建新的 step 对象触发 React 重渲染
   *   3. 通过 onStepChange 通知父组件（让右侧面板同步更新）
   *
   * 【为什么要 {...step, callbacks: [...step.callbacks]}？】
   *   callback.setInput 是 mutable 操作，React 不会感知变化。
   *   通过浅拷贝 step 和 callbacks 数组，让 React 看到「新对象」从而重渲染。
   *   注意：callbacks 数组里的 callback 对象本身仍是原对象（只改了 input），
   *   这样避免重新构造 callback 实例（保留 callback 上的方法）。
   */
  const handleCallbackChange = useCallback(
    (callback, value) => {
      if (!step) return;
      callback.setInput(value);
      // 浅拷贝触发重渲染（callback 对象本身不变，只是 input 字段变了）
      const newStep = { ...step, callbacks: [...step.callbacks] };
      setStep(newStep);
      setCapturedStep(newStep);
      onStepChange && onStepChange(newStep);
    },
    [step, onStepChange]
  );

  /**
   * 提交当前 step：调 FRAuth.next(step) 推进流程
   *
   * 流程：
   *   1. 设置 loading，禁用按钮
   *   2. 如果有 ConfirmationCallback 且未选中，默认选第一个（避免用户不点确认按钮）
   *   3. 调 FRAuth.next(step) 拿下一个 step
   *   4. 更新 step 状态 + 透传给父组件
   *   5. 根据结果：error → 显示错误；success → 调 onComplete
   */
  const handleSubmit = async () => {
    if (!step) return;
    setLoading(true);
    setError("");

    // ConfirmationCallback 的默认行为：
    // 如果用户没点选过（input < 0），默认选第一个选项（通常是「确认」）
    // 这样用户直接点「下一步」也能完成流程，UX 更顺滑
    const confirmCb = step.getCallback("ConfirmationCallback");
    if (confirmCb && confirmCb.getOutput() < 0) {
      confirmCb.select(0);
    }

    // 调 FRAuth.next 推进流程
    // nextStep 可能是：新 step（继续走）/ success step（成功）/ error step（失败）
    const nextStep = await FRAuth.next(step);
    setStep(nextStep);
    setCapturedStep(nextStep);
    onStepChange && onStepChange(nextStep);

    if (nextStep.error) {
      // 服务端校验失败：显示错误，让用户修正后重试
      // 注意：error step 通常仍带 callbacks，UI 会重新渲染输入框
      setError(nextStep.error);
    } else if (nextStep.success) {
      // 认证成功：调 onComplete 让 Demo 做副作用（如 FRUser.login）
      onComplete && onComplete(nextStep);
    }
    setLoading(false);
  };

  /**
   * 重新开始：重置状态 + 重新启动认证树
   *
   * 使用场景：
   *   - 用户主动点「重新开始」按钮
   *   - 认证成功后让用户再走一遍
   *   - 卡在错误状态时退出
   */
  const handleRestart = async () => {
    setLoading(true);
    setError("");
    onRestart && onRestart();
    // 重新调 FRAuth.start 拿第一个 step
    // 这会创建新的 session（旧 session 已被服务端清理或失效）
    const firstStep = await FRAuth.start(treeName);
    setStep(firstStep);
    setCapturedStep(firstStep);
    onStepChange && onStepChange(firstStep);
    setLoading(false);
  };

  // 左侧面板内容：根据 step 状态分发渲染
  // 用 IIFE 让 return JSX 更清晰（避免多重 ternary 嵌套）
  const leftPanel = (() => {
    // 启动中：还没拿到第一个 step
    if (!step) return <div style={styles.hint}>正在启动认证树...</div>;

    // 成功：显示成功提示 + token + 重新开始按钮
    if (step.success) {
      return (
        <div>
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>
            ✓ {successMessage || "认证成功"}
            <br />
            Session Token: <code>{step.token}</code>
          </div>
          <button style={styles.button} onClick={handleRestart}>
            重新开始
          </button>
        </div>
      );
    }

    // 进行中或失败：渲染当前 step 的表单
    return (
      <div>
        {/* step 元信息：stage 是机器可读标识，header/description 给人看 */}
        <div style={styles.stage}>{step.stage}</div>
        <h3 style={styles.stepHeader}>{step.header}</h3>
        <p style={styles.stepDesc}>{step.description}</p>

        {/* 错误提示：服务端校验失败时显示 */}
        {error && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            ✕ {error}
          </div>
        )}

        {/* 动态渲染 callbacks：核心！UI 不写死字段，根据 callbacks 类型分发 */}
        {step.callbacks.map((cb, i) => (
          <CallbackRenderer
            key={i}
            callback={cb}
            onChange={handleCallbackChange}
          />
        ))}

        {/* 操作按钮组 */}
        <div style={{ ...styles.buttonGroup, marginTop: "20px" }}>
          <button
            style={styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "处理中..." : "下一步"}
          </button>
          <button style={styles.buttonSecondary} onClick={handleRestart}>
            重新开始
          </button>
        </div>
      </div>
    );
  })();

  // 整体布局：左侧表单 + 右侧 children（通常是 TreeStatusPanel）
  return (
    <div style={styles.card}>
      <div style={styles.panel}>{leftPanel}</div>
      {children}
    </div>
  );
}

// =============================================================
// 主页面：Tab 切换三个 demo
// -------------------------------------------------------------
// 用 tabs 数组配置 + activeTab 状态实现 Tab 切换。
// 切换 Tab 时旧 demo 卸载（状态销毁），新 demo 重新启动认证树。
// 这意味着用户切回时是「从头开始」，符合 demo 场景。
// =============================================================
const tabs = [
  { id: "login", label: "🔐 登录（OTP）", component: LoginDemo },
  { id: "register", label: "📝 注册", component: RegisterDemo },
  { id: "changePassword", label: "🔑 改密码", component: ChangePasswordDemo },
];

export default function ForgeRockMiniPage() {
  // 默认激活「登录」Tab（用户最常测试的场景）
  const [activeTab, setActiveTab] = useState("login");
  // 找到当前 Tab 的组件（每次 render 都 find，开销可忽略）
  // 用变量保存而非内联 tabs.find(...).component，避免 JSX 里写复杂表达式
  const ActiveComponent = tabs.find((t) => t.id === activeTab).component;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 页头：标题 + 副标题说明 + 测试账号提示 */}
        <div style={styles.header}>
          <h1 style={styles.title}>ForgeRock Mini SDK</h1>
          <p style={styles.subtitle}>
            手写迷你版 ForgeRock SDK，演示 Authentication Tree 驱动的渐进式认证。
            UI 不写死字段，而是根据服务端返回的 callbacks 动态渲染输入控件。
            <br />
            测试账号：<code>demo</code> / <code>Demo1234</code>（登录 demo 用）
          </p>
        </div>

        {/* Tab 切换栏：用按钮组而非 select，更直观 */}
        {/* activeTab === tab.id 时叠加 tabActive 样式（高亮） */}
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 当前 demo：渲染为 <ActiveComponent /> */}
        {/* 切换 Tab 时旧组件卸载，新组件挂载并启动新的认证树 */}
        <ActiveComponent />
      </div>
    </div>
  );
}
